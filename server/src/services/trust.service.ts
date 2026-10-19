import mongoose from 'mongoose';
import { TrustProfile, ITrustProfile } from '../models/TrustProfile';
import { Trustee, ITrustee } from '../models/Trustee';
import { AppError } from '../utils/apiResponse';
import {
  UpdateTrustProfileInput,
  CreateTrusteeInput,
  UpdateTrusteeInput,
  TrusteeQueryParams,
} from '../validators/trust.validator';

const DEFAULT_TRUST_PROFILE = {
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
  address: 'Nashik, Maharashtra, India (Registered office address updating soon)',
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

const DEFAULT_TRUSTEES = [
  {
    name: 'Shri Sunil Vishwanath Nirgude',
    designation: 'President / अध्यक्ष',
    role: 'President',
    bio: 'President of the Trust, leading community welfare, institutional coordination, and social initiatives across Nashik.',
    qualification: '',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Shri Shailesh Yashwant Desle',
    designation: 'Vice President / उपाध्यक्ष',
    role: 'Vice President',
    bio: 'Vice President, supporting administrative leadership, field seva coordination, and educational outreach.',
    qualification: '',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Shri Pawan Vasant Khode',
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

export class TrustService {
  /**
   * Helper to verify database connectivity with fail-fast response
   */
  private static checkDatabaseConnection(): void {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }
  }

  // ==========================================
  // TRUST PROFILE (ORGANIZATION LEVEL)
  // ==========================================

  /**
   * Get public trust profile information
   * Excludes internal metadata, createdBy, and updatedBy
   * Initializes baseline profile if collection is empty
   */
  public static async getPublicTrustProfile(): Promise<Partial<ITrustProfile> | null> {
    if (mongoose.connection.readyState !== 1) {
      return DEFAULT_TRUST_PROFILE as unknown as Partial<ITrustProfile>;
    }

    let profile = await TrustProfile.findOne()
      .select('-createdBy -updatedBy -__v')
      .lean();

    if (!profile) {
      try {
        const created = await TrustProfile.create(DEFAULT_TRUST_PROFILE);
        profile = created.toObject();
      } catch {
        return DEFAULT_TRUST_PROFILE as unknown as Partial<ITrustProfile>;
      }
    }

    return profile;
  }

  /**
   * Get administrative trust profile with audit details
   */
  public static async getAdminTrustProfile(): Promise<ITrustProfile | null> {
    this.checkDatabaseConnection();

    let profile = await TrustProfile.findOne()
      .populate('updatedBy', 'name email role')
      .lean();

    if (!profile) {
      const created = await TrustProfile.create(DEFAULT_TRUST_PROFILE);
      profile = created.toObject();
    }

    return profile as ITrustProfile | null;
  }

  /**
   * Update or initialize singleton trust profile
   */
  public static async updateAdminTrustProfile(
    data: UpdateTrustProfileInput,
    adminUserId: string
  ): Promise<ITrustProfile> {
    this.checkDatabaseConnection();

    if (!mongoose.Types.ObjectId.isValid(adminUserId)) {
      throw new AppError('Invalid administrator credentials', 401);
    }

    // Find existing profile or upsert singleton
    let profile = await TrustProfile.findOne();

    if (!profile) {
      profile = new TrustProfile({
        ...data,
        updatedBy: new mongoose.Types.ObjectId(adminUserId),
      });
      await profile.save();
    } else {
      Object.assign(profile, data);
      profile.updatedBy = new mongoose.Types.ObjectId(adminUserId);
      await profile.save();
    }

    await profile.populate('updatedBy', 'name email role');
    return profile;
  }

  // ==========================================
  // TRUSTEES / BOARD MEMBERS
  // ==========================================

  /**
   * Get public active trustees sorted by display order
   * Excludes internal administrative metadata
   */
  public static async getPublicTrustees(): Promise<Partial<ITrustee>[]> {
    if (mongoose.connection.readyState !== 1) {
      return DEFAULT_TRUSTEES as unknown as Partial<ITrustee>[];
    }

    let trustees = await Trustee.find({ isActive: true })
      .select('-createdBy -updatedBy -__v')
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    if (trustees.length === 0) {
      try {
        await Trustee.insertMany(DEFAULT_TRUSTEES);
        trustees = await Trustee.find({ isActive: true })
          .select('-createdBy -updatedBy -__v')
          .sort({ displayOrder: 1, createdAt: 1 })
          .lean();
      } catch {
        return DEFAULT_TRUSTEES as unknown as Partial<ITrustee>[];
      }
    }

    return trustees;
  }

  /**
   * Get all trustees for admin management (active and inactive)
   */
  public static async getAdminTrustees(query?: TrusteeQueryParams): Promise<ITrustee[]> {
    this.checkDatabaseConnection();

    const count = await Trustee.countDocuments();
    if (count === 0) {
      await Trustee.insertMany(DEFAULT_TRUSTEES);
    }

    const filter: Record<string, any> = {};

    if (query?.isActive && query.isActive !== 'ALL') {
      filter.isActive = query.isActive === 'true';
    }

    if (query?.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { designation: searchRegex },
        { role: searchRegex },
        { bio: searchRegex },
        { qualification: searchRegex },
      ];
    }

    const trustees = await Trustee.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return trustees as ITrustee[];
  }

  /**
   * Create a new trustee record (ADMIN only)
   */
  public static async createTrustee(
    data: CreateTrusteeInput,
    adminUserId: string
  ): Promise<ITrustee> {
    this.checkDatabaseConnection();

    if (!mongoose.Types.ObjectId.isValid(adminUserId)) {
      throw new AppError('Invalid administrator credentials', 401);
    }

    const trustee = await Trustee.create({
      ...data,
      createdBy: new mongoose.Types.ObjectId(adminUserId),
      updatedBy: new mongoose.Types.ObjectId(adminUserId),
    });

    await trustee.populate('createdBy', 'name email');
    await trustee.populate('updatedBy', 'name email');

    return trustee;
  }

  /**
   * Update an existing trustee record (ADMIN only)
   */
  public static async updateTrustee(
    id: string,
    data: UpdateTrusteeInput,
    adminUserId: string
  ): Promise<ITrustee> {
    this.checkDatabaseConnection();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid trustee ID format', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(adminUserId)) {
      throw new AppError('Invalid administrator credentials', 401);
    }

    const trustee = await Trustee.findById(id);
    if (!trustee) {
      throw new AppError('Trustee record not found', 404);
    }

    Object.assign(trustee, data);
    trustee.updatedBy = new mongoose.Types.ObjectId(adminUserId);

    await trustee.save();
    await trustee.populate('createdBy', 'name email');
    await trustee.populate('updatedBy', 'name email');

    return trustee;
  }

  /**
   * Delete a trustee record (ADMIN only)
   */
  public static async deleteTrustee(id: string): Promise<void> {
    this.checkDatabaseConnection();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid trustee ID format', 400);
    }

    const deleted = await Trustee.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError('Trustee record not found', 404);
    }
  }
}
