export type PropertyRole = 'owner' | 'manager' | 'receptionist' | 'housekeeping';
export type OrganizationRole = 'owner' | 'admin' | 'member';
export type SubscriptionTier = 'starter' | 'growth' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  is_platform_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  billing_email?: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  max_properties: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  profile?: Profile;
  organization?: Organization;
}

export interface Property {
  id: string;
  organization_id?: string | null;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
  currency: string;
  check_in_time: string;
  check_out_time: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface PropertyMember {
  id: string;
  property_id: string;
  user_id: string;
  role: PropertyRole;
  created_at: string;
  profile?: Profile;
  property?: Property;
}

export interface PropertyInvitation {
  id: string;
  property_id: string;
  email: string;
  role: PropertyRole;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id?: string | null;
  property_id?: string | null;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
}

// ==========================================
// Phase 2: Room Types & Physical Rooms
// ==========================================

export interface RoomType {
  id: string;
  property_id: string;
  name: string;
  description?: string | null;
  max_adults: number;
  max_children: number;
  bed_configuration?: string | null;
  base_rate: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OperationalStatus =
  | 'available'
  | 'cleaning'
  | 'dirty'
  | 'maintenance'
  | 'out_of_service';

export interface Room {
  id: string;
  property_id: string;
  room_type_id: string;
  room_number: string;
  floor?: string | null;
  operational_status: OperationalStatus;
  notes?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  room_type?: RoomType;
}

export interface RoomInventoryMetrics {
  totalRooms: number;
  availableRooms: number;
  cleaningRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  outOfServiceRooms: number;
  totalRoomTypes: number;
  activeRoomTypes: number;
}

// ==========================================
// Dashboard & Operational Metrics
// ==========================================

export interface DashboardMetrics {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  todayArrivals: number;
  todayDepartures: number;
  occupancyRate: number;
  totalRevenue: number;
  averageDailyRate: number;
  revPar: number;
  currency: string;
}

export type ReservationStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type BookingSource = 'Direct' | 'Booking.com' | 'MakeMyTrip' | 'Agoda' | 'Goibibo';

export interface ReservationPreview {
  id: string;
  bookingRef: string;
  guestName: string;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: ReservationStatus;
  source: BookingSource;
}

export interface UpcomingArrival {
  id: string;
  guestName: string;
  roomType: string;
  roomNumber: string;
  arrivalTime: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
  nights: number;
}

export interface BookingSourceStat {
  channel: BookingSource;
  percentage: number;
  bookings: number;
  color: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// ==========================================
// Channel Manager & OTA Integrations
// ==========================================

export type SupportedChannel = 'makemytrip' | 'goibibo' | 'agoda' | 'booking_com';

export type ChannelConnectionStatus =
  | 'disconnected'
  | 'pending_verification'
  | 'connected'
  | 'error'
  | 'suspended';

export interface ChannelConnection {
  id: string;
  property_id: string;
  channel: SupportedChannel;
  hotel_identifier?: string | null;
  credentials_encrypted?: Record<string, string>;
  status: ChannelConnectionStatus;
  two_way_sync: boolean;
  rate_sync_enabled: boolean;
  inventory_sync_enabled: boolean;
  last_sync_at?: string | null;
  last_successful_sync_at?: string | null;
  last_error?: string | null;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SyncType = 'inventory' | 'rates' | 'reservations' | 'full';
export type SyncStatus = 'success' | 'failure' | 'in_progress' | 'retry_scheduled';

export interface ChannelSyncLog {
  id: string;
  property_id: string;
  channel: SupportedChannel;
  sync_type: SyncType;
  direction: 'push' | 'pull';
  status: SyncStatus;
  items_synced: number;
  error_message?: string | null;
  payload_summary?: Record<string, unknown>;
  duration_ms?: number | null;
  created_at: string;
}

export interface ChannelMapping {
  id: string;
  property_id: string;
  channel: SupportedChannel;
  room_type_id: string;
  ota_room_type_id: string;
  ota_room_type_name?: string | null;
  ota_rate_plan_id?: string | null;
  ota_rate_plan_name?: string | null;
  price_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  room_type?: RoomType;
}

export interface ChannelSummary {
  channel: SupportedChannel;
  displayName: string;
  connection: ChannelConnection | null;
  syncHealth: 'healthy' | 'warning' | 'error' | 'disconnected';
  lastSync?: string | null;
  mappedRoomTypesCount: number;
}

// ==========================================
// Platform Super Admin
// ==========================================

export interface PlatformAdminMetrics {
  totalTenants: number;
  totalProperties: number;
  activeSubscriptions: number;
  connectedChannels: number;
  syncSuccessRate: number;
  pendingAlerts: number;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  pricePerMonth: number;
  maxProperties: number;
  maxChannels: number;
  features: string[];
  isPopular?: boolean;
}

