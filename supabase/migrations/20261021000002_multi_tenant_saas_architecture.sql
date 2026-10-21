-- ==============================================================================
-- StayPilot Hotel Management SaaS — Multi-Tenant Architecture Migration
-- Description: Establishes Business Tenants (Organizations), Organization Memberships,
--              Platform Administration, Audit Logging, and Invitation Workflows.
--              Backward-compatible with Phase 1 and Phase 2.
-- ==============================================================================

-- 1. Add Platform Admin column to Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_platform_admin ON public.profiles(is_platform_admin);

-- 2. Organizations Table (Business / Tenant Entity)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  billing_email TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'starter'
    CHECK (subscription_tier IN ('starter', 'growth', 'pro', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'suspended')),
  max_properties INTEGER NOT NULL DEFAULT 3 CHECK (max_properties >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(subscription_status);

-- Trigger for organizations updated_at
DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON public.organizations;
CREATE TRIGGER trigger_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. Organization Members Table (Multi-Property Staff & Corporate Roles)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_organization_member UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members(organization_id);

-- 4. Link Properties to Organizations (Backward-Compatible)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON public.properties(organization_id);

-- 5. Backfill Existing Properties into Default Organizations (Zero Data Loss)
DO $$
DECLARE
  prop RECORD;
  new_org_id UUID;
  owner_user_id UUID;
  org_slug TEXT;
BEGIN
  FOR prop IN SELECT * FROM public.properties WHERE organization_id IS NULL LOOP
    -- Generate unique slug
    org_slug := lower(regexp_replace(prop.name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substring(prop.id::text, 1, 8);
    
    -- Create default organization for this property
    INSERT INTO public.organizations (name, slug, billing_email, subscription_tier, subscription_status)
    VALUES (prop.name || ' Group', org_slug, prop.contact_email, 'starter', 'active')
    RETURNING id INTO new_org_id;

    -- Update property with organization_id
    UPDATE public.properties SET organization_id = new_org_id WHERE id = prop.id;

    -- Find property owner and add to organization_members as owner
    SELECT user_id INTO owner_user_id FROM public.property_members
    WHERE property_id = prop.id AND role = 'owner'
    LIMIT 1;

    IF owner_user_id IS NOT NULL THEN
      INSERT INTO public.organization_members (organization_id, user_id, role)
      VALUES (new_org_id, owner_user_id, 'owner')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 6. Enforce Composite Uniqueness on Rooms for Phase 3 Reservation Foreign Keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_rooms_property_composite'
  ) THEN
    ALTER TABLE public.rooms ADD CONSTRAINT uq_rooms_property_composite UNIQUE (property_id, id);
  END IF;
END $$;

-- 7. Audit Logs Table (Append-Only Operational History)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_property ON public.audit_logs(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 8. Property Staff Invitations Table
CREATE TABLE IF NOT EXISTS public.property_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'receptionist', 'housekeeping')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_invitation_property_email UNIQUE (property_id, email)
);

CREATE INDEX IF NOT EXISTS idx_property_invitations_token ON public.property_invitations(token);
CREATE INDEX IF NOT EXISTS idx_property_invitations_property ON public.property_invitations(property_id);

-- ==============================================================================
-- 9. Security Definer Helper Functions
-- ==============================================================================

-- Check if user is platform administrator
CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_platform_admin FROM public.profiles WHERE id = p_user_id),
    false
  );
$$;

-- Check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(p_org_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id AND user_id = p_user_id
  );
$$;

