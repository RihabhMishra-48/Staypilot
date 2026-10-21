import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv, isSupabaseConfigured } from './config';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Handle root redirect
  if (pathname === '/' || pathname === '/hotel' || pathname === '/hotel/') {
    const url = request.nextUrl.clone();
    url.pathname = '/hotel/dashboard';
    return NextResponse.redirect(url);
  }

  // Handle platform-admin root redirect
  if (pathname === '/platform-admin' || pathname === '/platform-admin/') {
    const url = request.nextUrl.clone();
    url.pathname = '/platform-admin/dashboard';
    return NextResponse.redirect(url);
  }

  // Backward compatibility redirect: /dashboard/* -> /hotel/*
  if (pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/dashboard/, '/hotel');
    return NextResponse.redirect(url);
  }

  // If Supabase is not configured yet, pass through
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth');

  const isHotelRoute = pathname.startsWith('/hotel');
  const isPlatformAdminRoute = pathname.startsWith('/platform-admin');

  // 1. Unauthenticated users cannot access /hotel or /platform-admin
  if (!user && (isHotelRoute || isPlatformAdminRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Platform Admin boundary check: Only users with is_platform_admin can access /platform-admin
  if (user && isPlatformAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_platform_admin) {
      // Ordinary hotel user cannot access platform admin -> redirect to hotel dashboard
      const forbiddenUrl = request.nextUrl.clone();
      forbiddenUrl.pathname = '/hotel/dashboard';
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // 3. Authenticated users visiting login/signup are redirected appropriately
  if (user && isAuthRoute && !pathname.startsWith('/auth/callback')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = profile?.is_platform_admin
      ? '/platform-admin/dashboard'
      : '/hotel/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
