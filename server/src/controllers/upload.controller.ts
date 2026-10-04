import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storage.service';
import { validateFileSignature } from '../utils/fileSecurity';
import { AppError, sendSuccess } from '../utils/apiResponse';

export class UploadController {
  /**
   * Uploads a public image (Causes, Events, Blog, Gallery, Trust Profile).
   * Authorized for ADMIN and STAFF (or authenticated users).
   */
  public static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file || !req.file.buffer) {
        throw new AppError('No file provided. Please provide an image file in the "file" field.', 400);
      }

      // Deep binary magic byte verification
      const sigCheck = validateFileSignature(req.file.buffer, 'IMAGE');
      if (!sigCheck.isValid || !sigCheck.detectedMime || !sigCheck.extension) {
        throw new AppError(sigCheck.error || 'Invalid image file signature.', 400);
      }

      const asset = await StorageService.storeFile({
        buffer: req.file.buffer,
        originalFilename: req.file.originalname,
        mimeType: sigCheck.detectedMime,
        verifiedExtension: sigCheck.extension,
        category: 'IMAGE',
        isPublic: true,
        userId: req.user!._id,
      });

      sendSuccess(
        res,
        {
          url: asset.url,
          publicId: asset.publicId,
          originalName: asset.originalFilename,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
        },
        'Image uploaded and verified successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Uploads a public document (e.g. Annual Audit Report, Transparency PDF).
   * Restricted strictly to ADMIN and STAFF.
   */
  public static async uploadReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file || !req.file.buffer) {
        throw new AppError('No file provided. Please provide a PDF document in the "file" field.', 400);
      }

      // Deep binary magic byte verification
      const sigCheck = validateFileSignature(req.file.buffer, 'DOCUMENT');
      if (!sigCheck.isValid || !sigCheck.detectedMime || !sigCheck.extension) {
        throw new AppError(sigCheck.error || 'Invalid PDF document signature.', 400);
      }

      const asset = await StorageService.storeFile({
        buffer: req.file.buffer,
        originalFilename: req.file.originalname,
        mimeType: sigCheck.detectedMime,
        verifiedExtension: sigCheck.extension,
        category: 'DOCUMENT',
        isPublic: true,
        userId: req.user!._id,
      });

      sendSuccess(
        res,
        {
          url: asset.url,
          publicId: asset.publicId,
          originalName: asset.originalFilename,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
        },
        'Transparency report PDF uploaded and verified successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Uploads a private document/attachment (e.g. Doctor's Prescription, Income Certificate for Help Request).
   * Scoped to the authenticated applicant.
   */
  public static async uploadPrivateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file || !req.file.buffer) {
        throw new AppError('No file provided. Please provide a document or image file in the "file" field.', 400);
      }

      // Allow either PDF or Image for applicant verification proofs
      let sigCheck = validateFileSignature(req.file.buffer, 'DOCUMENT');
      let category: 'DOCUMENT' | 'IMAGE' = 'DOCUMENT';

      if (!sigCheck.isValid) {
        sigCheck = validateFileSignature(req.file.buffer, 'IMAGE');
        category = 'IMAGE';
      }

      if (!sigCheck.isValid || !sigCheck.detectedMime || !sigCheck.extension) {
        throw new AppError('Invalid attachment. Only genuine PDF documents and JPEG/PNG images are permitted.', 400);
      }

      const asset = await StorageService.storeFile({
        buffer: req.file.buffer,
        originalFilename: req.file.originalname,
        mimeType: sigCheck.detectedMime,
        verifiedExtension: sigCheck.extension,
        category: 'HELP_ATTACHMENT',
        isPublic: false,
        userId: req.user!._id,
      });

      sendSuccess(
        res,
        {
          url: asset.url,
          publicId: asset.publicId,
          originalName: asset.originalFilename,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          isPublic: false,
        },
        'Document proof uploaded securely',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Securely serves a stored asset with strict Content-Type and security headers.
   */
  public static async serveFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicId } = req.params;
      const requestingUser = req.user
        ? { id: req.user._id.toString(), role: req.user.role }
        : undefined;

      const { asset, filePath } = await StorageService.getAssetForServing(publicId, requestingUser);

      // Enforce nosniff and correct MIME type to prevent browser mime-sniffing exploits
      res.setHeader('Content-Type', asset.mimeType);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', asset.isPublic ? 'public, max-age=86400' : 'private, no-cache');

      // Send file safely
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes an uploaded asset.
   * Enforces IDOR check: ADMIN can delete any asset; user can delete own uploaded asset.
   */
  public static async deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await StorageService.deleteAsset({
        identifier: id,
        requestingUserId: req.user!._id.toString(),
        requestingUserRole: req.user!.role,
      });

      sendSuccess(res, null, 'Asset deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
