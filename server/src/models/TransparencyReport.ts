import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type TransparencyReportType =
  | 'Annual Report'
  | 'Financial Report'
  | 'Impact Report'
  | 'Audit Report'
  | 'Donation Utilization Report'
  | 'Other';

export interface ITransparencyReport extends Document {
  title: string;
  description: string;
  reportType: TransparencyReportType;
  financialYear: string;
  periodStart?: Date;
  periodEnd?: Date;
  fileUrl?: string;
  coverImage?: string;
  fileSize?: string;
  auditRating?: string;
  auditorFirm?: string;
  statutoryType?: string;
  totalDisbursal?: string;
  publishedAt: Date;
  isPublished: boolean;
  isFeatured: boolean;
  isKumbhRelated: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transparencyReportSchema = new Schema<ITransparencyReport>(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    reportType: {
      type: String,
      required: [true, 'Report type is required'],
      enum: {
        values: [
          'Annual Report',
          'Financial Report',
          'Impact Report',
          'Audit Report',
          'Donation Utilization Report',
          'Other',
        ],
        message: '{VALUE} is not a supported report type',
      },
      index: true,
    },
    financialYear: {
      type: String,
      required: [true, 'Financial year is required'],
      trim: true,
      index: true,
    },
    periodStart: {
      type: Date,
    },
    periodEnd: {
      type: Date,
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    fileSize: {
      type: String,
      trim: true,
      default: '',
    },
    auditRating: {
      type: String,
      trim: true,
      default: '',
    },
    auditorFirm: {
      type: String,
      trim: true,
      default: '',
    },
    statutoryType: {
      type: String,
      trim: true,
      default: '',
    },
    totalDisbursal: {
      type: String,
      trim: true,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isKumbhRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

// Performance & querying compound indexes
transparencyReportSchema.index({ isPublished: 1, publishedAt: -1 });
transparencyReportSchema.index({ isPublished: 1, financialYear: -1, publishedAt: -1 });
transparencyReportSchema.index({ isPublished: 1, reportType: 1, publishedAt: -1 });
transparencyReportSchema.index({ isPublished: 1, isFeatured: -1, publishedAt: -1 });

export const TransparencyReport: Model<ITransparencyReport> =
  mongoose.models.TransparencyReport ||
  mongoose.model<ITransparencyReport>('TransparencyReport', transparencyReportSchema);
