/**
 * Structured Logger Utility
 * Provides uniform log levels (INFO, WARN, ERROR, DEBUG) with timestamps and contextual metadata.
 * TODO: For production hardening, integrate with distributed logging aggregators (e.g., Datadog, Winston, or CloudWatch).
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const formatLog = (level: LogLevel, message: string, meta?: unknown): string => {
  const timestamp = new Date().toISOString();
  const metaStr = meta !== undefined ? ` | Context: ${typeof meta === 'object' ? JSON.stringify(meta) : String(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(formatLog('INFO', message, meta));
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(formatLog('WARN', message, meta));
  },
  error: (message: string, meta?: unknown) => {
    console.error(formatLog('ERROR', message, meta));
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('DEBUG', message, meta));
    }
  },
};
