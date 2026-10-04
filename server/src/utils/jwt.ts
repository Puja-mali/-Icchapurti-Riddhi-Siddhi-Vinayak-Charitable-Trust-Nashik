import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthUserPayload } from '../types';

export interface DecodedToken extends AuthUserPayload {
  iat: number;
  exp: number;
}

/**
 * Generates a short-lived access token (default: 15 minutes)
 */
export const generateAccessToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Generates a refresh token (default: 7 days)
 */
export const generateRefreshToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/**
 * Verifies and decodes an access token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
};

/**
 * Verifies and decodes a refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as DecodedToken;
};
