import { Request, Response, NextFunction } from 'express';
import { VolunteerService } from '../services/volunteer.service';
import { Volunteer } from '../models/Volunteer';
import { sendSuccess, AppError } from '../utils/apiResponse';

export class VolunteerController {
  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * Public: Get open volunteer roles
   */
  public static async getPublicRoles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isKumbhRelated =
        req.query.isKumbhRelated !== undefined
          ? req.query.isKumbhRelated === 'true'
          : undefined;

      const roles = await VolunteerService.listRoles({ isKumbhRelated });
      sendSuccess(res, { roles }, 'Active volunteer roles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Submit a volunteer application
   */
  public static async submitApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        roleId,
        roleTitle,
        fullName,
        email,
        phone,
        city,
        isCollegeStudent,
        collegeName,
        motivation,
        isKumbhRelated,
        preferredSevaArea,
        availability,
        emergencyContact,
        skills,
      } = req.body;

      const application = await VolunteerService.submitApplication({
        roleId,
        roleTitle,
        fullName,
        email,
        phone,
        city,
        isCollegeStudent,
        collegeName,
        motivation,
        isKumbhRelated,
        preferredSevaArea,
        availability,
        emergencyContact,
        skills,
      });

      sendSuccess(res, { application }, 'Volunteer application submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // AUTHENTICATED VOLUNTEER ENDPOINTS (Strict user isolation)
  // ============================================================================

  /**
   * Get logged-in volunteer's profile, shifts, certificates, and metrics
   * @access VOLUNTEER only
   */
  public static async getMyVolunteerProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const data = await VolunteerService.getMyProfile(userId);
      sendSuccess(res, data, 'Volunteer profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update logged-in volunteer's skills, availability, and focus
   * @access VOLUNTEER only
   */
  public static async updateMyVolunteerProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;

      if (req.body.volunteerHours !== undefined) {
        throw new AppError('Forbidden: Volunteer hours can only be approved by Staff or Admin.', 403);
      }

      const volunteer = await VolunteerService.updateMyProfile(userId, req.body);
      sendSuccess(res, { volunteer }, 'Volunteer profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Self-log a volunteer shift
   * @access VOLUNTEER only
   */
  public static async logMyShift(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const { roleTitle, date, hours, location, supervisor, notes } = req.body;

      const shift = await VolunteerService.logMyShift(userId, {
        roleTitle,
        date,
        hours,
        location,
        supervisor,
        notes,
      });

      sendSuccess(res, { shift }, 'Volunteer shift recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shifts strictly belonging to logged-in volunteer
   * @access VOLUNTEER only
   */
  public static async getMyShifts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const shifts = await VolunteerService.getMyShifts(userId);
      sendSuccess(res, { shifts }, 'Volunteer shifts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get digital certificates strictly belonging to logged-in volunteer
   * @access VOLUNTEER only
   */
  public static async getMyCertificates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const certificates = await VolunteerService.getMyCertificates(userId);
      sendSuccess(res, { certificates }, 'Volunteer certificates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register logged-in volunteer for an active community event
   * @access VOLUNTEER only
   */
  public static async registerForEvent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const { eventId } = req.params;

      const result = await VolunteerService.registerForEvent(userId, eventId);
      sendSuccess(res, result, 'Registered for event successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single volunteer record with strict IDOR verification
   * @access Volunteer record owner OR ADMIN, STAFF
   */
  public static async getVolunteerById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const volunteer = await Volunteer.findById(id)
        .populate('user', 'name email phone isActive')
        .populate('registeredEvents', 'title location startDate status')
        .lean();

      if (!volunteer) {
        throw new AppError('Volunteer profile not found.', 404);
      }

      // IDOR check: must be the user associated with this volunteer record, or ADMIN/STAFF
      const volunteerUserId = (volunteer.user as any)?._id
        ? (volunteer.user as any)._id.toString()
        : (volunteer.user as any)?.toString();
      const isOwner = Boolean(volunteerUserId && volunteerUserId === req.user!._id);
      const isPrivileged = req.user?.role === 'ADMIN' || req.user?.role === 'STAFF';

      if (!isOwner && !isPrivileged) {
        throw new AppError(
          'Forbidden: You are not authorized to view another volunteer’s profile.',
          403
        );
      }

      sendSuccess(res, { volunteer }, 'Volunteer profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // ADMIN-ONLY ACTIONS (authenticate -> authorize('ADMIN'))
  // ============================================================================

  /**
   * List all registered volunteers across the trust
   * @access ADMIN only
   */
  public static async listAllVolunteers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, search } = req.query;
      const result = await VolunteerService.listAllVolunteers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search ? String(search) : undefined,
      });

      sendSuccess(res, result, 'Volunteers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve and record volunteer hours
   * @access ADMIN only
   */
  public static async updateVolunteerHours(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { hoursToAdd } = req.body;

      const numHours = parseFloat(hoursToAdd);
      if (isNaN(numHours) || numHours <= 0) {
        throw new AppError('hoursToAdd must be a positive number.', 400);
      }

      const volunteer = await Volunteer.findByIdAndUpdate(
        id,
        { $inc: { volunteerHours: numHours } },
        { new: true, runValidators: true }
      ).populate('user', 'name email');

      if (!volunteer) {
        throw new AppError('Volunteer profile not found.', 404);
      }

      sendSuccess(
        res,
        { volunteer },
        `Successfully logged ${numHours} volunteer hours. Total: ${volunteer.volunteerHours}`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all volunteer shifts
   * @access ADMIN only
   */
  public static async listAllShifts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await VolunteerService.listAllShifts({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      sendSuccess(res, result, 'Volunteer shifts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify volunteer shift
   * @access ADMIN only
   */
  public static async verifyShift(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user!._id;
      const shift = await VolunteerService.verifyShift(id, adminId);
      sendSuccess(res, { shift }, 'Shift verified and hours updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all volunteer applications
   * @access ADMIN only
   */
  public static async listApplications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, status } = req.query;
      const result = await VolunteerService.listApplications({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        status: status ? String(status) : undefined,
      });
      sendSuccess(res, result, 'Volunteer applications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Review application (Approve or Reject)
   * @access ADMIN only
   */
  public static async reviewApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user!._id;

      if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        throw new AppError('Valid status (APPROVED or REJECTED) is required.', 400);
      }

      const application = await VolunteerService.reviewApplication(id, adminId, status);
      sendSuccess(res, { application }, `Application marked as ${status}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create volunteer role
   * @access ADMIN only
   */
  public static async createRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const role = await VolunteerService.createRole(req.body);
      sendSuccess(res, { role }, 'Volunteer role created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update volunteer role
   * @access ADMIN only
   */
  public static async updateRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const role = await VolunteerService.updateRole(id, req.body);
      if (!role) {
        throw new AppError('Volunteer role not found.', 404);
      }
      sendSuccess(res, { role }, 'Volunteer role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete volunteer role
   * @access ADMIN only
   */
  public static async deleteRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const success = await VolunteerService.deleteRole(id);
      if (!success) {
        throw new AppError('Volunteer role not found.', 404);
      }
      sendSuccess(res, null, 'Volunteer role deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Issue digital certificate
   * @access ADMIN only
   */
  public static async issueCertificate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const certificate = await VolunteerService.issueCertificate(req.body);
      sendSuccess(res, { certificate }, 'Certificate issued successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}
