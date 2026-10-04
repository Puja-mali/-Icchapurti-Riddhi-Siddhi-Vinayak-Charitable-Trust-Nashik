import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200).trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000).trim(),
});

export const campaignCreateSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200).trim(),
  description: z.string().min(10, 'Description is required').trim(),
  goalAmount: z.number().positive('Goal amount must be positive'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  image: z.string().url().optional(),
});
