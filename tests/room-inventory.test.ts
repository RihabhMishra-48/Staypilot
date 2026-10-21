import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  roomTypeSchema,
  roomSchema,
  updateRoomStatusSchema,
} from '../lib/validation/room';
import { Room, OperationalStatus } from '../types';

describe('Phase 2: Room Types & Inventory Test Suite', () => {
  const mockPropertyId = '11111111-1111-4111-a111-111111111111';
  const mockRoomTypeId = '22222222-2222-4222-a222-222222222222';

  // ============================================================================
  // 1. Room Type Validation Tests
  // ============================================================================
  describe('Room Type Validation (Zod)', () => {
    it('should validate a correct room type specification', () => {
      const validData = {
        property_id: mockPropertyId,
        name: 'Deluxe Heritage Suite',
        description: 'Traditional suite with courtyard view',
        max_adults: 2,
        max_children: 1,
        bed_configuration: '1 King Bed',
        base_rate: 4500,
        amenities: ['Air Conditioning', 'Free Wi-Fi', 'Smart TV'],
        is_active: true,
      };

      const result = roomTypeSchema.safeParse(validData);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.name, 'Deluxe Heritage Suite');
        assert.equal(result.data.base_rate, 4500);
      }
    });

    it('should reject invalid negative rates', () => {
      const negativeRate = {
        property_id: mockPropertyId,
        name: 'Standard Room',
        max_adults: 2,
        max_children: 0,
        base_rate: -1500, // Invalid negative rate
      };

      const result = roomTypeSchema.safeParse(negativeRate);
      assert.equal(result.success, false);
      if (!result.success) {
        const hasRateError = result.error.issues.some(
          (issue) => issue.path[0] === 'base_rate'
        );
        assert.equal(hasRateError, true);
      }
    });

    it('should reject zero or negative adult capacity', () => {
      const invalidAdults = {
        property_id: mockPropertyId,
        name: 'Single Room',
        max_adults: 0, // Must be at least 1
        base_rate: 2000,
      };

      const result = roomTypeSchema.safeParse(invalidAdults);
      assert.equal(result.success, false);
      if (!result.success) {
        const hasAdultError = result.error.issues.some(
          (issue) => issue.path[0] === 'max_adults'
        );
        assert.equal(hasAdultError, true);
      }
    });

    it('should reject negative child capacity', () => {
      const invalidChildren = {
        property_id: mockPropertyId,
        name: 'Family Suite',
        max_adults: 3,
        max_children: -2,
        base_rate: 6000,
      };

      const result = roomTypeSchema.safeParse(invalidChildren);
      assert.equal(result.success, false);
      if (!result.success) {
        const hasChildError = result.error.issues.some(
          (issue) => issue.path[0] === 'max_children'
        );
        assert.equal(hasChildError, true);
      }
    });
  });

  // ============================================================================
  // 2. Physical Room Validation Tests
  // ============================================================================
  describe('Physical Room Validation (Zod)', () => {
    it('should validate a correct physical room unit', () => {
      const validRoom = {
        property_id: mockPropertyId,
        room_type_id: mockRoomTypeId,
        room_number: '101',
        floor: '1st Floor',
        operational_status: 'available',
        notes: 'Near elevator',
        is_archived: false,
      };

      const result = roomSchema.safeParse(validRoom);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.room_number, '101');
        assert.equal(result.data.operational_status, 'available');
      }
    });

    it('should reject empty room numbers', () => {
      const emptyRoomNumber = {
        property_id: mockPropertyId,
        room_type_id: mockRoomTypeId,
        room_number: '   ',
        operational_status: 'available',
      };

      const result = roomSchema.safeParse(emptyRoomNumber);
      assert.equal(result.success, false);
      if (!result.success) {
        const hasRoomError = result.error.issues.some(
          (issue) => issue.path[0] === 'room_number'
        );
        assert.equal(hasRoomError, true);
      }
    });

    it('should reject invalid operational statuses', () => {
      const invalidStatus = {
        property_id: mockPropertyId,
        room_type_id: mockRoomTypeId,
        room_number: '204',
        operational_status: 'broken_beyond_repair', // Not in enum
      };

      const result = roomSchema.safeParse(invalidStatus);
      assert.equal(result.success, false);
      if (!result.success) {
        const hasStatusError = result.error.issues.some(
          (issue) => issue.path[0] === 'operational_status'
        );
        assert.equal(hasStatusError, true);
      }
    });
  });

  // ============================================================================
  // 3. Operational Status Transition Tests
  // ============================================================================
  describe('Operational Status Transitions', () => {
    it('should allow valid status updates for housekeeping and front desk', () => {
      const validStatuses: OperationalStatus[] = [
        'available',
        'cleaning',
        'dirty',
        'maintenance',
        'out_of_service',
      ];

      for (const st of validStatuses) {
        const payload = {
          property_id: mockPropertyId,
          room_id: '33333333-3333-4333-a333-333333333333',
          operational_status: st,
          notes: `Status changed to ${st}`,
        };

        const res = updateRoomStatusSchema.safeParse(payload);
        assert.equal(res.success, true, `Status ${st} should be accepted`);
      }
    });
  });

  // ============================================================================
  // 4. Sellable Inventory Architecture Rules
  // ============================================================================
  describe('Sellable Inventory Calculation Logic', () => {
    it('should never count rooms in maintenance or out_of_service as sellable', () => {
      const sampleRooms: Room[] = [
        {
          id: '1',
          property_id: mockPropertyId,
          room_type_id: mockRoomTypeId,
          room_number: '101',
          operational_status: 'available',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          property_id: mockPropertyId,
          room_type_id: mockRoomTypeId,
          room_number: '102',
          operational_status: 'cleaning',
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          property_id: mockPropertyId,
          room_type_id: mockRoomTypeId,
          room_number: '103',
          operational_status: 'maintenance', // NOT SELLABLE
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          property_id: mockPropertyId,
          room_type_id: mockRoomTypeId,
          room_number: '104',
          operational_status: 'out_of_service', // NOT SELLABLE
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '5',
          property_id: mockPropertyId,
          room_type_id: mockRoomTypeId,
          room_number: '105',
          operational_status: 'available',
          is_archived: true, // ARCHIVED - NOT IN ACTIVE INVENTORY
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Business Rule: Sellable physical rooms must be active and not under maintenance or out of service
      const sellableRooms = sampleRooms.filter(
        (r) =>
          !r.is_archived &&
          r.operational_status !== 'maintenance' &&
          r.operational_status !== 'out_of_service'
      );

      assert.equal(sellableRooms.length, 2);
      assert.deepEqual(
        sellableRooms.map((r) => r.room_number),
        ['101', '102']
      );
    });
  });
});
