import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ITrustee extends Document {
  name: string;
  designation: string;
  role?: string;
  bio: string;
  qualification?: string;
  photo?: string;
  displayOrder: number;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trusteeSchema = new Schema<ITrustee>(
  {
    name: {
      type: String,
      required: [true, 'Trustee name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      maxlength: [200, 'Designation cannot exceed 200 characters'],
    },
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
      default: 'Trustee',
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      maxlength: [3000, 'Bio cannot exceed 3000 characters'],
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: [200, 'Qualification cannot exceed 200 characters'],
      default: '',
    },
    photo: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public sorted listing
trusteeSchema.index({ isActive: 1, displayOrder: 1, createdAt: 1 });

// Text index for search
trusteeSchema.index({
  name: 'text',
  designation: 'text',
  role: 'text',
  bio: 'text',
  qualification: 'text',
});

export const Trustee: Model<ITrustee> =
  mongoose.models.Trustee || mongoose.model<ITrustee>('Trustee', trusteeSchema);
