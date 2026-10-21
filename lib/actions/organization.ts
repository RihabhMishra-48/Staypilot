'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  organizationSchema,
  propertyInvitationSchema,
} from '@/lib/validation/organization';
import {
  ActionResponse,
  Organization,
  PropertyInvitation,
  AuditLog,
} from '@/types';
import { revalidatePath } from 'next/cache';
import crypto from 'node:crypto';

/**
 * Fetch all organizations the authenticated user belongs to.
 */
export async function getUserOrganizations(): Promise<{
  organizations: (Organization & { role: string })[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { organizations: [] };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { organizations: [] };
    }

    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      return { organizations: [], error: error.message };
    }

    interface OrgMemberRow {
      role: string;
      organization: Organization | null;
    }

    const rows = (data as unknown as OrgMemberRow[]) || [];
    const list = rows
      .filter((r) => r.organization && r.organization.id)
      .map((r) => ({
        ...(r.organization as Organization),
        role: r.role,
      }));

    return { organizations: list };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch organizations.';
    return { organizations: [], error: errorMsg };
  }
}

/**
 * Create a new tenant organization (e.g. Hotel Group or Boutique Chain).
 */
export async function createOrganizationAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse<Organization>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  const rawData = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    billing_email: (formData.get('billing_email') as string) || undefined,
    subscription_tier: (formData.get('subscription_tier') as string) || 'starter',
  };

  const validation = organizationSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please verify organization details.',
      errors: errorMap,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: 'Authentication required to create an organization.',
      };
    }

    // 1. Insert organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: validation.data.name,
        slug: validation.data.slug.toLowerCase().trim(),
        billing_email: validation.data.billing_email || user.email,
        subscription_tier: validation.data.subscription_tier,
      })
      .select()
      .single();

    if (orgError || !org) {
      if (orgError?.code === '23505') {
        return {
          success: false,
          message: `The organization slug "${validation.data.slug}" is already in use. Please select a unique identifier.`,
        };
      }
      return {
        success: false,
        message: orgError?.message || 'Failed to create organization in database.',
      };
    }

    // 2. Add creator as Owner in organization_members
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      return {
        success: false,
        message: `Organization created, but failed to assign owner membership: ${memberError.message}`,
      };
    }

    // 3. Log audit event
    await supabase.from('audit_logs').insert({
      organization_id: org.id,
      user_id: user.id,
      action: 'organization.created',
      entity_type: 'organization',
      entity_id: org.id,
      details: { name: org.name, slug: org.slug, tier: org.subscription_tier },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings/property');

    return {
      success: true,
      message: `Organization "${org.name}" successfully registered with Owner privileges.`,
      data: org as Organization,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unexpected database error.';
    return { success: false, message: errorMsg };
  }
}

/**
 * Invite a staff member to a property with role authorization.
 */
export async function inviteStaffMemberAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse<PropertyInvitation>> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase credentials are not configured.',
    };
  }

  const rawData = {
    property_id: formData.get('property_id') as string,
    email: (formData.get('email') as string)?.toLowerCase().trim(),
    role: formData.get('role') as string,
  };

  const validation = propertyInvitationSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed for staff invitation.',
      errors: errorMap,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Authentication required.' };
    }

    // Verify caller role in this property (Privilege Escalation Check)
    const { data: memberData } = await supabase
      .from('property_members')
      .select('role')
      .eq('property_id', validation.data.property_id)
      .eq('user_id', user.id)
      .single();

    const callerRole = memberData?.role;
    if (!callerRole || (callerRole !== 'owner' && callerRole !== 'manager')) {
      return {
        success: false,
        message: 'Unauthorized. Only Property Owners and General Managers can invite staff.',
      };
    }

    // Privilege escalation guard: Managers cannot invite or create Owners/Managers
    if (callerRole === 'manager' && (validation.data.role === 'owner' || validation.data.role === 'manager')) {
      return {
        success: false,
        message: 'Permission denied. General Managers may only invite Front Desk and Housekeeping staff.',
      };
    }

    // Generate secure registration token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { data: invitation, error } = await supabase
      .from('property_invitations')
      .insert({
        property_id: validation.data.property_id,
        email: validation.data.email,
        role: validation.data.role,
        token,
        invited_by: user.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: `An active invitation already exists for ${validation.data.email} at this property.`,
        };
      }
      return { success: false, message: error.message };
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      property_id: validation.data.property_id,
      user_id: user.id,
      action: 'staff.invited',
      entity_type: 'invitation',
      entity_id: invitation.id,
      details: { email: validation.data.email, role: validation.data.role },
    });

    revalidatePath('/dashboard/staff');

    return {
      success: true,
      message: `Invitation generated for ${validation.data.email} as ${validation.data.role}.`,
      data: invitation as PropertyInvitation,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database error while issuing invitation.';
    return { success: false, message: errorMsg };
  }
}

/**
 * Fetch immutable audit logs for a property.
 */
export async function getPropertyAuditLogs(propertyId: string): Promise<{
  logs: AuditLog[];
  error?: string;
}> {
  if (!isSupabaseConfigured() || !propertyId) {
    return { logs: [] };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return { logs: [], error: error.message };
    }

    return { logs: (data as AuditLog[]) || [] };
  } catch (err: unknown) {
    return { logs: [], error: err instanceof Error ? err.message : 'Failed to fetch audit logs.' };
  }
}

/**
 * Platform Administration Telemetry & Overview.
 * Strictly checks that caller is marked as is_platform_admin in public.profiles.
 */
export async function getPlatformOverview(): Promise<{
  isAuthorized: boolean;
  metrics?: {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    totalProperties: number;
    tierBreakdown: Record<string, number>;
  };
  organizations?: Organization[];
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      isAuthorized: false,
      error: 'Supabase credentials are not configured.',
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAuthorized: false, error: 'Authentication required.' };
    }

    // Verify platform admin status directly from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_platform_admin) {
      return {
        isAuthorized: false,
        error: 'Access denied: Platform Administrator privileges required.',
      };
    }

    // Query platform-wide tenant and property telemetry
    const [{ data: orgs }, { count: propertyCount }] = await Promise.all([
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
    ]);

    const orgList = (orgs as Organization[]) || [];
    const activeTenants = orgList.filter((o) => o.subscription_status === 'active').length;
    const suspendedTenants = orgList.filter((o) => o.subscription_status === 'suspended').length;

    const tierBreakdown: Record<string, number> = {
      starter: 0,
      growth: 0,
      pro: 0,
      enterprise: 0,
    };

    orgList.forEach((o) => {
      tierBreakdown[o.subscription_tier] = (tierBreakdown[o.subscription_tier] || 0) + 1;
    });

    return {
      isAuthorized: true,
      metrics: {
        totalTenants: orgList.length,
        activeTenants,
        suspendedTenants,
        totalProperties: propertyCount || 0,
        tierBreakdown,
      },
      organizations: orgList,
    };
  } catch (err: unknown) {
    return {
      isAuthorized: false,
      error: err instanceof Error ? err.message : 'Failed to query platform administration data.',
    };
  }
}

/**
 * Record an immutable audit log entry.
 */
export async function recordAuditLog(params: {
  propertyId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = await createClient();
    await supabase.from('audit_logs').insert({
      property_id: params.propertyId || null,
      user_id: params.userId || null,
      action: params.action,
      entity_type: params.entityType || 'general',
      entity_id: params.entityId || null,
      details: params.details || {},
    });
  } catch {
    // Non-blocking telemetry
  }
}
