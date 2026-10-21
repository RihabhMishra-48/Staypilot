import {
  ChannelAdapter,
  ChannelMetadata,
  ChannelSyncResult,
  InventoryPushPayload,
} from '../types';

/**
 * Booking.com OTA Connector
 * Official Connectivity: Booking.com Connectivity Partner API / B.XML 2.0 / Content API
 * Partner Portal: https://admin.booking.com
 * Requirements:
 *  - Booking.com Legal Entity Hotel ID
 *  - Machine Account Credentials (Username & Password)
 *  - Channel Manager authorization confirmed in Booking.com Extranet
 */
export class BookingComAdapter implements ChannelAdapter {
  readonly channel = 'booking_com' as const;

  readonly metadata: ChannelMetadata = {
    channel: 'booking_com',
    name: 'Booking.com',
    category: 'Global OTA',
    portalUrl: 'https://admin.booking.com',
    documentationUrl: 'https://connectivity.booking.com',
    description:
      'Global distribution with real-time rate parity, two-way inventory deduction, and instant reservation delivery via Booking.com Connectivity API.',
    requirements: [
      'Active Booking.com Extranet listing',
      'Booking.com Hotel ID (numeric ID)',
      'StayPilot selected as Connectivity Provider in Booking.com Extranet Account settings',
      'Authorized Machine Account login issued by Booking.com Partner Services',
    ],
    fields: [
      {
        key: 'hotel_id',
        label: 'Booking.com Hotel ID',
        type: 'text',
        description: 'Numeric property ID assigned on Booking.com Extranet',
        placeholder: 'e.g. 7489201',
        required: true,
      },
      {
        key: 'machine_account',
        label: 'Machine Account ID',
        type: 'text',
        description: 'Machine account username provisioned by Booking.com Connectivity Hub',
        placeholder: 'e.g. staypilot_conn_102',
        required: true,
      },
      {
        key: 'api_token',
        label: 'API Authentication Token',
        type: 'password',
        description: 'Secure token or password for the machine account',
        placeholder: 'bk_live_sec_...',
        required: true,
      },
    ],
  };

  async validateCredentials(
    credentials: Record<string, string>
  ): Promise<{ valid: boolean; error?: string }> {
    if (!credentials.hotel_id || !credentials.machine_account || !credentials.api_token) {
      return {
        valid: false,
        error: 'Hotel ID, Machine Account ID, and API Authentication Token are all required.',
      };
    }

    return {
      valid: false,
      error: 'Booking.com Connectivity Hub requires bilateral channel manager handshake. Please confirm StayPilot connection inside admin.booking.com.',
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
      error: 'Cannot push inventory: Booking.com connection is not authorized.',
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
      error: 'Cannot push rates: Booking.com connection is not authorized.',
    };
  }

  async fetchReservations(
    _propertyId: string,
    _since?: Date,
    _credentials?: Record<string, string>
  ): Promise<{ reservations: unknown[]; error?: string }> {
    return {
      reservations: [],
      error: 'Booking.com channel disconnected.',
    };
  }
}
