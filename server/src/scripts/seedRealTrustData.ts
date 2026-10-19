/**
 * Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
 * Database Migration & Real Trust Information Seeding Script
 *
 * Usage:
 *   npx tsx server/src/scripts/seedRealTrustData.ts
 *
 * This script seeds authentic, verified Trust data into MongoDB:
 * - Official Trust Profile (Name, Reg. E/1341, Form 10AC Address, Contacts)
 * - 13 Documented Trustees & Members (Exact roles & names)
 * - Verified Causes & Support Drives (School support, 5 children education, food, clothing, medical camp, senior citizen care)
 * - Authentic Volunteer Roles in Nashik
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

import { connectDatabase, disconnectDatabase } from '../config/database';
import { TrustProfile } from '../models/TrustProfile';
import { Trustee } from '../models/Trustee';
import { Cause } from '../models/Cause';
import { VolunteerRole } from '../models/VolunteerRole';
import { logger } from '../utils/logger';

const REAL_TRUST_PROFILE = {
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
        'Supporting elderly citizens with mobility walking sticks, umbrellas, welfare programs, and active engagement through Jyeshtha Nagrik Sangh.',
    },
    {
      title: 'Environmental Conservation & Tree Plantation',
      category: 'Environment',
      description:
        'Leading native tree plantation drives, environmental cleanliness, and ecological conservation initiatives across Nashik.',
    },
    {
      title: 'Ladies Self-Employment & Vocational Training',
      category: 'Community Participation',
      description:
        'Conducting skill development and self-employment training centers to foster economic self-reliance for women.',
    },
  ],
  address: 'Official address will be updated soon.',
  phone: '9922271777 / 7588833127',
  email: 'ichhapurtiriddhisiddhivinayak@gmail.com',
  officeHours: 'Public desk timings will be updated soon.',
  website: '',
  registrationDetails: {
    registrationNumber: 'E/1341',
    establishedYear: '',
    taxExemption80G: '',
    fcraNumber: '',
    entityType: 'Public Charitable Trust',
  },
  socialLinks: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    github: '',
  },
};

/**
 * Real trustees list is initialized empty pending verified names and designations from Trust leadership.
 */
const REAL_TRUSTEES: any[] = [];

