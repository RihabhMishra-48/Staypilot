'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { verifyPlatformAdmin } from '@/lib/auth/platform-admin';
import {
  Organization,
  SubscriptionStatus,
  PlatformAdminMetrics,
  AuditLog,
  ChannelSyncLog,
  ActionResponse,
} from '@/types';
import { recordAuditLog } from './organization';

/**
 * Get honest platform metrics (No fake revenue or fabricated accounts)
 */
export async function getPlatformMetricsAction(): Promise<PlatformAdminMetrics> {
  try {
    await verifyPlatformAdmin();
    const supabase = await createClient();

    const [orgsResult, propsResult, connResult, logsResult] = await Promise.all([
      supabase.from('organizations').select('id, subscription_status', { count: 'exact' }),
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('channel_connections').select('id, status', { count: 'exact' }),
      supabase.from('channel_sync_logs').select('status').limit(100),
    ]);

    const totalTenants = orgsResult.count || 0;
    const totalProperties = propsResult.count || 0;
    const activeSubscriptions =
      orgsResult.data?.filter(
        (o) => o.subscription_status === 'active' || o.subscription_status === 'trialing'
      ).length || 0;

    const connectedChannels =
      connResult.data?.filter((c) => c.status === 'connected').length || 0;

    const recentLogs = logsResult.data || [];
    const successfulLogs = recentLogs.filter((l) => l.status === 'success').length;
    const syncSuccessRate =
      recentLogs.length > 0
        ? Math.round((successfulLogs / recentLogs.length) * 100)
        : 100;

    const pendingAlerts =
      (connResult.data?.filter((c) => c.status === 'error').length || 0) +
      recentLogs.filter((l) => l.status === 'failure').length;

    return {
      totalTenants,
      totalProperties,
      activeSubscriptions,
      connectedChannels,
      syncSuccessRate,
      pendingAlerts,
    };
  } catch (error) {
    console.error('Failed to get platform metrics:', error);
    return {
      totalTenants: 0,
      totalProperties: 0,
      activeSubscriptions: 0,
      connectedChannels: 0,
      syncSuccessRate: 100,
      pendingAlerts: 0,
    };
  }
}

/**
 * List all hotel business accounts
 */
export async function getPlatformTenantsAction(): Promise<
  (Organization & { propertyCount: number })[]
> {
  try {
    await verifyPlatformAdmin();
    const supabase = await createClient();

    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*, properties(id)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    interface OrgWithProps extends Organization {
      properties?: { id: string }[];
    }

    return ((orgs || []) as OrgWithProps[]).map((org) => ({
      ...org,
      propertyCount: org.properties?.length || 0,
    }));
  } catch (error) {
    console.error('Failed to get platform tenants:', error);
    return [];
  }
}

/**
 * Update tenant subscription status (activate, suspend)
 */
export async function updateTenantStatusAction(
  organizationId: string,
  newStatus: SubscriptionStatus
): Promise<ActionResponse> {
  try {
    const { user } = await verifyPlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('organizations')
      .update({
        subscription_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);

    if (error) return { success: false, message: error.message };

    await recordAuditLog({
      userId: user.id,
      action: 'platform.tenant_status_updated',
      entityType: 'organization',
      entityId: organizationId,
      details: { organizationId, newStatus },
    });

    revalidatePath('/platform-admin/hotels');
    revalidatePath('/platform-admin/dashboard');

    return { success: true, message: `Tenant account updated to ${newStatus}` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update tenant status',
    };
  }
}

/**
 * Get platform-wide sync failures and logs for Super Admin monitor
 */
export async function getPlatformSyncLogsAction(limit = 50): Promise<ChannelSyncLog[]> {
  try {
    await verifyPlatformAdmin();
    const supabase = await createClient();

    const { data: logs } = await supabase
      .from('channel_sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (logs || []) as ChannelSyncLog[];
  } catch (error) {
    console.error('Failed to get platform sync logs:', error);
    return [];
  }
}

/**
 * Get platform-wide audit trail
 */
export async function getPlatformAuditLogsAction(limit = 100): Promise<AuditLog[]> {
  try {
    await verifyPlatformAdmin();
    const supabase = await createClient();

    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (logs || []) as AuditLog[];
  } catch (error) {
    console.error('Failed to get platform audit logs:', error);
    return [];
  }
}
