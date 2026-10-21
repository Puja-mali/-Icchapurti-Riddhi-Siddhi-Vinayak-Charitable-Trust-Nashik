import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();
// Also attempt loading from server root if launched from different directory
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

export const DEV_JWT_ACCESS_FALLBACK = 'dev_jwt_access_fallback_secret_key_siddhivinayak';
export const DEV_JWT_REFRESH_FALLBACK = 'dev_jwt_refresh_fallback_secret_key_siddhivinayak';

const isProduction = process.env.NODE_ENV === 'production';

// Allow development fallbacks ONLY in development mode, NEVER in production
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || (isProduction ? '' : DEV_JWT_ACCESS_FALLBACK);
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (isProduction ? '' : DEV_JWT_REFRESH_FALLBACK);

const cleanEnvStr = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

// Parse CLOUDINARY_URL if provided (cloudinary://<api_key>:<api_secret>@<cloud_name>)
let parsedCloudName = cleanEnvStr(process.env.CLOUDINARY_CLOUD_NAME);
let parsedApiKey = cleanEnvStr(process.env.CLOUDINARY_API_KEY);
let parsedApiSecret = cleanEnvStr(process.env.CLOUDINARY_API_SECRET);

const rawCloudinaryUrl = cleanEnvStr(process.env.CLOUDINARY_URL);
if (rawCloudinaryUrl && (!parsedCloudName || !parsedApiKey || !parsedApiSecret)) {
  try {
    const match = rawCloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      if (!parsedApiKey) parsedApiKey = match[1];
      if (!parsedApiSecret) parsedApiSecret = match[2];
      if (!parsedCloudName) parsedCloudName = match[3];
    }
  } catch {
    // Ignore URL parse error
  }
}

// Support both SMTP_* and EMAIL_* environment variable standards (common on Render and Docker)
const emailHost = cleanEnvStr(process.env.SMTP_HOST || process.env.EMAIL_HOST);
const emailPortRaw = cleanEnvStr(process.env.SMTP_PORT || process.env.EMAIL_PORT) || '587';
const emailPort = parseInt(emailPortRaw, 10);
const emailUser = cleanEnvStr(process.env.SMTP_USER || process.env.EMAIL_USER);
const emailPassword = cleanEnvStr(
  process.env.SMTP_PASS ||
  process.env.SMTP_PASSWORD ||
  process.env.EMAIL_PASSWORD
);
const emailFrom = cleanEnvStr(
  process.env.SMTP_FROM ||
  process.env.EMAIL_FROM ||
  process.env.SMTP_USER ||
  process.env.EMAIL_USER ||
  'ichhapurtiriddhisiddhivinayak@gmail.com'
);
const emailSecureRaw = cleanEnvStr(process.env.SMTP_SECURE || process.env.EMAIL_SECURE);
const emailSecure = emailSecureRaw === 'true' || emailPort === 465;

// Resolves deployed frontend URL (Render provides RENDER_EXTERNAL_URL)
const resolvedClientUrl = cleanEnvStr(
  process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'
);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  CLIENT_URL: resolvedClientUrl,
  MONGODB_URI: cleanEnvStr(process.env.MONGODB_URI),
  USE_IN_MEMORY_DB: process.env.USE_IN_MEMORY_DB === 'true',
  JWT_ACCESS_SECRET: jwtAccessSecret,
  JWT_REFRESH_SECRET: jwtRefreshSecret,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1500', 10),
  AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '60', 10),
  RAZORPAY_KEY_ID: cleanEnvStr(process.env.RAZORPAY_KEY_ID),
  RAZORPAY_KEY_SECRET: cleanEnvStr(process.env.RAZORPAY_KEY_SECRET),
  RAZORPAY_WEBHOOK_SECRET: cleanEnvStr(process.env.RAZORPAY_WEBHOOK_SECRET),
  GEMINI_API_KEY: cleanEnvStr(process.env.GEMINI_API_KEY),
  EMAIL_HOST: emailHost,
  EMAIL_PORT: emailPort,
  EMAIL_USER: emailUser,
  EMAIL_PASSWORD: emailPassword,
  EMAIL_FROM: emailFrom,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Icchapurti Riddhi Siddhi Vinayak Charitable Trust',
  EMAIL_SECURE: emailSecure,
  CLOUDINARY_CLOUD_NAME: parsedCloudName,
  CLOUDINARY_API_KEY: parsedApiKey,
  CLOUDINARY_API_SECRET: parsedApiSecret,
  VAPID_PUBLIC_KEY: cleanEnvStr(process.env.VAPID_PUBLIC_KEY),
  VAPID_PRIVATE_KEY: cleanEnvStr(process.env.VAPID_PRIVATE_KEY),
  VAPID_SUBJECT: cleanEnvStr(process.env.VAPID_SUBJECT) || 'mailto:ichhapurtiriddhisiddhivinayak@gmail.com',
  isProduction,
};

export const isRazorpayConfigured = (): boolean => {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
};

export const isGeminiConfigured = (): boolean => {
  return Boolean(env.GEMINI_API_KEY);
};

export const isEmailConfigured = (): boolean => {
  return Boolean(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD);
};

export const isCloudinaryConfigured = (): boolean => {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};

export const isWebPushConfigured = (): boolean => {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
};

/**
 * Validates production JWT secrets and throws a clear fatal error if secrets are missing,
 * empty, or still using development fallbacks.
 */
export const validateJwtSecrets = (config: {
  isProduction: boolean;
  JWT_ACCESS_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
} = env): void => {
  if (!config.isProduction) return;

  const access = (config.JWT_ACCESS_SECRET || '').trim();
  const refresh = (config.JWT_REFRESH_SECRET || '').trim();

  const isAccessInvalid =
    !access ||
    access.includes('dev_') ||
    access === DEV_JWT_ACCESS_FALLBACK;

  const isRefreshInvalid =
    !refresh ||
    refresh.includes('dev_') ||
    refresh === DEV_JWT_REFRESH_FALLBACK;

  if (isAccessInvalid || isRefreshInvalid) {
    const errorDetails: string[] = [];
    if (isAccessInvalid) {
      errorDetails.push('JWT_ACCESS_SECRET is missing, empty, or using a development fallback');
    }
    if (isRefreshInvalid) {
      errorDetails.push('JWT_REFRESH_SECRET is missing, empty, or using a development fallback');
    }
    const message = `[FATAL SECURITY CONFIGURATION] Production startup aborted: ${errorDetails.join('; ')}. Production requires explicit, high-entropy JWT secrets in environment variables.`;
    console.error(message);
    throw new Error(message);
  }
};

// Validate critical production configurations
if (env.isProduction) {
  if (!process.env.MONGODB_URI) {
    console.warn('[SECURITY WARNING] MONGODB_URI is not set in production environment!');
  }
  validateJwtSecrets(env);
}
