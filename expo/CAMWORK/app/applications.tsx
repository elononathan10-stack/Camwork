import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, ApplicationItem } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

type TabFilter = "All" | "Pending" | "Reviewed" | "Interviews" | "Accepted" | "Rejected";

export default function ApplicationsScreen() {
  const { applications } = useUser();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabFilter>("All");

  const tabs: Array<{ key: TabFilter; label: string }> = [
    { key: "All", label: t.applications.tabs.all },
    { key: "Pending", label: t.applications.tabs.pending },
    { key: "Reviewed", label: t.applications.tabs.reviewed },
    { key: "Interviews", label: t.applications.tabs.interviews },
    { key: "Accepted", label: t.applications.tabs.accepted },
    { key: "Rejected", label: t.applications.tabs.rejected },
  ];

  const filteredApps = applications.filter((app) => {
    if (activeTab === "All") return true;
    return app.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return {
          bg: theme.colors.successLight,
          text: theme.colors.success,
          icon: CheckCircle2,
        };
      case "Interviews":
        return {
          bg: theme.colors.purpleLight,
          text: theme.colors.purple,
          icon: Sparkles,
        };
      case "Reviewed":
        return {
          bg: theme.colors.infoLight,
          text: theme.colors.info,
          icon: Clock,
        };
      case "Rejected":
        return {
          bg: theme.colors.errorLight,
          text: theme.colors.error,
          icon: XCircle,
        };
      default:
        return {
          bg: theme.colors.accentLight,
          text: theme.colors.accentDark,
          icon: Clock,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.navTitle}>{t.applications.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Horizontal Status Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const count =
              tab.key === "All"
                ? applications.length
                : applications.filter((a) => a.status === tab.key).length;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const IconComp = badge.icon;
          return (
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardTop}>
                <View style={styles.companyIconCircle}>
                  <Text style={styles.companyInitial}>
                    {item.companyName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {item.jobTitle}
                  </Text>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.companyName} • {item.location}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <IconComp size={12} color={badge.text} />
                  <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Next Step / Status Timeline snippet */}
              {item.nextStep && (
                <View style={styles.nextStepBox}>
                  <Text style={styles.nextStepLabel}>
                    {t.applications.statusTimeline}:
                  </Text>
                  <Text style={styles.nextStepText}>{item.nextStep}</Text>
                </View>
              )}

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.dateWrap}>
                  <Calendar size={13} color="#94a3b8" />
                  <Text style={styles.dateText}>
                    {t.applications.appliedOn} {item.appliedDate}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => router.push("/(tabs)/messages")}
                >
                  <MessageSquare size={14} color={theme.colors.primary} />
                  <Text style={styles.chatBtnText}>
                    {t.applications.contactEmployer}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.applications.emptyTitle}</Text>
            <Text style={styles.emptySub}>{t.applications.emptySub}</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabBtnTextActive: {
    color: "#ffffff",
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  companyInitial: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  companyName: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  nextStepBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    gap: 2,
  },
  nextStepLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  nextStepText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
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
    textAlign: "center",
    maxWidth: 260,
  },
});
