import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/hotel/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Return the user to login with informative query param
  return NextResponse.redirect(
    new URL('/login?error=email_verification_failed', requestUrl.origin)
  );
}
