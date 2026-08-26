import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  User,
  ShieldCheck,
  Star,
  MapPin,
  Edit3,
  Award,
  Users,
  Gift,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, skills, workHistory, reviews } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <Text style={styles.screenTitle}>{t.profile.title}</Text>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => router.push("/settings")}
          >
            <Settings size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <User size={34} color={theme.colors.primary} />
                </View>
              )}
              {user?.isVerified && (
                <View style={styles.verifiedBadgeCircle}>
                  <ShieldCheck size={14} color="#ffffff" />
                </View>
              )}
            </View>

            <Text style={styles.name}>{user?.name || "Your name"}</Text>
            <Text style={styles.headline}>
              {user?.headline || "Add a professional headline"}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <MapPin size={13} color={theme.colors.primary} />
                <Text style={styles.metaPillText}>
                  {user?.location || "Add your location"}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.metaPillText}>
                  {user?.rating || 0} ({user?.reviewCount || 0}{" "}
                  {language === "EN" ? "Reviews" : "Avis"})
                </Text>
              </View>
            </View>

            {/* Edit Profile Action Button */}
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push("/edit-profile")}
            >
              <Edit3 size={16} color={theme.colors.primary} />
              <Text style={styles.editProfileBtnText}>
                {t.profile.editProfileBtn}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.completenessBox}>
            <View style={styles.completenessHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Sparkles size={14} color={theme.colors.primary} />
                <Text style={styles.completenessTitle}>
                  {t.profile.profileCompleteness}
                </Text>
              </View>
              <Text style={styles.completenessPercent}>
                {user?.isProfileComplete ? "100%" : "0%"}
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: user?.isProfileComplete ? "100%" : "0%" },
                ]}
              />
            </View>
            <Text style={styles.completenessSub}>
              {t.profile.completeProfileTip}
            </Text>
          </View>
        </View>

        {/* Quick Nav Hub Shortcuts */}
        <View style={styles.hubGrid}>
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push("/verification")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.hubIconCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Award size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.hubTitle}>{t.profile.verificationSection}</Text>
            <Text style={styles.hubSub}>
              {user?.isVerified ? "Verified ✅" : "Upload ID"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push("/community-vouching")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.hubIconCircle,
                { backgroundColor: theme.colors.accentLight },
              ]}
            >
              <Users size={20} color={theme.colors.accentDark} />
            </View>
            <Text style={styles.hubTitle}>{t.profile.vouchingSection}</Text>
            <Text style={styles.hubSub}>
              {user?.vouchCount || 0}{" "}
              {language === "EN" ? "Vouches" : "Parrainages"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.profile.aboutMe}</Text>
          <Text style={styles.bioText}>
            {user?.bio || "Add a short description about your experience."}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.profile.skills}</Text>
            <TouchableOpacity
              style={styles.editSkillsBtn}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.editSkillsBtnText}>
                {t.profile.editSkillsBtn}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.skillChipsWrap}>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.skillChip}>
                <Text style={styles.skillChipName}>{skill.name}</Text>
                {skill.level && (
                  <Text style={styles.skillChipLevel}>• {skill.level}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Section: Work History / Portable Reputation */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.profile.workHistory}</Text>
            <TouchableOpacity onPress={() => router.push("/edit-profile")}>
              <Text style={styles.addHistoryLink}>
                {t.profile.addWorkHistory}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timelineList}>
            {workHistory.map((item, idx) => (
              <View key={item.id} style={styles.timelineItem}>
                {idx < workHistory.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
                <View style={styles.timelineDot} />
                <View style={styles.timelineBody}>
                  <View style={styles.timelineHeaderRow}>
                    <Text style={styles.timelineJobTitle}>{item.title}</Text>
                    {item.verifiedByEmployer && (
                      <View style={styles.verifiedChip}>
                        <ShieldCheck size={11} color={theme.colors.primary} />
                        <Text style={styles.verifiedChipText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.timelineCompany}>
                    {item.company} • {item.location} ({item.period})
                  </Text>
                  <Text style={styles.timelineDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Section: Ratings & Employer References */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.profile.ratingsTitle}</Text>
          <View style={styles.reviewsList}>
            {reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewerName}>{rev.employerName}</Text>
                    <Text style={styles.reviewerCompany}>
                      {rev.companyName}
                    </Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingPillText}>{rev.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>
                  &quot;{rev.comment}&quot;
                </Text>
                <Text style={styles.verifiedRoleSub}>
                  {language === "EN" ? "Verified for" : "Certifié pour"}:{" "}
                  {rev.verifiedJobTitle}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings / Direct Offers Shortcuts */}
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/direct-offers")}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: theme.colors.accentLight },
              ]}
            >
              <Gift size={18} color={theme.colors.accentDark} />
            </View>
            <Text style={styles.menuTitle}>
              {t.profile.directOffersSection}
            </Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push("/settings")}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Settings size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.menuTitle}>{t.profile.settingsSection}</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 18, gap: 16 },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  settingsIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  profileHeaderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSection: {
    alignItems: "center",
    gap: 8,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  avatarEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  verifiedBadgeCircle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
  },
  headline: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 6,
    minHeight: 40,
    justifyContent: "center",
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.primary,
    flexShrink: 1,
    textAlign: "center",
  },
  completenessBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  completenessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completenessTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  completenessPercent: {
    fontSize: 13,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  progressBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  completenessSub: {
    fontSize: 11,
    color: "#64748b",
  },
  hubGrid: {
    flexDirection: "row",
    gap: 12,
  },
  hubCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  hubTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  hubSub: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeaderRow: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
  },
  editSkillsBtn: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  editSkillsBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  bioText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  skillChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  skillChipName: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  skillChipLevel: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  addHistoryLink: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  timelineList: {
    gap: 16,
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: "row",
    position: "relative",
    gap: 14,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: 16,
    bottom: -16,
    width: 2,
    backgroundColor: "#e2e8f0",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: theme.colors.primaryLight,
    marginTop: 2,
  },
  timelineBody: {
    flex: 1,
    gap: 2,
  },
  timelineHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  timelineJobTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
    flex: 1,
  },
  verifiedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  timelineCompany: {
    fontSize: 12,
    color: "#64748b",
  },
  timelineDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginTop: 2,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  reviewerCompany: {
    fontSize: 11,
    color: "#64748b",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400e",
  },
  reviewComment: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 18,
  },
  verifiedRoleSub: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
});
