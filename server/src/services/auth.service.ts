import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { AppError } from '../utils/apiResponse';
import { env } from '../config/env';
import { AuthUserPayload, TokenPair, UserRole } from '../types';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

/**
 * Computes a secure SHA-256 hash of the refresh token for database persistence and lookup.
 */
const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  tokens: TokenPair;
}

export class AuthService {
  /**
   * Registers a new user account with hashed credentials.
   * Prevents duplicate email registration and enforces role safety.
   */
  public static async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: input.email.toLowerCase().trim() });
    if (existingUser) {
      throw new AppError('An account with this email address is already registered.', 409);
    }

    const hashedPassword = await hashPassword(input.password);

    // Strictly restrict public registration to DONOR or VOLUNTEER roles only
    if (input.role && !['DONOR', 'VOLUNTEER'].includes(input.role)) {
      throw new AppError(
        'Public registration is restricted to DONOR and VOLUNTEER roles only. Admin and Staff accounts must be provisioned through secure administrative procedures.',
        403
      );
    }
    const userRole: UserRole = input.role === 'VOLUNTEER' ? 'VOLUNTEER' : 'DONOR';

    const newUser: IUser = await User.create({
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      phone: input.phone?.trim() || '',
      passwordHash: hashedPassword,
      role: userRole,
      isActive: true,
      isEmailVerified: false,
    });

    const payload: AuthUserPayload = {
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      isActive: newUser.isActive,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store hashed refresh token in database
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    newUser.refreshTokens = [{ tokenHash, createdAt: new Date(), expiresAt }];
    await newUser.save();

    // Send welcome email non-blockingly
    EmailService.sendWelcomeEmail({
      email: newUser.email,
      name: newUser.name,
    }).catch((err) => logger.error(`[AuthService] Welcome email error: ${err.message}`));

    // In-app welcome notification
    NotificationService.createNotification({
      recipientId: newUser._id,
      type: 'WELCOME',
      title: 'Welcome to Shree Siddhivinayak Trust',
      message: `Namaste ${newUser.name}! Your verified profile is active. You can track seva contributions, download receipts, and manage your volunteer engagements.`,
      link: '/dashboard',
    }).catch((err) => logger.error(`[AuthService] Welcome notification error: ${err.message}`));

    // Notify Admins
    NotificationService.notifyAdmins({
      type: 'SYSTEM',
      title: 'New Account Registered',
      message: `${newUser.name} created a new ${newUser.role} account (${newUser.email}).`,
      link: '/admin',
      metadata: { userId: newUser._id.toString(), role: newUser.role },
    }).catch((err) => logger.error(`[AuthService] Admin notification error: ${err.message}`));

    return {
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        isEmailVerified: newUser.isEmailVerified,
        createdAt: newUser.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      },
    };
  }

  /**
   * Authenticates user with email and password.
   */
  public static async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email.toLowerCase().trim() })
      .select('+passwordHash +refreshTokens')
      .exec();

    if (!user) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    if (!user.isActive) {
      throw new AppError(
        'This account has been deactivated. Please contact the Siddhivinayak Trust administration.',
        403
      );
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const payload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      isActive: user.isActive,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store new hashed refresh token, prune expired tokens, and keep maximum 10 active tokens
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const activeTokens = (user.refreshTokens || [])
      .filter((t) => t.expiresAt > now)
      .slice(-9);

    activeTokens.push({ tokenHash, createdAt: now, expiresAt });
    user.refreshTokens = activeTokens;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      },
    };
  }

  /**
   * Refreshes access and refresh tokens via a valid refresh token.
   * Enforces strict token rotation: validates hash presence in user document,
   * invalidates the used token, issues a fresh token, and revokes all tokens on reuse attempt.
   */
  public static async refreshToken(token: string): Promise<TokenPair> {
    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id)
      .select('+refreshTokens')
      .exec();

    if (!user) {
      throw new AppError('User associated with refresh token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account deactivated.', 403);
    }

    const incomingHash = hashRefreshToken(token);
    const existingTokens = user.refreshTokens || [];
    const tokenIndex = existingTokens.findIndex((t) => t.tokenHash === incomingHash);

    // Reuse detection: If token was signed correctly but is not in user's active list,
    // it was already rotated or revoked. Revoke all tokens immediately for account safety.
    if (tokenIndex === -1) {
      user.refreshTokens = [];
      await user.save();
      throw new AppError(
        'Refresh token has already been used or revoked. For your security, please log in again.',
        401
      );
    }

    // Token is valid: Remove the used token (one-time use rotation)
    existingTokens.splice(tokenIndex, 1);

    const payload: AuthUserPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      isActive: user.isActive,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Add new token hash with 7 days expiry
    const newHash = hashRefreshToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const activeTokens = existingTokens
      .filter((t) => t.expiresAt > now)
      .slice(-9);

    activeTokens.push({ tokenHash: newHash, createdAt: now, expiresAt });
    user.refreshTokens = activeTokens;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  /**
   * Server-side logout: Invalidates specific refresh token or all user tokens.
   */
  public static async logout(token?: string, userId?: string): Promise<void> {
    if (token) {
      const incomingHash = hashRefreshToken(token);
      await User.updateOne(
        { 'refreshTokens.tokenHash': incomingHash },
        { $pull: { refreshTokens: { tokenHash: incomingHash } } }
      );
    } else if (userId) {
      await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
    }
  }

  /**
   * Retrieves profile details for the authenticated user.
   */
  public static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-passwordHash').exec();
    if (!user) {
      throw new AppError('User profile not found.', 404);
    }
    return user;
  }
}
