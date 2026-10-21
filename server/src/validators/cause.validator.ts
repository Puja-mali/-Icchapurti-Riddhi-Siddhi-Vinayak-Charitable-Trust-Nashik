import { z } from 'zod';
import { validateAndSanitizeMediaUrl } from '../utils/fileSecurity';

export const allocationItemSchema = z.object({
  category: z.string().min(1, 'Allocation category name is required').trim(),
  percentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),
});

export const impactMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required').trim(),
  description: z.string().min(1, 'Milestone description is required').trim(),
  targetDate: z.string().min(1, 'Target date is required').trim(),
  status: z.enum(['completed', 'in_progress', 'upcoming']).default('upcoming'),
});

export const createCauseSchema = z.object({
  title: z
    .string()
    .min(3, 'Campaign title must be at least 3 characters')
    .max(200, 'Campaign title cannot exceed 200 characters')
    .trim(),
  slug: z
    .string()
    .max(200, 'Slug cannot exceed 200 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional()
    .or(z.literal('')),
  shortDescription: z
    .string()
    .min(5, 'Short description must be at least 5 characters')
    .max(500, 'Short description cannot exceed 500 characters')
    .trim(),
  tagline: z.string().trim().max(500).optional(),
  description: z
    .string()
    .min(10, 'Full description must be at least 10 characters')
    .trim(),
  targetAmount: z
    .number()
    .min(0, 'Target amount cannot be negative')
    .optional()
    .default(0),
  raisedAmount: z.number().min(0, 'Raised amount cannot be negative').optional().default(0),
  category: z.enum(
    [
      'Education',
      'Medical Support',
      'Food & Nutrition',
      'Emergency Relief',
      'Environment',
      'Other',
    ],
    { message: 'A valid category is required' }
  ),
  imageUrl: z
    .string()
    .min(1, 'Image URL or uploaded file is required')
    .trim()
    .refine(
      (val) => {
        if (!val) return false;
        // Allow relative uploaded media paths or local public images
        if (val.startsWith('/') && !val.includes('..') && !val.includes('\\')) return true;
        return validateAndSanitizeMediaUrl(val, 'IMAGE').isValid;
      },
      { message: 'Invalid or unsafe image URL. Must be an uploaded image or valid http/https image link.' }
    ),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional().default('ACTIVE'),
  isKumbhRelated: z.boolean().optional().default(false),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
  location: z.string().max(150).optional().default('Maharashtra, India'),
  urgent: z.boolean().optional().default(false),
  donorCount: z.number().min(0).optional().default(0),
  allocationBreakdown: z.array(allocationItemSchema).optional().default([]),
  impactMilestones: z.array(impactMilestoneSchema).optional().default([]),
  translations: z
    .object({
      mr: z
        .object({
          title: z.string().trim().optional(),
          shortDescription: z.string().trim().optional(),
          description: z.string().trim().optional(),
        })
        .optional(),
      hi: z
        .object({
          title: z.string().trim().optional(),
          shortDescription: z.string().trim().optional(),
          description: z.string().trim().optional(),
        })
        .optional(),
      en: z
        .object({
          title: z.string().trim().optional(),
          shortDescription: z.string().trim().optional(),
          description: z.string().trim().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const updateCauseSchema = createCauseSchema.partial();

export const listCausesQuerySchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  isKumbhRelated: z.string().optional(),
  urgent: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateCauseInput = z.infer<typeof createCauseSchema>;
export type UpdateCauseInput = z.infer<typeof updateCauseSchema>;
export type ListCausesQuery = z.infer<typeof listCausesQuerySchema>;
