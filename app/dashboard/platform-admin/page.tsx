import * as React from 'react';
import { getPlatformOverview, getUserOrganizations } from '@/lib/actions/organization';
import { PlatformAdminClient } from '@/components/admin/platform-admin-client';

export const metadata = {
  title: 'Platform Administration — StayPilot Hotel SaaS',
  description: 'Multi-Tenant Account Management, Subscription Control & System Security Telemetry',
};

export default async function PlatformAdminPage() {
  const [overview, userOrgs] = await Promise.all([
    getPlatformOverview(),
    getUserOrganizations(),
  ]);

  return (
    <PlatformAdminClient
      overview={overview}
      userOrganizations={userOrgs.organizations}
    />
  );
}
