/**
 * NOTIFICATION CENTER UI
 * Displays and manages notifications with mark as read functionality
 */

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import {
  Bell,
  X,
  Trash2,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FileText,
} from "lucide-react-native";
import { theme } from "./theme";
import { Notification, NotificationType } from "@/types/domain";
import { getNotificationColor } from "@/utils/notificationService";

export interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notificationId: string) => void;
  onClearAll?: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "job_match":
      return "💼";
    case "application_status":
      return "📋";
    case "message":
      return "💬";
    case "verification_update":
      return "✅";
    case "vouch_request":
      return "🤝";
    case "rating_received":
      return "⭐";
    case "direct_offer":
      return "🎯";
    case "payment_confirmation":
      return "💳";
    case "video_call":
      return "📞";
    default:
      return "🔔";
  }
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(date).toLocaleDateString();
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => onMarkAllAsRead?.()}
            style={styles.markAllBtn}
          >
            <Text style={styles.markAllBtnText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Unread Section */}
        {unreadNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unread</Text>
            <FlatList
              data={unreadNotifications}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.notificationCard,
                    styles.notificationCardUnread,
                  ]}
                  onPress={() => onMarkAsRead?.(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.notifIcon}>
                    <Text style={styles.icon}>
                      {getNotificationIcon(item.type)}
                    </Text>
                  </View>

                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifTime}>
                        {getRelativeTime(new Date(item.createdAt))}
                      </Text>
                    </View>
                    <Text style={styles.notifBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>

                  <View style={styles.notifActions}>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Delete Notification",
                          "Remove this notification?",
                          [
                            { text: "Cancel" },
                            {
                              text: "Delete",
                              onPress: () => onDelete?.(item.id),
                              style: "destructive",
                            },
                          ],
                        );
                      }}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.unreadDot} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              We&apos;ll notify you when something happens
            </Text>
          </View>
        )}

        {/* Read Section */}
        {readNotifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.readSectionHeader}>
              <Text style={styles.sectionTitle}>Earlier</Text>
              {readNotifications.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Clear All", "Remove all read notifications?", [
                      { text: "Cancel" },
                      {
                        text: "Clear",
                        onPress: () => onClearAll?.(),
                        style: "destructive",
                      },
                    ]);
                  }}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={readNotifications.slice(0, 10)}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.notificationCard}>
                  <View style={styles.notifIcon}>
                    <Text style={styles.icon}>
                      {getNotificationIcon(item.type)}
                    </Text>
                  </View>

                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={[styles.notifTitle, styles.readText]}>
                        {item.title}
                      </Text>
                      <Text style={styles.notifTime}>
                        {getRelativeTime(new Date(item.createdAt))}
                      </Text>
                    </View>
                    <Text
                      style={[styles.notifBody, styles.readText]}
                      numberOfLines={2}
                    >
                      {item.body}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Delete Notification",
                        "Remove this notification?",
                        [
                          { text: "Cancel" },
                          {
                            text: "Delete",
                            onPress: () => onDelete?.(item.id),
                            style: "destructive",
                          },
                        ],
                      );
                    }}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.accent,
    marginTop: 2,
    fontWeight: "600",
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  readSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.error,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.card,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: theme.radius.md,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  notificationCardUnread: {
    backgroundColor: theme.colors.primaryLight,
    borderLeftColor: theme.colors.primary,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 122, 61, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  notifTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  notifBody: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  readText: {
    opacity: 0.6,
  },
  notifActions: {
    marginLeft: 8,
    paddingVertical: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: 12,
    marginTop: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
