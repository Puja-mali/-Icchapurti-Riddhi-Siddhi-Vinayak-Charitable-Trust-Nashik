import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { HelpRequestType, HelpUrgency, HelpRequestStatus } from '../types';

export interface IHelpRequest extends Document {
  requesterId?: Types.ObjectId | null;
  name: string;
  email: string;
  phone: string;
  requestType: HelpRequestType;
  description: string;
  location: string;
  urgency: HelpUrgency;
  status: HelpRequestStatus;
  adminNotes?: string;
  assignedTo?: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const helpRequestSchema = new Schema<IHelpRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      maxlength: [150, 'Email cannot exceed 150 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    requestType: {
      type: String,
      required: [true, 'Request type is required'],
      enum: {
        values: ['Education', 'Medical', 'Food', 'Shelter', 'Emergency', 'Other'],
        message: '{VALUE} is not a supported request type',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description of hardship/aid needed is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location/address is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    urgency: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        message: '{VALUE} is not a valid urgency level',
      },
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'PENDING',
          'UNDER_REVIEW',
          'APPROVED',
          'REJECTED',
          'IN_PROGRESS',
          'RESOLVED',
          'CLOSED',
        ],
        message: '{VALUE} is not a valid help request status',
      },
      default: 'PENDING',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Admin notes cannot exceed 3000 characters'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
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
helpRequestSchema.index({ requesterId: 1, createdAt: -1 });
helpRequestSchema.index({ status: 1, createdAt: -1 });
helpRequestSchema.index({ urgency: 1, status: 1 });
helpRequestSchema.index({ requestType: 1, createdAt: -1 });

export const HelpRequest: Model<IHelpRequest> =
  mongoose.models.HelpRequest || mongoose.model<IHelpRequest>('HelpRequest', helpRequestSchema);
