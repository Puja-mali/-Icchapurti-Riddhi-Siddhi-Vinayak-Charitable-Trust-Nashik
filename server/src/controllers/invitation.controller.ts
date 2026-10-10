import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Invitation, InvitationRole } from '../models/Invitation';
import { User } from '../models/User';
import { EmailService } from '../services/email.service';
import { sendSuccess, AppError } from '../utils/apiResponse';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class InvitationController {
  /**
   * Create and issue an invitation to onboard a new ADMIN or STAFF member
   * @access ADMIN only
   */
  public static async createInvitation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, name, role } = req.body;

      // Validate Email
      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new AppError('A valid email address is required.', 400);
      }
      const normalizedEmail = email.trim().toLowerCase();

      // Validate Role: Strictly ADMIN or STAFF
      const validRoles: InvitationRole[] = ['ADMIN', 'STAFF'];
      if (!role || !validRoles.includes(role)) {
        throw new AppError('Invalid role specified. Only ADMIN or STAFF can be invited.', 400);
      }

      // Check if user is already registered with this role
      const existingUser = await User.findOne({ email: normalizedEmail }).lean();
      if (existingUser && existingUser.role === role && existingUser.isActive) {
        throw new AppError(
          `User with email ${normalizedEmail} is already registered and active as an ${role}.`,
          400
        );
      }

      // Revoke any previous PENDING invitations for this email to prevent duplicate valid tokens
      await Invitation.updateMany(
        { email: normalizedEmail, status: 'PENDING' },
        { status: 'REVOKED' }
      );

      // Cryptographically secure token generation
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // 72 hours expiration window
      const expiresInHours = 72;
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      // Create invitation in database storing ONLY the hash
      const invitation = await Invitation.create({
        email: normalizedEmail,
        name: typeof name === 'string' ? name.trim() : '',
        role,
        tokenHash,
        invitedBy: req.user!._id,
        expiresAt,
        status: 'PENDING',
      });

      // Construct activation URL
      const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
      const invitationUrl = `${clientUrl}/accept-invitation?token=${rawToken}`;

      // Dispatch invitation email
      const emailResult = await EmailService.sendAdminInvitationEmail({
        email: normalizedEmail,
        name: invitation.name || undefined,
        role,
        inviteUrl: invitationUrl,
        expiresInHours,
        invitedByName: req.user?.name || 'Trust Board Administrator',
      });

      const responsePayload = {
        invitation: {
          _id: invitation._id,
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
        },
        emailSent: emailResult.success,
        invitationUrl, // Furnished to admin so onboarding is never blocked if SMTP is disabled
        ...(emailResult.success
          ? {}
          : {
              smtpWarning:
                emailResult.reason ||
                emailResult.error ||
                'SMTP credentials not configured. Please share the direct invitation link manually with the invitee.',
            }),
      };

      sendSuccess(
        res,
        responsePayload,
        emailResult.success
          ? `Invitation successfully dispatched to ${normalizedEmail}`
          : `Invitation generated. SMTP delivery unavailable; please deliver activation link directly to invitee.`,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all invitations with status and expiration tracking
   * @access ADMIN only
   */
  public static async listInvitations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 30));
      const skip = (page - 1) * limit;

      // Update any expired pending invitations in background
      await Invitation.updateMany(
        { status: 'PENDING', expiresAt: { $lt: new Date() } },
        { status: 'EXPIRED' }
      );

      const [invitations, total] = await Promise.all([
        Invitation.find()
          .populate('invitedBy', 'name email role')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Invitation.countDocuments(),
      ]);

      sendSuccess(
        res,
        {
          invitations,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        'Invitations retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend an invitation with a refreshed token and renewed 72h expiry
   * @access ADMIN only
   */
  public static async resendInvitation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const invitation = await Invitation.findById(id);
      if (!invitation) {
        throw new AppError('Invitation record not found.', 404);
      }

      if (invitation.status === 'ACCEPTED') {
        throw new AppError('This invitation has already been accepted and cannot be resent.', 400);
      }

      // Generate new cryptographically secure token
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresInHours = 72;
      const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

      invitation.tokenHash = tokenHash;
      invitation.expiresAt = expiresAt;
      invitation.status = 'PENDING';
      invitation.invitedBy = req.user!._id as any;
      await invitation.save();

      const clientUrl = env.CLIENT_URL || 'http://localhost:3000';
      const invitationUrl = `${clientUrl}/accept-invitation?token=${rawToken}`;

      const emailResult = await EmailService.sendAdminInvitationEmail({
        email: invitation.email,
        name: invitation.name || undefined,
        role: invitation.role,
        inviteUrl: invitationUrl,
        expiresInHours,
        invitedByName: req.user?.name || 'Trust Board Administrator',
      });

      sendSuccess(
        res,
        {
          invitation: {
            _id: invitation._id,
            email: invitation.email,
            name: invitation.name,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
          },
          emailSent: emailResult.success,
          invitationUrl,
          ...(emailResult.success
            ? {}
            : {
                smtpWarning:
                  emailResult.reason ||
                  emailResult.error ||
                  'SMTP delivery unavailable. Use direct link.',
              }),
        },
        emailResult.success
          ? `Invitation resent to ${invitation.email}`
          : `Invitation renewed. Please provide activation link directly.`
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke an active invitation
   * @access ADMIN only
   */
  public static async revokeInvitation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const invitation = await Invitation.findById(id);
      if (!invitation) {
        throw new AppError('Invitation record not found.', 404);
      }

      if (invitation.status === 'ACCEPTED') {
        throw new AppError('Cannot revoke an invitation that has already been accepted.', 400);
      }

      invitation.status = 'REVOKED';
      await invitation.save();

      sendSuccess(res, { invitation }, `Invitation for ${invitation.email} has been revoked.`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public validation of invitation token prior to showing activation form
   * @access Public
   */
  public static async validateInvitationToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.params;

      if (!token || typeof token !== 'string' || token.length < 32) {
        throw new AppError('Invalid invitation token parameter.', 400);
      }

      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

      // Check invitation by hash
      const invitation = await Invitation.findOne({ tokenHash }).select('+tokenHash');

      if (!invitation) {
        throw new AppError('Invitation is invalid, revoked, or does not exist.', 404);
      }

      if (invitation.status === 'REVOKED') {
        throw new AppError('This invitation has been revoked by Trust Administration.', 400);
      }

      if (invitation.status === 'ACCEPTED') {
        throw new AppError(
          'This invitation has already been accepted. Please sign in via the administrative login portal.',
          400
        );
      }

      if (invitation.expiresAt < new Date()) {
        invitation.status = 'EXPIRED';
        await invitation.save();
        throw new AppError(
          'This invitation has expired. Please contact a Trust administrator to request a renewed invitation.',
          400
        );
      }

      sendSuccess(
        res,
        {
          valid: true,
          email: invitation.email,
          name: invitation.name,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
        },
        'Invitation token verified successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept an invitation and establish secure password
   * @access Public
   */
  public static async acceptInvitation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, password, name } = req.body;

      if (!token || typeof token !== 'string') {
        throw new AppError('Invitation token is required.', 400);
      }

      if (!password || typeof password !== 'string') {
        throw new AppError('Password is required.', 400);
      }

      // Password Complexity Validation
      if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters long.', 400);
      }
      if (!/[A-Z]/.test(password)) {
        throw new AppError('Password must contain at least one uppercase letter.', 400);
      }
      if (!/[a-z]/.test(password)) {
        throw new AppError('Password must contain at least one lowercase letter.', 400);
      }
      if (!/[0-9]/.test(password)) {
        throw new AppError('Password must contain at least one numerical digit.', 400);
      }

      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
      const invitation = await Invitation.findOne({ tokenHash, status: 'PENDING' }).select('+tokenHash');

      if (!invitation) {
        throw new AppError('Invitation token is invalid, expired, or already used.', 400);
      }

      if (invitation.expiresAt < new Date()) {
        invitation.status = 'EXPIRED';
        await invitation.save();
        throw new AppError('This invitation has expired. Please request a new invitation.', 400);
      }

      // Hash password with bcrypt (12 salt rounds)
      const passwordHash = await bcrypt.hash(password, 12);
      const chosenName = (typeof name === 'string' && name.trim()) || invitation.name || 'Trust Officer';

      // Find or create User
      let user = await User.findOne({ email: invitation.email });
      if (user) {
        user.passwordHash = passwordHash;
        user.role = invitation.role;
        user.isActive = true;
        user.isEmailVerified = true;
        if (chosenName) user.name = chosenName;
        await user.save();
      } else {
        user = await User.create({
          name: chosenName,
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          isActive: true,
          isEmailVerified: true,
        });
      }

      // Mark invitation as single-use consumed
      invitation.status = 'ACCEPTED';
      invitation.acceptedAt = new Date();
      invitation.acceptedBy = user._id as any;
      await invitation.save();

      logger.info(
        `[INVITATION ACCEPTED] User ${user.email} successfully activated as ${user.role} via invitation ${invitation._id}`
      );

      sendSuccess(
        res,
        {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        `Account activated successfully as ${user.role}! You may now proceed to Admin Login.`
      );
    } catch (error) {
      next(error);
    }
  }
}
