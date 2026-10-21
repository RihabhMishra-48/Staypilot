import {
  ChannelAdapter,
  ChannelMetadata,
  ChannelSyncResult,
  InventoryPushPayload,
} from '../types';

/**
 * Agoda OTA Connector
 * Official Connectivity: Agoda YCS API / Connectivity Partner Gateway
 * Partner Portal: https://ycs.agoda.com
 * Requirements:
 *  - Agoda Hotel ID
 *  - Agoda Connectivity Partner Key
 */
export class AgodaAdapter implements ChannelAdapter {
  readonly channel = 'agoda' as const;

  readonly metadata: ChannelMetadata = {
    channel: 'agoda',
    name: 'Agoda',
    category: 'Global OTA',
    portalUrl: 'https://ycs.agoda.com',
    documentationUrl: 'https://partners.agoda.com/connectivity',
    description:
      'Worldwide distribution across Asia-Pacific and international travelers. Synchronizes room allotments, dynamic rates, and restrictions directly with Agoda YCS.',
    requirements: [
      'Active property listed on Agoda YCS Extranet',
      'Agoda Hotel ID (numeric code)',
      'StayPilot selected as the authorized Channel Manager in Agoda YCS Settings',
      'Agoda API Partner Secret Key',
    ],
    fields: [
      {
        key: 'hotel_id',
        label: 'Agoda Hotel ID',
        type: 'text',
        description: 'Numeric property identifier shown on Agoda YCS dashboard',
        placeholder: 'e.g. 1928471',
        required: true,
      },
      {
        key: 'api_key',
        label: 'Agoda YCS API Key',
        type: 'password',
        description: 'Secure API token generated under Agoda YCS Connectivity settings',
        placeholder: 'agoda_ycs_sec_...',
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
        error: 'Agoda Hotel ID and YCS API Key are required.',
      };
    }

    return {
      valid: false,
      error: 'Agoda YCS Connectivity authentication requires active partner onboarding and channel manager switch in YCS Extranet.',
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
      error: 'Cannot push inventory: Agoda channel is not connected.',
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
      error: 'Cannot push rates: Agoda channel is not connected.',
    };
  }

  async fetchReservations(
    _propertyId: string,
    _since?: Date,
    _credentials?: Record<string, string>
  ): Promise<{ reservations: unknown[]; error?: string }> {
    return {
      reservations: [],
      error: 'Agoda channel disconnected.',
    };
  }
}
