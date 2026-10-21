import * as React from 'react';
import { Metadata } from 'next';
import { getUserProperties } from '@/lib/actions/property';
import { getRoomInventoryMetrics } from '@/lib/actions/room';
import { getPropertyChannelSummaries, getPropertySyncLogs } from '@/lib/actions/channel';
import { HotelDashboardClient } from '@/components/hotel/hotel-dashboard-client';
import { RoomInventoryMetrics, ChannelSummary, ChannelSyncLog } from '@/types';

export const metadata: Metadata = {
  title: 'Channel Manager Dashboard — StayPilot',
  description: 'Hotel Channel Manager operations, OTA connections, and inventory synchronization.',
};

export default async function HotelDashboardPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let metrics: RoomInventoryMetrics = {
    totalRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    dirtyRooms: 0,
    maintenanceRooms: 0,
    outOfServiceRooms: 0,
    totalRoomTypes: 0,
    activeRoomTypes: 0,
  };

  let channelSummaries: ChannelSummary[] = [];
  let syncLogs: ChannelSyncLog[] = [];

  if (currentProperty) {
    const [fetchedMetrics, fetchedSummaries, fetchedLogs] = await Promise.all([
      getRoomInventoryMetrics(currentProperty.id),
      getPropertyChannelSummaries(currentProperty.id),
      getPropertySyncLogs(currentProperty.id, 10),
    ]);

    metrics = fetchedMetrics;
    channelSummaries = fetchedSummaries;
    syncLogs = fetchedLogs;
  }

  return (
    <HotelDashboardClient
      initialMetrics={metrics}
      channelSummaries={channelSummaries}
      syncLogs={syncLogs}
      recentReservations={[]}
    />
  );
}
