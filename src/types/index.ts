export type CauseCategory =
  | "Education"
  | "Medical Support"
  | "Food & Nutrition"
  | "Emergency Relief"
  | "Environment"
  | "Other";

export interface Cause {
  id: string;
  _id?: string;
  slug?: string;
  title: string;
  category: CauseCategory;
  tagline: string;
  shortDescription?: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  imageUrl: string;
  location: string;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  urgent?: boolean;
  featured?: boolean;
  isKumbhRelated?: boolean;
  startDate?: string;
  endDate?: string;
  allocationBreakdown?: {
    category: string;
    percentage: number;
  }[];
  impactMilestones?: {
    title: string;
    description: string;
    targetDate: string;
    status: "completed" | "in_progress" | "upcoming";
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export type PassportStageStatus = "completed" | "current" | "pending";

export interface PassportStage {
  stage: "Donation" | "Allocation" | "Verification" | "Impact";
  title: string;
  date: string;
  status: PassportStageStatus;
  description: string;
  evidenceType?: "receipt" | "purchase_order" | "inspection_report" | "field_audit";
  evidenceDocNumber?: string;
  verifiedBy?: string;
  details?: { label: string; value: string }[];
}

export interface ImpactPassportRecord {
  id: string;
  passportNumber: string;
  donorName: string;
  isAnonymous?: boolean;
  donationDate: string;
  amount: number;
  causeId: string;
  causeTitle: string;
  category: CauseCategory;
  overallStatus: "In Verification" | "Fully Impacted" | "Allocated" | "Received";
  stages: PassportStage[];
  summaryNote: string;
}

export interface TrustStat {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  iconName: string;
}

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface EventItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  category: string;
  startDate: string;
  endDate?: string;
  date: string;
  time: string;
  location: string;
  shortDescription: string;
  description: string;
  capacity: number;
  registeredCount: number;
  registrationLimit: number;
  registrationCount: number;
  registrationRequired: boolean;
  status: EventStatus | "Upcoming" | "Completed";
  imageUrl: string;
  galleryUrls?: string[];
  isKumbhRelated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventRegistrationItem {
  id: string;
  _id?: string;
  event: EventItem | string;
  user: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  attendeeCount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
}

export interface VolunteerRole {
  id: string;
  _id?: string;
  title: string;
  department: string;
  commitment: string;
  location: string;
  description: string;
  requirements: string[];
  spotsAvailable: number;
  isKumbhRelated?: boolean;
}

export type DonationStatus = 'CREATED' | 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface DonationRecord {
  id: string;
  _id?: string;
  donorId?: { _id: string; name: string; email: string; phone?: string } | string | null;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  causeId?: { _id: string; title: string; slug: string; category?: string; imageUrl?: string } | string | null;
  purpose: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: DonationStatus;
  paymentStatus?: DonationStatus;
  receiptNumber?: string;
  receiptUrl?: string | null;
  paidAt?: string | null;
  paymentVerifiedAt?: string | null;
  paymentMethod?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserDonation {
  id: string;
  receiptNumber: string;
  date: string;
  causeTitle: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Failed';
  passportId: string;
  taxExemptEligible: boolean;
  paymentMethod?: string;
  panNumber?: string;
  rawRecord?: DonationRecord;
}

export type HelpRequestType =
  | 'Education'
  | 'Medical'
  | 'Food'
  | 'Shelter'
  | 'Emergency'
  | 'Other';

export type HelpUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type HelpRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface HelpRequest {
  id: string;
  requesterId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  } | string;
  name: string;
  email: string;
  phone: string;
  requestType: HelpRequestType;
  description: string;
  location: string;
  urgency: HelpUrgency;
  status: HelpRequestStatus;
  adminNotes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reviewedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerShift {
  id: string;
  _id?: string;
  roleTitle: string;
  role?: string;
  date: string;
  hours: number;
  location: string;
  supervisor: string;
  status: "Completed & Verified" | "Scheduled" | "Pending Approval" | string;
  notes?: string;
}

export interface VolunteerCertificate {
  id: string;
  _id?: string;
  certificateNumber: string;
  volunteerName: string;
  issuedDate: string;
  issueDate?: string;
  serviceTitle: string;
  title?: string;
  totalHours: number;
  hoursRecorded?: number;
  description?: string;
  signatoryTitle: string;
  signatoryName: string;
  verificationHash: string;
}

export interface BlogPost {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  authorRole?: string;
  date?: string;
  publishedDate?: string;
  publishedAt?: string;
  readTime: string;
  excerpt: string;
  content: string | string[];
  imageUrl: string;
  coverImage: string;
  tags: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
  isKumbhRelated?: boolean;
  createdBy?: any;
  updatedBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "Education" | "Medical" | "Food" | "Environment" | "Events" | "Kumbh Seva";
  imageUrl: string;
  location: string;
  date: string;
  caption: string;
  isKumbhRelated?: boolean;
}

export type TransparencyReportType =
  | 'Annual Report'
  | 'Financial Report'
  | 'Impact Report'
  | 'Audit Report'
  | 'Donation Utilization Report'
  | 'Other';

export interface TransparencyReport {
  id: string;
  title: string;
  description?: string;
  reportType?: TransparencyReportType | string;
  financialYear: string;
  filingDate?: string;
  periodStart?: string;
  periodEnd?: string;
  fileUrl?: string;
  coverImage?: string;
  auditorFirm?: string;
  statutoryType?: string;
  totalDisbursal?: string;
  auditRating?: string;
  fileSize?: string;
  publishedAt?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isKumbhRelated?: boolean;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface KumbhConfig {
  isActive: boolean;
  editionName: string;
  location: string;
  targetYear: string;
  status: string;
  planningNote: string;
}

export interface TrustObjective {
  title: string;
  description: string;
  category?: string;
}

export interface TrustSocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  github?: string;
}

export interface TrustRegistrationDetails {
  registrationNumber?: string;
  establishedYear?: string;
  taxExemption80G?: string;
  fcraNumber?: string;
  entityType?: string;
}

export interface TrustProfile {
  _id?: string;
  id?: string;
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
  updatedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Trustee {
  _id?: string;
  id?: string;
  name: string;
  designation: string;
  role?: string;
  bio: string;
  qualification?: string;
  photo?: string;
  displayOrder: number;
  isActive: boolean;
  createdBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  updatedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
