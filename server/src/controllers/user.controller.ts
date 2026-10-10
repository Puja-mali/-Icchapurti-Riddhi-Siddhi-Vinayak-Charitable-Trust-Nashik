import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sendSuccess, AppError } from '../utils/apiResponse';
import { UserRole } from '../types';

export class UserController {
  /**
   * List all users
   * @access ADMIN only
   */
  public static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const roleFilter = req.query.role as UserRole | undefined;
      const query: Record<string, any> = {};
      if (roleFilter && ['ADMIN', 'STAFF', 'VOLUNTEER', 'DONOR'].includes(roleFilter)) {
        query.role = roleFilter;
      }

      const statusFilter = req.query.status as string | undefined;
      if (statusFilter === 'active') {
        query.isActive = true;
      } else if (statusFilter === 'deactivated') {
        query.isActive = false;
      }

      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { name: { $regex: escaped, $options: 'i' } },
          { email: { $regex: escaped, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('_id name email phone role isActive isEmailVerified createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
      ]);

      sendSuccess(
        res,
        {
          users,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        'Users retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve single user by ID
   * @access Owner OR ADMIN
   */
  public static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id && req.params.id !== 'me' ? req.params.id : req.user!._id;

      // Enforce ownership: only the user themselves or an ADMIN can view the profile
      const isOwner = req.user?._id === id;
      const isAdmin = req.user?.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        throw new AppError('Forbidden: You do not have permission to view this user profile.', 403);
      }

      const user = await User.findById(id)
        .select('_id name email phone role isActive isEmailVerified createdAt')
        .lean();

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      sendSuccess(res, { user }, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update own profile
   * @access Authenticated user (self)
   */
  public static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      const { name, phone } = req.body;

      // Explicitly reject privilege escalation attempts
      if (req.body.role || req.body.isActive !== undefined || req.body.passwordHash) {
        throw new AppError(
          'Forbidden: You cannot modify security-sensitive fields (role, status) directly.',
          403
        );
      }

      const updateData: Record<string, any> = {};
      if (typeof name === 'string' && name.trim()) updateData.name = name.trim();
      if (typeof phone === 'string') updateData.phone = phone.trim();

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select('_id name email phone role isActive isEmailVerified createdAt');

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      sendSuccess(res, { user }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user status (Active / Deactivated)
   * @access ADMIN only
   */
  public static async updateUserStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        throw new AppError('isActive status must be a boolean (true or false).', 400);
      }

      // Prevent admin from deactivating themselves to avoid system lockout
      if (id === req.user!._id && !isActive) {
        throw new AppError('Action denied: You cannot deactivate your own administrative account.', 400);
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      ).select('_id name email phone role isActive isEmailVerified');

      if (!user) {
        throw new AppError('Target user not found.', 404);
      }

      sendSuccess(
        res,
        { user },
        `User ${user.email} status updated to ${isActive ? 'ACTIVE' : 'DEACTIVATED'}`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   * @access ADMIN only
   */
  public static async updateUserRole(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles: UserRole[] = ['ADMIN', 'STAFF', 'VOLUNTEER', 'DONOR'];
      if (!role || !validRoles.includes(role)) {
        throw new AppError(`Invalid role. Valid roles are: ${validRoles.join(', ')}`, 400);
      }

      // Prevent changing own role to avoid accidentally locking out the only admin
      if (id === req.user!._id && role !== 'ADMIN') {
        throw new AppError('Action denied: You cannot demote your own administrator account.', 400);
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('_id name email phone role isActive isEmailVerified');

      if (!user) {
        throw new AppError('Target user not found.', 404);
      }

      sendSuccess(res, { user }, `User role successfully assigned to ${role}`);
    } catch (error) {
      next(error);
    }
  }
}
