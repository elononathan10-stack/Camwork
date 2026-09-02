/**
 * CAMWORK PLATFORM - CENTRAL EXPORTS
 * Barrel export file for all new components, types, and utilities
 *
 * Usage:
 *   import { PortableReputation, AdminConsole } from "@/camwork";
 *   import type { JobSeeker, Employer, VideoCall } from "@/camwork";
 */

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type {
  UserRole,
  VerificationStatus,
  Profile,
  BaseUser,
  Location,
  SkillItem,
  WorkHistoryEntry,
  JobSeeker,
  Employer,
  Administrator,
  AdminPrivilege,
  JobStatus,
  JobPosting,
  ApplicationStatus,
  Application,
  VerificationRequestStatus,
  VerificationRequest,
  VouchRequest,
  Rating,
  NotificationType,
  Notification,
  PaymentStatus,
  PaymentType,
  Payment,
  CallStatus,
  VideoCall,
  CallHistoryEntry,
  Message,
  Conversation,
  DisputeStatus,
  Dispute,
  GeocodeResult,
  ApiResponse,
} from "@/types/domain";

// ============================================================================
// COMPONENTS - JOB SEEKER
// ============================================================================

export { PortableReputation } from "@/components/PortableReputation";
export type { PortableReputationProps } from "@/components/PortableReputation";

export { VerificationInterface } from "@/components/VerificationInterface";
export type { VerificationInterfaceProps } from "@/components/VerificationInterface";

// ============================================================================
// COMPONENTS - EMPLOYER
// ============================================================================

export { EmployerATS } from "@/components/EmployerATS";
export type { EmployerATSProps } from "@/components/EmployerATS";

// ============================================================================
// COMPONENTS - ADMIN
// ============================================================================

export { AdminConsole } from "@/components/AdminConsole";
export type { AdminConsoleProps } from "@/components/AdminConsole";

// ============================================================================
// COMPONENTS - COMMUNICATION
// ============================================================================

export { VideoCallInterface } from "@/components/VideoCallInterface";
export type { VideoCallInterfaceProps } from "@/components/VideoCallInterface";

export { NotificationCenter } from "@/components/NotificationCenter";
export type { NotificationCenterProps } from "@/components/NotificationCenter";

// ============================================================================
// UTILITY SERVICES
// ============================================================================

// Location Helpers
export {
  geocodeLocation,
  getFullAddress,
  calculateDistance,
  getLocationSuggestions,
  findJobsWithinRadius,
  getMockUserLocation,
} from "@/utils/locationHelper";

// Notification Service
export {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationIcon,
  getNotificationColor,
} from "@/utils/notificationService";

// Video Call Service
export {
  initiateCall,
  updateCallStatus,
  endCall,
  declineCall,
  getActiveCall,
  getUserCallHistory,
  formatCallDuration,
  getMockCallDuration,
  formatCallDate,
} from "@/utils/videoCallService";

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const USER_ROLES = ["seeker", "employer", "admin"] as const;

export const VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "suspended",
] as const;

export const APPLICATION_STATUSES = [
  "pending",
  "reviewed",
  "interviews",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export const NOTIFICATION_TYPES = [
  "job_match",
  "application_status",
  "message",
  "verification_update",
  "vouch_request",
  "rating_received",
  "direct_offer",
  "payment_confirmation",
  "video_call",
] as const;

export const CALL_STATUSES = [
  "initiating",
  "ringing",
  "connected",
  "ended",
] as const;

// ============================================================================
// HELPER TYPES FOR COMPONENT PROPS
// ============================================================================

export type ComponentWithUser<T> = T & {
  userId: string;
};

export type FormState<T> = {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isLoading: boolean;
};

// ============================================================================
// VERSION INFO
// ============================================================================

export const CAMWORK_VERSION = "1.0.0";
export const IMPLEMENTATION_DATE = "2024-09-01";
export const PLATFORM = "Expo React Native";
