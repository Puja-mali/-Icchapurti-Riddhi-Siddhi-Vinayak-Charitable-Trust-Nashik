import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export interface DbStatusInfo {
  status: 'connected' | 'connecting' | 'disconnecting' | 'disconnected';
  host?: string;
  name?: string;
}

export const getDbStatus = (): DbStatusInfo => {
  const readyState = mongoose.connection.readyState;
  switch (readyState) {
    case 1:
      return {
        status: 'connected',
        host: mongoose.connection.host || undefined,
        name: mongoose.connection.name || undefined,
      };
    case 2:
      return { status: 'connecting' };
    case 3:
      return { status: 'disconnecting' };
    case 0:
    default:
      return { status: 'disconnected' };
  }
};

let mongodInstance: any = null;
let listenersAttached = false;

// Disable command buffering globally so queries fail fast rather than hanging when disconnected
mongoose.set('bufferCommands', false);

const setupConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connection established successfully (host: ${mongoose.connection.host || 'active-cluster'}).`);
  });

  mongoose.connection.on('error', (err) => {
    // Only log runtime errors on established connections to avoid duplicate logs during startup attempts
    if (mongoose.connection.readyState === 1) {
      logger.error('MongoDB connection error encountered:', (err as Error)?.message || err);
    }
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost.');
  });
};

export interface ConnectDatabaseOptions {
  uri?: string;
  allowInMemory?: boolean;
}

export const connectDatabase = async (options: ConnectDatabaseOptions = {}): Promise<boolean> => {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  if (mongoose.connection.readyState === 1) {
    logger.info('Database connection already established.');
    return true;
  }

  const isProd = process.env.NODE_ENV === 'production' || env.isProduction;
  const forceInMemory = !isProd && (process.env.USE_IN_MEMORY_DB === 'true' || env.USE_IN_MEMORY_DB);
  let uri = options.uri !== undefined 
    ? options.uri 
    : (forceInMemory ? '' : (process.env.MONGODB_URI || env.MONGODB_URI));

  // 1. Production Validation: Real MongoDB connection strictly required
  if (isProd) {
    if (!uri) {
      logger.warn(
        '[WARNING] Production database configuration notice: MONGODB_URI is not set in environment. In-memory database fallback is strictly blocked in production.'
      );
      return false;
    }
  }

  setupConnectionListeners();

  // Helper to start and connect to isolated in-memory DB in development
  const startInMemoryDb = async (reason?: string): Promise<boolean> => {
    try {
      logger.info(
        reason || 'Initializing local in-memory MongoDB instance for development & preview...'
      );
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!mongodInstance) {
        mongodInstance = await MongoMemoryServer.create();
      }
      const memUri = mongodInstance.getUri();
      await mongoose.connect(memUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      logger.info('Local in-memory MongoDB instance initialized successfully.');
      return true;
    } catch (memErr) {
      logger.warn('Failed to launch in-memory MongoDB instance:', (memErr as Error)?.message || memErr);
      return false;
    }
  };

  // 2. Fallback: Automatically launch in-memory MongoDB when no remote URI is configured
  if (!uri) {
    const useInMemory = options.allowInMemory !== false;

    if (useInMemory && !isProd) {
      return await startInMemoryDb('No external MONGODB_URI configured. Initializing local in-memory MongoDB instance for development & preview...');
    } else {
      logger.warn(
        'Database connection omitted: MONGODB_URI is unset and in-memory database is disabled.'
      );
      return false;
    }
  }

  // Determine appropriate timeout: if uri already specifies serverSelectionTimeoutMS, let it take precedence
  const isRemote = uri.startsWith('mongodb+srv://') || (!uri.includes('127.0.0.1') && !uri.includes('localhost'));
  const defaultSelectionTimeout = isRemote ? (isProd ? 10000 : 3000) : 5000;
  const maxAttempts = isProd && isRemote ? 3 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        logger.info(`[MONGODB] Retrying connection attempt ${attempt}/${maxAttempts}...`);
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: defaultSelectionTimeout,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      return true;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);

      if (attempt < maxAttempts) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
        logger.warn(`[MONGODB] Connection attempt ${attempt} failed (${errorMsg}). Backing off for ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      if (isProd) {
        logger.error('Failed to establish MongoDB connection after maximum attempts:', errorMsg);

        // Provide actionable diagnostic advice without revealing secrets or URI strings
        if (error?.name === 'MongooseServerSelectionError' || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('whitelisted') || errorMsg.includes('SSL')) {
          logger.warn(
            '[MONGODB ATLAS DIAGNOSTIC] Cluster unreachable or server selection timed out. Typical root causes: ' +
            '1) Client IP is not permitted in MongoDB Atlas Network Access (whitelist your hosting IP or 0.0.0.0/0 for Cloud Run/Container hosting). ' +
            '2) MongoDB Atlas shared M0 cluster is in pause/resume transition. ' +
            '3) Network restricts direct outbound TCP on port 27017.'
          );
        } else if (errorMsg.includes('Authentication failed') || errorMsg.includes('auth error')) {
          logger.warn(
            '[MONGODB ATLAS DIAGNOSTIC] Authentication failed. Ensure MongoDB Atlas username and password in MONGODB_URI are URL-encoded and match a user in Atlas Database Access.'
          );
        }

        return false;
      }

      // In development / preview mode:
      if (options.allowInMemory !== false) {
        logger.warn(
          `[MONGODB NOTICE] Remote MongoDB Atlas connection unavailable (${errorMsg.includes('SSL') || errorMsg.includes('whitelisted') ? 'Atlas IP whitelist restriction or SSL alert' : errorMsg}). Falling back to isolated local in-memory database for development & preview.`
        );
        return await startInMemoryDb('Initializing isolated local in-memory MongoDB fallback...');
      } else {
        logger.warn('Failed to establish MongoDB connection and in-memory fallback is disabled:', errorMsg);
        return false;
      }
    }
  }

  return false;
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
    logger.info('MongoDB disconnected gracefully.');
  } catch (error) {
    logger.error('Error during MongoDB disconnect:', error);
  }
};
