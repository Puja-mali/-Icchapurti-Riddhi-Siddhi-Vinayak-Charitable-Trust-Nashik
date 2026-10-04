import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { CauseCategory, CauseStatus } from '../types';

export interface IAllocationItem {
  category: string;
  percentage: number;
}

export interface IImpactMilestone {
  title: string;
  description: string;
  targetDate: string;
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface ICause extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  category: CauseCategory;
  imageUrl: string;
  status: CauseStatus;
  isKumbhRelated: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy?: Types.ObjectId;
  donorCount: number;
  location: string;
  urgent: boolean;
  allocationBreakdown: IAllocationItem[];
  impactMilestones: IImpactMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const causeSchema = new Schema<ICause>(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Campaign slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full campaign description is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target funding amount is required'],
      min: [1, 'Target amount must be at least ₹1'],
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Raised amount cannot be negative'],
    },
    category: {
      type: String,
      enum: [
        'Education',
        'Medical Support',
        'Food & Nutrition',
        'Emergency Relief',
        'Environment',
        'Other',
      ],
      default: 'Other',
      required: [true, 'Category is required'],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    isKumbhRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    donorCount: {
      type: Number,
      default: 0,
      min: [0, 'Donor count cannot be negative'],
    },
    location: {
      type: String,
      default: 'Maharashtra, India',
      trim: true,
    },
    urgent: {
      type: Boolean,
      default: false,
      index: true,
    },
    allocationBreakdown: [
      {
        category: { type: String, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    impactMilestones: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        targetDate: { type: String, required: true },
        status: {
          type: String,
          enum: ['completed', 'in_progress', 'upcoming'],
          default: 'upcoming',
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.tagline = ret.shortDescription;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.tagline = ret.shortDescription;
        return ret;
      },
    },
  }
);

// Virtual property: tagline mirroring shortDescription for UI compatibility
causeSchema.virtual('tagline').get(function (this: ICause) {
  return this.shortDescription;
});

export const Cause: Model<ICause> =
  mongoose.models.Cause || mongoose.model<ICause>('Cause', causeSchema);
