import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/apiResponse';
import { FILE_SIZE_LIMITS } from '../utils/fileSecurity';

// Use in-memory buffer storage so magic bytes can be inspected before saving to disk or Cloudinary
const memoryStorage = multer.memoryStorage();

export const uploadImageMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.IMAGE, // 5 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Initial coarse MIME filter (deep byte inspection follows in controller)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP images are allowed.', 400));
    }
    cb(null, true);
  },
}).single('file');

export const uploadDocumentMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.DOCUMENT, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    // Initial coarse MIME filter (deep byte inspection follows in controller)
    const allowedMimes = ['application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new AppError('Invalid file type. Only PDF documents (.pdf) are allowed.', 400));
    }
    cb(null, true);
  },
}).single('file');

/**
 * Wraps Multer middleware to convert Multer errors (e.g., file too large) into standard AppError (HTTP 400).
 */
export function handleUploadErrors(uploadFn: (req: Request, res: Response, next: NextFunction) => void) {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadFn(req, res, (err: any) => {
      if (err) {
        if (err instanceof MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('Uploaded file exceeds the maximum permitted size limit.', 400));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new AppError(`Unexpected form field name "${err.field}". Expected field "file".`, 400));
          }
          return next(new AppError(`Upload error: ${err.message}`, 400));
        }
        return next(err);
      }
      next();
    });
  };
}
