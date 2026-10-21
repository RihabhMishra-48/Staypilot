import { z } from 'zod';

export const organizationSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Organization name must be at least 2 characters.' })
    .max(100, { message: 'Organization name must be under 100 characters.' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters.' })
    .max(50, { message: 'Slug must be under 50 characters.' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug must only contain lowercase alphanumeric characters and dashes.',
    }),
  billing_email: z.string().email({ message: 'Valid billing email is required.' }).optional().or(z.literal('')),
  subscription_tier: z
    .enum(['starter', 'growth', 'pro', 'enterprise'])
    .default('starter'),
});

export const propertyInvitationSchema = z.object({
  property_id: z.string().uuid({ message: 'Valid Property UUID is required.' }),
  email: z.string().email({ message: 'Valid email address is required.' }),
  role: z.enum(['owner', 'manager', 'receptionist', 'housekeeping'], {
    message: 'Valid operational staff role is required.',
  }),
});

export const auditLogSchema = z.object({
  organization_id: z.string().uuid().optional().nullable(),
  property_id: z.string().uuid().optional().nullable(),
  action: z.string().min(2),
  entity_type: z.string().min(2),
  entity_id: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
  ip_address: z.string().optional().nullable(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
export type PropertyInvitationFormData = z.infer<typeof propertyInvitationSchema>;
