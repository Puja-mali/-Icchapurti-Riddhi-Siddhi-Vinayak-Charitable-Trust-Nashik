import { z } from 'zod';
import { validateAndSanitizeMediaUrl } from '../utils/fileSecurity';

const isSafePdfUrl = (val?: string) => {
  if (!val || val.trim() === '') return true;
  if (val.startsWith('/api/uploads/')) return true;
  return validateAndSanitizeMediaUrl(val, 'DOCUMENT').isValid;
};

const isSafeImageUrl = (val?: string) => {
  if (!val || val.trim() === '') return true;
  if (val.startsWith('/api/uploads/')) return true;
  return validateAndSanitizeMediaUrl(val, 'IMAGE').isValid;
};

export const reportTypeValues = [
  'Annual Report',
  'Financial Report',
  'Impact Report',
  'Audit Report',
  'Donation Utilization Report',
  'Other',
] as const;

export const createTransparencySchema = z.object({
  title: z
    .string()
    .min(3, 'Report title must be at least 3 characters')
    .max(300, 'Report title cannot exceed 300 characters')
    .trim(),
  description: z
    .string()
    .min(5, 'Report description must be at least 5 characters')
    .max(3000, 'Report description cannot exceed 3000 characters')
    .trim(),
  reportType: z.enum(reportTypeValues, {
    message: 'Please select a valid report type',
  }),
  financialYear: z
    .string()
    .min(2, 'Financial year is required (e.g. FY 2024-25)')
    .max(50, 'Financial year cannot exceed 50 characters')
    .trim(),
  periodStart: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' })
    .optional(),
  periodEnd: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' })
    .optional(),
  fileUrl: z
    .string()
    .trim()
    .refine(isSafePdfUrl, {
      message: 'Invalid or unsafe file URL. Must be a valid http/https URL pointing to a PDF or verified upload.',
    })
    .optional()
    .default(''),
  coverImage: z
    .string()
    .trim()
    .refine(isSafeImageUrl, {
      message: 'Invalid or unsafe cover image URL. Must be a valid http/https URL pointing to a supported image format or verified upload.',
    })
    .optional()
    .default(''),
  fileSize: z
    .string()
    .max(50, 'File size string too long')
    .trim()
    .optional()
    .default(''),
  auditRating: z
    .string()
    .max(100, 'Audit rating too long')
    .trim()
    .optional()
    .default(''),
  auditorFirm: z
    .string()
    .max(200, 'Auditor firm too long')
    .trim()
    .optional()
    .default(''),
  statutoryType: z
    .string()
    .max(100, 'Statutory type too long')
    .trim()
    .optional()
    .default(''),
  totalDisbursal: z
    .string()
    .max(100, 'Total disbursal string too long')
    .trim()
    .optional()
    .default(''),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid published date format' })
    .optional(),
  isPublished: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  isKumbhRelated: z.boolean().optional().default(false),
});

export const updateTransparencySchema = z.object({
  title: z
    .string()
    .min(3, 'Report title must be at least 3 characters')
    .max(300, 'Report title cannot exceed 300 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(5, 'Report description must be at least 5 characters')
    .max(3000, 'Report description cannot exceed 3000 characters')
    .trim()
    .optional(),
  reportType: z.enum(reportTypeValues).optional(),
  financialYear: z
    .string()
    .min(2, 'Financial year is required')
    .max(50, 'Financial year cannot exceed 50 characters')
    .trim()
    .optional(),
  periodStart: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' })
    .optional(),
  periodEnd: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' })
    .optional(),
  fileUrl: z.string().trim().refine(isSafePdfUrl, {
    message: 'Invalid or unsafe file URL format. Must point to a valid PDF or verified upload.',
  }).optional(),
  coverImage: z.string().trim().refine(isSafeImageUrl, {
    message: 'Invalid or unsafe cover image URL format.',
  }).optional(),
  fileSize: z.string().max(50).trim().optional(),
  auditRating: z.string().max(100).trim().optional(),
  auditorFirm: z.string().max(200).trim().optional(),
  statutoryType: z.string().max(100).trim().optional(),
  totalDisbursal: z.string().max(100).trim().optional(),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid published date format' })
    .optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isKumbhRelated: z.boolean().optional(),
});

export const transparencyQuerySchema = z.object({
  reportType: z.string().optional(),
  financialYear: z.string().optional(),
  search: z.string().optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
  isKumbhRelated: z.enum(['true', 'false']).optional(),
  isPublished: z.enum(['true', 'false', 'ALL']).optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export type CreateTransparencyInput = z.infer<typeof createTransparencySchema>;
export type UpdateTransparencyInput = z.infer<typeof updateTransparencySchema>;
export type TransparencyQueryParams = z.infer<typeof transparencyQuerySchema>;
