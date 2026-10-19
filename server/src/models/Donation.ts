import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { PaymentStatus } from '../types';

export interface IDonation extends Document {
  donorId?: Types.ObjectId | null;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  causeId?: Types.ObjectId | null;
  purpose: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  paymentStatus: PaymentStatus;
  receiptNumber?: string;
  receiptUrl?: string | null;
  paidAt?: Date | null;
  paymentVerifiedAt?: Date | null;
  paymentMethod?: string | null;
  failureReason?: string | null;
  isTestMode?: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Backward compatibility getters
  donor?: Types.ObjectId | null;
  campaign?: Types.ObjectId | null;
}

const donationSchema = new Schema<IDonation>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
      maxlength: [100, 'Donor name cannot exceed 100 characters'],
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      trim: true,
      maxlength: [150, 'Donor email cannot exceed 150 characters'],
    },
    donorPhone: {
      type: String,
      default: '',
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least ₹1'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    causeId: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      default: null,
      index: true,
    },
    purpose: {
      type: String,
      default: 'General Trust Corpus',
      trim: true,
      maxlength: [250, 'Purpose description cannot exceed 250 characters'],
    },
    razorpayOrderId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PAID', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PAID', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    receiptUrl: {
      type: String,
      default: null,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null,
      trim: true,
    },
    failureReason: {
      type: String,
      default: null,
      trim: true,
    },
    isTestMode: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save synchronization hook between status <-> paymentStatus and paidAt <-> paymentVerifiedAt
donationSchema.pre('save', function (this: any) {
  if (this.paymentStatus && !this.status) {
    this.status = this.paymentStatus;
  } else if (this.status && !this.paymentStatus) {
    this.paymentStatus = this.status;
  }
  if (
    (this.status === 'PAID' || this.status === 'SUCCESS') &&
    (!this.paymentStatus || this.paymentStatus === 'CREATED' || this.paymentStatus === 'PENDING')
  ) {
    this.paymentStatus = 'PAID';
  }
  if (this.paidAt && !this.paymentVerifiedAt) {
    this.paymentVerifiedAt = this.paidAt;
  } else if (this.paymentVerifiedAt && !this.paidAt) {
    this.paidAt = this.paymentVerifiedAt;
  }
});

// Explicit required indexes
donationSchema.index({ donorId: 1 });
donationSchema.index({ causeId: 1 });
donationSchema.index({ razorpayOrderId: 1 });
donationSchema.index({ razorpayPaymentId: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

// Backward-compatible virtual aliases for existing populate / relation structures
donationSchema.virtual('donor').get(function (this: IDonation) {
  return this.donorId;
});

donationSchema.virtual('campaign').get(function (this: IDonation) {
  return this.causeId;
});

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>('Donation', donationSchema);
