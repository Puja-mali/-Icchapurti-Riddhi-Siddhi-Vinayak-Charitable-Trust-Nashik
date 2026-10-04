import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/apiResponse';
import { User } from '../models/User';
import { UserRole } from '../types';

/**
 * Authentication Middleware
 * Extracts Bearer token, verifies its signature and validity, and attaches the active user to req.user.
 * Rejects unauthenticated, invalid, or deactivated accounts.
 * TODO: For production hardening, add token revocation/denylist checks via Redis.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token is missing. Please provide a valid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication token malformed.', 401);
    }

    const decoded = verifyAccessToken(token);

    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is temporarily unavailable. Please try again later.', 503);
    }

    // Fetch user from database to verify active state and current role
    const user = await User.findById(decoded.id).select(
      '_id name email phone role isActive isEmailVerified'
    );

    if (!user) {
      throw new AppError('User account associated with this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError(
        'This account has been deactivated. Please contact the Siddhivinayak Trust administration.',
        403
      );
    }

    // Attach verified user to request context
    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * If a valid Bearer token is provided, attaches req.user.
 * Does NOT reject if token is missing or invalid.
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select(
      '_id name email phone role isActive isEmailVerified'
    );

    if (user && user.isActive) {
      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role as UserRole,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      };
    }

    next();
  } catch {
    next();
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access strictly to users with designated roles.
 * Example: authorize('ADMIN', 'STAFF') rejects DONOR and VOLUNTEER.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}].`,
          403
        )
      );
    }

    next();
  };
};

/**
 * IDOR / Resource Ownership Guard Middleware
 * Verifies that the authenticated user owns the resource identified by the target parameter
 * (defaults to req.params.id or req.params.userId), OR possesses one of the specified bypass roles
 * (such as ADMIN or STAFF).
 * Returns 401 if unauthenticated, 403 if unauthorized.
 */
export const enforceOwnerOrRoles = (
  paramName: string = 'id',
  ...bypassRoles: UserRole[]
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required before ownership check.', 401));
    }

    const resourceOwnerId = req.params[paramName];
    const isOwner = resourceOwnerId === req.user._id;
    const hasBypassRole = bypassRoles.includes(req.user.role);

    if (!isOwner && !hasBypassRole) {
      return next(
        new AppError(
          'Forbidden: You do not have authorization to access or modify another user’s record.',
          403
        )
      );
    }

    next();
  };
};
