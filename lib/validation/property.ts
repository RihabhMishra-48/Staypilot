import { z } from 'zod';

export const propertySchema = z.object({
  name: z
    .string()
    .min(2, 'Property name must be at least 2 characters')
    .max(100, 'Property name must not exceed 100 characters'),
  address: z
    .string()
    .min(3, 'Street address is required (at least 3 characters)')
    .max(255, 'Address is too long'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(100, 'City name is too long'),
  state: z
    .string()
    .min(2, 'State / Province is required')
    .max(100, 'State name is too long'),
  country: z
    .string()
    .min(2, 'Country is required')
    .default('India'),
  timezone: z
    .string()
    .min(2, 'Timezone is required')
    .default('Asia/Kolkata'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO code (e.g. INR, USD)')
    .default('INR'),
  check_in_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Check-in time must be in HH:MM format (24-hour)')
    .default('14:00'),
  check_out_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Check-out time must be in HH:MM format (24-hour)')
    .default('11:00'),
  contact_email: z
    .string()
    .email('Please provide a valid contact email address'),
  contact_phone: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number is too long')
    .regex(/^[+0-9\s\-()]+$/, 'Please provide a valid phone number'),
});

export type PropertyInput = z.infer<typeof propertySchema>;
