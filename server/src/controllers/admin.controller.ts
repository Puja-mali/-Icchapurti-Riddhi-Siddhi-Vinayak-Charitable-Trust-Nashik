import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { SettingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/apiResponse';

export class AdminController {
  /**
   * GET /api/admin/dashboard/summary
   * Retrieve MongoDB-backed administrative summary metrics
   * @access Private (ADMIN only)
   */
  public static async getDashboardSummary(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await AdminService.getDashboardSummary();
      sendSuccess(res, summary, 'Admin dashboard summary metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/settings
   * Retrieve site settings including feature modules
   * @access Private (ADMIN only)
   */
  public static async getSettings(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const settings = await SettingsService.getSettings();
      sendSuccess(res, settings, 'Site settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/settings/kumbh-mode
   * Toggle Kumbh Mode ON / OFF in MongoDB
   * @access Private (ADMIN only)
   */
  public static async updateKumbhMode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'Invalid request: "enabled" must be a boolean (true/false)',
        });
        return;
      }
      const updated = await SettingsService.updateKumbhMode(enabled);
      sendSuccess(res, updated, `Kumbh Mode successfully set to ${enabled ? 'ON' : 'OFF'}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/translate
   * Draft automated translation of community content with server-side validation and cost controls
   * @access Private (ADMIN or STAFF)
   */
  public static async translateText(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { text, targetLang, sourceLang } = req.body;
      const { TranslationService } = await import('../services/translation.service');
      const result = await TranslationService.translateDraft({
        text,
        targetLang: targetLang || 'mr',
        sourceLang: sourceLang || 'en',
      });
      sendSuccess(res, result, 'Draft translation generated successfully');
    } catch (error) {
      next(error);
    }
  }
}
