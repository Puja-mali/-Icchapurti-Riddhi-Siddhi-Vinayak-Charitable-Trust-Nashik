import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { EventStatus } from '../types';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  registrationRequired: boolean;
  registrationLimit: number; // 0 = unlimited
  registrationCount: number;
  status: EventStatus;
  imageUrl: string;
  galleryUrls: string[];
  isKumbhRelated: boolean;
  category?: string;
  registeredVolunteers?: Types.ObjectId[];
  capacity?: number;
  translations?: {
    mr?: { title?: string; shortDescription?: string; description?: string };
    hi?: { title?: string; shortDescription?: string; description?: string };
    en?: { title?: string; shortDescription?: string; description?: string };
  };
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Event slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event full description is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short summary description is required'],
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date and time is required'],
      index: true,
    },
    endDate: {
      type: Date,
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationLimit: {
      type: Number,
      default: 0,
      min: [0, 'Registration limit cannot be negative'],
    },
    registrationCount: {
      type: Number,
      default: 0,
      min: [0, 'Registration count cannot be negative'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    galleryUrls: {
      type: [String],
      default: [],
    },
    isKumbhRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    category: {
      type: String,
      default: 'Community Outreach',
      trim: true,
    },
    registeredVolunteers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    translations: {
      mr: {
        title: { type: String, trim: true },
        shortDescription: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      hi: {
        title: { type: String, trim: true },
        shortDescription: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      en: {
        title: { type: String, trim: true },
        shortDescription: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.capacity = ret.registrationLimit;
        ret.registeredCount = ret.registrationCount;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.capacity = ret.registrationLimit;
        ret.registeredCount = ret.registrationCount;
        return ret;
      },
    },
  }
);

// Virtuals for backwards compatibility with UI components
eventSchema.virtual('capacity').get(function (this: IEvent) {
  return this.registrationLimit;
});

eventSchema.virtual('registeredCount').get(function (this: IEvent) {
  return this.registrationCount;
});

export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
