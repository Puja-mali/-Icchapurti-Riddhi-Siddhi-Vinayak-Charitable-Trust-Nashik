import { Request, Response, NextFunction } from 'express';
import { donationAllocationInputSchema } from '../validators/ai.validator';
import { AiService } from '../services/ai.service';
import { sendSuccess, AppError } from '../utils/apiResponse';

export class AiController {
  /**
   * POST /api/ai/donation-allocation
   * Generates a grounded donation allocation recommendation based strictly on verified MongoDB data.
   * Requires donor authentication.
   */
  public static async getDonationAllocation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        throw new AppError('Authentication required to access the AI Donation Allocation Assistant.', 401);
      }

      // Validate inputs
      const validatedInput = donationAllocationInputSchema.parse(req.body);

      // Call AI Service with caller's verified donor ID
      const recommendation = await AiService.generateDonationAllocation(
        validatedInput,
        req.user._id.toString()
      );

      sendSuccess(
        res,
        recommendation,
        'Donation allocation recommendation generated successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
