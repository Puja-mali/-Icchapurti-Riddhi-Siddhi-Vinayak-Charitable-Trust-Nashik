import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid MongoDB ObjectId format',
  });

export const createDonationOrderSchema = z.object({
  amount: z
    .number()
    .min(1, 'Donation amount must be at least ₹1')
    .max(5000000, 'Donation amount exceeds single transaction limit of ₹50,00,000'),
  currency: z
    .string()
    .length(3, 'Currency must be 3-character ISO code (e.g., INR)')
    .default('INR')
    .optional(),
  donorName: z
    .string()
    .trim()
    .min(2, 'Donor name must be at least 2 characters')
    .max(100, 'Donor name cannot exceed 100 characters'),
  donorEmail: z
    .string()
    .trim()
    .email('Please provide a valid email address')
    .max(150, 'Donor email cannot exceed 150 characters'),
  donorPhone: z
    .string()
    .trim()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
  causeId: objectIdSchema.nullable().optional(),
  purpose: z
    .string()
    .trim()
    .max(250, 'Purpose description cannot exceed 250 characters')
    .optional(),
});

export const verifyDonationPaymentSchema = z
  .object({
    razorpayOrderId: z.string().trim().min(5).optional(),
    razorpay_order_id: z.string().trim().min(5).optional(),
    razorpayPaymentId: z.string().trim().min(5).optional(),
    razorpay_payment_id: z.string().trim().min(5).optional(),
    razorpaySignature: z.string().trim().min(10).optional(),
    razorpay_signature: z.string().trim().min(10).optional(),
  })
  .transform((data, ctx) => {
    const orderId = data.razorpayOrderId || data.razorpay_order_id;
    const paymentId = data.razorpayPaymentId || data.razorpay_payment_id;
    const signature = data.razorpaySignature || data.razorpay_signature;

    if (!orderId || orderId.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['razorpay_order_id'],
        message: 'Invalid or missing Razorpay Order ID (razorpay_order_id or razorpayOrderId)',
      });
    }

    if (!paymentId || paymentId.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['razorpay_payment_id'],
        message: 'Invalid or missing Razorpay Payment ID (razorpay_payment_id or razorpayPaymentId)',
      });
    }

    if (!signature || signature.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['razorpay_signature'],
        message: 'Invalid or missing Razorpay Signature (razorpay_signature or razorpaySignature)',
      });
    }

    return {
      razorpayOrderId: orderId ? orderId.trim() : '',
      razorpayPaymentId: paymentId ? paymentId.trim() : '',
      razorpaySignature: signature ? signature.trim() : '',
    };
  });

export type CreateDonationOrderInput = z.infer<typeof createDonationOrderSchema>;
export type VerifyDonationPaymentInput = z.infer<typeof verifyDonationPaymentSchema>;
