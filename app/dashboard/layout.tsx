import * as React from 'react';
import { DashboardLayoutClient } from '@/components/layout/dashboard-layout-client';
import { getUserProperties } from '@/lib/actions/property';
import { getCurrentUser } from '@/lib/actions/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const metadata = {
  title: 'StayPilot — Hotel Operations & Channel Manager',
  description: 'Enterprise Hospitality Management System',
};

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isConfigured = isSupabaseConfigured();
  const [{ properties }, { profile }] = await Promise.all([
    getUserProperties(),
    getCurrentUser(),
  ]);

  return (
    <DashboardLayoutClient
      initialProperties={properties}
      userProfile={profile}
      isConfigured={isConfigured}
    >
      {children}
    </DashboardLayoutClient>
  );
}
