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

// Disable command buffering globally so queries fail fast rather than hanging 10 seconds when disconnected
mongoose.set('bufferCommands', false);

export const connectDatabase = async (): Promise<boolean> => {
  mongoose.set('strictQuery', true);
  mongoose.set('bufferCommands', false);

  if (!env.MONGODB_URI) {
    logger.warn(
      'MONGODB_URI is not configured in .env. Database connection skipped. The server is running in standalone mode until real MongoDB credentials are provided.'
    );
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected successfully to host: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error encountered:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Attempting reconnection...');
    });

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    return true;
  } catch (error) {
    logger.error('Failed to establish initial MongoDB connection:', error);
    // Do not crash the entire node process; allow health endpoints to report status
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully.');
  } catch (error) {
    logger.error('Error during MongoDB disconnect:', error);
  }
};
