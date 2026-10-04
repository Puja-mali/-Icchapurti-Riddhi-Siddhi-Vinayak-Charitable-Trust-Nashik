import { Request, Response, NextFunction } from 'express';
import { HelpRequestService } from '../services/helpRequest.service';
import { sendSuccess } from '../utils/apiResponse';
import {
  CreateHelpRequestInput,
  UpdateHelpRequestAdminInput,
  HelpRequestQueryParams,
} from '../validators/helpRequest.validator';

export class HelpRequestController {
  /**
   * Submit a new help request (requesterId derived from authenticated user)
   * POST /api/help-requests
   */
  public static async createHelpRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUserId = req.user?._id ? req.user._id.toString() : undefined;
      const data = req.body as CreateHelpRequestInput;
      const request = await HelpRequestService.createHelpRequest(data, authenticatedUserId);

      sendSuccess(res, { helpRequest: request }, 'Help request submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated user's submitted requests
   * GET /api/help-requests/my
   */
  public static async getMyHelpRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authenticatedUserId = req.user!._id;
      const requests = await HelpRequestService.getMyHelpRequests(authenticatedUserId);

      sendSuccess(res, { helpRequests: requests }, 'My help requests retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single request with strict IDOR check
   * GET /api/help-requests/:id
   */
  public static async getHelpRequestById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const authenticatedUserId = req.user!._id;
      const isAdmin = req.user?.role === 'ADMIN';

      const request = await HelpRequestService.getHelpRequestById(id, authenticatedUserId, isAdmin);

      sendSuccess(res, { helpRequest: request }, 'Help request retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all requests with filters & metrics
   * GET /api/help-requests/admin/all or GET /api/help-requests/admin
   */
  public static async getAdminHelpRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as HelpRequestQueryParams;
      const result = await HelpRequestService.getAllRequestsAdmin(query);

      sendSuccess(res, result, 'All help requests retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get single request with complete audit details
   * GET /api/help-requests/admin/:id
   */
  public static async getAdminHelpRequestById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const request = await HelpRequestService.getAdminRequestById(id);

      sendSuccess(res, { helpRequest: request }, 'Help request retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update status, adminNotes, assignment
   * PATCH /api/help-requests/admin/:id
   */
  public static async updateHelpRequestAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const adminUserId = req.user!._id;
      const data = req.body as UpdateHelpRequestAdminInput;

      const updated = await HelpRequestService.updateRequestAdmin(id, data, adminUserId);

      sendSuccess(res, { helpRequest: updated }, 'Help request updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete help request record
   * DELETE /api/help-requests/admin/:id
   */
  public static async deleteHelpRequestAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await HelpRequestService.deleteRequestAdmin(id);

      sendSuccess(res, null, 'Help request permanently deleted');
    } catch (error) {
      next(error);
    }
  }
}
