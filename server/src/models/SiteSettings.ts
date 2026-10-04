import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  kumbhMode: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      default: 'Siddhivinayak Charitable Trust',
      trim: true,
    },
    defaultLanguage: {
      type: String,
      default: 'mr',
    },
    supportedLanguages: {
      type: [String],
      default: ['mr', 'en', 'hi'],
    },
    kumbhMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    contactEmail: {
      type: String,
      default: 'trust@siddhivinayaktrust.org',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '0253 6029200 / 0253 6018200',
      trim: true,
    },
    officeAddress: {
      type: String,
      default: '7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);
