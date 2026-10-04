import mongoose from 'mongoose';
import { SiteSettings, ISiteSettings } from '../models/SiteSettings';

export class SettingsService {
  /**
   * Retrieves or initializes the singleton SiteSettings record
   */
  public static async getSettings(): Promise<ISiteSettings> {
    if (mongoose.connection.readyState !== 1) {
      // Return transient document if database is disconnected
      return new SiteSettings({
        kumbhMode: process.env.KUMBH_MODE === 'true',
      });
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'Siddhivinayak Charitable Trust',
        defaultLanguage: 'mr',
        supportedLanguages: ['mr', 'en', 'hi'],
        kumbhMode: process.env.KUMBH_MODE === 'true' || false,
      });
    }
    return settings;
  }

  /**
   * Updates Kumbh Mode toggle (Strictly ADMIN only)
   */
  public static async updateKumbhMode(enabled: boolean): Promise<ISiteSettings> {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings({
        siteName: 'Siddhivinayak Charitable Trust',
        defaultLanguage: 'mr',
        supportedLanguages: ['mr', 'en', 'hi'],
        kumbhMode: enabled,
      });
    } else {
      settings.kumbhMode = enabled;
    }
    await settings.save();
    return settings;
  }

  /**
   * Retrieves public settings (no sensitive admin configs)
   */
  public static async getPublicSettings(): Promise<{
    siteName: string;
    kumbhMode: boolean;
    defaultLanguage: string;
    supportedLanguages: string[];
  }> {
    const settings = await this.getSettings();
    return {
      siteName: settings.siteName || 'Siddhivinayak Charitable Trust',
      kumbhMode: Boolean(settings.kumbhMode),
      defaultLanguage: settings.defaultLanguage || 'mr',
      supportedLanguages: settings.supportedLanguages || ['mr', 'en', 'hi'],
    };
  }
}
