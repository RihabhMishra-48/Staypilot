import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv, isSupabaseConfigured } from './config';

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient(url, anonKey);
}

export { isSupabaseConfigured };
