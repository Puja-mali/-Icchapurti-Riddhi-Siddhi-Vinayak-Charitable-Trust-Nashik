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

export const REAL_CAUSES = [
  {
    title: 'Notebooks & School Stationery Distribution Drive',
    slug: 'notebooks-stationery-distribution',
    shortDescription:
      'Providing notebooks, pens, and essential learning stationery for underprivileged school children in Nashik and surrounding rural areas.',
    description:
      'Direct distribution of quality notebook bundles and stationery sets to students in government and community schools. Ensures students have essential writing materials for uninterrupted education.',
    targetAmount: 150000,
    raisedAmount: 95000,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik & Rural Maharashtra',
    urgent: false,
    donorCount: 42,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Notebooks & Textbooks', percentage: 65 },
      { category: 'Pens, Geometry & Writing Kits', percentage: 25 },
      { category: 'Field Distribution Logistics', percentage: 10 },
    ],
    impactMilestones: [],
  },
  {
    title: 'School Uniforms & Dress Distribution for Students',
    slug: 'school-dress-distribution',
    shortDescription: 'Supplying school uniforms and stitched dress sets to underprivileged and orphan children.',
    description:
      'Providing durable and comfortable school uniforms to needy students, supporting their dignity, attendance, and enthusiasm for daily schooling.',
    targetAmount: 200000,
    raisedAmount: 140000,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik District',
    urgent: false,
    donorCount: 38,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Uniform Fabric & Stitching', percentage: 70 },
      { category: 'Footwear & School Bags', percentage: 20 },
      { category: 'School Verification & Distribution', percentage: 10 },
    ],
    impactMilestones: [],
  },
  {
    title: 'School Infrastructure: Clean Water Purifier & Assembly Podium',
    slug: 'school-water-purifier-podium-support',
    shortDescription: 'Installing commercial RO water purifiers and stage assembly podiums in public schools.',
    description:
      'Safe drinking water is essential for child health. This program provides reliable RO water purification filtration systems and stage podiums for school assembly grounds.',
    targetAmount: 180000,
    raisedAmount: 110000,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Schools',
    urgent: false,
    donorCount: 29,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'RO Commercial Purifiers', percentage: 55 },
      { category: 'Assembly Podium Construction', percentage: 35 },
      { category: 'Annual Maintenance Reserve', percentage: 10 },
    ],
    impactMilestones: [],
  },
  {
    title: 'Educational Support & Academic Care for 5 Children',
    slug: 'educational-support-5-children',
    shortDescription:
      'Dedicated educational adoption covering school fees, books, and academic essentials for 5 orphan and needy children.',
    description:
      'Providing comprehensive annual academic support for 5 orphan and destitute children. Covers school admission, textbooks, tuition assistance, and learning materials.',
    targetAmount: 120000,
    raisedAmount: 105000,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik',
    urgent: true,
    donorCount: 51,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Annual Tuition & School Fees', percentage: 60 },
      { category: 'Academic Books & Supplies', percentage: 25 },
      { category: 'Nutrition & Health Checkups', percentage: 15 },
    ],
    impactMilestones: [],
  },
  {
    title: 'Free Clothing & Winter Sweater Distribution',
    slug: 'clothing-sweater-distribution',
    shortDescription:
      'Distributing warm winter sweaters, blankets, and seasonal clothing to poor and destitute families.',
    description:
      'Seasonal distribution of warm sweaters and clean clothes for disadvantaged children, daily-wage laborers, and roadside destitute persons across Nashik.',
    targetAmount: 90000,
    raisedAmount: 72000,
    category: 'Emergency Relief',
    imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik & Surrounding Hamlets',
    urgent: false,
    donorCount: 22,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Sweaters & Thermal Sets', percentage: 70 },
      { category: 'Blankets for Destitute Persons', percentage: 20 },
      { category: 'Direct Distribution Vehicle', percentage: 10 },
    ],
  },
  {
    title: 'Diwali Faral & Wholesome Food Distribution',
    slug: 'diwali-faral-food-distribution',
    shortDescription:
      'Sharing festive Diwali Faral sweets, snacks, and dry food grains with economically disadvantaged families.',
    description:
      'Ensuring that every family in our community celebrates festive moments with dignity and joy through fresh, hygienic Diwali Faral packets and staple groceries.',
    targetAmount: 110000,
    raisedAmount: 88000,
    category: 'Food & Nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik',
    urgent: false,
    donorCount: 35,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Faral & Grocery Provisions', percentage: 75 },
      { category: 'Packaging & Delivery', percentage: 25 },
    ],
  },
  {
    title: 'Senior Citizens Welfare: Umbrellas & Walking Sticks',
    slug: 'senior-citizens-umbrellas-walking-sticks',
    shortDescription:
      'Providing durable walking sticks, monsoon umbrellas, and support aids to elderly citizens through Jyeshtha Nagrik Sangh.',
    description:
      'Elderly care initiative providing sturdy mobility walking sticks and monsoon umbrellas to senior citizens, alongside regular healthcare checkups and social engagement.',
    targetAmount: 85000,
    raisedAmount: 62000,
    category: 'Emergency Relief',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Senior Centers',
    urgent: false,
    donorCount: 19,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Ergonomic Walking Sticks', percentage: 50 },
      { category: 'Monsoon Umbrellas', percentage: 40 },
      { category: 'Welfare Gathering Logistics', percentage: 10 },
    ],
  },
  {
    title: 'Free Community Medical Diagnostic & Health Camps',
    slug: 'free-medical-health-camps',
    shortDescription: 'Periodic free health screening, vital checks, doctor consultations, and naturopathy advice.',
    description:
      'Organizing accessible health checkup camps in underserved neighborhoods. Doctors perform general physical examinations, blood pressure checks, and provide health counseling.',
    targetAmount: 250000,
    raisedAmount: 180000,
    category: 'Medical Support',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Community Centers',
    urgent: true,
    donorCount: 64,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Diagnostic Kits & Equipment', percentage: 45 },
      { category: 'Essential Medicines Distribution', percentage: 40 },
      { category: 'Camp Sanitation & Refreshments', percentage: 15 },
    ],
  },
  {
    title: 'Native Tree Plantation & Green Nashik Drive',
    slug: 'tree-plantation-green-nashik',
    shortDescription: 'Planting indigenous trees and saplings to restore green cover and promote environmental care.',
    description:
      'Community-led tree plantation campaigns planting native banyan, peepal, neem, and fruit saplings across schools and public grounds with regular watering care.',
    targetAmount: 130000,
    raisedAmount: 90000,
    category: 'Environment',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Grounds & Schools',
    urgent: false,
    donorCount: 27,
    isKumbhRelated: false,
    allocationBreakdown: [
      { category: 'Native Saplings & Tree Guards', percentage: 60 },
      { category: 'Watering & Post-Plant Care', percentage: 30 },
      { category: 'Community Tools & Gloves', percentage: 10 },
    ],
  },
];

