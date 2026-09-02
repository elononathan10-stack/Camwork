import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  CheckCheck,
  Gift,
  Circle,
  Users,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, NotificationItem } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotifTab = "all" | "jobs" | "messages" | "system";

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<NotifTab>("all");

  const tabs: Array<{ key: NotifTab; label: string }> = [
    { key: "all", label: t.notifications.tabs.all },
    { key: "jobs", label: t.notifications.tabs.jobs },
    { key: "messages", label: t.notifications.tabs.messages },
    { key: "system", label: t.notifications.tabs.system },
  ];

  const filteredNotifs = notifications.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "jobs") return item.type === "job" || item.type === "application";
    if (activeTab === "messages") return item.type === "message";
    if (activeTab === "system") return item.type === "verification" || item.type === "vouch";
    return true;
  });

  const handleNotificationPress = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    if (notif.targetScreen) {
      if (notif.targetScreen === "job-detail" && notif.targetId) {
        router.push({
          pathname: "/job-detail",
          params: { id: notif.targetId },
        });
      } else if (notif.targetScreen === "applications") {
        router.push("/applications");
      } else if (notif.targetScreen === "direct-offers") {
        router.push("/direct-offers");
      } else if (notif.targetScreen === "verification") {
        router.push("/verification");
      } else if (notif.targetScreen === "community-vouching") {
        router.push("/community-vouching");
      }
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "job":
      case "application":
        return <Briefcase size={20} color={theme.colors.primary} />;
      case "message":
        return <MessageSquare size={20} color="#2563eb" />;
      case "verification":
        return <ShieldCheck size={20} color={theme.colors.success} />;
      case "vouch":
        return <Users size={20} color={theme.colors.accentDark} />;
      default:
        return <Bell size={20} color="#64748b" />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t.notifications.title}</Text>
        <TouchableOpacity onPress={markAllAllNotificationsRead => markAllNotificationsRead()}>
          <Text style={styles.markAllReadText}>{t.notifications.markAllRead}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab.key && styles.tabBtnTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.unread && styles.cardUnread]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>{getNotifIcon(item.type)}</View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                {item.unread && (
                  <Circle
                    size={8}
                    fill={theme.colors.primary}
                    color={theme.colors.primary}
                  />
                )}
              </View>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.notifications.emptyTitle}</Text>
            <Text style={styles.emptySub}>{t.notifications.emptySub}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  markAllReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  tabBtnTextActive: {
    color: "#ffffff",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardUnread: {
    borderColor: theme.colors.primary,
    backgroundColor: "#ffffff",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  notifBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: "#94a3b8",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748b",
  },
});
