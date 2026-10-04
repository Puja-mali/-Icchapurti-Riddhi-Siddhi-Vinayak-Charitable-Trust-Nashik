import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { VolunteerAvailability } from '../types';

export interface IVolunteer extends Document {
  user: Types.ObjectId;
  volunteerCode?: string;
  primaryFocus?: string;
  isKumbhRegistered?: boolean;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  skills: string[];
  availability: VolunteerAvailability;
  registeredEvents: Types.ObjectId[];
  volunteerHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerSchema = new Schema<IVolunteer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    volunteerCode: {
      type: String,
      trim: true,
    },
    primaryFocus: {
      type: String,
      default: 'Community Seva & Field Operations',
      trim: true,
    },
    isKumbhRegistered: {
      type: Boolean,
      default: false,
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['WEEKDAYS', 'WEEKENDS', 'FLEXIBLE', 'EVENTS_ONLY'],
      default: 'FLEXIBLE',
    },
    registeredEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    volunteerHours: {
      type: Number,
      default: 0,
      min: [0, 'Volunteer hours cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export const Volunteer: Model<IVolunteer> =
  mongoose.models.Volunteer || mongoose.model<IVolunteer>('Volunteer', volunteerSchema);
