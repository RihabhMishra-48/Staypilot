-- ==============================================================================
-- StayPilot Hotel Management SaaS — Phase 1 Initial Database Schema
-- Description: Core tables for Profiles, Properties, and Property Members with
--              robust Row Level Security (RLS) and recursion-free helper functions.
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  currency TEXT NOT NULL DEFAULT 'INR',
  check_in_time TEXT NOT NULL DEFAULT '14:00',
  check_out_time TEXT NOT NULL DEFAULT '11:00',
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes on properties
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);

-- Trigger for properties updated_at
DROP TRIGGER IF EXISTS trigger_properties_updated_at ON public.properties;
CREATE TRIGGER trigger_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Property Members Table (Multi-tenant access control)
CREATE TABLE IF NOT EXISTS public.property_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'receptionist', 'housekeeping')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_property_member UNIQUE (property_id, user_id)
);

-- Indexes on property_members
CREATE INDEX IF NOT EXISTS idx_property_members_user ON public.property_members(user_id);
CREATE INDEX IF NOT EXISTS idx_property_members_property ON public.property_members(property_id);
CREATE INDEX IF NOT EXISTS idx_property_members_role ON public.property_members(role);

-- ==============================================================================
-- 5. Helper Functions for RLS (Security Definer to prevent policy recursion)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_user_property_role(p_property_id UUID, p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.property_members
  WHERE property_id = p_property_id AND user_id = p_user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_property_member(p_property_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.property_members
    WHERE property_id = p_property_id AND user_id = p_user_id
  );
$$;

DROP FUNCTION IF EXISTS public.can_insert_property_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.can_insert_property_member(UUID, UUID, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.can_insert_property_member(
  p_property_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'owner'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    -- Case 1: Caller is owner or manager of the property
    public.get_user_property_role(p_property_id, auth.uid()) IN ('owner', 'manager')
    OR (
      -- Case 2: New property creation — no members exist yet, and the caller is making themselves owner
      auth.uid() = p_user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.property_members WHERE property_id = p_property_id
      )
    )
  );
$$;

-- Function to handle new user registration from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_members ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.property_members pm1
      JOIN public.property_members pm2 ON pm1.property_id = pm2.property_id
      WHERE pm1.user_id = auth.uid() AND pm2.user_id = public.profiles.id
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Properties Policies
DROP POLICY IF EXISTS "Members can view their properties" ON public.properties;
CREATE POLICY "Members can view their properties"
  ON public.properties FOR SELECT
  USING (public.is_property_member(id, auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create properties" ON public.properties;
CREATE POLICY "Authenticated users can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Owners and managers can update property details" ON public.properties;
CREATE POLICY "Owners and managers can update property details"
  ON public.properties FOR UPDATE
  USING (public.get_user_property_role(id, auth.uid()) IN ('owner', 'manager'))
  WITH CHECK (public.get_user_property_role(id, auth.uid()) IN ('owner', 'manager'));

DROP POLICY IF EXISTS "Only owners can delete properties" ON public.properties;
CREATE POLICY "Only owners can delete properties"
  ON public.properties FOR DELETE
  USING (public.get_user_property_role(id, auth.uid()) = 'owner');

-- Property Members Policies
DROP POLICY IF EXISTS "Users can view members of properties they belong to" ON public.property_members;
CREATE POLICY "Users can view members of properties they belong to"
  ON public.property_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_property_member(property_id, auth.uid())
  );

DROP POLICY IF EXISTS "Owners and managers or new creators can add members" ON public.property_members;
CREATE POLICY "Owners and managers or new creators can add members"
  ON public.property_members FOR INSERT
  WITH CHECK (public.can_insert_property_member(property_id, user_id, role));

DROP POLICY IF EXISTS "Owners can update member roles" ON public.property_members;
CREATE POLICY "Owners can update member roles"
  ON public.property_members FOR UPDATE
  USING (public.get_user_property_role(property_id, auth.uid()) = 'owner')
  WITH CHECK (public.get_user_property_role(property_id, auth.uid()) = 'owner');

DROP POLICY IF EXISTS "Owners can remove members" ON public.property_members;
CREATE POLICY "Owners can remove members"
  ON public.property_members FOR DELETE
  USING (public.get_user_property_role(property_id, auth.uid()) = 'owner');
