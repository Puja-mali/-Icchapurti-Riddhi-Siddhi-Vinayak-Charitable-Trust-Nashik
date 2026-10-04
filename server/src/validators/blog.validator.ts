import { z } from 'zod';
import { validateAndSanitizeMediaUrl } from '../utils/fileSecurity';

const isSafeImageUrl = (val: string) => {
  if (!val) return true;
  if (val.startsWith('/api/uploads/')) return true;
  return validateAndSanitizeMediaUrl(val, 'IMAGE').isValid;
};

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, 'Blog title must be at least 3 characters')
    .max(300, 'Blog title cannot exceed 300 characters')
    .trim(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  excerpt: z
    .string()
    .min(5, 'Excerpt must be at least 5 characters')
    .max(1000, 'Excerpt cannot exceed 1000 characters')
    .trim(),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .trim(),
  coverImage: z
    .string()
    .min(1, 'Cover image URL is required')
    .trim()
    .refine(isSafeImageUrl, {
      message: 'Invalid or unsafe cover image URL. Must be a valid http/https URL pointing to a supported image format or verified upload.',
    }),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category cannot exceed 100 characters')
    .trim(),
  author: z
    .string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name cannot exceed 100 characters')
    .trim()
    .optional()
    .default('Siddhivinayak Trust'),
  tags: z.array(z.string().trim()).optional().default([]),
  isPublished: z.boolean().optional().default(true),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'A valid published date is required' })
    .optional(),
  isFeatured: z.boolean().optional().default(false),
  isKumbhRelated: z.boolean().optional().default(false),
});

export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(3, 'Blog title must be at least 3 characters')
    .max(300, 'Blog title cannot exceed 300 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  excerpt: z
    .string()
    .min(5, 'Excerpt must be at least 5 characters')
    .max(1000, 'Excerpt cannot exceed 1000 characters')
    .trim()
    .optional(),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .trim()
    .optional(),
  coverImage: z
    .string()
    .min(1, 'Cover image URL cannot be empty')
    .trim()
    .refine(isSafeImageUrl, {
      message: 'Invalid or unsafe cover image URL format.',
    })
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category cannot exceed 100 characters')
    .trim()
    .optional(),
  author: z
    .string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name cannot exceed 100 characters')
    .trim()
    .optional(),
  tags: z.array(z.string().trim()).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'A valid published date is required' })
    .optional(),
  isFeatured: z.boolean().optional(),
  isKumbhRelated: z.boolean().optional(),
});

export const blogQuerySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
  isKumbhRelated: z.enum(['true', 'false']).optional(),
  isPublished: z.enum(['true', 'false', 'ALL']).optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export type BlogQueryParams = z.infer<typeof blogQuerySchema>;
