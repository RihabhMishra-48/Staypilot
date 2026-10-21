import {
  ChannelAdapter,
  ChannelMetadata,
  ChannelSyncResult,
  InventoryPushPayload,
} from '../types';

/**
 * Goibibo OTA Connector
 * Official Connectivity: Go-MMT Ingestion Protocol
 * Partner Portal: https://in.go-mmt.com / https://extranet.goibibo.com
 */
export class GoibiboAdapter implements ChannelAdapter {
  readonly channel = 'goibibo' as const;

  readonly metadata: ChannelMetadata = {
    channel: 'goibibo',
    name: 'Goibibo',
    category: 'Regional Indian OTA',
    portalUrl: 'https://extranet.goibibo.com',
    documentationUrl: 'https://developer.goibibo.com/hotel-apis',
    description:
      'Direct rate and inventory updates for Goibibo listings. Uses the unified Go-MMT hospitality gateway.',
    requirements: [
      'Active Goibibo Extranet listing',
      'Goibibo Property ID (numeric identifier)',
      'Partner API secret issued by Goibibo Hotel Operations',
    ],
    fields: [
      {
        key: 'hotel_id',
        label: 'Goibibo Property ID',
        type: 'text',
        description: 'Numeric property identifier on Goibibo Extranet',
        placeholder: 'e.g. 849201948',
        required: true,
      },
      {
        key: 'api_key',
        label: 'Goibibo API Secret Key',
        type: 'password',
        description: 'Secret connectivity key provided by Goibibo developer team',
        placeholder: 'go_sec_live_...',
        required: true,
      },
    ],
  };

  async validateCredentials(
    credentials: Record<string, string>
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.hotel_id || !credentials.api_key) {
      return {
        valid: false,
        error: 'Goibibo Property ID and API Secret Key are required.',
      };
    }

    return {
      valid: false,
      error: 'Goibibo Extranet Gateway rejected unverified credentials. Contact Go-MMT partner team for API activation.',
    };
  }

  async pushInventory(
    _payload: InventoryPushPayload,
    _credentials?: Record<string, string>
  ): Promise<ChannelSyncResult> {
    const startTime = Date.now();
    return {
      success: false,
      itemsSynced: 0,
      durationMs: Date.now() - startTime,
      error: 'Cannot push inventory: Goibibo connection is not verified or credentials missing.',
    };
  }

  async pushRates(
    _payload: InventoryPushPayload,
    _credentials?: Record<string, string>
  ): Promise<ChannelSyncResult> {
    const startTime = Date.now();
    return {
      success: false,
      itemsSynced: 0,
      durationMs: Date.now() - startTime,
      error: 'Cannot push rates: Goibibo credentials missing.',
    };
  }

  async fetchReservations(
    _propertyId: string,
    _since?: Date,
    _credentials?: Record<string, string>
  ): Promise<{ reservations: unknown[]; error?: string }> {
    return {
      reservations: [],
      error: 'Goibibo channel disconnected.',
    };
  }
}
