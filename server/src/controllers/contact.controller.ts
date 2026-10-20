import { Request, Response, NextFunction } from 'express';
import { ContactMessage } from '../models/ContactMessage';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { z } from 'zod';

const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').max(150).trim().toLowerCase(),
  phone: z.string().max(30).trim().optional().default(''),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200).trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000).trim(),
});

export class ContactController {
  public static async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = contactSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, parsed.error.issues[0]?.message || 'Invalid contact form data', 400);
        return;
      }

      const { name, email, phone, subject, message } = parsed.data;

      // Duplicate submission protection within short window (same email + subject within 5 minutes)
      const recentDuplicate = await ContactMessage.findOne({
        email,
        subject,
        createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      });

      if (recentDuplicate) {
        sendSuccess(res, { id: recentDuplicate._id }, 'Your inquiry has been received. Our liaison desk will contact you soon.');
        return;
      }

      const contactMsg = await ContactMessage.create({
        name,
        email,
        phone,
        subject,
        message,
        status: 'NEW',
      });

      sendSuccess(res, { id: contactMsg._id }, 'Thank you for reaching out. Your message has been safely received by the Trust secretariat.', 201);
    } catch (error) {
      next(error);
    }
  }

  public static async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, limit = 50, page = 1 } = req.query;
      const filter: any = {};
      if (status && typeof status === 'string' && ['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM'].includes(status)) {
        filter.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [messages, total] = await Promise.all([
        ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        ContactMessage.countDocuments(filter),
      ]);

      sendSuccess(res, { messages, total, page: Number(page) }, 'Contact messages retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM'].includes(status)) {
        throw new AppError('Invalid status value.', 400);
      }

      const updated = await ContactMessage.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!updated) {
        throw new AppError('Message record not found.', 404);
      }

      sendSuccess(res, { message: updated }, 'Message status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
