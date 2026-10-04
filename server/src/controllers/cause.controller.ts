import { Request, Response, NextFunction } from 'express';
import { CauseService } from '../services/cause.service';
import { sendSuccess } from '../utils/apiResponse';
import { ListCausesQuery } from '../validators/cause.validator';

export class CauseController {
  /**
   * Public: List all campaigns with filtering, search, and pagination
   * GET /api/causes
   */
  public static async listCauses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListCausesQuery;
      const isAdmin = req.user?.role === 'ADMIN';

      const result = await CauseService.listCauses(query, isAdmin);

      sendSuccess(res, result, 'Campaigns retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Get single campaign by ID or Slug
   * GET /api/causes/:id
   */
  public static async getCauseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';
      const cause = await CauseService.getCauseByIdOrSlug(id, isAdmin);

      sendSuccess(res, { cause }, 'Campaign details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new campaign
   * POST /api/causes
   */
  public static async createCause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      const cause = await CauseService.createCause(req.body, userId);

      sendSuccess(res, { cause }, 'Campaign created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing campaign
   * PATCH /api/causes/:id
   */
  public static async updateCause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cause = await CauseService.updateCause(id, req.body);

      sendSuccess(res, { cause }, 'Campaign updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete a campaign
   * DELETE /api/causes/:id
   */
  public static async deleteCause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cause = await CauseService.deleteCause(id);

      sendSuccess(res, { cause }, 'Campaign deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
