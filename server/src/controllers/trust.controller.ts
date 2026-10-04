import { Request, Response, NextFunction } from 'express';
import { TrustService } from '../services/trust.service';
import { sendSuccess } from '../utils/apiResponse';
import {
  UpdateTrustProfileInput,
  CreateTrusteeInput,
  UpdateTrusteeInput,
  TrusteeQueryParams,
} from '../validators/trust.validator';

export class TrustController {
  // ==========================================
  // TRUST PROFILE CONTROLLER METHODS
  // ==========================================

  /**
   * Public: Retrieve organization trust profile
   * GET /api/trust
   */
  public static async getPublicTrust(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trust = await TrustService.getPublicTrustProfile();
      sendSuccess(res, { trust }, 'Trust profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Retrieve complete trust profile with audit metadata
   * GET /api/trust/admin
   */
  public static async getAdminTrust(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trust = await TrustService.getAdminTrustProfile();
      sendSuccess(res, { trust }, 'Admin trust profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update or initialize trust profile
   * PATCH /api/trust/admin
   */
  public static async updateAdminTrust(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminUserId = req.user!._id;
      const data = req.body as UpdateTrustProfileInput;
      const trust = await TrustService.updateAdminTrustProfile(data, adminUserId);

      sendSuccess(res, { trust }, 'Trust profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // TRUSTEES CONTROLLER METHODS
  // ==========================================

  /**
   * Public: Retrieve active trustees
   * GET /api/trustees
   */
  public static async getPublicTrustees(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trustees = await TrustService.getPublicTrustees();
      sendSuccess(res, { trustees }, 'Trustees retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Retrieve all trustees (active and inactive) with filters
   * GET /api/trustees/admin
   */
  public static async getAdminTrustees(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as TrusteeQueryParams;
      const trustees = await TrustService.getAdminTrustees(query);

      sendSuccess(res, { trustees }, 'Admin trustees retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new trustee
   * POST /api/trustees/admin
   */
  public static async createTrustee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminUserId = req.user!._id;
      const data = req.body as CreateTrusteeInput;
      const trustee = await TrustService.createTrustee(data, adminUserId);

      sendSuccess(res, { trustee }, 'Trustee created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing trustee
   * PATCH /api/trustees/admin/:id
   */
  public static async updateTrustee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminUserId = req.user!._id;
      const id = req.params.id;
      const data = req.body as UpdateTrusteeInput;
      const trustee = await TrustService.updateTrustee(id, data, adminUserId);

      sendSuccess(res, { trustee }, 'Trustee updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete a trustee record
   * DELETE /api/trustees/admin/:id
   */
  public static async deleteTrustee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      await TrustService.deleteTrustee(id);

      sendSuccess(res, null, 'Trustee deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
