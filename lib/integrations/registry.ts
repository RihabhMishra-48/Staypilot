import { SupportedChannel } from '@/types';
import { ChannelAdapter, ChannelMetadata } from './types';
import { MakeMyTripAdapter } from './adapters/makemytrip';
import { GoibiboAdapter } from './adapters/goibibo';
import { AgodaAdapter } from './adapters/agoda';
import { BookingComAdapter } from './adapters/booking-com';

export const SUPPORTED_CHANNELS: SupportedChannel[] = [
  'makemytrip',
  'goibibo',
  'agoda',
  'booking_com',
];

const adapters: Record<SupportedChannel, ChannelAdapter> = {
  makemytrip: new MakeMyTripAdapter(),
  goibibo: new GoibiboAdapter(),
  agoda: new AgodaAdapter(),
  booking_com: new BookingComAdapter(),
};

export function getChannelAdapter(channel: SupportedChannel): ChannelAdapter {
  const adapter = adapters[channel];
  if (!adapter) {
    throw new Error(`Unsupported channel adapter requested: ${channel}`);
  }
  return adapter;
}

export function getAllChannelMetadata(): ChannelMetadata[] {
  return SUPPORTED_CHANNELS.map((channel) => adapters[channel].metadata);
}

export function getChannelMetadata(channel: SupportedChannel): ChannelMetadata {
  return getChannelAdapter(channel).metadata;
}
