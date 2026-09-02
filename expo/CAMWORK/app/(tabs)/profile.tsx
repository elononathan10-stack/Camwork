import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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
  Bookmark,
  Camera,
  Check,
  X,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, updateProfile, skills, workHistory, reviews, savedJobIds } =
    useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isEn = language === "EN";

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Error picking photo:", e);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedPhotoUri) return;
    setIsSavingPhoto(true);
    try {
      await updateProfile({ avatar: selectedPhotoUri });
      setIsSavingPhoto(false);
      setIsPhotoModalOpen(false);
      setSelectedPhotoUri(null);
      Alert.alert(
        isEn ? "Photo Saved" : "Photo enregistrée",
        isEn
          ? "Your profile picture has been updated!"
          : "Votre photo de profil a été mise à jour !",
      );
    } catch (e) {
      setIsSavingPhoto(false);
      Alert.alert(
        isEn ? "Error" : "Erreur",
        isEn
          ? "Failed to save profile picture."
          : "Échec de l'enregistrement de la photo.",
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
              <TouchableOpacity
                style={styles.avatarEditBadge}
                onPress={() => {
                  setSelectedPhotoUri(null);
                  setIsPhotoModalOpen(true);
                }}
                activeOpacity={0.85}
              >
                <Camera size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{user?.name || "Your name"}</Text>
            <Text style={styles.headline}>
              {user?.headline || (isEn ? "Add a professional headline" : "Ajoutez un titre professionnel")}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <MapPin size={13} color={theme.colors.primary} />
                <Text style={styles.metaPillText}>
                  {user?.location || (isEn ? "Add your location" : "Ajouter votre ville")}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.metaPillText}>
                  {user?.rating || 0} ({user?.reviewCount || 0}{" "}
                  {isEn ? "Reviews" : "Avis"})
                </Text>
              </View>
            </View>

            {/* Edit Profile Action Button */}
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.85}
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

        {/* Quick Nav Hub Shortcuts: Verification, Vouching, Favorites */}
        <View style={styles.hubGrid}>
          {/* Favorites Hub Card */}
          <TouchableOpacity
            style={styles.hubCard}
            onPress={() => router.push("/favorites")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.hubIconCircle,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Bookmark size={20} color={theme.colors.primary} fill={theme.colors.primary} />
            </View>
            <Text style={styles.hubTitle}>
              {isEn ? "Favorite Jobs" : "Offres favorites"}
            </Text>
            <Text style={styles.hubSub}>
              {savedJobIds.length} {isEn ? "Saved" : "Offres"}
            </Text>
          </TouchableOpacity>

          {/* Verification Hub Card */}
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
              {user?.isVerified ? "Verified ✅" : isEn ? "Upload ID" : "Vérifier ID"}
            </Text>
          </TouchableOpacity>

          {/* Vouching Hub Card */}
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
              {isEn ? "Vouches" : "Parrainages"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.profile.aboutMe}</Text>
          <Text style={styles.bioText}>
            {user?.bio || (isEn ? "Add a short description about your experience." : "Ajoutez une courte description de votre expérience.")}
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

        {/* Section: Work History */}
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

        {/* Section: Ratings & References */}
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
                  {isEn ? "Verified for" : "Certifié pour"}:{" "}
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

      {/* Profile Picture Modal with Save Button */}
      <Modal
        visible={isPhotoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEn ? "Update Profile Picture" : "Photo de profil"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsPhotoModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalAvatarPreview}>
              {selectedPhotoUri || user?.avatar ? (
                <Image
                  source={{ uri: selectedPhotoUri || user?.avatar }}
                  style={styles.modalAvatarImage}
                />
              ) : (
                <View style={styles.modalAvatarPlaceholder}>
                  <User size={48} color={theme.colors.primary} />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalChooseBtn}
              onPress={handlePickPhoto}
              activeOpacity={0.85}
            >
              <Camera size={18} color={theme.colors.primary} />
              <Text style={styles.modalChooseBtnText}>
                {isEn ? "Choose from Gallery" : "Choisir dans la galerie"}
              </Text>
            </TouchableOpacity>

            {selectedPhotoUri && (
              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  isSavingPhoto && styles.modalSaveBtnDisabled,
                ]}
                onPress={handleSavePhoto}
                disabled={isSavingPhoto}
                activeOpacity={0.85}
              >
                {isSavingPhoto ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Check size={18} color="#ffffff" strokeWidth={2.5} />
                    <Text style={styles.modalSaveBtnText}>
                      {isEn ? "Save Profile Picture" : "Enregistrer la photo"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: {
    padding: 16,
    gap: 16,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
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
  avatarEditBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    width: 28,
    height: 28,
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
    gap: 10,
  },
  hubCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  hubIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  hubTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.text,
  },
  hubSub: {
    fontSize: 11,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    gap: 16,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  modalAvatarPreview: {
    marginVertical: 8,
  },
  modalAvatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  modalAvatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  modalChooseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
  },
  modalChooseBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  modalSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
  },
  modalSaveBtnDisabled: {
    opacity: 0.6,
  },
  modalSaveBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
