import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IEventRegistration extends Document {
  event: Types.ObjectId;
  user: Types.ObjectId;
  userName: string;
  userEmail: string;
  userPhone?: string;
  attendeeCount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: [true, 'Attendee name is required'],
      trim: true,
      maxlength: 100,
    },
    userEmail: {
      type: String,
      required: [true, 'Attendee email is required'],
      trim: true,
      lowercase: true,
    },
    userPhone: {
      type: String,
      trim: true,
    },
    attendeeCount: {
      type: Number,
      required: true,
      min: [1, 'Must register at least 1 attendee'],
      max: [4, 'Cannot register more than 4 attendees per pass'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
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
  }
);

// Compound index to prevent duplicate registrations for the same event by the same user
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
