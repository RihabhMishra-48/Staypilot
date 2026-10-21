-- ==============================================================================
-- StayPilot Hotel Management SaaS — Phase 2: Rooms & Inventory Schema
-- Description: Core tables for Room Types and Physical Rooms with strict constraints,
--              property isolation, and role-based Row Level Security (RLS).
-- ==============================================================================

-- 1. Room Types Table (Categories, Capacities, Base Pricing, Amenities)
CREATE TABLE IF NOT EXISTS public.room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_adults INTEGER NOT NULL DEFAULT 2 CHECK (max_adults >= 1),
  max_children INTEGER NOT NULL DEFAULT 0 CHECK (max_children >= 0),
  bed_configuration TEXT,
  base_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (base_rate >= 0),
  amenities TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_room_type_name_per_property UNIQUE (property_id, name),
  CONSTRAINT uq_room_types_property_composite UNIQUE (property_id, id)
);

-- Indexes for room_types
CREATE INDEX IF NOT EXISTS idx_room_types_property_id ON public.room_types(property_id);
CREATE INDEX IF NOT EXISTS idx_room_types_is_active ON public.room_types(is_active);

-- Trigger for room_types updated_at
DROP TRIGGER IF EXISTS trigger_room_types_updated_at ON public.room_types;
CREATE TRIGGER trigger_room_types_updated_at
  BEFORE UPDATE ON public.room_types
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. Physical Rooms Table (Inventory Units, Floor, Operational Status)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL,
  room_number TEXT NOT NULL,
  floor TEXT,
  operational_status TEXT NOT NULL DEFAULT 'available'
    CHECK (operational_status IN ('available', 'cleaning', 'dirty', 'maintenance', 'out_of_service')),
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_room_number_per_property UNIQUE (property_id, room_number),
  -- Ensures room type strictly belongs to the same property and prevents deleting room types referenced by rooms
  CONSTRAINT fk_rooms_room_type_composite FOREIGN KEY (property_id, room_type_id)
    REFERENCES public.room_types(property_id, id) ON DELETE RESTRICT
);

-- Indexes for rooms
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type_id ON public.rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(operational_status);
CREATE INDEX IF NOT EXISTS idx_rooms_archived ON public.rooms(is_archived);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON public.rooms(property_id, room_number);

-- Trigger for rooms updated_at
DROP TRIGGER IF EXISTS trigger_rooms_updated_at ON public.rooms;
CREATE TRIGGER trigger_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Trigger to prevent unauthorized field edits by housekeeping
CREATE OR REPLACE FUNCTION public.check_room_update_permission()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := public.get_user_property_role(NEW.property_id, auth.uid());
  -- If housekeeping, restrict modification of structural/inventory configuration
  IF v_role = 'housekeeping' THEN
    IF NEW.room_number <> OLD.room_number
       OR NEW.room_type_id <> OLD.room_type_id
       OR NEW.floor IS DISTINCT FROM OLD.floor
       OR NEW.is_archived <> OLD.is_archived THEN
      RAISE EXCEPTION 'Housekeeping staff are only authorized to update operational status and notes.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_check_room_update_permission ON public.rooms;
CREATE TRIGGER trigger_check_room_update_permission
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.check_room_update_permission();

-- ==============================================================================
-- 4. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Room Types Policies
DROP POLICY IF EXISTS "Members can view room types of their property" ON public.room_types;
CREATE POLICY "Members can view room types of their property"
  ON public.room_types FOR SELECT
  USING (public.is_property_member(property_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and managers can create room types" ON public.room_types;
CREATE POLICY "Owners and managers can create room types"
  ON public.room_types FOR INSERT
  WITH CHECK (public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager'));

DROP POLICY IF EXISTS "Owners and managers can update room types" ON public.room_types;
CREATE POLICY "Owners and managers can update room types"
  ON public.room_types FOR UPDATE
  USING (public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager'))
  WITH CHECK (public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager'));

DROP POLICY IF EXISTS "Only owners can delete room types" ON public.room_types;
CREATE POLICY "Only owners can delete room types"
  ON public.room_types FOR DELETE
  USING (public.get_user_property_role(property_id, auth.uid()) = 'owner');

-- Rooms Policies
DROP POLICY IF EXISTS "Members can view rooms of their property" ON public.rooms;
CREATE POLICY "Members can view rooms of their property"
  ON public.rooms FOR SELECT
  USING (public.is_property_member(property_id, auth.uid()));

DROP POLICY IF EXISTS "Owners and managers can create rooms" ON public.rooms;
CREATE POLICY "Owners and managers can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager'));

DROP POLICY IF EXISTS "Authorized staff can update rooms" ON public.rooms;
CREATE POLICY "Authorized staff can update rooms"
  ON public.rooms FOR UPDATE
  USING (public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager', 'receptionist', 'housekeeping'))
  WITH CHECK (public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager', 'receptionist', 'housekeeping'));

DROP POLICY IF EXISTS "Only owners can delete physical rooms" ON public.rooms;
CREATE POLICY "Only owners can delete physical rooms"
  ON public.rooms FOR DELETE
  USING (public.get_user_property_role(property_id, auth.uid()) = 'owner');
