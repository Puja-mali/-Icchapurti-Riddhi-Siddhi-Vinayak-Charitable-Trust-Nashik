import fs from 'fs';
import path from 'path';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env, isCloudinaryConfigured } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/apiResponse';
import { MediaAsset, IMediaAsset, MediaCategory, MediaStorageProvider } from '../models/MediaAsset';
import { generateSafeStoredFilename } from '../utils/fileSecurity';
import { Types } from 'mongoose';

export class StorageService {
  private static isInitialized = false;
  private static uploadsBaseDir = path.resolve(process.cwd(), 'server/uploads');

  /**
   * Initializes storage directories and Cloudinary configuration if present.
   */
  public static init(): void {
    if (this.isInitialized) return;

    if (isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      logger.info('[STORAGE] Cloudinary storage configured and active');
    } else {
      logger.info('[STORAGE] Cloudinary not configured; utilizing secure local server storage');
      // Ensure local upload directories exist
      const publicDir = path.join(this.uploadsBaseDir, 'public');
      const privateDir = path.join(this.uploadsBaseDir, 'private');
      fs.mkdirSync(publicDir, { recursive: true });
      fs.mkdirSync(privateDir, { recursive: true });
    }

    this.isInitialized = true;
  }

  /**
   * Uploads an inspected, validated file buffer to Cloudinary or secure local storage.
   */
  public static async storeFile({
    buffer,
    originalFilename,
    mimeType,
    verifiedExtension,
    category,
    isPublic,
    userId,
  }: {
    buffer: Buffer;
    originalFilename: string;
    mimeType: string;
    verifiedExtension: string;
    category: MediaCategory;
    isPublic: boolean;
    userId: string | Types.ObjectId;
  }): Promise<IMediaAsset> {
    this.init();

    const { safeFilename, sanitizedOriginal } = generateSafeStoredFilename(
      originalFilename,
      verifiedExtension
    );

    const publicIdToken = safeFilename.replace(/\.[^/.]+$/, '');

    // Option A: Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const folder = isPublic
          ? category === 'IMAGE'
            ? 'sct/public/images'
            : 'sct/public/reports'
          : 'sct/private/documents';

        const resourceType = category === 'IMAGE' ? 'image' : 'raw';

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              public_id: publicIdToken,
              resource_type: resourceType,
              overwrite: false,
              unique_filename: true,
            },
            (error, response) => {
              if (error || !response) {
                return reject(error || new Error('Empty response from Cloudinary'));
              }
              resolve(response);
            }
          );
          uploadStream.end(buffer);
        });

        const asset = await MediaAsset.create({
          url: result.secure_url,
          publicId: result.public_id,
          storageProvider: 'CLOUDINARY',
          originalFilename: sanitizedOriginal,
          sanitizedFilename: safeFilename,
          mimeType,
          sizeBytes: buffer.length,
          category,
          isPublic,
          uploadedBy: new Types.ObjectId(userId),
        });

        logger.info(`[STORAGE] Uploaded asset to Cloudinary: ${asset.publicId}`);
        return asset;
      } catch (err: any) {
        logger.error('[STORAGE] Cloudinary upload failed:', err);
        throw new AppError(`Storage upload failed: ${err.message || 'Unknown error'}`, 502);
      }
    }

    // Option B: Secure Local Storage
    try {
      const subFolder = isPublic ? 'public' : 'private';
      const targetDir = path.join(this.uploadsBaseDir, subFolder);
      fs.mkdirSync(targetDir, { recursive: true });

      // Path traversal safety check: ensure target path is strictly within targetDir
      const fullPath = path.resolve(targetDir, safeFilename);
      if (!fullPath.startsWith(targetDir)) {
        throw new AppError('Illegal path traversal detected in file storage operation', 400);
      }

      await fs.promises.writeFile(fullPath, buffer);

      // Construct safe URL for serving
      const servedUrl = isPublic
        ? `/api/uploads/file/${publicIdToken}`
        : `/api/uploads/private/${publicIdToken}`;

      const asset = await MediaAsset.create({
        url: servedUrl,
        publicId: publicIdToken,
        storageProvider: 'LOCAL',
        originalFilename: sanitizedOriginal,
        sanitizedFilename: safeFilename,
        mimeType,
        sizeBytes: buffer.length,
        category,
        isPublic,
        uploadedBy: new Types.ObjectId(userId),
        localFilePath: fullPath,
      });

      logger.info(`[STORAGE] Stored asset locally: ${safeFilename} (${buffer.length} bytes)`);
      return asset;
    } catch (err: any) {
      logger.error('[STORAGE] Local file store failed:', err);
      throw new AppError(`File storage failed: ${err.message || 'Unknown error'}`, 500);
    }
  }

  /**
   * Authorizes and deletes an asset by its publicId or ID.
   * Enforces IDOR check: Admin can delete any asset, owner can delete own asset.
   */
  public static async deleteAsset({
    identifier,
    requestingUserId,
    requestingUserRole,
  }: {
    identifier: string;
    requestingUserId: string;
    requestingUserRole: string;
  }): Promise<void> {
    this.init();

    const isObjectId = Types.ObjectId.isValid(identifier);
    const asset = await MediaAsset.findOne(
      isObjectId ? { $or: [{ _id: identifier }, { publicId: identifier }] } : { publicId: identifier }
    );

    if (!asset) {
      throw new AppError('Asset not found or already removed', 404);
    }

    // Authorization & IDOR Check
    const isAdmin = requestingUserRole === 'ADMIN';
    const isOwner = asset.uploadedBy.toString() === requestingUserId;

    if (!isAdmin && !isOwner) {
      throw new AppError('Access denied: You do not have permission to delete this asset', 403);
    }

    // Provider-specific removal
    if (asset.storageProvider === 'CLOUDINARY' && isCloudinaryConfigured()) {
      try {
        const resourceType = asset.category === 'IMAGE' ? 'image' : 'raw';
        await cloudinary.uploader.destroy(asset.publicId, { resource_type: resourceType });
        logger.info(`[STORAGE] Destroyed Cloudinary asset: ${asset.publicId}`);
      } catch (err: any) {
        logger.warn(`[STORAGE] Failed to destroy Cloudinary asset ${asset.publicId}:`, err);
      }
    } else if (asset.storageProvider === 'LOCAL' && asset.localFilePath) {
      try {
        if (fs.existsSync(asset.localFilePath)) {
          await fs.promises.unlink(asset.localFilePath);
          logger.info(`[STORAGE] Deleted local file: ${asset.localFilePath}`);
        }
      } catch (err: any) {
        logger.warn(`[STORAGE] Failed to delete local file ${asset.localFilePath}:`, err);
      }
    }

    await MediaAsset.deleteOne({ _id: asset._id });
  }

  /**
   * Retrieves asset metadata by publicId or ID, checking access rights for private assets.
   */
  public static async getAssetForServing(
    publicId: string,
    requestingUser?: { id: string; role: string }
  ): Promise<{ asset: IMediaAsset; filePath: string }> {
    this.init();

    const asset = await MediaAsset.findOne({ publicId });
    if (!asset) {
      throw new AppError('File not found', 404);
    }

    // If file is private, enforce authentication and authorization
    if (!asset.isPublic) {
      if (!requestingUser) {
        throw new AppError('Authentication required to access this document', 401);
      }
      const isAdminOrStaff = requestingUser.role === 'ADMIN' || requestingUser.role === 'STAFF';
      const isOwner = asset.uploadedBy.toString() === requestingUser.id;
      if (!isAdminOrStaff && !isOwner) {
        throw new AppError('Access denied to private document', 403);
      }
    }

    if (asset.storageProvider === 'LOCAL' && asset.localFilePath) {
      if (!fs.existsSync(asset.localFilePath)) {
        throw new AppError('File content is no longer available on disk', 404);
      }
      return { asset, filePath: asset.localFilePath };
    }

    throw new AppError('Direct file streaming is not supported for remote storage assets', 400);
  }
}
