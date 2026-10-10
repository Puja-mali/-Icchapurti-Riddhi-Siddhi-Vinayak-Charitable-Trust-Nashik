import mongoose, { Document, Model, Schema } from 'mongoose';

export type InvitationRole = 'ADMIN' | 'STAFF';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface IInvitation extends Document {
  email: string;
  name?: string;
  role: InvitationRole;
  tokenHash: string;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  status: InvitationStatus;
  acceptedAt?: Date;
  acceptedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'STAFF'],
      required: [true, 'Role is required (ADMIN or STAFF)'],
      default: 'STAFF',
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
      unique: true,
      index: true,
      select: false, // Security: Never expose tokenHash by default in general queries
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    acceptedAt: {
      type: Date,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.tokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for pending invitations lookup by email
invitationSchema.index({ email: 1, status: 1 });

export const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', invitationSchema);
