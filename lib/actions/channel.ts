'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  SupportedChannel,
  ChannelConnection,
  ChannelSyncLog,
  ChannelSummary,
  ActionResponse,
  SyncType,
} from '@/types';
import { SUPPORTED_CHANNELS, getChannelAdapter, getChannelMetadata } from '@/lib/integrations/registry';
import { recordAuditLog } from './organization';

/**
 * Verify user has access to property
 */
async function verifyPropertyAccess(
  propertyId: string,
  requiredRoles: string[] = ['owner', 'manager', 'receptionist', 'housekeeping']
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthenticated');
  }

  // Check if platform admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_platform_admin) {
    return { user, role: 'platform_admin' as const };
  }

  // Check property membership
  const { data: member } = await supabase
    .from('property_members')
    .select('role')
    .eq('property_id', propertyId)
    .eq('user_id', user.id)
    .single();

  if (!member || !requiredRoles.includes(member.role)) {
    throw new Error('Unauthorized for this property');
  }

  return { user, role: member.role };
}

/**
 * Get all 4 channel statuses for a property
 */
export async function getPropertyChannelSummaries(
  propertyId: string
): Promise<ChannelSummary[]> {
  try {
    await verifyPropertyAccess(propertyId);
    const supabase = await createClient();

    const { data: connections } = await supabase
      .from('channel_connections')
      .select('*')
      .eq('property_id', propertyId);

    const { data: mappings } = await supabase
      .from('channel_mappings')
      .select('channel')
      .eq('property_id', propertyId)
      .eq('is_active', true);

    const connectionsMap = new Map<SupportedChannel, ChannelConnection>();
    if (connections) {
      for (const conn of connections) {
        connectionsMap.set(conn.channel as SupportedChannel, conn as ChannelConnection);
      }
    }

    const mappingCounts = new Map<SupportedChannel, number>();
    if (mappings) {
      for (const m of mappings) {
        const c = m.channel as SupportedChannel;
        mappingCounts.set(c, (mappingCounts.get(c) || 0) + 1);
      }
    }

    return SUPPORTED_CHANNELS.map((channel) => {
      const metadata = getChannelMetadata(channel);
      const connection = connectionsMap.get(channel) || null;

      let syncHealth: 'healthy' | 'warning' | 'error' | 'disconnected' = 'disconnected';
      if (connection) {
        if (connection.status === 'connected') {
          syncHealth = connection.last_error ? 'warning' : 'healthy';
        } else if (connection.status === 'error') {
          syncHealth = 'error';
        } else {
          syncHealth = 'disconnected';
        }
      }

      return {
        channel,
        displayName: metadata.name,
        connection,
        syncHealth,
        lastSync: connection?.last_sync_at || null,
        mappedRoomTypesCount: mappingCounts.get(channel) || 0,
      };
    });
  } catch (error) {
    console.error('Failed to get channel summaries:', error);
    return SUPPORTED_CHANNELS.map((channel) => ({
      channel,
      displayName: getChannelMetadata(channel).name,
      connection: null,
      syncHealth: 'disconnected',
      mappedRoomTypesCount: 0,
    }));
  }
}

/**
 * Get recent sync logs for a property
 */
export async function getPropertySyncLogs(
  propertyId: string,
  limit = 25
): Promise<ChannelSyncLog[]> {
  try {
    await verifyPropertyAccess(propertyId);
    const supabase = await createClient();

    const { data: logs, error } = await supabase
      .from('channel_sync_logs')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sync logs:', error);
      return [];
    }

    return (logs || []) as ChannelSyncLog[];
  } catch (error) {
    console.error('Failed to fetch sync logs:', error);
    return [];
  }
}

/**
 * Update or connect an OTA channel
 */
export async function saveChannelConnectionAction(
  propertyId: string,
  channel: SupportedChannel,
  hotelIdentifier: string,
  credentials: Record<string, string>
): Promise<ActionResponse<ChannelConnection>> {
  try {
    const { user } = await verifyPropertyAccess(propertyId, ['owner', 'manager']);
    const adapter = getChannelAdapter(channel);

    // Validate credentials through channel adapter
    const validation = await adapter.validateCredentials(credentials);

    const supabase = await createClient();

    const connectionData = {
      property_id: propertyId,
      channel,
      hotel_identifier: hotelIdentifier,
      credentials_encrypted: credentials,
      status: validation.valid ? 'connected' : 'error',
      last_error: validation.valid ? null : validation.error,
      updated_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabase
      .from('channel_connections')
      .upsert(connectionData, { onConflict: 'property_id,channel' })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    await recordAuditLog({
      propertyId,
      userId: user.id,
      action: 'channel.connection_updated',
      entityType: 'channel_connection',
      entityId: saved.id,
      details: {
        channel,
        status: saved.status,
        valid: validation.valid,
        error: validation.error,
      },
    });

    revalidatePath(`/hotel/channel-manager`);
    revalidatePath(`/hotel/channel-manager/connections`);
    revalidatePath(`/hotel/dashboard`);

    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Failed to verify channel credentials with OTA portal.',
        data: saved as ChannelConnection,
      };
    }

    return {
      success: true,
      message: `${adapter.metadata.name} credentials updated and verified successfully.`,
      data: saved as ChannelConnection,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update channel connection',
    };
  }
}

