import { z } from 'zod';

export const operationalStatusEnum = z.enum([
  'available',
  'cleaning',
  'dirty',
  'maintenance',
  'out_of_service',
]);

export const roomTypeSchema = z.object({
  property_id: z.string().uuid('Invalid property identifier'),
  name: z
    .string()
    .trim()
    .min(2, 'Room type name must be at least 2 characters')
    .max(100, 'Room type name must not exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  max_adults: z.coerce
    .number()
    .int('Adult capacity must be an integer')
    .min(1, 'Room must accommodate at least 1 adult')
    .max(30, 'Adult capacity cannot exceed 30'),
  max_children: z.coerce
    .number()
    .int('Child capacity must be an integer')
    .min(0, 'Child capacity cannot be negative')
    .max(20, 'Child capacity cannot exceed 20')
    .default(0),
  bed_configuration: z
    .string()
    .trim()
    .max(100, 'Bed configuration is too long')
    .optional()
    .nullable(),
  base_rate: z.coerce
    .number()
    .min(0, 'Base rate cannot be negative')
    .max(10000000, 'Base rate is unrealistically high'),
  amenities: z.array(z.string().trim()).default([]),
  is_active: z.boolean().default(true),
});

export const roomSchema = z.object({
  property_id: z.string().uuid('Invalid property identifier'),
  room_type_id: z.string().uuid('Please select a valid room type'),
  room_number: z
    .string()
    .trim()
    .min(1, 'Room number is required')
    .max(20, 'Room number cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9\-_./\s]+$/, 'Room number contains invalid characters'),
  floor: z
    .string()
    .trim()
    .max(20, 'Floor designation is too long')
    .optional()
    .nullable(),
  operational_status: operationalStatusEnum.default('available'),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
  is_archived: z.boolean().default(false),
});

export const updateRoomStatusSchema = z.object({
  property_id: z.string().uuid('Invalid property identifier'),
  room_id: z.string().uuid('Invalid room identifier'),
  operational_status: operationalStatusEnum,
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
});

export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type UpdateRoomStatusInput = z.infer<typeof updateRoomStatusSchema>;
