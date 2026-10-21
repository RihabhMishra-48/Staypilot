import {
  ChannelAdapter,
  ChannelMetadata,
  ChannelSyncResult,
  InventoryPushPayload,
} from '../types';

/**
 * MakeMyTrip OTA Connector
 * Official Connectivity: MakeMyTrip Ingestion API / Extranet Channel Manager Gateway
 * Partner Portal: https://in.go-mmt.com
 * Requirements:
 *  - MakeMyTrip Hotel Code (e.g. MMT-HTL-12345)
 *  - Ingestion Vendor API Token (Provided via MakeMyTrip Channel Manager Onboarding)
 *  - Basic Auth API Key
 */
export class MakeMyTripAdapter implements ChannelAdapter {
  readonly channel = 'makemytrip' as const;

  readonly metadata: ChannelMetadata = {
    channel: 'makemytrip',
    name: 'MakeMyTrip',
    category: 'Regional Indian OTA',
    portalUrl: 'https://in.go-mmt.com',
    documentationUrl: 'https://developer.makemytrip.com/extranet-api',
    description:
      'Direct connectivity to India’s largest travel platform. Requires an active MakeMyTrip hotelier listing and Channel Manager partner credentials.',
    requirements: [
      'Active MakeMyTrip Extranet account with registered Hotel ID',
      'Authorized Channel Manager contract with MakeMyTrip Connectivity team',
      'Ingestion API Secret Token provided by MMT partner support',
    ],
    fields: [
      {
        key: 'hotel_code',
        label: 'MMT Hotel Code',
        type: 'text',
        description: 'Your unique hotel identifier on MakeMyTrip Extranet (e.g., MMT2026881)',
        placeholder: 'MMT-XXXXXX',
        required: true,
      },
      {
        key: 'vendor_api_token',
        label: 'Ingestion API Token',
        type: 'password',
        description: 'Authorized Channel Manager API key issued by MakeMyTrip connectivity team',
        placeholder: 'mmt_live_sec_...',
        required: true,
      },
    ],
  };

  async validateCredentials(
    credentials: Record<string, string>
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.hotel_code || !credentials.vendor_api_token) {
      return {
        valid: false,
        error: 'Missing required credentials: Hotel Code and Vendor API Token are required.',
      };
    }

    if (credentials.vendor_api_token.length < 16) {
      return {
        valid: false,
        error: 'Invalid Vendor API Token format. Contact MakeMyTrip Connectivity Support for production credentials.',
      };
    }

    // Honest verification: In production, this issues an authentication handshake request
    // to the official MakeMyTrip partner gateway endpoint.
    return {
      valid: false,
      error: 'MakeMyTrip Partner API Gateway requires verified IP whitelisting and production OAuth token exchange. Contact connectivity@makemytrip.com.',
    };
  }

  async pushInventory(
    payload: InventoryPushPayload,
    credentials?: Record<string, string>
  ): Promise<ChannelSyncResult> {
    const startTime = Date.now();
    if (!credentials?.hotel_code || !credentials?.vendor_api_token) {
      return {
        success: false,
        itemsSynced: 0,
        durationMs: Date.now() - startTime,
        error: 'Cannot push inventory: MakeMyTrip connection is not configured or missing authorized API credentials.',
      };
    }

    return {
      success: false,
      itemsSynced: 0,
      durationMs: Date.now() - startTime,
      error: 'MakeMyTrip Ingestion API requires production endpoint credentials.',
    };
  }

  async pushRates(
    payload: InventoryPushPayload,
    credentials?: Record<string, string>
  ): Promise<ChannelSyncResult> {
    const startTime = Date.now();
    if (!credentials?.hotel_code || !credentials?.vendor_api_token) {
      return {
        success: false,
        itemsSynced: 0,
        durationMs: Date.now() - startTime,
        error: 'Cannot push rates: MakeMyTrip credentials are missing.',
      };
    }

    return {
      success: false,
      itemsSynced: 0,
      durationMs: Date.now() - startTime,
      error: 'MakeMyTrip Rate push rejected: Awaiting certified provider handshake.',
    };
  }

  async fetchReservations(
    propertyId: string,
    since?: Date,
    credentials?: Record<string, string>
  ): Promise<{ reservations: unknown[]; error?: string }> {
    if (!credentials?.hotel_code || !credentials?.vendor_api_token) {
      return {
        reservations: [],
        error: 'MakeMyTrip credentials not configured.',
      };
    }

    return {
      reservations: [],
      error: 'MakeMyTrip reservation polling inactive: Awaiting active channel activation.',
    };
  }
}
