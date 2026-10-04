import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { env } from '../config/env';

export const REFRESH_COOKIE_NAME = 'sct_refresh_token';

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      // Set secure HttpOnly cookie with refresh token
      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, getRefreshCookieOptions());

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'User registered successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);

      // Set secure HttpOnly cookie with refresh token
      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, getRefreshCookieOptions());

      sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
        'Login successful',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (!token) {
        sendError(res, 'No refresh token provided in session or request. Please log in.', 401);
        return;
      }

      const tokens = await AuthService.refreshToken(token);

      // Rotate refresh token in HttpOnly cookie
      res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, getRefreshCookieOptions());

      sendSuccess(
        res,
        {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
        'Tokens refreshed successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      const userId = req.user?._id;
      if (token || userId) {
        await AuthService.logout(token, userId);
      }
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        path: '/',
      });
      sendSuccess(res, null, 'Logged out successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getProfile(req.user!._id);
      sendSuccess(
        res,
        {
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
        },
        'User profile retrieved successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
