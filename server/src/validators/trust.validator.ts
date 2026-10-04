import { z } from 'zod';
import { validateAndSanitizeMediaUrl } from '../utils/fileSecurity';

const isSafeImageUrl = (val?: string) => {
  if (!val || val.trim() === '') return true;
  if (val.startsWith('/api/uploads/')) return true;
  return validateAndSanitizeMediaUrl(val, 'IMAGE').isValid;
};

export const objectIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format: must be a 24-character hexadecimal ObjectId'),
});

export const trustObjectiveItemSchema = z.object({
  title: z.string().min(2, 'Objective title must be at least 2 characters').max(200).trim(),
  description: z.string().min(5, 'Objective description must be at least 5 characters').max(1000).trim(),
  category: z.string().max(100).trim().optional(),
});

export const trustSocialLinksSchema = z.object({
  facebook: z.string().max(300).trim().optional(),
  twitter: z.string().max(300).trim().optional(),
  instagram: z.string().max(300).trim().optional(),
  linkedin: z.string().max(300).trim().optional(),
  youtube: z.string().max(300).trim().optional(),
  github: z.string().max(300).trim().optional(),
});

export const trustRegistrationDetailsSchema = z.object({
  registrationNumber: z.string().max(100).trim().optional(),
  establishedYear: z.string().max(50).trim().optional(),
  taxExemption80G: z.string().max(100).trim().optional(),
  fcraNumber: z.string().max(100).trim().optional(),
  entityType: z.string().max(100).trim().optional(),
});

export const updateTrustProfileSchema = z.object({
  trustName: z.string().min(2, 'Trust name must be at least 2 characters').max(200).trim().optional(),
  shortName: z.string().max(100).trim().optional(),
  subtitle: z.string().max(300).trim().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000).trim().optional(),
  vision: z.string().min(10, 'Vision must be at least 10 characters').max(3000).trim().optional(),
  mission: z.string().min(10, 'Mission must be at least 10 characters').max(3000).trim().optional(),
  objectives: z.array(trustObjectiveItemSchema).optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500).trim().optional(),
  phone: z.string().min(5, 'Phone must be at least 5 characters').max(100).trim().optional(),
  email: z.string().email('Invalid email address format').max(150).trim().toLowerCase().optional(),
  officeHours: z.string().max(200).trim().optional(),
  website: z.string().max(300).trim().optional(),
  socialLinks: trustSocialLinksSchema.optional(),
  registrationDetails: trustRegistrationDetailsSchema.optional(),
  logo: z.string().max(500).trim().refine(isSafeImageUrl, {
    message: 'Invalid or unsafe logo URL format.',
  }).optional(),
  academicNote: z.string().max(1000).trim().optional(),
});

export const createTrusteeSchema = z.object({
  name: z
    .string()
    .min(2, 'Trustee name must be at least 2 characters')
    .max(200, 'Trustee name cannot exceed 200 characters')
    .trim(),
  designation: z
    .string()
    .min(2, 'Designation must be at least 2 characters')
    .max(200, 'Designation cannot exceed 200 characters')
    .trim(),
  role: z.string().max(100, 'Role cannot exceed 100 characters').trim().optional().default('Trustee'),
  bio: z
    .string()
    .min(5, 'Bio must be at least 5 characters')
    .max(3000, 'Bio cannot exceed 3000 characters')
    .trim(),
  qualification: z.string().max(200, 'Qualification cannot exceed 200 characters').trim().optional().default(''),
  photo: z.string().max(500, 'Photo URL cannot exceed 500 characters').trim().refine(isSafeImageUrl, {
    message: 'Invalid or unsafe photo URL format.',
  }).optional().default(''),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateTrusteeSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  designation: z.string().min(2).max(200).trim().optional(),
  role: z.string().max(100).trim().optional(),
  bio: z.string().min(5).max(3000).trim().optional(),
  qualification: z.string().max(200).trim().optional(),
  photo: z.string().max(500).trim().refine(isSafeImageUrl, {
    message: 'Invalid or unsafe photo URL format.',
  }).optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const trusteeQuerySchema = z.object({
  isActive: z.enum(['true', 'false', 'ALL']).optional(),
  search: z.string().optional(),
});

export type UpdateTrustProfileInput = z.infer<typeof updateTrustProfileSchema>;
export type CreateTrusteeInput = z.infer<typeof createTrusteeSchema>;
export type UpdateTrusteeInput = z.infer<typeof updateTrusteeSchema>;
export type TrusteeQueryParams = z.infer<typeof trusteeQuerySchema>;
