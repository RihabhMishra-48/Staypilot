-- ==============================================================================
-- StayPilot Hotel Channel Manager — Core Integration & Sync Schema Migration
-- Description: Establishes OTA Channel Connections, Channel Mappings, 
--              Sync Logs, and Concurrency-Safe Inventory Tracking.
-- ==============================================================================

-- 1. Supported OTA Channels Check
-- Target channels: MakeMyTrip, Goibibo, Agoda, Booking.com
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ota_channel') THEN
    CREATE TYPE public.ota_channel AS ENUM ('makemytrip', 'goibibo', 'agoda', 'booking_com');
  END IF;
END $$;

-- 2. Channel Connections Table
-- Stores configuration, partner credentials, and connection health per property
CREATE TABLE IF NOT EXISTS public.channel_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  channel public.ota_channel NOT NULL,
  hotel_identifier TEXT, -- Hotel ID or Property ID on OTA extranet
  credentials_encrypted JSONB DEFAULT '{}'::jsonb, -- Secured partner API credentials
  status TEXT NOT NULL DEFAULT 'disconnected'
    CHECK (status IN ('disconnected', 'pending_verification', 'connected', 'error', 'suspended')),
  two_way_sync BOOLEAN NOT NULL DEFAULT true,
  rate_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  inventory_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_successful_sync_at TIMESTAMPTZ,
  last_error TEXT,
  settings JSONB DEFAULT '{"auto_close_on_zero": true, "sync_pricing": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_property_channel UNIQUE (property_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_channel_connections_property ON public.channel_connections(property_id);
CREATE INDEX IF NOT EXISTS idx_channel_connections_status ON public.channel_connections(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_channel_connections_updated_at ON public.channel_connections;
CREATE TRIGGER trigger_channel_connections_updated_at
  BEFORE UPDATE ON public.channel_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Channel Room & Rate Mappings
-- Maps StayPilot internal room types and rate plans to OTA room IDs and rate plan codes
CREATE TABLE IF NOT EXISTS public.channel_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  channel public.ota_channel NOT NULL,
  room_type_id UUID NOT NULL REFERENCES public.room_types(id) ON DELETE CASCADE,
  ota_room_type_id TEXT NOT NULL,
  ota_room_type_name TEXT,
  ota_rate_plan_id TEXT,
  ota_rate_plan_name TEXT,
  price_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00 CHECK (price_multiplier > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_property_channel_room_type UNIQUE (property_id, channel, room_type_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_mappings_property ON public.channel_mappings(property_id);
CREATE INDEX IF NOT EXISTS idx_channel_mappings_room_type ON public.channel_mappings(room_type_id);

DROP TRIGGER IF EXISTS trigger_channel_mappings_updated_at ON public.channel_mappings;
CREATE TRIGGER trigger_channel_mappings_updated_at
  BEFORE UPDATE ON public.channel_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Channel Sync Logs Table
-- Append-only audit record of every inventory push, rate push, and reservation pull
CREATE TABLE IF NOT EXISTS public.channel_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  channel public.ota_channel NOT NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('inventory', 'rates', 'reservations', 'full')),
  direction TEXT NOT NULL DEFAULT 'push' CHECK (direction IN ('push', 'pull')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'in_progress', 'retry_scheduled')),
  items_synced INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  payload_summary JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_property ON public.channel_sync_logs(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_channel ON public.channel_sync_logs(channel, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_sync_logs_status ON public.channel_sync_logs(status);

-- ==============================================================================
-- 5. Row Level Security Policies for Channel Manager
-- ==============================================================================

ALTER TABLE public.channel_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_sync_logs ENABLE ROW LEVEL SECURITY;

-- Channel Connections Policies
DROP POLICY IF EXISTS "Authorized property staff and platform admins can view channel connections" ON public.channel_connections;
CREATE POLICY "Authorized property staff and platform admins can view channel connections"
  ON public.channel_connections FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "Property owners, managers and platform admins can modify channel connections" ON public.channel_connections;
CREATE POLICY "Property owners, managers and platform admins can modify channel connections"
  ON public.channel_connections FOR ALL
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
  );

-- Channel Mappings Policies
DROP POLICY IF EXISTS "Authorized property staff and platform admins can view channel mappings" ON public.channel_mappings;
CREATE POLICY "Authorized property staff and platform admins can view channel mappings"
  ON public.channel_mappings FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "Property owners, managers and platform admins can manage channel mappings" ON public.channel_mappings;
CREATE POLICY "Property owners, managers and platform admins can manage channel mappings"
  ON public.channel_mappings FOR ALL
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
  );

-- Channel Sync Logs Policies (Append-Only)
DROP POLICY IF EXISTS "Authorized staff and platform admins can view channel sync logs" ON public.channel_sync_logs;
CREATE POLICY "Authorized staff and platform admins can view channel sync logs"
  ON public.channel_sync_logs FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_user_property_role(property_id, auth.uid()) IS NOT NULL
  );

DROP POLICY IF EXISTS "Authenticated users or background services can insert sync logs" ON public.channel_sync_logs;
CREATE POLICY "Authenticated users or background services can insert sync logs"
  ON public.channel_sync_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );
