import * as React from 'react';
import { Metadata } from 'next';
import { getUserProperties } from '@/lib/actions/property';
import { getRoomTypes } from '@/lib/actions/room';
import { getPropertyChannelSummaries } from '@/lib/actions/channel';
import { ChannelManagerMatrixClient } from '@/components/hotel/channel-manager-matrix-client';
import { RoomType, ChannelSummary } from '@/types';

export const metadata: Metadata = {
  title: 'Rates & Availability Matrix — StayPilot Channel Manager',
  description: 'Master rate parity and OTA inventory distribution matrix.',
};

export default async function HotelChannelManagerPage() {
  const { properties } = await getUserProperties();
  const currentProperty = properties.length > 0 ? properties[0] : null;

  let roomTypes: RoomType[] = [];
  let channelSummaries: ChannelSummary[] = [];

  if (currentProperty) {
    const [typesResult, fetchedSummaries] = await Promise.all([
      getRoomTypes(currentProperty.id),
      getPropertyChannelSummaries(currentProperty.id),
    ]);
    roomTypes = typesResult.roomTypes || [];
    channelSummaries = fetchedSummaries;
  }

  return (
    <ChannelManagerMatrixClient
      roomTypes={roomTypes}
      channelSummaries={channelSummaries}
    />
  );
}
