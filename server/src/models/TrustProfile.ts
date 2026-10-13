import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { TrustObjective, TrustSocialLinks, TrustRegistrationDetails } from '../types';

export interface ITrustProfile extends Document {
  trustName: string;
  shortName?: string;
  subtitle?: string;
  description: string;
  vision: string;
  mission: string;
  objectives: TrustObjective[];
  address: string;
  phone: string;
  email: string;
  officeHours?: string;
  website?: string;
  socialLinks: TrustSocialLinks;
  registrationDetails: TrustRegistrationDetails;
  logo?: string;
  academicNote?: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trustObjectiveSchema = new Schema<TrustObjective>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, trim: true, maxlength: 100 },
  },
  { _id: false }
);

const trustSocialLinksSchema = new Schema<TrustSocialLinks>(
  {
    facebook: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    youtube: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const trustRegistrationDetailsSchema = new Schema<TrustRegistrationDetails>(
  {
    registrationNumber: { type: String, trim: true, default: '' },
    establishedYear: { type: String, trim: true, default: '' },
    taxExemption80G: { type: String, trim: true, default: '' },
    fcraNumber: { type: String, trim: true, default: '' },
    entityType: { type: String, trim: true, default: 'Charitable Trust' },
  },
  { _id: false }
);

const trustProfileSchema = new Schema<ITrustProfile>(
  {
    trustName: {
      type: String,
      required: [true, 'Trust name is required'],
      trim: true,
      maxlength: [200, 'Trust name cannot exceed 200 characters'],
      default: 'Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik',
    },
    shortName: {
      type: String,
      trim: true,
      maxlength: [100, 'Short name cannot exceed 100 characters'],
      default: 'Icchapurti Vinayak Trust',
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: 'Reg. No. E-9389 / Nashik • Dedicated to Grassroots Social Welfare',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: 'Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik is a registered charitable trust dedicated to social welfare, educational support for underprivileged and orphan children, community healthcare, environmental conservation, senior citizen care, and women self-employment training.',
    },
    vision: {
      type: String,
      required: [true, 'Vision is required'],
      trim: true,
      maxlength: [3000, 'Vision cannot exceed 3000 characters'],
      default: 'To foster an empowered, compassionate, and self-reliant society through transparent social welfare, accessible education, community health, and dedicated grassroots assistance for those in need.',
    },
    mission: {
      type: String,
      required: [true, 'Mission is required'],
      trim: true,
      maxlength: [3000, 'Mission cannot exceed 3000 characters'],
      default: 'To serve our community through verifiable social action — providing educational aid, healthcare camps, nutritious food distribution, skill development for women, senior citizen assistance, and environmental conservation with complete integrity and public accountability.',
    },
    objectives: {
      type: [trustObjectiveSchema],
      default: [
        {
          title: 'Educational Support for Underprivileged & Orphan Children',
          description: 'Providing notebooks, stationery, school dress kits, school infrastructure, and educational adoption support for orphan and needy students.',
          category: 'Education & Youth',
        },
        {
          title: 'Community Healthcare & Medical Camps',
          description: 'Organizing periodic free medical camps, health checkup camps, vaccination awareness, naturopathy guidance, and healthcare support for the poor.',
          category: 'Health & Wellness',
        },
        {
          title: 'Food & Clothing Relief for Needy Families',
          description: 'Distributing wholesome food, festive Diwali Faral packets, seasonal sweaters, and free clothing to destitute and economically disadvantaged individuals.',
          category: 'Community & Social Welfare',
        },
        {
          title: 'Senior Citizen Care (Jyeshtha Nagrik Sangh)',
          description: 'Supporting elderly citizens with mobility walking sticks, umbrellas, welfare programs, and active engagement through Jyeshtha Nagrik Sangh.',
          category: 'Community & Social Welfare',
        },
        {
          title: 'Environmental Conservation & Tree Plantation',
          description: 'Leading native tree plantation drives, environmental cleanliness, and ecological conservation initiatives across Nashik.',
          category: 'Environment',
        },
        {
          title: 'Ladies Self-Employment & Vocational Training',
          description: 'Conducting skill development and self-employment training centers to foster economic self-reliance for women.',
          category: 'Community Participation',
        },
      ],
    },
    address: {
      type: String,
      required: [true, 'Trust address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
      default: '7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [100, 'Phone cannot exceed 100 characters'],
      default: '0253 6029200 / 0253 6018200',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      maxlength: [150, 'Email cannot exceed 150 characters'],
      default: 'contact@siddhivinayaktrust.org',
    },
    officeHours: {
      type: String,
      trim: true,
      maxlength: [200, 'Office hours cannot exceed 200 characters'],
      default: 'Mon - Sat: 9:30 AM - 5:30 PM IST',
    },
    website: {
      type: String,
      trim: true,
      maxlength: [300, 'Website URL cannot exceed 300 characters'],
      default: '',
    },
    socialLinks: {
      type: trustSocialLinksSchema,
      default: () => ({
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        github: '',
      }),
    },
    registrationDetails: {
      type: trustRegistrationDetailsSchema,
      default: () => ({
        registrationNumber: 'E-9389 / Nashik',
        establishedYear: '',
        taxExemption80G: '',
        fcraNumber: '',
        entityType: 'Public Charitable Trust',
      }),
    },
    logo: {
      type: String,
      trim: true,
      default: '',
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

export const TrustProfile: Model<ITrustProfile> =
  mongoose.models.TrustProfile || mongoose.model<ITrustProfile>('TrustProfile', trustProfileSchema);
