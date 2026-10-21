import * as React from 'react';
import { Metadata } from 'next';
import { getPlatformTenantsAction } from '@/lib/actions/platform-admin';
import { HotelsManagerClient } from '@/components/platform-admin/hotels-manager-client';

export const metadata: Metadata = {
  title: 'Hotel Businesses — StayPilot Super Admin',
  description: 'Manage hotel business accounts, subscriptions, and platform access.',
};

export default async function PlatformHotelsPage() {
  const tenants = await getPlatformTenantsAction();
  return <HotelsManagerClient initialTenants={tenants} />;
}
