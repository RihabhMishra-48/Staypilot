import * as React from 'react';
import { Metadata } from 'next';
import { getUserProperties } from '@/lib/actions/property';
import { getPropertySyncLogs } from '@/lib/actions/channel';
import { ChannelSyncLogsClient } from '@/components/hotel/channel-sync-logs-client';
import { ChannelSyncLog } from '@/types';

export const metadata: Metadata = {
  title: 'Channel Sync Logs — StayPilot',
  description: 'Audit logs of inventory pushes, rate plan updates, and reservation transmissions.',
};

export default async function ChannelSyncLogsPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let logs: ChannelSyncLog[] = [];
  if (currentProperty) {
    logs = await getPropertySyncLogs(currentProperty.id, 50);
  }

  return <ChannelSyncLogsClient initialLogs={logs} />;
}
