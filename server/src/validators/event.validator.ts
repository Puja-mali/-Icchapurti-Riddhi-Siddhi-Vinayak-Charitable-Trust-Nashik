import { z } from 'zod';
import { validateAndSanitizeMediaUrl } from '../utils/fileSecurity';

const isSafeImageUrl = (val: string) => {
  if (!val) return true;
  if (val.startsWith('/api/uploads/')) return true;
  return validateAndSanitizeMediaUrl(val, 'IMAGE').isValid;
};

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title cannot exceed 200 characters')
    .trim(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  shortDescription: z
    .string()
    .min(5, 'Short description must be at least 5 characters')
    .max(500, 'Short description cannot exceed 500 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Full description must be at least 10 characters')
    .trim(),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .trim(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'A valid start date is required' }),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'A valid end date is required' })
    .optional(),
  registrationRequired: z.boolean().optional().default(false),
  registrationLimit: z
    .number()
    .min(0, 'Registration limit cannot be negative')
    .optional()
    .default(0),
  status: z
    .enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], {
      message: 'Invalid status value',
    })
    .optional()
    .default('UPCOMING'),
  imageUrl: z
    .string()
    .min(1, 'Cover image URL is required')
    .trim()
    .refine(isSafeImageUrl, {
      message: 'Invalid or unsafe image URL. Must be a valid http/https URL pointing to a supported image format or verified upload.',
    }),
  galleryUrls: z
    .array(
      z.string().trim().refine(isSafeImageUrl, {
        message: 'Invalid gallery image URL format or unsafe protocol detected.',
      })
    )
    .optional()
    .default([]),
  isKumbhRelated: z.boolean().optional().default(false),
  category: z.string().optional().default('Community Outreach'),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
  }
  return true;
}, {
  message: 'End date cannot be earlier than start date',
  path: ['endDate'],
});

export const updateEventSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  shortDescription: z.string().min(5).max(500).trim().optional(),
  description: z.string().min(10).trim().optional(),
  location: z.string().min(2).trim().optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' })
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' })
    .optional(),
  registrationRequired: z.boolean().optional(),
  registrationLimit: z.number().min(0).optional(),
  status: z
    .enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .optional(),
  imageUrl: z.string().min(1).trim().refine(isSafeImageUrl, {
    message: 'Invalid or unsafe image URL format.',
  }).optional(),
  galleryUrls: z.array(z.string().trim().refine(isSafeImageUrl, {
    message: 'Invalid gallery image URL format or unsafe protocol detected.',
  })).optional(),
  isKumbhRelated: z.boolean().optional(),
  category: z.string().optional(),
});

export const listEventsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  status: z
    .enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ALL'])
    .optional(),
  isKumbhRelated: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

export const registerForEventSchema = z.object({
  attendeeCount: z
    .number()
    .int('Attendee count must be an integer')
    .min(1, 'Must register at least 1 attendee')
    .max(4, 'Cannot exceed 4 attendees per registration')
    .optional()
    .default(1),
  userName: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
  userEmail: z.string().email('Invalid email address').optional(),
  userPhone: z.string().trim().optional(),
  notes: z.string().max(500).trim().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type RegisterForEventInput = z.infer<typeof registerForEventSchema>;
