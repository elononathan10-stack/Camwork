import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image,
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
  FileText,
  Sparkles,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

export default function EditProfileScreen() {
  const { user, updateProfile, skills, addSkill, removeSkill } = useUser();
  const { language, t } = useLanguage();

  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [location, setLocation] = useState(
    user?.location || "Douala, Littoral",
  );
  const [expectedRate, setExpectedRate] = useState(user?.expectedRate || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [newSkillInput, setNewSkillInput] = useState("");

  const changePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) await updateProfile({ avatar: result.assets[0].uri });
  };

  const handleSave = async () => {
    await updateProfile({
      name,
      headline,
      location,
      expectedRate,
      bio,
    });
    Alert.alert(
      language === "EN" ? "Profile Updated" : "Profil mis à jour",
      language === "EN"
        ? "Your changes have been saved successfully."
        : "Vos modifications ont été enregistrées avec succès.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  const handleAddSkill = async () => {
    if (newSkillInput.trim()) {
      await addSkill(newSkillInput.trim());
      setNewSkillInput("");
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
        <Text style={styles.navTitle}>
          {language === "EN"
            ? "Edit Profile & Skills"
            : "Modifier Profil & Compétences"}
        </Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t.common.save}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Info Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {language === "EN"
                ? "Personal Details"
                : "Informations Personnelles"}
            </Text>
            <TouchableOpacity style={styles.photoRow} onPress={changePhoto}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.photo} />
              ) : (
                <User size={28} color={theme.colors.primary} />
              )}
              <Text style={styles.photoText}>
                {language === "EN"
                  ? "Change profile picture"
                  : "Changer la photo de profil"}
              </Text>
            </TouchableOpacity>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t.auth.fullName}</Text>
              <View style={styles.inputWrap}>
                <User size={18} color="#94a3b8" />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Jean Dupont"
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
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 36,
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
  photoRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  photo: { width: 52, height: 52, borderRadius: 26 },
  photoText: { color: theme.colors.primary, fontWeight: "700", fontSize: 14 },
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
