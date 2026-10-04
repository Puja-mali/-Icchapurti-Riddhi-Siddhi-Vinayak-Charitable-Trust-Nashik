import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth';
import {
  uploadImageMiddleware,
  uploadDocumentMiddleware,
  handleUploadErrors,
} from '../middleware/upload';

const router = Router();

/**
 * @route   POST /api/uploads/image
 * @desc    Upload an image asset (Admin/Staff only)
 * @access  Private (ADMIN, STAFF)
 */
router.post(
  '/image',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  handleUploadErrors(uploadImageMiddleware),
  UploadController.uploadImage
);

/**
 * @route   POST /api/uploads/report
 * @desc    Upload a public transparency report PDF (Admin/Staff only)
 * @access  Private (ADMIN, STAFF)
 */
router.post(
  '/report',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  handleUploadErrors(uploadDocumentMiddleware),
  UploadController.uploadReport
);

/**
 * @route   POST /api/uploads/document
 * @desc    Upload an applicant verification document (Prescription, Income certificate)
 * @access  Private (Authenticated users)
 */
router.post(
  '/document',
  authenticate,
  handleUploadErrors(uploadDocumentMiddleware),
  UploadController.uploadPrivateDocument
);

/**
 * @route   GET /api/uploads/file/:publicId
 * @desc    Serve a public media asset safely
 * @access  Public
 */
router.get('/file/:publicId', UploadController.serveFile);

/**
 * @route   GET /api/uploads/private/:publicId
 * @desc    Serve a private document attachment (Requires authorization)
 * @access  Private
 */
router.get('/private/:publicId', authenticate, UploadController.serveFile);

/**
 * @route   DELETE /api/uploads/:id
 * @desc    Delete an uploaded media asset (Enforces owner or admin check)
 * @access  Private
 */
router.delete('/:id', authenticate, UploadController.deleteAsset);

export default router;
