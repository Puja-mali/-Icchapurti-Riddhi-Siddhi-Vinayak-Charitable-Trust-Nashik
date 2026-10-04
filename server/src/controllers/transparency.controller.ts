import { Request, Response, NextFunction } from 'express';
import { TransparencyService } from '../services/transparency.service';
import { sendSuccess } from '../utils/apiResponse';
import { TransparencyQueryParams } from '../validators/transparency.validator';

export class TransparencyController {
  /**
   * Public: List all published transparency reports
   */
  public static async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as TransparencyQueryParams;
      const result = await TransparencyService.getPublishedReports(query);
      sendSuccess(res, result, 'Transparency reports retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public / Admin Preview: Retrieve single report by ID
   */
  public static async getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';
      const report = await TransparencyService.getReportById(id, isAdmin);
      sendSuccess(res, { report }, 'Transparency report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all reports (including drafts and unpublished)
   */
  public static async getAdminReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as TransparencyQueryParams;
      const result = await TransparencyService.getAllReportsAdmin(query);
      sendSuccess(res, result, 'All transparency records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new transparency report
   */
  public static async createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creatorUserId = req.user!._id;
      const report = await TransparencyService.createReport(req.body, creatorUserId);
      sendSuccess(res, { report }, 'Transparency report created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing transparency report
   */
  public static async updateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updaterUserId = req.user!._id;
      const report = await TransparencyService.updateReport(id, req.body, updaterUserId);
      sendSuccess(res, { report }, 'Transparency report updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete a transparency report
   */
  public static async deleteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await TransparencyService.deleteReport(id);
      sendSuccess(res, null, 'Transparency report deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
