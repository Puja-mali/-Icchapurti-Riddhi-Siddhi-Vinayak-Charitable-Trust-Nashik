import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IVolunteerApplication extends Document {
  roleId?: Types.ObjectId;
  roleTitle: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  isCollegeStudent: boolean;
  collegeName?: string;
  motivation?: string;
  isKumbhRelated?: boolean;
  preferredSevaArea?: string;
  availability?: string;
  emergencyContact?: string;
  skills?: string[];
  referenceNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'VolunteerRole',
    },
    roleTitle: {
      type: String,
      required: [true, 'Target role title is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City/Region is required'],
      trim: true,
    },
    isCollegeStudent: {
      type: Boolean,
      default: false,
    },
    collegeName: {
      type: String,
      default: '',
      trim: true,
    },
    motivation: {
      type: String,
      default: '',
      trim: true,
    },
    isKumbhRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    preferredSevaArea: {
      type: String,
      default: '',
      trim: true,
    },
    availability: {
      type: String,
      default: '',
      trim: true,
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    referenceNumber: {
      type: String,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const VolunteerApplication: Model<IVolunteerApplication> =
  mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>('VolunteerApplication', volunteerApplicationSchema);
