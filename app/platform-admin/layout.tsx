import * as React from 'react';
import { redirect } from 'next/navigation';
import { verifyPlatformAdmin } from '@/lib/auth/platform-admin';
import { AdminLayoutClient } from '@/components/platform-admin/admin-layout-client';

export const instant = false;

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminProfile;
  try {
    const { profile } = await verifyPlatformAdmin();
    adminProfile = profile;
  } catch {
    // If not authenticated or not a platform admin, redirect safely away
    redirect('/hotel/dashboard');
  }

  return <AdminLayoutClient profile={adminProfile}>{children}</AdminLayoutClient>;
}
