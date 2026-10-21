import { SupportedChannel } from '@/types';

export interface ChannelFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'password';
  description: string;
  placeholder: string;
  required: boolean;
}

export interface ChannelMetadata {
  channel: SupportedChannel;
  name: string;
  category: 'Global OTA' | 'Regional Indian OTA';
  portalUrl: string;
  documentationUrl: string;
  description: string;
  requirements: string[];
  fields: ChannelFieldDefinition[];
}

export interface InventoryPushPayload {
  propertyId: string;
  dateFrom: string;
  dateTo: string;
  rates: Array<{
    roomTypeId: string;
    date: string;
    availableUnits: number;
    baseRate: number;
    closed: boolean;
  }>;
}

export interface ChannelSyncResult {
  success: boolean;
  itemsSynced: number;
  durationMs: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ChannelAdapter {
  readonly channel: SupportedChannel;
  readonly metadata: ChannelMetadata;
  
  /**
   * Validate partner API credentials against official gateway
   */
  validateCredentials(credentials: Record<string, string>): Promise<{ valid: boolean; error?: string }>;

  /**
   * Push live room availability updates
   */
  pushInventory(payload: InventoryPushPayload, credentials?: Record<string, string>): Promise<ChannelSyncResult>;

  /**
   * Push rate and price updates
   */
  pushRates(payload: InventoryPushPayload, credentials?: Record<string, string>): Promise<ChannelSyncResult>;

  /**
   * Pull newly confirmed reservations
   */
  fetchReservations(propertyId: string, since?: Date, credentials?: Record<string, string>): Promise<{ reservations: unknown[]; error?: string }>;
}
