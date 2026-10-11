import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export class KumbhSeedService {
  /**
   * Preserves clean database integrity.
   * In compliance with data integrity policies, no synthetic campaigns, events,
   * volunteer roles, or blog posts are automatically seeded into production or preview.
   * Genuine Simhastha Kumbh initiatives will be created and managed via the Admin Dashboard.
   */
  public static async seedKumbhDefaults(): Promise<void> {
    logger.info('[KumbhSeed] Clean database policy active; synthetic Kumbh records omitted.');
  }
}
