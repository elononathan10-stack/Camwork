import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Bell, Briefcase, MessageSquare, Circle } from "lucide-react-native";
import { theme } from "./theme";

const NotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState("All");

  const notifications = [
    {
      id: "1",
      type: "job",
      title: "New Job Match",
      body: "A Senior Logistics role matches your profile.",
      time: "2h ago",
      unread: true,
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      body: "Orange HR sent you a message.",
      time: "5h ago",
      unread: true,
    },
    {
      id: "3",
      type: "system",
      title: "Profile Tip",
      body: "Complete your bio to get 2x more views.",
      time: "Yesterday",
      unread: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {["All", "Unread"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.unread && styles.unreadCard]}
          >
            <View style={styles.iconContainer}>
              {item.type === "job" ? (
                <Briefcase size={20} color={theme.colors.primary} />
              ) : item.type === "message" ? (
                <MessageSquare size={20} color="#3b82f6" />
              ) : (
                <Bell size={20} color="#64748b" />
              )}
            </View>
            <View style={styles.body}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            {item.unread && (
              <Circle
                size={8}
                fill={theme.colors.primary}
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: "bold", color: theme.colors.text },
  markRead: { color: theme.colors.primary, fontSize: 13, fontWeight: "600" },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  activeTab: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  activeTabText: { color: "#ffffff" },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    gap: 12,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  notifTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.text },
  notifBody: { fontSize: 13, color: "#64748b" },
  time: { fontSize: 11, color: "#94a3b8" },
});

export default NotificationsScreen;
