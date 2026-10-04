/**
 * Siddhivinayak Charitable Trust - Backend Global Type Definitions
 */

export type UserRole = 'ADMIN' | 'STAFF' | 'VOLUNTEER' | 'DONOR';

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

export type CauseStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export type CauseCategory =
  | 'Education'
  | 'Medical Support'
  | 'Food & Nutrition'
  | 'Emergency Relief'
  | 'Environment'
  | 'Other';

export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentGateway = 'RAZORPAY' | 'STRIPE' | 'UPI_OFFLINE' | 'BANK_TRANSFER' | 'CASH';

export type VolunteerAvailability = 'WEEKDAYS' | 'WEEKENDS' | 'FLEXIBLE' | 'EVENTS_ONLY';

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type HelpCategory = 'MEDICAL' | 'EDUCATION' | 'FOOD_RELIEF' | 'DISASTER' | 'ELDERLY_CARE' | 'OTHER';

export type HelpStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED';

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

export type ContactStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'SPAM';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field?: string; message: string }>;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  isActive: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthenticatedUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
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

export type PassportStageStatus = 'completed' | 'current' | 'pending';

export interface PassportStage {
  stage: 'Donation' | 'Allocation' | 'Verification' | 'Impact';
  title: string;
  date: string;
  status: PassportStageStatus;
  description: string;
  evidenceType?: 'receipt' | 'purchase_order' | 'inspection_report' | 'field_audit';
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
  overallStatus: 'In Verification' | 'Fully Impacted' | 'Allocated' | 'Received';
  stages: PassportStage[];
  summaryNote: string;
}
