import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IVolunteerShift extends Document {
  volunteer?: Types.ObjectId;
  user: Types.ObjectId;
  roleTitle: string;
  date: string;
  hours: number;
  location: string;
  supervisor: string;
  status: 'Completed & Verified' | 'Scheduled' | 'Pending Approval';
  notes?: string;
  verifiedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerShiftSchema = new Schema<IVolunteerShift>(
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
    roleTitle: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Shift date is required'],
      trim: true,
    },
    hours: {
      type: Number,
      required: [true, 'Hours are required'],
      min: [0.5, 'Minimum shift duration is 0.5 hours'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    supervisor: {
      type: String,
      default: 'Trust Field Supervisor',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Completed & Verified', 'Scheduled', 'Pending Approval'],
      default: 'Completed & Verified',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const VolunteerShift: Model<IVolunteerShift> =
  mongoose.models.VolunteerShift ||
  mongoose.model<IVolunteerShift>('VolunteerShift', volunteerShiftSchema);
