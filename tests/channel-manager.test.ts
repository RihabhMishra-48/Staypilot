import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_CHANNELS,
  getChannelAdapter,
  getAllChannelMetadata,
} from '../lib/integrations/registry';

describe('StayPilot Channel Manager Integration Test Suite', () => {
  describe('OTA Adapter Registry & Metadata Compliance', () => {
    it('should support all 4 required OTA partner channels', () => {
      assert.deepEqual(SUPPORTED_CHANNELS, [
        'makemytrip',
        'goibibo',
        'agoda',
        'booking_com',
      ]);
    });

    it('should return all channel metadata correctly', () => {
      const allMeta = getAllChannelMetadata();
      assert.equal(allMeta.length, 4);
      assert.ok(allMeta.every((m) => m.name && m.portalUrl));
    });

    it('should return valid independent adapter for each channel', () => {
      SUPPORTED_CHANNELS.forEach((channel) => {
        const adapter = getChannelAdapter(channel);
        assert.ok(adapter, `Adapter for ${channel} must exist`);
        assert.equal(adapter.channel, channel);
        assert.ok(adapter.metadata.name.length > 0);
        assert.ok(adapter.metadata.portalUrl.startsWith('https://'));
        assert.ok(adapter.metadata.documentationUrl.startsWith('https://'));
        assert.ok(adapter.metadata.fields.length >= 2, `${channel} must declare required fields`);
      });
    });
  });

  describe('Honest Credentials Verification & Validation', () => {
    it('MakeMyTrip: should reject empty credentials', async () => {
      const adapter = getChannelAdapter('makemytrip');
      const res = await adapter.validateCredentials({});
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Hotel Code and Vendor API Token are required'));
    });

    it('MakeMyTrip: should reject short/invalid vendor tokens', async () => {
      const adapter = getChannelAdapter('makemytrip');
      const res = await adapter.validateCredentials({
        hotel_code: 'MMT-102',
        vendor_api_token: 'short',
      });
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Invalid Vendor API Token format'));
    });

    it('Booking.com: should require machine account, hotel ID, and auth token', async () => {
      const adapter = getChannelAdapter('booking_com');
      const res = await adapter.validateCredentials({
        hotel_id: '7489201',
      });
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Hotel ID, Machine Account ID, and API Authentication Token are all required'));
    });

    it('Agoda: should require hotel ID and YCS API key', async () => {
      const adapter = getChannelAdapter('agoda');
      const res = await adapter.validateCredentials({});
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Agoda Hotel ID and YCS API Key are required'));
    });

    it('Goibibo: should require property ID and API secret key', async () => {
      const adapter = getChannelAdapter('goibibo');
      const res = await adapter.validateCredentials({});
      assert.equal(res.valid, false);
      assert.ok(res.error?.includes('Goibibo Property ID and API Secret Key are required'));
    });
  });

  describe('Sync Prevention for Unconnected Channels', () => {
    it('should refuse to push inventory without valid credentials', async () => {
      const adapter = getChannelAdapter('booking_com');
      const result = await adapter.pushInventory({
        propertyId: 'prop-1',
        dateFrom: '2026-10-21',
        dateTo: '2026-10-22',
        rates: [],
      });
      assert.equal(result.success, false);
      assert.equal(result.itemsSynced, 0);
      assert.ok(result.error?.includes('Cannot push inventory'));
    });

    it('should refuse to push rates without valid credentials', async () => {
      const adapter = getChannelAdapter('makemytrip');
      const result = await adapter.pushRates({
        propertyId: 'prop-1',
        dateFrom: '2026-10-21',
        dateTo: '2026-10-22',
        rates: [],
      });
      assert.equal(result.success, false);
      assert.equal(result.itemsSynced, 0);
      assert.ok(result.error?.includes('Cannot push rates'));
    });

    it('should return empty reservations for unconnected channel', async () => {
      const adapter = getChannelAdapter('agoda');
      const result = await adapter.fetchReservations('prop-1');
      assert.deepEqual(result.reservations, []);
      assert.ok(result.error?.includes('disconnected'));
    });
  });
});
