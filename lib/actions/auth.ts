'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { loginSchema, signupSchema } from '@/lib/validation/auth';
import { ActionResponse, Profile } from '@/types';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function loginAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        'Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.',
    };
  }

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors: errorMap,
    };
  }

  const cleanedEmail = validation.data.email.trim().toLowerCase();
  const { password } = validation.data;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: cleanedEmail,
    password,
  });

  if (error || !authData.user) {
    console.error('[StayPilot Auth Login Error]', error?.message);
    const msg =
      error?.message?.toLowerCase().includes('credential') ||
      error?.message?.toLowerCase().includes('invalid')
        ? 'Invalid email or password. Note: If you recently registered, please ensure you clicked the verification link sent to your email inbox (check Spam folder too).'
        : error?.message || 'Authentication failed. Please check your credentials.';

    return {
      success: false,
      message: msg,
    };
  }

  let target = (formData.get('redirectTo') as string) || '';
  if (!target || target === '/dashboard' || target === '/hotel' || target === '/hotel/dashboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', authData.user.id)
      .single();

    target = profile?.is_platform_admin ? '/platform-admin/dashboard' : '/hotel/dashboard';
  }

  redirect(target);
}

export async function signupAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message:
        'Supabase is not configured yet. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable account registration.',
    };
  }

  const rawData = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    initialHotelName: (formData.get('initialHotelName') as string) || undefined,
  };

  const validation = signupSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMap: Record<string, string[]> = {};
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0]?.toString() || 'form';
      if (!errorMap[field]) errorMap[field] = [];
      errorMap[field].push(issue.message);
    });

    return {
      success: false,
      message: 'Validation failed. Please check the required fields.',
      errors: errorMap,
    };
  }

  const { fullName, password, initialHotelName } = validation.data;
  const cleanedEmail = validation.data.email.trim().toLowerCase();
  const supabase = await createClient();

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signUp({
    email: cleanedEmail,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/hotel/dashboard`,
      data: {
        full_name: fullName,
        initial_hotel_name: initialHotelName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message || 'Failed to create account.',
    };
  }

  // If Supabase has email confirmation disabled, this session will log in immediately
  if (data.session) {
    redirect('/hotel/dashboard');
  }

  // If email confirmation is enabled for security, inform the user to check their inbox
  return {
    success: true,
    message: `Account created successfully for ${cleanedEmail}! A security confirmation link has been sent to your email. Please click the link in your email inbox (or spam folder) to activate your account, then sign in.`,
  };
}

export async function logoutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/login');
}

export async function getCurrentUser(): Promise<{
  user: { id: string; email?: string } | null;
  profile: Profile | null;
}> {
  if (!isSupabaseConfigured()) {
    return { user: null, profile: null };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, profile: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user: { id: user.id, email: user.email },
      profile: profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        created_at: user.created_at,
        updated_at: user.created_at,
      },
    };
  } catch {
    return { user: null, profile: null };
  }
}
