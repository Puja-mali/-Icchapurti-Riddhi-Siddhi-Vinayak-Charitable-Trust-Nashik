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
  subtitle: 'Reg. No. E-9389 / Nashik • Dedicated to Grassroots Social Welfare',
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
  registrationNumber: 'E-9389 / Nashik',
  panNumber: 'AAATI2734K',
  registrationDate: '2019-10-18T00:00:00.000Z',
  registeredAddress: '7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004',
  primaryContact: {
    name: 'Secretariat Office',
    phone: '0253 6029200 / 0253 6018200',
    email: 'contact@siddhivinayaktrust.org',
    address: '7, Pokar Avenue, Nandanvan Garden Apartment, Nashik, Maharashtra, India, PIN 422004',
  },
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  },
  establishedYear: '2019',
  isVerified: true,
};

export const REAL_TRUSTEES = [
  {
    name: 'Adv. Shri Suresh Vasantrao Maru',
    designation: 'President / अध्यक्ष',
    role: 'President',
    bio: 'Founder President, providing legal and statutory leadership, community advocacy, and overall governance for trust initiatives.',
    qualification: 'Advocate',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Sau. Chhayatai Suresh Maru',
    designation: 'Vice President / उपाध्यक्षा',
    role: 'Vice President',
    bio: 'Vice President, leading women self-employment initiatives, orphan student mentoring, and family relief drives.',
    qualification: '',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Sau. Vimal Balu Gaidhani',
    designation: 'Secretary / सचिव',
    role: 'Secretary',
    bio: 'Secretary, managing official secretarial records, public communications, statutory correspondence, and seva scheduling.',
    qualification: '',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Shri Vaibhav Darugade',
    designation: 'Treasurer / खजिनदार',
    role: 'Treasurer',
    bio: 'Treasurer, overseeing financial accounts, transparent accounting, itemized disbursement records, and annual compliance.',
    qualification: '',
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'Shri Shailesh Maru',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, actively coordinating community health camps, blood donation initiatives, and social welfare distribution.',
    qualification: '',
    displayOrder: 5,
    isActive: true,
  },
  {
    name: 'Shri Ashok Vishnu Wagh',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, contributing to community assistance programs, educational supply drives, and public outreach.',
    qualification: '',
    displayOrder: 6,
    isActive: true,
  },
  {
    name: 'Shri Eknath Ramchandra Kedare',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, guiding environmental initiatives, tree plantation drives, and local civic assistance.',
    qualification: '',
    displayOrder: 7,
    isActive: true,
  },
  {
    name: 'Shri Vaibhav Madhukar Ujale',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, assisting in youth sports activities, library operations, and student study center coordination.',
    qualification: '',
    displayOrder: 8,
    isActive: true,
  },
  {
    name: 'Shri Vilas Eknath Kadale',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, supporting senior citizen welfare (Jyeshtha Nagrik Sangh) and community care programs.',
    qualification: '',
    displayOrder: 9,
    isActive: true,
  },
  {
    name: 'Shri Ravindra Wagh',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, supporting medical camps, health awareness drives, and emergency assistance.',
    qualification: '',
    displayOrder: 10,
    isActive: true,
  },
  {
    name: 'Shri Mohinesh Mahendra Nikale',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, coordinating social awareness programs, cultural events, and government schemes guidance.',
    qualification: '',
    displayOrder: 11,
    isActive: true,
  },
  {
    name: 'Shri Rajendra Ganpat Khode',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, contributing to food distribution, clothing drives, and seasonal relief for families in need.',
    qualification: '',
    displayOrder: 12,
    isActive: true,
  },
  {
    name: 'Shri Bhushan Sunil Wadane',
    designation: 'Trustee / विश्वस्त',
    role: 'Trustee',
    bio: 'Trustee, active in volunteer mobilization, ladies self-employment programs, and grassroots field seva.',
    qualification: '',
    displayOrder: 13,
    isActive: true,
  },
];

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
        phone: '+91 253 6029200',
      });
      logger.info('[Seed] Initial Trust Admin account provisioned: admin@trust.org');
    }

    logger.info('[Seed] Startup verification complete. Genuine trust records intact; campaign/event collections await authentic admin publication.');
  } catch (err) {
    logger.warn('[Seed] Error during auto-seeding:', (err as Error)?.message || err);
  }
}
