import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types';
import { User } from '@supabase/supabase-js';

export async function isCurrentUserPlatformAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_platform_admin === true;
  } catch {
    return false;
  }
}

export async function verifyPlatformAdmin(): Promise<{ user: User; profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthenticated: Super Admin login required');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.is_platform_admin) {
    throw new Error('Forbidden: Platform Super Admin privileges required');
  }

  return { user, profile: profile as Profile };
}
