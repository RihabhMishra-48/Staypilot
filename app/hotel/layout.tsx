import * as React from 'react';
import { getUserProperties } from '@/lib/actions/property';
import { getCurrentUser } from '@/lib/actions/auth';
import { HotelLayoutClient } from '@/components/hotel/hotel-layout-client';
import { ConfigWarningBanner } from '@/components/dashboard/config-warning-banner';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const instant = false;

export default async function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [propertiesResult, authResult] = await Promise.all([
    getUserProperties(),
    getCurrentUser(),
  ]);

  const properties = propertiesResult.properties || [];
  const profile = authResult.profile;
  const isConfigured = isSupabaseConfigured();

  return (
    <>
      {!isConfigured && <ConfigWarningBanner isConfigured={isConfigured} />}
      <HotelLayoutClient properties={properties} profile={profile}>
        {children}
      </HotelLayoutClient>
    </>
  );
}
