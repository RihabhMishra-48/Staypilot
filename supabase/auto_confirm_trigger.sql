-- ==============================================================================
-- StayPilot Permanent Production Trigger: Auto-Confirm Hoteliers & Users
-- ==============================================================================
-- Run this ONCE in your Supabase SQL Editor.
-- After this is executed, NO manual query is ever needed again:
-- Any hotelier who registers at /signup will be automatically and instantly confirmed,
-- logged in, and redirected directly into their PMS & Channel Manager dashboard.
-- ==============================================================================

-- 1. Create the auto-confirm trigger function
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically verify the user upon registration
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Attach BEFORE INSERT trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user_email();

-- 3. Confirm any users registered so far that were stuck in unconfirmed state
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
