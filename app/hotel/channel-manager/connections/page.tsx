import * as React from 'react';
import { Metadata } from 'next';
import { getUserProperties } from '@/lib/actions/property';
import { getPropertyChannelSummaries } from '@/lib/actions/channel';
import { ChannelConnectionsClient } from '@/components/hotel/channel-connections-client';
import { ChannelSummary } from '@/types';

export const metadata: Metadata = {
  title: 'OTA Channel Connections — StayPilot',
  description: 'Bilateral connectivity configuration for MakeMyTrip, Goibibo, Agoda, and Booking.com.',
};

export default async function ChannelConnectionsPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let channelSummaries: ChannelSummary[] = [];
  if (currentProperty) {
    channelSummaries = await getPropertyChannelSummaries(currentProperty.id);
  }

  return <ChannelConnectionsClient initialSummaries={channelSummaries} />;
}
