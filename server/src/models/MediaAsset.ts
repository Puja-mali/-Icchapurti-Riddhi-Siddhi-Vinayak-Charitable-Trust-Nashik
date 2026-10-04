import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MediaStorageProvider = 'CLOUDINARY' | 'LOCAL';
export type MediaCategory = 'IMAGE' | 'DOCUMENT' | 'HELP_ATTACHMENT';

export interface IMediaAsset extends Document {
  url: string;
  publicId: string;
  storageProvider: MediaStorageProvider;
  originalFilename: string;
  sanitizedFilename: string;
  mimeType: string;
  sizeBytes: number;
  category: MediaCategory;
  isPublic: boolean;
  uploadedBy: Types.ObjectId;
  localFilePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: {
      type: String,
      required: [true, 'Asset URL is required'],
      trim: true,
      index: true,
    },
    publicId: {
      type: String,
      required: [true, 'Asset publicId is required'],
      unique: true,
      trim: true,
      index: true,
    },
    storageProvider: {
      type: String,
      enum: ['CLOUDINARY', 'LOCAL'],
      required: true,
      default: 'LOCAL',
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    sanitizedFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      enum: ['IMAGE', 'DOCUMENT', 'HELP_ATTACHMENT'],
      required: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    localFilePath: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const MediaAsset: Model<IMediaAsset> =
  mongoose.models.MediaAsset || mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema);
