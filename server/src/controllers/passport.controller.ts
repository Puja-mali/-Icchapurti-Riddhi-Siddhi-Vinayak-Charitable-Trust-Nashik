import { Request, Response, NextFunction } from 'express';
import { PassportService } from '../services/passport.service';
import { sendSuccess, AppError } from '../utils/apiResponse';

export class PassportController {
  /**
   * GET /api/passport/my
   * Retrieves verified Impact Passports belonging to the authenticated donor
   */
  public static async getMyPassports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        throw new AppError('Authentication required to access personal Impact Passport.', 401);
      }

      const passports = await PassportService.getMyPassports(req.user._id.toString());
      sendSuccess(res, { passports }, 'Personal Impact Passports retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/passport/:id
   * Retrieves a single Impact Passport by ID or Passport Number with IDOR validation
   */
  public static async getPassportById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user._id) {
        throw new AppError('Authentication required to inspect Impact Passport records.', 401);
      }

      const identifier = req.params.id;
      if (!identifier) {
        throw new AppError('Passport identifier is required.', 400);
      }

      const passport = await PassportService.getPassportById(identifier, {
        _id: req.user._id.toString(),
        role: req.user.role,
      });

      sendSuccess(res, { passport }, 'Impact Passport retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/passport/admin/all
   * Admin-only listing of all verified Impact Passports
   */
  public static async getAllPassports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string;

      const result = await PassportService.getAllPassports({ page, limit, search });
      sendSuccess(res, result, 'All verified Impact Passports retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
