import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'DONATION_SUCCESS'
  | 'DONATION_FAILED'
  | 'DONATION_PENDING'
  | 'VOLUNTEER_SUBMITTED'
  | 'VOLUNTEER_APPROVED'
  | 'VOLUNTEER_REJECTED'
  | 'HELP_REQUEST_SUBMITTED'
  | 'HELP_REQUEST_STATUS_UPDATED'
  | 'EVENT_REGISTRATION'
  | 'EVENT_UPDATE'
  | 'WELCOME'
  | 'SYSTEM'
  | 'ADMIN';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedEntity?: {
    entityType: 'Donation' | 'Volunteer' | 'HelpRequest' | 'Event' | 'User';
    entityId: Types.ObjectId | string;
  };
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'DONATION_SUCCESS',
        'DONATION_FAILED',
        'DONATION_PENDING',
        'VOLUNTEER_SUBMITTED',
        'VOLUNTEER_APPROVED',
        'VOLUNTEER_REJECTED',
        'HELP_REQUEST_SUBMITTED',
        'HELP_REQUEST_STATUS_UPDATED',
        'EVENT_REGISTRATION',
        'EVENT_UPDATE',
        'WELCOME',
        'SYSTEM',
        'ADMIN',
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Donation', 'Volunteer', 'HelpRequest', 'Event', 'User'],
      },
      entityId: {
        type: Schema.Types.Mixed,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for inbox retrieval and unread counters
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
