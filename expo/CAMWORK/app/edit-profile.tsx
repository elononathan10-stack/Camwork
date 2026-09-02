import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  ArrowLeft,
  Check,
  Plus,
  X,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  Camera,
  CheckCircle2,
  Sparkles,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { user, updateProfile, skills, addSkill, removeSkill } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isEn = language === "EN";

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [location, setLocation] = useState(
    user?.location || "Douala, Littoral",
  );
  const [expectedRate, setExpectedRate] = useState(user?.expectedRate || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [newSkillInput, setNewSkillInput] = useState("");

  // Profile Picture state
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoSavedSuccess, setPhotoSavedSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const choosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPendingPhotoUri(result.assets[0].uri);
        setPhotoSavedSuccess(false);
      }
    } catch (err) {
      console.error("Error picking photo:", err);
    }
  };

  const saveProfilePicture = async () => {
    if (!pendingPhotoUri) return;
    setIsSavingPhoto(true);
    try {
      await updateProfile({ avatar: pendingPhotoUri });
      setIsSavingPhoto(false);
      setPhotoSavedSuccess(true);
      setPendingPhotoUri(null);
      Alert.alert(
        isEn ? "Photo Saved" : "Photo enregistrée",
        isEn
          ? "Your profile picture has been updated successfully!"
          : "Votre photo de profil a été mise à jour avec succès !",
      );
    } catch (e) {
      setIsSavingPhoto(false);
      Alert.alert(
        isEn ? "Error" : "Erreur",
        isEn
          ? "Failed to save profile picture."
          : "Échec de l'enregistrement de la photo de profil.",
      );
    }
  };

  const handleSave = async () => {
    setIsSavingProfile(true);
    try {
      const updates: Record<string, string> = {
        name,
        headline,
        location,
        expectedRate,
        bio,
      };
      if (pendingPhotoUri) {
        updates.avatar = pendingPhotoUri;
      }
      await updateProfile(updates);
      setIsSavingProfile(false);
      Alert.alert(
        isEn ? "Profile Updated" : "Profil mis à jour",
        isEn
          ? "Your changes have been saved successfully."
          : "Vos modifications ont été enregistrées avec succès.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      setIsSavingProfile(false);
      Alert.alert(
        isEn ? "Error" : "Erreur",
        isEn
          ? "Failed to save profile changes."
          : "Impossible d'enregistrer les modifications.",
      );
    }
  };

  const handleAddSkill = async () => {
    if (newSkillInput.trim()) {
      await addSkill(newSkillInput.trim());
      setNewSkillInput("");
    }
  };

  const currentDisplayAvatar = pendingPhotoUri || user?.avatar;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Responsive Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {isEn ? "Edit Profile & Skills" : "Modifier Profil & Compétences"}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, isSavingProfile && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSavingProfile}
        >
          {isSavingProfile ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>{t.common.save}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 36 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Card with explicit Save Photo Button */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {isEn ? "Profile Picture" : "Photo de profil"}
            </Text>

            <View style={styles.avatarCardContent}>
              <View style={styles.avatarWrapper}>
                {currentDisplayAvatar ? (
                  <Image
                    source={{ uri: currentDisplayAvatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={38} color={theme.colors.primary} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.cameraBadge}
                  onPress={choosePhoto}
                  activeOpacity={0.8}
                >
                  <Camera size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.avatarActions}>
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={choosePhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.changePhotoBtnText}>
                    {isEn ? "Choose New Photo" : "Choisir une photo"}
                  </Text>
                </TouchableOpacity>

                {pendingPhotoUri && (
                  <TouchableOpacity
                    style={[
                      styles.savePhotoBtn,
                      isSavingPhoto && styles.savePhotoBtnDisabled,
                    ]}
                    onPress={saveProfilePicture}
                    disabled={isSavingPhoto}
                    activeOpacity={0.85}
                  >
                    {isSavingPhoto ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Check size={16} color="#ffffff" strokeWidth={2.5} />
                        <Text style={styles.savePhotoBtnText}>
                          {isEn ? "Save Photo" : "Enregistrer la photo"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {photoSavedSuccess && !pendingPhotoUri && (
                  <View style={styles.savedBadgeRow}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <Text style={styles.savedBadgeText}>
                      {isEn ? "Photo Saved" : "Photo enregistrée"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Personal Info Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {isEn ? "Personal Details" : "Informations Personnelles"}
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t.auth.fullName}</Text>
              <View style={styles.inputWrap}>
                <User size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jean Dupont"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t.wizard.headlineLabel}</Text>
              <View style={styles.inputWrap}>
                <Briefcase size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={headline}
                  onChangeText={setHeadline}
                  placeholder="Senior Logistics Planner"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t.wizard.cityLabel}</Text>
              <View style={styles.inputWrap}>
                <MapPin size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Douala, Littoral"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t.wizard.rateLabel}</Text>
              <View style={styles.inputWrap}>
                <DollarSign size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={expectedRate}
                  onChangeText={setExpectedRate}
                  placeholder="450,000 FCFA / month"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* Bio Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t.wizard.bioLabel}</Text>
            <TextInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder={t.wizard.bioPlaceholder}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Skills Management Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t.profile.skills}</Text>

            {/* Add skill input */}
            <View style={styles.addSkillRow}>
              <TextInput
                style={styles.addSkillInput}
                placeholder={t.wizard.addSkillPlaceholder}
                placeholderTextColor="#94a3b8"
                value={newSkillInput}
                onChangeText={setNewSkillInput}
                onSubmitEditing={handleAddSkill}
              />
              <TouchableOpacity
                style={styles.addSkillBtn}
                onPress={handleAddSkill}
              >
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Current Skills list */}
            <View style={styles.skillsListWrap}>
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{skill.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeSkill(skill.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  avatarCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 4,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarActions: {
    flex: 1,
    gap: 8,
  },
  changePhotoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignSelf: "flex-start",
  },
  changePhotoBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  savePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-start",
  },
  savePhotoBtnDisabled: {
    opacity: 0.6,
  },
  savePhotoBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  savedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  savedBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 110,
  },
  addSkillRow: {
    flexDirection: "row",
    gap: 8,
  },
  addSkillInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addSkillBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  skillsListWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  skillPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