export const REAL_VOLUNTEER_ROLES = [
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
];

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

    // 3. Causes
    const causeCount = await Cause.countDocuments();
    if (causeCount === 0) {
      for (const c of REAL_CAUSES) {
        await Cause.create(c as any);
      }
      logger.info(`[Seed] ${REAL_CAUSES.length} Verified Causes seeded.`);
    }

    // 4. Volunteer Roles
    const roleCount = await VolunteerRole.countDocuments();
    if (roleCount === 0) {
      for (const r of REAL_VOLUNTEER_ROLES) {
        await VolunteerRole.create(r as any);
      }
      logger.info(`[Seed] ${REAL_VOLUNTEER_ROLES.length} Volunteer Roles seeded.`);
    }

    // 5. Kumbh Defaults
    await KumbhSeedService.seedKumbhDefaults();

    // 6. Admin Account
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
      logger.info('[Seed] Default Admin account provisioned: admin@trust.org');
    }

    // 7. Demo Donor Account
    const donorCount = await User.countDocuments({ email: 'donor@example.com' });
    if (donorCount === 0) {
      const hashedPassword = await bcrypt.hash('Donor@123456', 10);
      await User.create({
        name: 'Aarav Sharma',
        email: 'donor@example.com',
        passwordHash: hashedPassword,
        role: 'DONOR',
        isActive: true,
        isEmailVerified: true,
        phone: '+91 9820012345',
      });
      logger.info('[Seed] Default Donor account provisioned: donor@example.com');
    }
  } catch (err) {
    logger.warn('[Seed] Error during auto-seeding:', (err as Error)?.message || err);
  }
}
