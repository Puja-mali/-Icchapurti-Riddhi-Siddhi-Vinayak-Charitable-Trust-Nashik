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
  if (isProd) {
    if (!uri) {
      logger.error(
        '[FATAL] Production database configuration error: MONGODB_URI is required when NODE_ENV=production. In-memory database fallback is strictly prohibited in production. Server startup aborted.'
      );
      return false;
    }
  }

  // 2. Development & Non-production Fallback: Only permitted with explicit opt-in
  if (!uri && !isProd) {
    const useInMemory = options.allowInMemory ?? (process.env.USE_IN_MEMORY_DB === 'true' || env.USE_IN_MEMORY_DB);

    if (useInMemory) {
      try {
        logger.info(
          'USE_IN_MEMORY_DB=true detected. Initializing local in-memory MongoDB instance for development/testing...'
        );
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        if (!mongodInstance) {
          mongodInstance = await MongoMemoryServer.create();
        }
        uri = mongodInstance.getUri();
        logger.info('Local in-memory MongoDB instance initialized successfully.');
      } catch (memErr) {
        logger.error('Failed to launch in-memory MongoDB instance:', (memErr as Error)?.message || memErr);
        return false;
      }
    } else {
      logger.error(
        '[FATAL] Database configuration missing: MONGODB_URI is not set in environment. To start with an ephemeral in-memory database for local testing or development, set USE_IN_MEMORY_DB=true in your .env file. Otherwise, provide a valid MONGODB_URI (e.g. MongoDB Atlas or local mongodb://localhost:27017/trust_db).'
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

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    return true;
  } catch (error) {
    logger.error('Failed to establish initial MongoDB connection:', (error as Error)?.message || error);
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
