import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface IPushSubscription extends Document {
  user: Types.ObjectId;
  endpoint: string;
  keys: IPushSubscriptionKeys;
  userAgent?: string;
  isActive: boolean;
  failedAttempts: number;
  lastSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required for push subscription'],
      index: true,
    },
    endpoint: {
      type: String,
      required: [true, 'Subscription endpoint URL is required'],
      unique: true,
      trim: true,
      index: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: [true, 'p256dh key is required'],
        trim: true,
      },
      auth: {
        type: String,
        required: [true, 'auth key is required'],
        trim: true,
      },
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-subscription lookups
pushSubscriptionSchema.index({ user: 1, isActive: 1 });

export const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription ||
  mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);
