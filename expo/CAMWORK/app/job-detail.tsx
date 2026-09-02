import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Star,
  Sparkles,
  Building2,
  ArrowRight,
  Check,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    jobs,
    savedJobIds,
    toggleSaveJob,
    applications,
    skills,
    user,
    startConversation,
  } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const job = jobs.find((j) => j.id === id) || jobs[0];
  const isSaved = savedJobIds.includes(job.id);
  const isAlreadyApplied = applications.some((a) => a.jobId === job.id);
  const isOwner =
    user?.email?.trim().toLowerCase() === job.postedBy?.trim().toLowerCase();

  const seekerSkillNames = skills.map((s) => s.name.toLowerCase());

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this job opportunity on CamWork: ${job.title} at ${job.company} (${job.location})`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyPress = () => {
    if (user?.role === "employer") {
      startConversation(job.company, job.company, job.title, job.postedBy).then(
        (conversationId) =>
          router.push({
            pathname: "/chat-thread",
            params: { id: conversationId },
          }),
      );
      return;
    }
    router.push({
      pathname: "/apply-job",
      params: { id: job.id },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {job.company}
        </Text>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Share2 size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => toggleSaveJob(job.id)}
          >
            <Bookmark
              size={20}
              color={isSaved ? theme.colors.primary : theme.colors.text}
              fill={isSaved ? theme.colors.primary : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.companyRow}>
            <View style={styles.companyLogo}>
              <Text style={styles.logoText}>{job.company.charAt(0)}</Text>
            </View>
            <View style={styles.companyInfo}>
              <View style={styles.companyNameRow}>
                <Text style={styles.companyName}>{job.company}</Text>
                {job.employerVerified && (
                  <ShieldCheck size={16} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.ratingRow}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>
                  {job.rating} ({job.reviewCount} reviews)
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.jobTitle}>{job.title}</Text>

          {/* Tag Pills */}
          <View style={styles.tagGrid}>
            <View style={styles.tagItem}>
              <MapPin size={14} color={theme.colors.primary} />
              <Text style={styles.tagText}>{job.location}</Text>
            </View>
            <View style={styles.tagItem}>
              <Briefcase size={14} color={theme.colors.primary} />
              <Text style={styles.tagText}>
                {job.type === "Gig" ? t.common.gig : t.common.formal}
              </Text>
            </View>
            <View style={styles.tagItem}>
              <Clock size={14} color={theme.colors.primary} />
              <Text style={styles.tagText}>
                {job.contractDuration || "Full-time"}
              </Text>
            </View>
          </View>

          {/* Salary Banner */}
          <View style={styles.salaryBanner}>
            <View>
              <Text style={styles.salaryLabel}>{t.jobDetail.salary}</Text>
              <Text style={styles.salaryValue}>{job.salary}</Text>
            </View>
            <View style={styles.matchScorePill}>
              <Sparkles size={14} color={theme.colors.primary} />
              <Text style={styles.matchScoreText}>{job.matchScore}% Match</Text>
            </View>
          </View>
        </View>

        {/* Section 1: About Role & Responsibilities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>{t.jobDetail.aboutRole}</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>

          <Text style={[styles.sectionSubHeading, { marginTop: 16 }]}>
            {t.jobDetail.responsibilities}
          </Text>
          <View style={styles.bulletList}>
            {job.responsibilities.map((resp, i) => (
              <View key={i} style={styles.bulletItem}>
                <CheckCircle2
                  size={16}
                  color={theme.colors.primary}
                  style={styles.bulletIcon}
                />
                <Text style={styles.bulletText}>{resp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 2: Requirements */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>{t.jobDetail.requirements}</Text>
          <View style={styles.bulletList}>
            {job.requirements.map((req, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={styles.dot} />
                <Text style={styles.bulletText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 3: Skills & Seeker Fit */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>
            {t.jobDetail.requiredSkills}
          </Text>
          <View style={styles.skillsTagWrap}>
            {job.skills.map((skill) => {
              const isMatched = seekerSkillNames.some(
                (sn) =>
                  sn.includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(sn),
              );
              return (
                <View
                  key={skill}
                  style={[
                    styles.skillTagBadge,
                    isMatched && styles.skillTagBadgeMatched,
                  ]}
                >
                  {isMatched && <Check size={12} color="#ffffff" />}
                  <Text
                    style={[
                      styles.skillTagBadgeText,
                      isMatched && styles.skillTagBadgeTextMatched,
                    ]}
                  >
                    {skill}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Section 4: Employer Trust Preview */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>{t.jobDetail.aboutCompany}</Text>
          <View style={styles.employerTrustRow}>
            <Building2 size={24} color={theme.colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.trustTitle}>CamWork Verified Employer</Text>
              <Text style={styles.trustSub}>
                Registered enterprise with verified business registration
                (RCCM/NIU).
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Action Footer */}
      <View style={styles.floatingFooter}>
        {isOwner && (
          <TouchableOpacity
            style={styles.editPostButton}
            onPress={() =>
              router.push({ pathname: "/post-job", params: { id: job.id } })
            }
          >
            <Text style={styles.editPostText}>Edit post</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.applyMainBtn,
            isAlreadyApplied && styles.applyMainBtnDisabled,
          ]}
          onPress={handleApplyPress}
          disabled={isAlreadyApplied || isOwner}
          activeOpacity={0.9}
        >
          <Text style={styles.applyMainBtnText}>
            {isOwner
              ? "Your job post"
              : user?.role === "employer"
                ? "Contact service seeker"
                : isAlreadyApplied
                  ? t.jobDetail.appliedAlready
                  : t.jobDetail.applyNow}
          </Text>
          {!isAlreadyApplied && <ArrowRight size={20} color="#ffffff" />}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    maxWidth: 180,
  },
  navActions: {
    flexDirection: "row",
    gap: 8,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  companyInfo: {
    flex: 1,
    gap: 3,
  },
  companyNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
  },
  salaryBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.primaryLight,
    padding: 14,
    borderRadius: 14,
  },
  salaryLabel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  matchScorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  sectionSubHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  bulletList: {
    gap: 10,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletIcon: {
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  skillsTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skillTagBadgeMatched: {
    backgroundColor: theme.colors.primary,
  },
  skillTagBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  skillTagBadgeTextMatched: {
    color: "#ffffff",
    fontWeight: "700",
  },
  employerTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 14,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  trustSub: {
    fontSize: 12,
    color: "#64748b",
  },
  floatingFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  editPostButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "#fff",
  },
  editPostText: { color: theme.colors.primary, fontWeight: "800" },
  applyMainBtn: {
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  applyMainBtnDisabled: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
  },
  applyMainBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
