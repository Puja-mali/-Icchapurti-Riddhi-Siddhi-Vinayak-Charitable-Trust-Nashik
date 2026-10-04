import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVolunteerRole extends Document {
  title: string;
  department: string;
  commitment: string;
  location: string;
  description: string;
  requirements: string[];
  spotsAvailable: number;
  isKumbhRelated: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerRoleSchema = new Schema<IVolunteerRole>(
  {
    title: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    commitment: {
      type: String,
      required: [true, 'Time commitment is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    spotsAvailable: {
      type: Number,
      default: 5,
      min: [0, 'Spots available cannot be negative'],
    },
    isKumbhRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VolunteerRole: Model<IVolunteerRole> =
  mongoose.models.VolunteerRole ||
  mongoose.model<IVolunteerRole>('VolunteerRole', volunteerRoleSchema);