-- Get user role in organization
CREATE OR REPLACE FUNCTION public.get_user_organization_role(p_org_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = p_org_id AND user_id = p_user_id
  LIMIT 1;
$$;

-- Privilege-Escalation Hardened Member Insertion Helper
-- Managers can only add receptionist or housekeeping roles. Only owners can add/grant owner or manager roles.
DROP FUNCTION IF EXISTS public.can_insert_property_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.can_insert_property_member(UUID, UUID, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.can_insert_property_member(
  p_property_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'receptionist'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role TEXT;
  v_is_first_member BOOLEAN;
BEGIN
  -- Check if caller is platform admin
  IF public.is_platform_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  -- Case 1: Initial creation of the property — no members exist yet, caller making themselves owner
  SELECT NOT EXISTS (
    SELECT 1 FROM public.property_members WHERE property_id = p_property_id
  ) INTO v_is_first_member;

  IF v_is_first_member AND auth.uid() = p_user_id AND p_role = 'owner' THEN
    RETURN true;
  END IF;

  v_caller_role := public.get_user_property_role(p_property_id, auth.uid());

  -- Case 2: Caller is Property Owner — can invite any valid role
  IF v_caller_role = 'owner' THEN
    RETURN true;
  END IF;

  -- Case 3: Caller is Manager — CANNOT create/invite owners or managers (prevents privilege escalation)
  IF v_caller_role = 'manager' AND p_role IN ('receptionist', 'housekeeping') THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ==============================================================================
-- 10. Row Level Security Policies
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    public.is_organization_member(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Organization owners and admins can update organization" ON public.organizations;
CREATE POLICY "Organization owners and admins can update organization"
  ON public.organizations FOR UPDATE
  USING (
    public.get_user_organization_role(id, auth.uid()) IN ('owner', 'admin')
    OR public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    public.get_user_organization_role(id, auth.uid()) IN ('owner', 'admin')
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Only platform admins or org owners can delete organizations" ON public.organizations;
CREATE POLICY "Only platform admins or org owners can delete organizations"
  ON public.organizations FOR DELETE
  USING (
    public.get_user_organization_role(id, auth.uid()) = 'owner'
    OR public.is_platform_admin(auth.uid())
  );

-- Organization Members Policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
CREATE POLICY "Users can view members of their organizations"
  ON public.organization_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_organization_member(organization_id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org owners and admins can add members" ON public.organization_members;
CREATE POLICY "Org owners and admins can add members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    public.get_user_organization_role(organization_id, auth.uid()) IN ('owner', 'admin')
    OR (
      -- Auto-adding creator on new org
      auth.uid() = user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.organization_members WHERE organization_id = organization_members.organization_id
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org owners can update member roles" ON public.organization_members;
CREATE POLICY "Org owners can update member roles"
  ON public.organization_members FOR UPDATE
  USING (
    public.get_user_organization_role(organization_id, auth.uid()) = 'owner'
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org owners can remove members" ON public.organization_members;
CREATE POLICY "Org owners can remove members"
  ON public.organization_members FOR DELETE
  USING (
    public.get_user_organization_role(organization_id, auth.uid()) = 'owner'
    OR public.is_platform_admin(auth.uid())
  );

-- Audit Logs Policies (Append-Only)
DROP POLICY IF EXISTS "Authorized property staff and platform admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Authorized property staff and platform admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR (
      property_id IS NOT NULL
      AND public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
    )
    OR (
      organization_id IS NOT NULL
      AND public.get_user_organization_role(organization_id, auth.uid()) IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can record audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can record audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- Property Invitations Policies
DROP POLICY IF EXISTS "Property managers and owners can view invitations" ON public.property_invitations;
CREATE POLICY "Property managers and owners can view invitations"
  ON public.property_invitations FOR SELECT
  USING (
    public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Property managers and owners can issue invitations" ON public.property_invitations;
CREATE POLICY "Property managers and owners can issue invitations"
  ON public.property_invitations FOR INSERT
  WITH CHECK (
    public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Property owners can cancel invitations" ON public.property_invitations;
CREATE POLICY "Property owners can cancel invitations"
  ON public.property_invitations FOR DELETE
  USING (
    public.get_user_property_role(property_id, auth.uid()) IN ('owner', 'manager')
    OR public.is_platform_admin(auth.uid())
  );
