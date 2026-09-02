/**
 * VIDEO CALL SERVICE
 * Mock service for managing video calls and call history
 */

import { VideoCall, CallStatus, CallHistoryEntry } from "@/types/domain";

let callStore: Map<string, VideoCall> = new Map();
let callHistoryStore: CallHistoryEntry[] = [];
let callId = 1;

/**
 * Initiate a new video call
 */
export const initiateCall = (
  callerId: string,
  receiverId: string,
): VideoCall => {
  const call: VideoCall = {
    id: `call_${callId++}`,
    callerId,
    receiverId,
    startTime: new Date(),
    status: "initiating",
  };

  callStore.set(call.id, call);
  return call;
};

/**
 * Update call status
 */
export const updateCallStatus = (
  callId: string,
  status: CallStatus,
): VideoCall | null => {
  const call = callStore.get(callId);
  if (call) {
    call.status = status;
    if (status === "connected" && !call.startTime) {
      call.startTime = new Date();
    }
  }
  return call || null;
};

/**
 * End a call and record in history
 */
export const endCall = (callId: string): VideoCall | null => {
  const call = callStore.get(callId);
  if (call) {
    call.endTime = new Date();
    call.status = "ended";

    // Calculate duration
    const duration = Math.floor(
      (call.endTime.getTime() - call.startTime.getTime()) / 1000,
    );
    call.duration = duration;

    // Record in history
    const historyEntry: CallHistoryEntry = {
      callId: call.id,
      caller: call.callerId,
      receiver: call.receiverId,
      date: new Date(),
      duration,
      initiatedBy: "caller",
    };

    callHistoryStore.push(historyEntry);
    callStore.delete(callId);
  }

  return call || null;
};

/**
 * Decline a call
 */
export const declineCall = (callId: string): VideoCall | null => {
  const call = callStore.get(callId);
  if (call) {
    call.status = "ended";
    callStore.delete(callId);
  }
  return call || null;
};

/**
 * Get active call between two users
 */
export const getActiveCall = (
  userId1: string,
  userId2: string,
): VideoCall | null => {
  for (const call of callStore.values()) {
    if (
      (call.callerId === userId1 && call.receiverId === userId2) ||
      (call.callerId === userId2 && call.receiverId === userId1)
    ) {
      if (call.status !== "ended") {
        return call;
      }
    }
  }
  return null;
};

/**
 * Get call history for a user
 */
export const getUserCallHistory = (userId: string): CallHistoryEntry[] => {
  return callHistoryStore
    .filter((entry) => entry.caller === userId || entry.receiver === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Format call duration for display
 */
export const formatCallDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${secs}s`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

/**
 * Get mock call duration (in seconds)
 */
export const getMockCallDuration = (): number => {
  // Random duration between 1 minute and 2 hours
  return Math.floor(Math.random() * 7140) + 60;
};

/**
 * Format date for call history
 */
export const formatCallDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // Format as date
  return new Date(date).toLocaleDateString();
};
