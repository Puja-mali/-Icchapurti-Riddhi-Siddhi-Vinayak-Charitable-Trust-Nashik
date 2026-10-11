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
    logger.error('MongoDB connection error encountered:', (err as Error)?.message || err);
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
  let uri = options.uri !== undefined ? options.uri : (process.env.MONGODB_URI || env.MONGODB_URI);

  // 1. Production Validation: Real MongoDB connection strictly required
  if (isProd && !uri && options.allowInMemory !== true) {
    logger.warn(
      '[WARNING] Production database configuration notice: MONGODB_URI is not set in environment.'
    );
    return false;
  }

  // 2. Fallback: Automatically launch in-memory MongoDB when no remote URI is configured
  if (!uri) {
    const useInMemory = options.allowInMemory !== false;

    if (useInMemory) {
      try {
        logger.info(
          'No external MONGODB_URI configured. Initializing local in-memory MongoDB instance for development & preview...'
        );
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!mongodInstance) {
          mongodInstance = await MongoMemoryServer.create();
        }
        uri = mongodInstance.getUri();
        logger.info('Local in-memory MongoDB instance initialized successfully.');
      } catch (memErr) {
        logger.warn('Failed to launch in-memory MongoDB instance:', (memErr as Error)?.message || memErr);
        return false;
      }
    } else {
      logger.warn(
        'Database connection omitted: MONGODB_URI is unset and in-memory database is disabled.'
      );
      return false;
    }
  }

  if (!uri) {
    logger.error('[FATAL] No valid MongoDB URI available for connection.');
    return false;
  }

  try {
    setupConnectionListeners();

    // Determine appropriate timeout: if uri already specifies serverSelectionTimeoutMS, let it take precedence
    const isRemote = uri.startsWith('mongodb+srv://') || (!uri.includes('127.0.0.1') && !uri.includes('localhost'));
    const defaultSelectionTimeout = isRemote ? 10000 : 5000;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: defaultSelectionTimeout,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    return true;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logger.error('Failed to establish MongoDB connection:', errorMsg);

    // Provide actionable diagnostic advice without revealing secrets or URI strings
    if (error?.name === 'MongooseServerSelectionError' || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ETIMEDOUT')) {
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