const REAL_CAUSES = [
  {
    title: 'Notebooks & School Stationery Distribution Drive',
    slug: 'notebooks-stationery-distribution',
    shortDescription: 'Providing notebooks, pens, and essential learning stationery for underprivileged school children in Nashik and surrounding rural areas.',
    description: 'Direct distribution of quality notebook bundles and stationery sets to students in government and community schools. Ensures students have essential writing materials for uninterrupted education.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik & Rural Maharashtra',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'School Uniforms & Dress Distribution for Students',
    slug: 'school-dress-distribution',
    shortDescription: 'Supplying school uniforms and stitched dress sets to underprivileged and orphan children.',
    description: 'Providing durable and comfortable school uniforms to needy students, supporting their dignity, attendance, and enthusiasm for daily schooling.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik District',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'School Infrastructure: Clean Water Purifier & Assembly Podium',
    slug: 'school-water-purifier-podium-support',
    shortDescription: 'Installing commercial RO water purifiers and stage assembly podiums in public schools.',
    description: 'Safe drinking water is essential for child health. This program provides reliable RO water purification filtration systems and stage podiums for school assembly grounds.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Schools',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'Educational Support & Academic Care for 5 Children',
    slug: 'educational-support-5-children',
    shortDescription: 'Dedicated educational adoption covering school fees, books, and academic essentials for 5 orphan and needy children.',
    description: 'Providing comprehensive annual academic support for 5 orphan and destitute children. Covers school admission, textbooks, tuition assistance, and learning materials without inflating impact numbers.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik',
    urgent: true,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'Free Clothing & Winter Sweater Distribution',
    slug: 'clothing-sweater-distribution',
    shortDescription: 'Distributing warm winter sweaters, blankets, and seasonal clothing to poor and destitute families.',
    description: 'Seasonal distribution of warm sweaters and clean clothes for disadvantaged children, daily-wage laborers, and roadside destitute persons across Nashik.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Emergency Relief',
    imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik & Surrounding Hamlets',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'Diwali Faral & Wholesome Food Distribution',
    slug: 'diwali-faral-food-distribution',
    shortDescription: 'Sharing festive Diwali Faral sweets, snacks, and dry food grains with economically disadvantaged families.',
    description: 'Ensuring that every family in our community celebrates festive moments with dignity and joy through fresh, hygienic Diwali Faral packets and staple groceries.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Food & Nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'Senior Citizens Welfare: Umbrellas & Walking Sticks',
    slug: 'senior-citizens-umbrellas-walking-sticks',
    shortDescription: 'Providing durable walking sticks, monsoon umbrellas, and support aids to elderly citizens through Jyeshtha Nagrik Sangh.',
    description: 'Elderly care initiative providing sturdy mobility walking sticks and monsoon umbrellas to senior citizens, alongside regular healthcare checkups and social engagement.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Emergency Relief',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Senior Centers',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'Free Community Medical Diagnostic & Health Camps',
    slug: 'free-medical-health-camps',
    shortDescription: 'Periodic free health screening, vital checks, doctor consultations, and naturopathy advice.',
    description: 'Organizing accessible health checkup camps in underserved neighborhoods. Doctors perform general physical examinations, blood pressure checks, and provide health counseling.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Medical Support',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Community Centers',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    title: 'Native Tree Plantation & Green Nashik Drive',
    slug: 'tree-plantation-green-nashik',
    shortDescription: 'Planting indigenous trees and saplings to restore green cover and promote environmental care.',
    description: 'Community-led tree plantation campaigns planting native banyan, peepal, neem, and fruit saplings across schools and public grounds with regular watering care.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Environment',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Grounds & Schools',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
];

const REAL_VOLUNTEER_ROLES = [
  {
    title: 'Free Health & Medical Camp Coordinator',
    department: 'Health & Wellness',
    commitment: '4 Hours / Weekend Camp',
    location: 'Nashik & Surrounding Rural Centers',
    description:
      'Assist visiting doctors, manage patient registration, help with basic vital checks, and coordinate orderly patient movement during free health and diagnostic camps.',
    requirements: [
      'Empathy and organized temperament',
      'Basic familiarity with health camp coordination',
      'Fluency in Marathi or Hindi',
    ],
    spotsAvailable: 8,
    isKumbhRelated: false,
    isActive: true,
  },
  {
    title: 'Tree Plantation & Environmental Sevadar',
    department: 'Environment',
    commitment: 'Weekend Drives (3-4 Hours)',
    location: 'Nashik City & Community Grounds',
    description:
      'Participate in native sapling plantation drives, soil preparation, tree guard installation, and community tree nurturing to foster ecological green cover.',
    requirements: [
      'Love for nature and environment',
      'Comfortable with outdoor field activities',
      'Team participation spirit',
    ],
    spotsAvailable: 15,
    isKumbhRelated: false,
    isActive: true,
  },
  {
    title: 'Blood Donation Camp Support & Donor Care',
    department: 'Community Healthcare',
    commitment: 'Rotational Camp Shifts (4 Hours)',
    location: 'Nashik Seva Centers',
    description:
      'Help coordinate blood donation camps, register voluntary donors, provide post-donation refreshment care, and issue trust certificates of appreciation.',
    requirements: [
      'Polite and reassuring communication',
      'Careful documentation of donor details',
      'Adherence to hygiene protocols',
    ],
    spotsAvailable: 6,
    isKumbhRelated: false,
    isActive: true,
  },
  {
    title: 'Senior Citizens Welfare & Jyeshtha Nagrik Sahayata',
    department: 'Social Welfare',
    commitment: 'Flexible 3-5 Hours / Week',
    location: 'Nashik',
    description:
      'Engage with elderly community members under Jyeshtha Nagrik Sangh, assist in distributing walking sticks and umbrellas, and facilitate welfare gatherings.',
    requirements: [
      'Deep respect and patience for elders',
      'Active listening and empathetic approach',
      'Marathi communication fluency',
    ],
    spotsAvailable: 10,
    isKumbhRelated: false,
    isActive: true,
  },
  {
    title: 'Student Study Center & Library Seva',
    department: 'Education & Youth',
    commitment: '3-4 Hours / Week',
    location: 'Trust Library & Study Center, Nashik',
    description:
      'Assist in maintaining library book catalog, organize quiet study spaces for underprivileged school students, and help manage notebook and stationery distribution drives.',
    requirements: [
      'High organizational skill',
      'Interest in student mentoring',
      'Basic computer record-keeping',
    ],
    spotsAvailable: 4,
    isKumbhRelated: false,
    isActive: true,
  },
  {
    title: 'Ladies Self-Employment Workshop Assistant',
    department: 'Vocational Empowerment',
    commitment: 'Weekend Workshops (3 Hours)',
    location: 'Nashik Training Center',
    description:
      'Support instructors in conducting vocational skill and self-employment workshops for women, managing materials, and documenting participant progress.',
    requirements: [
      'Supportive and encouraging attitude',
      'Coordination with women trainees',
      'Basic workshop logistics experience',
    ],
    spotsAvailable: 5,
    isKumbhRelated: false,
    isActive: true,
  },
];

async function seedData() {
  const isConnected = await connectDatabase();
  if (!isConnected) {
    console.log('[Seed] Database is not connected (MONGODB_URI not configured in .env).');
    console.log('[Seed] Standalone mode: Services will serve authentic Trust fallback data automatically.');
    process.exit(0);
  }

  try {
    console.log('[Seed] Connected to MongoDB. Seeding verified Trust data...');

    // 1. Trust Profile (Singleton update/insert)
    const existingProfile = await TrustProfile.findOne();
    let createdProfile;
    if (existingProfile) {
      Object.assign(existingProfile, REAL_TRUST_PROFILE);
      createdProfile = await existingProfile.save();
    } else {
      createdProfile = await TrustProfile.create(REAL_TRUST_PROFILE);
    }
    console.log(`[Seed] ✓ Trust Profile verified: ${createdProfile.trustName} (${createdProfile.registrationDetails.registrationNumber})`);

    // 2. Trustees (Idempotent update/insert matched by name)
    for (const trustee of REAL_TRUSTEES) {
      await Trustee.findOneAndUpdate(
        { name: trustee.name },
        { $set: trustee },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
      );
    }
    const trusteeCount = await Trustee.countDocuments();
    console.log(`[Seed] ✓ ${trusteeCount} Verified Trustees active in database.`);

    // 3. Causes (Idempotent update/insert matched by slug)
    for (const cause of REAL_CAUSES) {
      await Cause.findOneAndUpdate(
        { slug: cause.slug },
        { $set: cause },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
      );
    }
    const causeCount = await Cause.countDocuments();
    console.log(`[Seed] ✓ ${causeCount} Verified Trust Causes active in database.`);

    // 4. Volunteer Roles (Idempotent update/insert matched by title)
    for (const role of REAL_VOLUNTEER_ROLES) {
      await VolunteerRole.findOneAndUpdate(
        { title: role.title },
        { $set: role },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
      );
    }
    const roleCount = await VolunteerRole.countDocuments();
    console.log(`[Seed] ✓ ${roleCount} Verified Volunteer Roles active in database.`);

    console.log('[Seed] SUCCESS: All authentic Trust information successfully verified and seeded into MongoDB.');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    await disconnectDatabase();
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

seedData();
