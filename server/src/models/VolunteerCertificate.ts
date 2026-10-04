import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IVolunteerCertificate extends Document {
  volunteer?: Types.ObjectId;
  user: Types.ObjectId;
  certificateNumber: string;
  volunteerName: string;
  issuedDate: string;
  serviceTitle: string;
  totalHours: number;
  signatoryTitle: string;
  signatoryName: string;
  verificationHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerCertificateSchema = new Schema<IVolunteerCertificate>(
  {
    volunteer: {
      type: Schema.Types.ObjectId,
      ref: 'Volunteer',
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    certificateNumber: {
      type: String,
      required: [true, 'Certificate number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    volunteerName: {
      type: String,
      required: [true, 'Volunteer name is required'],
      trim: true,
    },
    issuedDate: {
      type: String,
      required: [true, 'Issued date is required'],
      trim: true,
    },
    serviceTitle: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    totalHours: {
      type: Number,
      required: [true, 'Total certified hours are required'],
      min: [1, 'Minimum certified hours is 1'],
    },
    signatoryTitle: {
      type: String,
      default: 'President / अध्यक्ष',
      trim: true,
    },
    signatoryName: {
      type: String,
      default: 'Shri Sunil Vishwanath Nirgude',
      trim: true,
    },
    verificationHash: {
      type: String,
      required: [true, 'Verification hash is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VolunteerCertificate: Model<IVolunteerCertificate> =
  mongoose.models.VolunteerCertificate ||
  mongoose.model<IVolunteerCertificate>('VolunteerCertificate', volunteerCertificateSchema);
