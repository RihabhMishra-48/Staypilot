-- ==============================================================================
-- StayPilot Platform Super Admin Fix & Bootstrap Script
-- ==============================================================================

-- 1. Fix any existing NULL token columns in auth.users (fixes 'Database error querying schema')
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone = COALESCE(phone, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '');

-- 2. Cleanly create or update the Super Admin user
DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_email TEXT := 'admin@staypilot.com';
  v_password TEXT := 'Admin@12345';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change,
      email_change_token_new,
      email_change_token_current,
      phone,
      phone_change,
      phone_change_token,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Platform Super Admin"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(v_password, gen_salt('bf')),
      email_confirmed_at = now(),
      confirmation_token = '',
      recovery_token = '',
      email_change = '',
      email_change_token_new = '',
      email_change_token_current = '',
      phone = COALESCE(phone, ''),
      phone_change = '',
      phone_change_token = '',
      aud = 'authenticated',
      role = 'authenticated'
    WHERE id = v_user_id;
  END IF;

  -- 3. Ensure profile exists and has is_platform_admin = true
  INSERT INTO public.profiles (id, full_name, is_platform_admin)
  VALUES (v_user_id, 'Platform Super Admin', true)
  ON CONFLICT (id) DO UPDATE SET is_platform_admin = true;
  
  RAISE NOTICE 'Platform Super Admin successfully fixed and ready: %', v_email;
END $$;

