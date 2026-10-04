import { z } from 'zod';

export const requestTypeValues = [
  'Education',
  'Medical',
  'Food',
  'Shelter',
  'Emergency',
  'Other',
] as const;

export const urgencyValues = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const helpStatusValues = [
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export const createHelpRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name cannot exceed 200 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(150, 'Email cannot exceed 150 characters')
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(7, 'Phone number must be at least 7 characters')
    .max(30, 'Phone number cannot exceed 30 characters')
    .trim(),
  requestType: z.enum(requestTypeValues, {
    message: 'Please select a valid request type: Education, Medical, Food, Shelter, Emergency, or Other',
  }),
  description: z
    .string()
    .min(10, 'Please describe your hardship in at least 10 characters')
    .max(3000, 'Description cannot exceed 3000 characters')
    .trim(),
  location: z
    .string()
    .min(2, 'Location is required (city, taluka, or district)')
    .max(200, 'Location cannot exceed 200 characters')
    .trim(),
  urgency: z.enum(urgencyValues).optional().default('MEDIUM'),
});

export const updateHelpRequestAdminSchema = z.object({
  status: z.enum(helpStatusValues).optional(),
  adminNotes: z.string().max(3000, 'Admin notes cannot exceed 3000 characters').trim().optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format for assignment')
    .nullable()
    .optional(),
  urgency: z.enum(urgencyValues).optional(),
});

export const helpRequestQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum([...helpStatusValues, 'ALL'] as const).optional(),
  requestType: z.enum([...requestTypeValues, 'ALL'] as const).optional(),
  urgency: z.enum([...urgencyValues, 'ALL'] as const).optional(),
  search: z.string().trim().optional(),
});

export type CreateHelpRequestInput = z.infer<typeof createHelpRequestSchema>;
export type UpdateHelpRequestAdminInput = z.infer<typeof updateHelpRequestAdminSchema>;
export type HelpRequestQueryParams = z.infer<typeof helpRequestQuerySchema>;
