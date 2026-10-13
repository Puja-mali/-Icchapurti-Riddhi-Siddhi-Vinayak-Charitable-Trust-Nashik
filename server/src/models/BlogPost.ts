import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date;
  isFeatured: boolean;
  isKumbhRelated: boolean;
  translations?: {
    mr?: { title?: string; shortDescription?: string; description?: string };
    hi?: { title?: string; shortDescription?: string; description?: string };
    en?: { title?: string; shortDescription?: string; description?: string };
  };
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  readTime?: string;
  imageUrl?: string;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Blog post slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
      maxlength: [1000, 'Excerpt cannot exceed 1000 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      default: 'Siddhivinayak Trust',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isKumbhRelated: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
        ret.imageUrl = ret.coverImage;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.imageUrl = ret.coverImage;
        return ret;
      },
    },
  }
);

// Virtual for reading time estimation (~200 words per minute)
blogPostSchema.virtual('readTime').get(function (this: IBlogPost) {
  if (!this.content) return '1 min read';
  const words = this.content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
});

// Virtual for imageUrl alias (backward compatibility with UI components)
blogPostSchema.virtual('imageUrl').get(function (this: IBlogPost) {
  return this.coverImage;
});

// Performance and filtering compound indexes
blogPostSchema.index({ isPublished: 1, publishedAt: -1 });
blogPostSchema.index({ isPublished: 1, isFeatured: -1, publishedAt: -1 });
blogPostSchema.index({ isPublished: 1, category: 1, publishedAt: -1 });

export const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
