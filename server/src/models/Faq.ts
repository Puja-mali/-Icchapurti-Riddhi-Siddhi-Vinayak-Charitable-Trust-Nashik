import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  questionMr?: string;
  questionHi?: string;
  answer: string;
  answerMr?: string;
  answerHi?: string;
  category: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFaq>(
  {
    question: {
      type: String,
      required: [true, 'Question in English/default is required'],
      trim: true,
      maxlength: [400, 'Question cannot exceed 400 characters'],
    },
    questionMr: {
      type: String,
      trim: true,
      maxlength: [500, 'Marathi question cannot exceed 500 characters'],
      default: '',
    },
    questionHi: {
      type: String,
      trim: true,
      maxlength: [500, 'Hindi question cannot exceed 500 characters'],
      default: '',
    },
    answer: {
      type: String,
      required: [true, 'Answer in English/default is required'],
      trim: true,
      maxlength: [3000, 'Answer cannot exceed 3000 characters'],
    },
    answerMr: {
      type: String,
      trim: true,
      maxlength: [3500, 'Marathi answer cannot exceed 3500 characters'],
      default: '',
    },
    answerHi: {
      type: String,
      trim: true,
      maxlength: [3500, 'Hindi answer cannot exceed 3500 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
      enum: ['General', 'Donations', 'Impact Passport', 'Volunteering', 'Verification', 'Kumbh Seva'],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Faq: Model<IFaq> =
  mongoose.models.Faq || mongoose.model<IFaq>('Faq', faqSchema);
