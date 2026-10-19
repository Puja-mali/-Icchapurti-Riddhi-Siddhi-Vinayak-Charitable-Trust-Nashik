import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { TrustProfile } from '../models/TrustProfile';
import { Trustee } from '../models/Trustee';
import { Cause } from '../models/Cause';
import { VolunteerRole } from '../models/VolunteerRole';
import { User } from '../models/User';
import { KumbhSeedService } from './kumbhSeed.service';
import { logger } from '../utils/logger';

export const REAL_TRUST_PROFILE = {
  trustName: 'Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik',
  shortName: 'Icchapurti Vinayak Trust',
  subtitle: 'Reg. No. E/1341 • Dedicated to Grassroots Social Welfare',
  description:
    'Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik is a registered charitable trust dedicated to social welfare, educational support for underprivileged and orphan children, community healthcare, environmental conservation, senior citizen care, and women self-employment training.',
  vision:
    'To foster an empowered, compassionate, and self-reliant society through transparent social welfare, accessible education, community health, and dedicated grassroots assistance for those in need.',
  mission:
    'To serve our community through verifiable social action — providing educational aid, healthcare camps, nutritious food distribution, skill development for women, senior citizen assistance, and environmental conservation with complete integrity and public accountability.',
  objectives: [
    {
      title: 'Educational Support for Underprivileged & Orphan Children',
      category: 'Education & Youth',
      description:
        'Providing notebooks, stationery, school dress kits, school infrastructure, and educational adoption support for orphan and needy students.',
    },
    {
      title: 'Community Healthcare & Medical Camps',
      category: 'Health & Wellness',
      description:
        'Organizing periodic free medical camps, health checkup camps, vaccination awareness, naturopathy guidance, and healthcare support for the poor.',
    },
    {
      title: 'Food & Clothing Relief for Needy Families',
      category: 'Community & Social Welfare',
      description:
        'Distributing wholesome food, festive Diwali Faral packets, seasonal sweaters, and free clothing to destitute and economically disadvantaged individuals.',
    },
    {
      title: 'Senior Citizen Care (Jyeshtha Nagrik Sangh)',
      category: 'Community & Social Welfare',
      description:
        'Mobility assistance including walking sticks and umbrellas, social engagement, and support for elderly citizens through the senior citizens forum.',
    },
    {
      title: 'Environmental Protection & Tree Plantation',
      category: 'Environment',
      description:
        'Community tree plantation drives across Nashik, fostering green cover, native sapling conservation, and ecological awareness.',
    },
    {
      title: 'Ladies Self-Employment & Vocational Skills',
      category: 'Vocational Empowerment',
      description:
        'Supporting women through vocational skill training, self-help group mentoring, and livelihood assistance.',
    },
  ],
  governance: {
    boardSize: 13,
    meetingFrequency: 'Monthly Secretariat & Board Review',
    financialAuditStatus: 'Compliant & Audited under Maharashtra Public Trusts Act',
    ethicsPolicy:
      'Zero-tolerance for misrepresentation. Strict adherence to trust bylaws, transparent bookkeeping, and public accountability for every rupee received.',
  },
  registrationNumber: 'E/1341',
  panNumber: '',
  address: 'Nashik, Maharashtra, India (Registered office address updating soon)',
  registeredAddress: 'Nashik, Maharashtra, India (Registered office address updating soon)',
  primaryContact: {
    name: 'Secretariat Office',
    phone: '9922271777 / 7588833127',
    email: 'ichhapurtiriddhisiddhivinayak@gmail.com',
    address: 'Nashik, Maharashtra, India (Registered office address updating soon)',
  },
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  },
  establishedYear: '',
  isVerified: true,
};

/**
 * Real trustees list is initialized empty pending verified names and designations from Trust leadership.
 * Verified trustees can be added through the admin dashboard.
 */
export const REAL_TRUSTEES: any[] = [];

/**
 * Data Integrity:
 * Clean empty lists ensure the application renders honest empty states when no genuine campaigns
 * or roles have been entered yet by Trust administrators. Real initiatives will be added via Admin Portal.
 */
export const REAL_CAUSES: any[] = [];
export const REAL_VOLUNTEER_ROLES: any[] = [];

export async function autoSeedTrustData(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;

  try {
    // 1. Trust Profile
    const profileCount = await TrustProfile.countDocuments();
    if (profileCount === 0) {
      await TrustProfile.create(REAL_TRUST_PROFILE);
      logger.info('[Seed] Verified Trust Profile seeded successfully.');
    }

    // 2. Trustees
    const trusteeCount = await Trustee.countDocuments();
    if (trusteeCount === 0) {
      for (const t of REAL_TRUSTEES) {
        await Trustee.create(t);
      }
      logger.info(`[Seed] ${REAL_TRUSTEES.length} Verified Trustees seeded.`);
    }

    // 3. Admin Account Provisioning (if no administrator exists yet)
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      await User.create({
        name: 'Trust Administrator',
        email: 'admin@trust.org',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
        phone: '',
      });
      logger.info('[Seed] Initial Trust Admin account provisioned: admin@trust.org');
    }

    logger.info('[Seed] Startup verification complete. Genuine trust records intact; campaign/event collections await authentic admin publication.');
  } catch (err) {
    logger.warn('[Seed] Error during auto-seeding:', (err as Error)?.message || err);
  }
}
