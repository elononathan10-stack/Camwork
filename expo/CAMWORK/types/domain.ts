/**
 * CAMWORK PLATFORM - DOMAIN MODELS & TYPES
 * TypeScript interfaces for all system entities based on class diagram
 */

// ============================================================================
// BASE USER TYPES
// ============================================================================

export type UserRole = "seeker" | "employer" | "admin";
export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "suspended";

export interface Profile {
  id: string;
  userId: string;
  skills: SkillItem[];
  experience: string; // Years or description
  resumeUrl?: string; // URL to uploaded resume
  averageRating: number;
  ratingCount: number;
  bio?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileId: string;
  profile?: Profile;
  role: UserRole;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// JOB SEEKER SPECIFIC
// ============================================================================

export interface Location {
  town: string;
  region: string;
  division: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  fullAddress?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Expert";
  endorsementCount?: number;
}

export interface WorkHistoryEntry {
  id: string;
  jobSeekerId: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  verifiedByEmployer?: boolean;
  verifierEmployerId?: string;
}

export interface JobSeeker extends BaseUser {
  availabilityStatus: "available" | "not-available" | "on-leave";
  ratingScore: number;
  workHistory: WorkHistoryEntry[];
  location: Location;
  directOffers?: DirectOffer[];
  vouchRequests?: VouchRequest[];
}

export interface DirectOffer {
  id: string;
  employerId: string;
  jobId: string;
  message: string;
  status: "pending" | "accepted" | "declined";
}

// ============================================================================
// EMPLOYER SPECIFIC
// ============================================================================

export interface Employer extends BaseUser {
  companyName: string;
  companyLogoUrl?: string;
  companyDescription?: string;
  companySize?: "1-10" | "11-50" | "51-200" | "200+";
  postedJobs: string[]; // Job IDs
  totalJobsPosted?: number;
}

// ============================================================================
// ADMIN SPECIFIC
// ============================================================================

export interface Administrator extends BaseUser {
  privileges: AdminPrivilege[];
}

export type AdminPrivilege =
  | "moderate_content"
  | "resolve_disputes"
  | "verify_profiles"
  | "suspend_users"
  | "manage_payments"
  | "view_analytics";

// ============================================================================
// JOB POSTINGS & APPLICATIONS
// ============================================================================

export type JobStatus = "open" | "closed" | "archived";

export interface JobPosting {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string[];
  skillsNeeded: string[];
  category: string;
  type: "Formal" | "Gig";
  location: Location;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  contractDuration?: string; // e.g., "3 months", "6 months"
  status: JobStatus;
  applicants: string[]; // Application IDs
  createdAt: Date;
  updatedAt: Date;
  postedTime: string;
}

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "interviews"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  jobId: string;
  jobSeekerId: string;
  applicationDate: Date;
  status: ApplicationStatus;
  coverLetter?: string;
  lastUpdated: Date;
  rejectionReason?: string;
}

// ============================================================================
// VERIFICATION & TRUST
// ============================================================================

export type VerificationRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "resubmit";

export interface VerificationRequest {
  id: string;
  userId: string;
  status: VerificationRequestStatus;
  submissionDate: Date;
  documents: {
    documentType: string;
    documentUrl: string;
  }[];
  reviewedBy?: string; // Admin ID
  reviewDate?: Date;
  rejectionReason?: string;
}

export interface VouchRequest {
  id: string;
  jobSeekerId: string;
  endorserName: string;
  endorserRole: string;
  company: string;
  relationship: string;
  comment: string;
  status: "pending" | "endorsed" | "declined";
  createdAt: Date;
  approvedAt?: Date;
}

// ============================================================================
// RATINGS & REVIEWS
// ============================================================================

export interface Rating {
  id: string;
  submitterId: string; // Who gave the rating (usually Employer)
  recipientId: string; // Who receives it (usually Job Seeker)
  score: number; // 1-5 stars
  reviewText: string;
  jobId?: string; // Related job posting
  createdAt: Date;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType =
  | "job_match"
  | "application_status"
  | "message"
  | "verification_update"
  | "vouch_request"
  | "rating_received"
  | "direct_offer"
  | "payment_confirmation"
  | "video_call";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data?: {
    [key: string]: any;
  };
  targetScreen?: string;
  targetId?: string;
  createdAt: Date;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentType = "verification" | "featured_post" | "premium_feature";

export interface Payment {
  id: string;
  employerId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  transactionDate: Date;
  description?: string;
}

// ============================================================================
// VIDEO CALLS
// ============================================================================

export type CallStatus = "initiating" | "ringing" | "connected" | "ended";

export interface VideoCall {
  id: string;
  callerId: string;
  receiverId: string;
  startTime: Date;
  endTime?: Date;
  status: CallStatus;
  duration?: number; // in seconds
  callHistory?: CallHistoryEntry[];
}

export interface CallHistoryEntry {
  callId: string;
  caller: string;
  receiver: string;
  date: Date;
  duration: number; // in seconds
  initiatedBy: "caller" | "receiver";
}

// ============================================================================
// MESSAGES & CONVERSATIONS
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  conversationId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  jobContextId?: string; // Related Job Posting
  messages: Message[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DISPUTES & MODERATION
// ============================================================================

export type DisputeStatus = "open" | "in-review" | "resolved" | "closed";

export interface Dispute {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  contentId?: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolvedBy?: string; // Admin ID
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================================================
// LOCATION HELPER TYPES
// ============================================================================

export interface GeocodeResult {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  town: string;
  region: string;
  division: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
