/**
 * Validates whether Supabase environment variables are set and not using default placeholders.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    return false;
  }

  // Check for common default placeholder values
  if (
    url.includes('your-project') ||
    url.includes('placeholder') ||
    !url.startsWith('https://')
  ) {
    return false;
  }

  if (anonKey.includes('placeholder') || anonKey.length < 20) {
    return false;
  }

  return true;
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'placeholder-anon-key';

  return { url, anonKey };
}
