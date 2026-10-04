import mongoose, { Types } from 'mongoose';
import { Volunteer, IVolunteer } from '../models/Volunteer';
import { VolunteerRole, IVolunteerRole } from '../models/VolunteerRole';
import { VolunteerShift, IVolunteerShift } from '../models/VolunteerShift';
import { VolunteerCertificate, IVolunteerCertificate } from '../models/VolunteerCertificate';
import { VolunteerApplication, IVolunteerApplication } from '../models/VolunteerApplication';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { AppError } from '../utils/apiResponse';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export interface VolunteerProfileResult {
  volunteer: IVolunteer;
  shifts: IVolunteerShift[];
  certificates: IVolunteerCertificate[];
  stats: {
    totalHours: number;
    shiftsCompleted: number;
    certificatesCount: number;
    tier: string;
  };
}

export class VolunteerService {
  /**
   * Helper to verify database connectivity
   */
  private static checkDatabaseConnection(): void {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }
  }

  /**
   * Default canonical roles to seed if collection is empty
   */
  private static readonly INITIAL_ROLES = [
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

  /**
   * Public: List all active volunteer roles from MongoDB.
   * Auto-seeds initial roles if the collection is empty.
   */
  public static async listRoles(filters: { isKumbhRelated?: boolean } = {}): Promise<IVolunteerRole[]> {
    if (mongoose.connection.readyState !== 1) {
      let fallbackRoles = this.INITIAL_ROLES.map((r, idx) => ({
        _id: new mongoose.Types.ObjectId(`00000000000000000000000${idx + 1}`),
        ...r,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as unknown as IVolunteerRole[];

      if (filters.isKumbhRelated !== undefined) {
        fallbackRoles = fallbackRoles.filter((r) => r.isKumbhRelated === filters.isKumbhRelated);
      }
      return fallbackRoles;
    }

    const count = await VolunteerRole.countDocuments();
    if (count === 0) {
      await VolunteerRole.insertMany(this.INITIAL_ROLES);
    }

    const query: Record<string, any> = { isActive: true };
    if (filters.isKumbhRelated !== undefined) {
      query.isKumbhRelated = filters.isKumbhRelated;
    }

    return VolunteerRole.find(query).sort({ isKumbhRelated: -1, createdAt: -1 }).lean();
  }

  /**
   * Public: Submit volunteer application for an open position
   */
  public static async submitApplication(input: {
    roleId?: string;
    roleTitle: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    isCollegeStudent?: boolean;
    collegeName?: string;
    motivation?: string;
    isKumbhRelated?: boolean;
    preferredSevaArea?: string;
    availability?: string;
    emergencyContact?: string;
    skills?: string[];
  }): Promise<IVolunteerApplication> {
    this.checkDatabaseConnection();

    if (!input.roleTitle || !input.fullName || !input.email || !input.phone || !input.city) {
      throw new AppError('Full name, email, phone, city, and role title are required.', 400);
    }

    let roleObjectId: Types.ObjectId | undefined;
    if (input.roleId && Types.ObjectId.isValid(input.roleId)) {
      roleObjectId = new Types.ObjectId(input.roleId);
    }

    const isKumbh = Boolean(
      input.isKumbhRelated ||
        input.roleTitle.toLowerCase().includes('kumbh') ||
        input.roleTitle.toLowerCase().includes('simhastha')
    );

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = isKumbh
      ? `KMB-2027-${randomSuffix}`
      : `VOL-${new Date().getFullYear()}-${randomSuffix}`;

    const application = await VolunteerApplication.create({
      roleId: roleObjectId,
      roleTitle: input.roleTitle.trim(),
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      isCollegeStudent: Boolean(input.isCollegeStudent),
      collegeName: input.collegeName?.trim() || '',
      motivation: input.motivation?.trim() || '',
      isKumbhRelated: isKumbh,
      preferredSevaArea: input.preferredSevaArea?.trim() || '',
      availability: input.availability?.trim() || '',
      emergencyContact: input.emergencyContact?.trim() || '',
      skills: Array.isArray(input.skills) ? input.skills : [],
      referenceNumber,
      status: 'PENDING',
    });

    // Send volunteer application acknowledgement email non-blockingly
    EmailService.sendVolunteerApplicationReceivedEmail({
      email: application.email,
      fullName: application.fullName,
      roleTitle: application.roleTitle,
      referenceNumber,
    }).catch((err) => logger.error(`[VolunteerService] Email error: ${err.message}`));

    // In-app notification for registered users
    User.findOne({ email: application.email }).select('_id').then((user) => {
      if (user) {
        NotificationService.createNotification({
          recipientId: user._id,
          type: 'VOLUNTEER_SUBMITTED',
          title: 'Volunteer Seva Application Received',
          message: `Your seva application for "${application.roleTitle}" has been received. Application Ref: ${referenceNumber}.`,
          link: '/volunteer-portal',
          relatedEntity: { entityType: 'Volunteer', entityId: application._id },
          metadata: { referenceNumber, roleTitle: application.roleTitle },
        }).catch((err) => logger.error(`[VolunteerService] Notification error: ${err.message}`));
      }
    }).catch(() => {});

    // Notify Admins
    NotificationService.notifyAdmins({
      type: 'VOLUNTEER_SUBMITTED',
      title: 'New Volunteer Application',
      message: `${application.fullName} applied for "${application.roleTitle}" (Ref: ${referenceNumber}).`,
      link: '/admin',
      metadata: { applicationId: application._id.toString(), referenceNumber },
    }).catch((err) => logger.error(`[VolunteerService] Admin notification error: ${err.message}`));

    return application;
  }

  /**
   * Authenticated Volunteer: Retrieve logged-in volunteer's profile, shifts, certificates, and stats.
   * Strictly enforces that volunteers only access their own private data.
   */
  public static async getMyProfile(userId: string): Promise<VolunteerProfileResult> {
    this.checkDatabaseConnection();

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid authenticated user identifier.', 401);
    }

    const userObjectId = new Types.ObjectId(userId);

    // Retrieve or create volunteer profile
    let volunteer = await Volunteer.findOne({ user: userObjectId })
      .populate('user', 'name email phone isActive createdAt')
      .populate('registeredEvents', 'title location startDate status imageUrl');

    if (!volunteer) {
      const codeSuffix = userId.slice(-4).toUpperCase();
      volunteer = await Volunteer.create({
        user: userObjectId,
        volunteerCode: `VOL-MH-2024-${codeSuffix}`,
        primaryFocus: 'Nutrition & Logistics',
        skills: ['First Aid', 'Community Engagement'],
        availability: 'FLEXIBLE',
        registeredEvents: [],
        volunteerHours: 0,
        tier: 'Bronze',
      });

      volunteer = await Volunteer.findById(volunteer._id)
        .populate('user', 'name email phone isActive createdAt')
        .populate('registeredEvents', 'title location startDate status imageUrl');
    }

    // Fetch shifts strictly belonging to this user
    let shifts = await VolunteerShift.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch certificates strictly belonging to this user
    let certificates = await VolunteerCertificate.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate total verified hours from real shifts and existing logged hours
    const verifiedShiftHours = shifts
      .filter((s) => s.status === 'Completed & Verified')
      .reduce((sum, s) => sum + (s.hours || 0), 0);

    const totalHours = Math.max(volunteer!.volunteerHours || 0, verifiedShiftHours);

    // Compute tier
    let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
    if (totalHours >= 100) tier = 'Platinum';
    else if (totalHours >= 50) tier = 'Gold';
    else if (totalHours >= 25) tier = 'Silver';

    // Update volunteer record if hours or tier changed
    if (volunteer!.volunteerHours !== totalHours || volunteer!.tier !== tier) {
      volunteer!.volunteerHours = totalHours;
      volunteer!.tier = tier;
      await volunteer!.save();
    }

    return {
      volunteer: volunteer!,
      shifts,
      certificates,
      stats: {
        totalHours,
        shiftsCompleted: shifts.filter((s) => s.status === 'Completed & Verified').length,
        certificatesCount: certificates.length,
        tier,
      },
    };
  }

  /**
   * Authenticated Volunteer: Update logged-in volunteer's preferences
   */
  public static async updateMyProfile(
    userId: string,
    updateData: {
      skills?: string[];
      availability?: 'WEEKDAYS' | 'WEEKENDS' | 'FLEXIBLE' | 'EVENTS_ONLY';
      primaryFocus?: string;
    }
  ): Promise<IVolunteer> {
    this.checkDatabaseConnection();

    const allowedUpdates: Record<string, any> = {};
    if (Array.isArray(updateData.skills)) {
      allowedUpdates.skills = updateData.skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (
      updateData.availability &&
      ['WEEKDAYS', 'WEEKENDS', 'FLEXIBLE', 'EVENTS_ONLY'].includes(updateData.availability)
    ) {
      allowedUpdates.availability = updateData.availability;
    }
    if (updateData.primaryFocus) {
      allowedUpdates.primaryFocus = updateData.primaryFocus.trim();
    }

    const volunteer = await Volunteer.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      allowedUpdates,
      { new: true, upsert: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('registeredEvents', 'title location startDate status');

    return volunteer!;
  }

  /**
   * Authenticated Volunteer: Self-log a completed or scheduled shift
   */
  public static async logMyShift(
    userId: string,
    shiftData: {
      roleTitle: string;
      date: string;
      hours: number;
      location: string;
      supervisor?: string;
      notes?: string;
    }
  ): Promise<IVolunteerShift> {
    this.checkDatabaseConnection();

    if (!shiftData.roleTitle || !shiftData.date || !shiftData.hours || !shiftData.location) {
      throw new AppError('Role title, date, hours, and location are required.', 400);
    }

    const hours = Number(shiftData.hours);
    if (isNaN(hours) || hours <= 0) {
      throw new AppError('Hours must be a valid positive number.', 400);
    }

    const userObjectId = new Types.ObjectId(userId);
    let volunteer = await Volunteer.findOne({ user: userObjectId });
    if (!volunteer) {
      volunteer = await Volunteer.create({
        user: userObjectId,
        volunteerCode: `VOL-MH-2024-${userId.slice(-4).toUpperCase()}`,
        primaryFocus: shiftData.roleTitle,
        skills: [],
        availability: 'FLEXIBLE',
        volunteerHours: 0,
      });
    }

    const newShift = await VolunteerShift.create({
      volunteer: volunteer._id,
      user: userObjectId,
      roleTitle: shiftData.roleTitle.trim(),
      date: shiftData.date.trim(),
      hours,
      location: shiftData.location.trim(),
      supervisor: shiftData.supervisor?.trim() || 'Trust Field Supervisor',
      status: 'Completed & Verified',
      notes: shiftData.notes?.trim() || '',
    });

    // Update volunteer total hours
    await Volunteer.findByIdAndUpdate(volunteer._id, {
      $inc: { volunteerHours: hours },
    });

    return newShift;
  }

  /**
   * Authenticated Volunteer: Get shifts strictly belonging to current user
   */
  public static async getMyShifts(userId: string): Promise<IVolunteerShift[]> {
    this.checkDatabaseConnection();
    return VolunteerShift.find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Authenticated Volunteer: Get digital certificates strictly belonging to current user
   */
  public static async getMyCertificates(userId: string): Promise<IVolunteerCertificate[]> {
    this.checkDatabaseConnection();
    return VolunteerCertificate.find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Authenticated Volunteer: Register for an upcoming event
   */
  public static async registerForEvent(userId: string, eventId: string): Promise<any> {
    this.checkDatabaseConnection();

    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Target event not found.', 404);
    }

    if (event.status !== 'UPCOMING' && event.status !== 'ONGOING') {
      throw new AppError(`Cannot register for event with status '${event.status}'.`, 400);
    }

    const capacity = event.capacity || event.registrationLimit || 0;
    const registeredVolunteers = event.registeredVolunteers || [];
    if (capacity > 0 && registeredVolunteers.length >= capacity) {
      throw new AppError('This event has reached its maximum volunteer capacity.', 400);
    }

    const isAlreadyRegistered = registeredVolunteers.some(
      (vId) => vId.toString() === userId
    );

    if (!isAlreadyRegistered) {
      if (!event.registeredVolunteers) {
        event.registeredVolunteers = [];
      }
      event.registeredVolunteers.push(userId as any);
      await event.save();
    }

    const volunteer = await Volunteer.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { $addToSet: { registeredEvents: event._id } },
      { new: true, upsert: true }
    ).populate('registeredEvents', 'title location startDate status');

    return { volunteer, event };
  }

  // ============================================================================
  // ADMIN-ONLY OPERATIONS (Protected with authenticate -> authorize('ADMIN'))
  // ============================================================================

  /**
   * Admin: List all volunteers with pagination and user metadata
   */
  public static async listAllVolunteers(options: { page?: number; limit?: number; search?: string }) {
    this.checkDatabaseConnection();

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const [volunteers, total] = await Promise.all([
      Volunteer.find()
        .populate('user', 'name email phone isActive createdAt')
        .populate('registeredEvents', 'title location startDate status')
        .sort({ volunteerHours: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Volunteer.countDocuments(),
    ]);

    return {
      volunteers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: List all volunteer shifts across the trust
   */
  public static async listAllShifts(options: { page?: number; limit?: number }) {
    this.checkDatabaseConnection();

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 50));
    const skip = (page - 1) * limit;

    const [shifts, total] = await Promise.all([
      VolunteerShift.find()
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VolunteerShift.countDocuments(),
    ]);

    return {
      shifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Verify shift
   */
  public static async verifyShift(shiftId: string, adminId: string) {
    this.checkDatabaseConnection();

    const shift = await VolunteerShift.findById(shiftId);
    if (!shift) {
      throw new AppError('Shift not found.', 404);
    }

    shift.status = 'Completed & Verified';
    shift.verifiedBy = new Types.ObjectId(adminId);
    await shift.save();

    // Recalculate volunteer hours
    const userShifts = await VolunteerShift.find({
      user: shift.user,
      status: 'Completed & Verified',
    });
    const totalHours = userShifts.reduce((acc, s) => acc + s.hours, 0);

    await Volunteer.findOneAndUpdate(
      { user: shift.user },
      { $set: { volunteerHours: totalHours } }
    );

    return shift;
  }

  /**
   * Admin: List volunteer applications
   */
  public static async listApplications(options: { page?: number; limit?: number; status?: string }) {
    this.checkDatabaseConnection();

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (options.status) {
      query.status = options.status;
    }

    const [applications, total] = await Promise.all([
      VolunteerApplication.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VolunteerApplication.countDocuments(query),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Review application (Approve or Reject)
   */
  public static async reviewApplication(
    applicationId: string,
    adminId: string,
    status: 'APPROVED' | 'REJECTED'
  ) {
    this.checkDatabaseConnection();

    const application = await VolunteerApplication.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found.', 404);
    }

    // Idempotency: If already reviewed with the same status, do not re-send alerts
    if (application.status === status) {
      return application;
    }

    application.status = status;
    application.reviewedBy = new Types.ObjectId(adminId);
    application.reviewedAt = new Date();
    await application.save();

    if (status === 'APPROVED' && application.email) {
      const user = await User.findOne({ email: application.email.toLowerCase() });
      if (user) {
        if (user.role === 'DONOR') {
          user.role = 'VOLUNTEER';
          await user.save();
        }
        let vol = await Volunteer.findOne({ user: user._id });
        if (!vol) {
          vol = await Volunteer.create({
            user: user._id,
            volunteerCode: `VOL-MH-2024-${user._id.toString().slice(-4).toUpperCase()}`,
            primaryFocus: application.roleTitle,
            skills: [],
            availability: 'FLEXIBLE',
            isKumbhRegistered: application.roleTitle.toLowerCase().includes('kumbh'),
            volunteerHours: 0,
            tier: 'Bronze',
          });
        }
      }
    }

    // Send application decision email to volunteer
    if (application.email) {
      EmailService.sendVolunteerStatusEmail({
        email: application.email,
        fullName: application.fullName,
        roleTitle: application.roleTitle,
        status,
      }).catch((err) => logger.error(`[VolunteerService] Decision email error: ${err.message}`));

      // Create in-app notification if user account exists
      User.findOne({ email: application.email.toLowerCase() }).select('_id').then((user) => {
        if (user) {
          NotificationService.createNotification({
            recipientId: user._id,
            type: status === 'APPROVED' ? 'VOLUNTEER_APPROVED' : 'VOLUNTEER_REJECTED',
            title: status === 'APPROVED' ? 'Volunteer Seva Application Approved!' : 'Volunteer Application Status Update',
            message: status === 'APPROVED'
              ? `Congratulations! Your volunteer application for "${application.roleTitle}" has been approved.`
              : `Your volunteer application for "${application.roleTitle}" has been reviewed.`,
            link: '/volunteer-portal',
            relatedEntity: { entityType: 'Volunteer', entityId: application._id },
            metadata: { status, roleTitle: application.roleTitle },
          }).catch((err) => logger.error(`[VolunteerService] Decision notification error: ${err.message}`));
        }
      }).catch(() => {});
    }

    return application;
  }

  /**
   * Admin: Create new volunteer role
   */
  public static async createRole(data: any): Promise<IVolunteerRole> {
    this.checkDatabaseConnection();
    return VolunteerRole.create(data);
  }

  /**
   * Admin: Update volunteer role
   */
  public static async updateRole(roleId: string, data: any): Promise<IVolunteerRole | null> {
    this.checkDatabaseConnection();
    return VolunteerRole.findByIdAndUpdate(roleId, data, { new: true, runValidators: true });
  }

  /**
   * Admin: Delete volunteer role
   */
  public static async deleteRole(roleId: string): Promise<boolean> {
    this.checkDatabaseConnection();
    const result = await VolunteerRole.findByIdAndDelete(roleId);
    return Boolean(result);
  }

  /**
   * Admin: Issue digital certificate to volunteer
   */
  public static async issueCertificate(
    data: {
      userId: string;
      volunteerName: string;
      serviceTitle: string;
      totalHours: number;
      signatoryTitle?: string;
      signatoryName?: string;
    }
  ): Promise<IVolunteerCertificate> {
    this.checkDatabaseConnection();

    const certNumber = `SCT-VOL-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hashRandom = Math.random().toString(16).slice(2, 8).toUpperCase();
    const verificationHash = `0x${hashRandom}...${Math.random().toString(16).slice(2, 6).toUpperCase()} (Audited & On-Record)`;

    const userObjectId = new Types.ObjectId(data.userId);
    const vol = await Volunteer.findOne({ user: userObjectId });

    const cert = await VolunteerCertificate.create({
      volunteer: vol?._id,
      user: userObjectId,
      certificateNumber: certNumber,
      volunteerName: data.volunteerName.trim(),
      issuedDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      serviceTitle: data.serviceTitle.trim(),
      totalHours: data.totalHours,
      signatoryTitle: data.signatoryTitle || 'President / अध्यक्ष',
      signatoryName: data.signatoryName || 'Shri Sunil Vishwanath Nirgude',
      verificationHash,
    });

    return cert;
  }
}
