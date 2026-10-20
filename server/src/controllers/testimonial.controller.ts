import { Request, Response, NextFunction } from 'express';
import { Testimonial } from '../models/Testimonial';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { z } from 'zod';

const createTestimonialSchema = z.object({
  authorName: z.string().min(2, 'Author name must be at least 2 characters').max(120).trim(),
  roleOrLocation: z.string().min(2, 'Role or location must be at least 2 characters').max(150).trim(),
  quote: z.string().min(10, 'Quote must be at least 10 characters').max(2000).trim(),
  quoteMr: z.string().max(2500).trim().optional().default(''),
  quoteHi: z.string().max(2500).trim().optional().default(''),
  category: z.enum(['beneficiary', 'volunteer', 'community', 'donor']).default('community'),
  isPublished: z.boolean().default(false),
  verified: z.boolean().default(true),
  order: z.number().default(0),
});

export class TestimonialController {
  /**
   * Public: Retrieve verified published testimonials
   */
  public static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query;
      const filter: any = { isPublished: true, verified: true };
      if (category && typeof category === 'string') {
        filter.category = category;
      }

      const testimonials = await Testimonial.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .lean();

      sendSuccess(res, { testimonials }, 'Published testimonials retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all testimonials for review
   */
  public static async listAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testimonials = await Testimonial.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();

      sendSuccess(res, { testimonials }, 'All testimonials retrieved for administration');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create Testimonial
   */
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createTestimonialSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation error', 400);
        return;
      }

      const testimonial = await Testimonial.create(parsed.data);
      sendSuccess(res, { testimonial }, 'Testimonial created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update Testimonial
   */
  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = createTestimonialSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation error', 400);
        return;
      }

      const updated = await Testimonial.findByIdAndUpdate(id, parsed.data, { new: true });
      if (!updated) {
        throw new AppError('Testimonial not found.', 404);
      }

      sendSuccess(res, { testimonial: updated }, 'Testimonial updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete Testimonial
   */
  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await Testimonial.findByIdAndDelete(id);
      if (!deleted) {
        throw new AppError('Testimonial not found.', 404);
      }

      sendSuccess(res, { id }, 'Testimonial removed successfully');
    } catch (error) {
      next(error);
    }
  }
}