/**
 * Disconnect an OTA channel
 */
export async function disconnectChannelAction(
  propertyId: string,
  channel: SupportedChannel
): Promise<ActionResponse> {
  try {
    const { user } = await verifyPropertyAccess(propertyId, ['owner', 'manager']);
    const supabase = await createClient();

    const { error } = await supabase
      .from('channel_connections')
      .update({
        status: 'disconnected',
        credentials_encrypted: {},
        last_error: 'Channel connection disconnected by administrator',
        updated_at: new Date().toISOString(),
      })
      .eq('property_id', propertyId)
      .eq('channel', channel);

    if (error) {
      return { success: false, message: error.message };
    }

    await recordAuditLog({
      propertyId,
      userId: user.id,
      action: 'channel.disconnected',
      entityType: 'channel_connection',
      entityId: channel,
      details: { channel },
    });

    revalidatePath(`/hotel/channel-manager`);
    revalidatePath(`/hotel/channel-manager/connections`);
    revalidatePath(`/hotel/dashboard`);

    return { success: true, message: `${getChannelMetadata(channel).name} disconnected.` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to disconnect channel',
    };
  }
}

/**
 * Trigger manual synchronization for an OTA channel
 */
export async function triggerChannelSyncAction(
  propertyId: string,
  channel: SupportedChannel,
  syncType: SyncType
): Promise<ActionResponse> {
  try {
    await verifyPropertyAccess(propertyId, ['owner', 'manager']);
    const supabase = await createClient();

    // Check if channel is connected
    const { data: conn } = await supabase
      .from('channel_connections')
      .select('*')
      .eq('property_id', propertyId)
      .eq('channel', channel)
      .single();

    const startTime = Date.now();

    if (!conn || conn.status !== 'connected') {
      const errorMessage = `Cannot sync: ${getChannelMetadata(channel).name} is not connected or credentials unverified.`;

      // Log the honest attempt
      await supabase.from('channel_sync_logs').insert({
        property_id: propertyId,
        channel,
        sync_type: syncType,
        direction: 'push',
        status: 'failure',
        items_synced: 0,
        error_message: errorMessage,
        duration_ms: Date.now() - startTime,
      });

      return {
        success: false,
        message: errorMessage,
      };
    }

    const adapter = getChannelAdapter(channel);
    let result: {
      success: boolean;
      itemsSynced: number;
      durationMs: number;
      error?: string;
    } = {
      success: false,
      itemsSynced: 0,
      durationMs: 0,
      error: 'Sync handler unexecuted',
    };

    if (syncType === 'inventory' || syncType === 'full') {
      result = await adapter.pushInventory(
        {
          propertyId,
          dateFrom: new Date().toISOString().split('T')[0],
          dateTo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          rates: [],
        },
        conn.credentials_encrypted
      );
    } else if (syncType === 'rates') {
      result = await adapter.pushRates(
        {
          propertyId,
          dateFrom: new Date().toISOString().split('T')[0],
          dateTo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          rates: [],
        },
        conn.credentials_encrypted
      );
    }

    // Insert sync log
    await supabase.from('channel_sync_logs').insert({
      property_id: propertyId,
      channel,
      sync_type: syncType,
      direction: 'push',
      status: result.success ? 'success' : 'failure',
      items_synced: result.itemsSynced,
      error_message: result.error || null,
      duration_ms: result.durationMs,
    });

    // Update connection record
    await supabase
      .from('channel_connections')
      .update({
        last_sync_at: new Date().toISOString(),
        last_successful_sync_at: result.success ? new Date().toISOString() : conn.last_successful_sync_at,
        last_error: result.error || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conn.id);

    revalidatePath(`/hotel/channel-manager`);
    revalidatePath(`/hotel/channel-manager/sync-logs`);
    revalidatePath(`/hotel/dashboard`);

    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Channel sync failed at remote gateway.',
      };
    }

    return {
      success: true,
      message: `Successfully synchronized ${result.itemsSynced} updates with ${adapter.metadata.name}.`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sync invocation failed',
    };
  }
}
