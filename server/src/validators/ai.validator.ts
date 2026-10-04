import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid MongoDB ObjectId format for preferredCauseId',
  });

export const donationAllocationInputSchema = z.object({
  amount: z
    .number()
    .min(1, 'Donation amount must be at least ₹1')
    .max(5000000, 'Donation amount exceeds single transaction limit of ₹50,00,000'),
  preferredCauseId: objectIdSchema.nullable().optional().or(z.literal('')),
  impactPreference: z
    .string()
    .trim()
    .max(200, 'Impact preference cannot exceed 200 characters')
    .optional()
    .or(z.literal('')),
  includePassportHistory: z.boolean().default(true).optional(),
});

export type DonationAllocationInput = z.infer<typeof donationAllocationInputSchema>;
