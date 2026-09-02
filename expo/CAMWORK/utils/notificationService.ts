/**
 * NOTIFICATION CENTER
 * Mock service for managing notifications
 */

import { Notification, NotificationType } from "@/types/domain";

let notificationStore: Notification[] = [];
let notificationId = 1;

/**
 * Create a new notification
 */
export const createNotification = (
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: { [key: string]: any },
): Notification => {
  const notification: Notification = {
    id: `notif_${notificationId++}`,
    userId,
    type,
    title,
    body,
    isRead: false,
    data,
    createdAt: new Date(),
  };

  notificationStore.push(notification);
  return notification;
};

/**
 * Get all notifications for a user
 */
export const getUserNotifications = (userId: string): Notification[] => {
  return notificationStore
    .filter((n) => n.userId === userId)
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = (userId: string): number => {
  return notificationStore.filter((n) => n.userId === userId && !n.isRead)
    .length;
};

/**
 * Mark a notification as read
 */
export const markAsRead = (notificationId: string): Notification | null => {
  const notification = notificationStore.find((n) => n.id === notificationId);
  if (notification) {
    notification.isRead = true;
  }
  return notification || null;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = (userId: string): void => {
  notificationStore.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
};

/**
 * Delete a notification
 */
export const deleteNotification = (notificationId: string): void => {
  notificationStore = notificationStore.filter((n) => n.id !== notificationId);
};

/**
 * Clear all notifications for a user
 */
export const clearAllNotifications = (userId: string): void => {
  notificationStore = notificationStore.filter((n) => n.userId !== userId);
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    job_match: "💼",
    application_status: "📋",
    message: "💬",
    verification_update: "✅",
    vouch_request: "🤝",
    rating_received: "⭐",
    direct_offer: "🎯",
    payment_confirmation: "💳",
    video_call: "📞",
  };
  return iconMap[type] || "🔔";
};

/**
 * Get notification color based on type
 */
export const getNotificationColor = (type: NotificationType): string => {
  const colorMap: Record<NotificationType, string> = {
    job_match: "#007A3D", // Primary green
    application_status: "#2563eb", // Blue
    message: "#7c3aed", // Purple
    verification_update: "#15803d", // Success green
    vouch_request: "#f59e0b", // Amber/gold
    rating_received: "#f59e0b", // Gold
    direct_offer: "#06b6d4", // Cyan
    payment_confirmation: "#15803d", // Success green
    video_call: "#2563eb", // Blue
  };
  return colorMap[type] || "#64748b";
};
