import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  authorName: string;
  roleOrLocation: string;
  quote: string;
  quoteMr?: string;
  quoteHi?: string;
  category: 'beneficiary' | 'volunteer' | 'community' | 'donor';
  isPublished: boolean;
  verified: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    authorName: {
      type: String,
      required: [true, 'Author attribution name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    roleOrLocation: {
      type: String,
      required: [true, 'Role, location or designation is required'],
      trim: true,
      maxlength: [150, 'Role/Location cannot exceed 150 characters'],
    },
    quote: {
      type: String,
      required: [true, 'Testimonial quote text is required'],
      trim: true,
      maxlength: [2000, 'Quote cannot exceed 2000 characters'],
    },
    quoteMr: {
      type: String,
      trim: true,
      maxlength: [2500, 'Marathi quote cannot exceed 2500 characters'],
      default: '',
    },
    quoteHi: {
      type: String,
      trim: true,
      maxlength: [2500, 'Hindi quote cannot exceed 2500 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['beneficiary', 'volunteer', 'community', 'donor'],
      default: 'community',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false, // Default unpublished until reviewed by admin
      index: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
