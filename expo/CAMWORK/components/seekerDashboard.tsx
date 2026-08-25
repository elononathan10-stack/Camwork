import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  Briefcase,
  Clock,
  CheckCircle,
  ChevronRight,
  Star,
  Bell,
  Search,
  MapPin,
  Sparkles,
  Bookmark,
  ShieldCheck,
  Zap,
  Gift,
  Eye,
  TrendingUp,
  User,
} from "lucide-react-native";
import { theme } from "./theme";
import { useUser, JobListing } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

const SeekerDashboard: React.FC = () => {
  const {
    user,
    applications,
    directOffers,
    savedJobIds,
    toggleSaveJob,
    notifications,
    jobs,
  } = useUser();
  const { language, t } = useLanguage();

  const unreadNotifs = notifications.filter((n) => n.unread).length;
  const priorityJob = jobs.find((j) => j.isPriorityMatch) || jobs[0];
  const recommendedJobs = jobs.filter((j) => j.id !== priorityJob?.id);

  // Status color mapping helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return { bg: theme.colors.successLight, text: theme.colors.success };
      case "Interviews":
        return { bg: theme.colors.purpleLight, text: theme.colors.purple };
      case "Reviewed":
        return { bg: theme.colors.infoLight, text: theme.colors.info };
      case "Rejected":
        return { bg: theme.colors.errorLight, text: theme.colors.error };
      default:
        return { bg: theme.colors.accentLight, text: theme.colors.accentDark };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header: Seeker Snippet + Notifications */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.profileSnippet}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <User size={24} color={theme.colors.primary} />
                </View>
              )}
              {user?.isVerified && (
                <View style={styles.verifiedDot}>
                  <ShieldCheck size={12} color="#ffffff" />
                </View>
              )}
            </View>
            <View style={styles.greetingWrap}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user?.name || "Your name"}</Text>
                {user?.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userHeadline} numberOfLines={1}>
                {user?.headline || "Complete your profile"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/notifications")}
            activeOpacity={0.8}
          >
            <Bell size={22} color={theme.colors.text} />
            {unreadNotifs > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifs}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/post-job")}
            activeOpacity={0.8}
          >
            <Briefcase size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Search Bar Shortcut */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.8}
        >
          <Search size={20} color="#94a3b8" />
          <Text style={styles.searchPlaceholder}>
            {t.home.searchPlaceholder}
          </Text>
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>{t.common.filter}</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Grid (4 Cards) */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/applications")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Briefcase size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.statNumber}>{applications.length}</Text>
            <Text style={styles.statLabel}>{t.home.statApplied}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/applications")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.colors.purpleLight },
              ]}
            >
              <Clock size={20} color={theme.colors.purple} />
            </View>
            <Text style={styles.statNumber}>
              {applications.filter((app) => app.status === "Interviews").length}
            </Text>
            <Text style={styles.statLabel}>{t.home.statInterviews}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push("/direct-offers")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.colors.accentLight },
              ]}
            >
              <Gift size={20} color={theme.colors.accentDark} />
            </View>
            <Text style={styles.statNumber}>{directOffers.length}</Text>
            <Text style={styles.statLabel}>{t.home.statOffers}</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.colors.infoLight },
              ]}
            >
              <Eye size={20} color={theme.colors.info} />
            </View>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>{t.home.statViews}</Text>
          </View>
        </View>

        {/* Priority Match Banner */}
        {priorityJob && (
          <View style={styles.priorityMatchCard}>
            <View style={styles.priorityGlow} />
            <View style={styles.priorityHeader}>
              <View style={styles.priorityBadge}>
                <Sparkles size={14} color="#ffffff" />
                <Text style={styles.priorityBadgeText}>
                  {priorityJob.matchScore}% {t.home.priorityMatchBadge}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleSaveJob(priorityJob.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bookmark
                  size={20}
                  color="#ffffff"
                  fill={
                    savedJobIds.includes(priorityJob.id)
                      ? "#ffffff"
                      : "transparent"
                  }
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.priorityTitle}>{priorityJob.title}</Text>
            <Text style={styles.priorityCompany}>
              {priorityJob.company} • {priorityJob.location}
            </Text>

            <View style={styles.priorityTagsRow}>
              <View style={styles.priorityPill}>
                <Text style={styles.priorityPillText}>
                  {priorityJob.salary}
                </Text>
              </View>
              <View style={styles.priorityPill}>
                <Text style={styles.priorityPillText}>{priorityJob.type}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.priorityApplyBtn}
              onPress={() =>
                router.push({
                  pathname: "/job-detail",
                  params: { id: priorityJob.id },
                })
              }
              activeOpacity={0.9}
            >
              <Text style={styles.priorityApplyText}>{t.home.applyNow}</Text>
              <ChevronRight size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* "My Applications" Preview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.myApplications}</Text>
            <TouchableOpacity onPress={() => router.push("/applications")}>
              <Text style={styles.viewAllText}>{t.home.viewHistory}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.applicationsList}>
            {applications.slice(0, 2).map((app) => {
              const badge = getStatusBadge(app.status);
              return (
                <TouchableOpacity
                  key={app.id}
                  style={styles.appCard}
                  onPress={() => router.push("/applications")}
                  activeOpacity={0.8}
                >
                  <View style={styles.appIconCircle}>
                    <Briefcase size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.appInfo}>
                    <Text style={styles.appJobTitle} numberOfLines={1}>
                      {app.jobTitle}
                    </Text>
                    <Text style={styles.appCompany} numberOfLines={1}>
                      {app.companyName} • {app.location}
                    </Text>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                  >
                    <Text
                      style={[styles.statusBadgeText, { color: badge.text }]}
                    >
                      {app.status.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recommended Jobs List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.home.recommendedJobs}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.viewAllText}>{t.common.viewAll}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.jobsList}>
            {recommendedJobs.map((job) => {
              const isSaved = savedJobIds.includes(job.id);
              return (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() =>
                    router.push({
                      pathname: "/job-detail",
                      params: { id: job.id },
                    })
                  }
                  activeOpacity={0.85}
                >
                  <View style={styles.jobCardTop}>
                    <View style={styles.jobCompanyLogo}>
                      <Text style={styles.logoLetter}>
                        {job.company.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.jobHeaderInfo}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <Text style={styles.jobCompany} numberOfLines={1}>
                        {job.company}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleSaveJob(job.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Bookmark
                        size={20}
                        color={isSaved ? theme.colors.primary : "#94a3b8"}
                        fill={isSaved ? theme.colors.primary : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.jobMetaRow}>
                    <View style={styles.metaItem}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={styles.metaText}>{job.location}</Text>
                    </View>
                    <View
                      style={[
                        styles.jobTypePill,
                        job.type === "Gig"
                          ? { backgroundColor: theme.colors.accentLight }
                          : { backgroundColor: theme.colors.primaryLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.jobTypePillText,
                          job.type === "Gig"
                            ? { color: theme.colors.accentDark }
                            : { color: theme.colors.primary },
                        ]}
                      >
                        {job.type === "Gig" ? t.common.gig : t.common.formal}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobCardBottom}>
                    <Text style={styles.jobSalary}>{job.salary}</Text>
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>{job.rating}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 20,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileSnippet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  greetingWrap: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  userHeadline: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#94a3b8",
  },
  filterChip: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  priorityMatchCard: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  priorityGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  priorityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  priorityTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  priorityCompany: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 14,
  },
  priorityTagsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  priorityPill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priorityPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  priorityApplyBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  priorityApplyText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  applicationsList: {
    gap: 10,
  },
  appCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  appIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  appInfo: {
    flex: 1,
    gap: 3,
  },
  appJobTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  appCompany: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  jobCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  jobCompanyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  jobHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  jobCompany: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  jobMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
  },
  jobTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  jobTypePillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  jobCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400e",
  },
});

export default SeekerDashboard;
