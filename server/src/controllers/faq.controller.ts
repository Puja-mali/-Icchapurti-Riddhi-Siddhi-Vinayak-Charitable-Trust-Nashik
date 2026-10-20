import { Request, Response, NextFunction } from 'express';
import { Faq } from '../models/Faq';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { z } from 'zod';

const createFaqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(400).trim(),
  questionMr: z.string().max(500).trim().optional().default(''),
  questionHi: z.string().max(500).trim().optional().default(''),
  answer: z.string().min(10, 'Answer must be at least 10 characters').max(3000).trim(),
  answerMr: z.string().max(3500).trim().optional().default(''),
  answerHi: z.string().max(3500).trim().optional().default(''),
  category: z.string().default('General'),
  order: z.number().default(0),
  isPublished: z.boolean().default(true),
});

export class FaqController {
  /**
   * Public: Retrieve published FAQs ordered by `order`
   */
  public static async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query;
      const filter: any = { isPublished: true };
      if (category && typeof category === 'string') {
        filter.category = category;
      }

      const faqs = await Faq.find(filter).sort({ order: 1, createdAt: 1 }).lean();
      sendSuccess(res, { faqs }, 'Published FAQs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all FAQs including unpublished
   */
  public static async listAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faqs = await Faq.find().sort({ order: 1, createdAt: 1 }).lean();
      sendSuccess(res, { faqs }, 'All FAQs retrieved for management');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create FAQ
   */
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createFaqSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation error', 400);
        return;
      }

      const faq = await Faq.create(parsed.data);
      sendSuccess(res, { faq }, 'FAQ created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update FAQ
   */
  public static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const parsed = createFaqSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Validation error', 400);
        return;
      }

      const updated = await Faq.findByIdAndUpdate(id, parsed.data, { new: true });
      if (!updated) {
        throw new AppError('FAQ not found.', 404);
      }

      sendSuccess(res, { faq: updated }, 'FAQ updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete FAQ
   */
  public static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await Faq.findByIdAndDelete(id);
      if (!deleted) {
        throw new AppError('FAQ not found.', 404);
      }

      sendSuccess(res, { id }, 'FAQ removed successfully');
    } catch (error) {
      next(error);
    }
  }
}
