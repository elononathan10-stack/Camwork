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
  Image,
} from "react-native";
import { router } from "expo-router";
import {
  User,
  MapPin,
  Clock,
  Sparkles,
  Check,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Camera,
  Briefcase,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";
import * as ImagePicker from "expo-image-picker";

const CITIES = [
  "Douala, Littoral",
  "Yaoundé, Centre",
  "Bafoussam, Ouest",
  "Garoua, Nord",
  "Bamenda, Nord-Ouest",
  "Kribi, Sud",
  "Limbe / Buea, Sud-Ouest",
  "Ngaoundéré, Adamaoua",
];

const AVAILABILITY_OPTIONS: Array<
  "Full-time" | "Part-time" | "Gig / Daily" | "Contract"
> = ["Full-time", "Part-time", "Gig / Daily", "Contract"];

const SUGGESTED_SKILLS = [
  "Logistics & Supply Chain",
  "Douala Port Customs",
  "Fleet Management",
  "Solar PV Installation",
  "Electrical Wiring",
  "Heavy Machinery Repair",
  "React Native / Mobile",
  "B2B Sales & Distribution",
  "Civil Construction",
  "Inventory & ERP",
  "Welding & Fabrication",
  "Bilingual (EN / FR)",
];

export default function ProfileSetupWizard() {
  const { language, t } = useLanguage();
  const { user, updateProfile, addSkill } = useUser();

  const [step, setStep] = useState(1);
  const [headline, setHeadline] = useState(user?.headline || "");
  const [selectedCity, setSelectedCity] = useState(user?.location || "");
  const [availability, setAvailability] = useState<
    "Full-time" | "Part-time" | "Gig / Daily" | "Contract"
  >(user?.availability || "Full-time");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [bio, setBio] = useState(user?.bio || "");
  const [expectedRate, setExpectedRate] = useState(user?.expectedRate || "");

  const changePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) await updateProfile({ avatar: result.assets[0].uri });
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (
      customSkillInput.trim() &&
      !selectedSkills.includes(customSkillInput.trim())
    ) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput("");
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    // Save all wizard data to user profile context
    await updateProfile({
      headline,
      location: selectedCity,
      availability: availability,
      bio,
      expectedRate: expectedRate,
      isProfileComplete: Boolean(
        headline.trim() && selectedCity && bio.trim() && selectedSkills.length,
      ),
    });

    for (const skill of selectedSkills) {
      await addSkill(skill);
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Top Progress & Step Counter */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={
                step === 1 ? () => router.replace("/(tabs)") : handlePrev
              }
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.stepProgressWrap}>
              <Text style={styles.stepCounter}>
                {language === "EN"
                  ? `Step ${step} of 4`
                  : `Étape ${step} sur 4`}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${(step / 4) * 100}%` },
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity onPress={handleFinish}>
              <Text style={styles.skipText}>{t.wizard.skipBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* Step Content */}
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: Avatar & Professional Headline */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{t.wizard.step1Title}</Text>
                  <Text style={styles.stepSub}>{t.wizard.step1Sub}</Text>
                </View>

                {/* Avatar Preview */}
                <View style={styles.avatarSection}>
                  <View style={styles.avatarWrap}>
                    {user?.avatar ? (
                      <Image
                        source={{ uri: user.avatar }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={[styles.avatarImage, styles.avatarEmpty]}>
                        <User size={36} color={theme.colors.primary} />
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.cameraBadge}
                      onPress={changePhoto}
                    >
                      <Camera size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.userName}>
                    {user?.name || "Your name"}
                  </Text>
                  <Text style={styles.userEmail}>
                    {user?.email || "Your email"}
                  </Text>
                </View>

                {/* Headline Input */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t.wizard.headlineLabel}
                  </Text>
                  <View style={styles.inputWrap}>
                    <Briefcase
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t.wizard.headlinePlaceholder}
                      style={styles.input}
                      placeholderTextColor="#94a3b8"
                      value={headline}
                      onChangeText={setHeadline}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2: Location & Availability */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{t.wizard.step2Title}</Text>
                  <Text style={styles.stepSub}>{t.wizard.step2Sub}</Text>
                </View>

                {/* Location Picker */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t.wizard.cityLabel}</Text>
                  <View style={styles.chipGrid}>
                    {CITIES.map((city) => (
                      <TouchableOpacity
                        key={city}
                        activeOpacity={0.8}
                        onPress={() => setSelectedCity(city)}
                        style={[
                          styles.chip,
                          selectedCity === city && styles.chipActive,
                        ]}
                      >
                        <MapPin
                          size={14}
                          color={
                            selectedCity === city
                              ? "#ffffff"
                              : theme.colors.primary
                          }
                        />
                        <Text
                          style={[
                            styles.chipText,
                            selectedCity === city && styles.chipTextActive,
                          ]}
                        >
                          {city}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Availability Picker */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t.wizard.availabilityLabel}
                  </Text>
                  <View style={styles.availGrid}>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => setAvailability(opt)}
                        style={[
                          styles.availCard,
                          availability === opt && styles.availCardActive,
                        ]}
                      >
                        <Clock
                          size={18}
                          color={
                            availability === opt
                              ? theme.colors.primary
                              : "#94a3b8"
                          }
                        />
                        <Text
                          style={[
                            styles.availText,
                            availability === opt && styles.availTextActive,
                          ]}
                        >
                          {opt}
                        </Text>
                        {availability === opt && (
                          <Check size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 3: Skills & Specialties */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{t.wizard.step3Title}</Text>
                  <Text style={styles.stepSub}>{t.wizard.step3Sub}</Text>
                </View>

                {/* Custom Skill Input */}
                <View style={styles.customSkillRow}>
                  <TextInput
                    placeholder={t.wizard.addSkillPlaceholder}
                    style={styles.customInput}
                    placeholderTextColor="#94a3b8"
                    value={customSkillInput}
                    onChangeText={setCustomSkillInput}
                    onSubmitEditing={handleAddCustomSkill}
                  />
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={handleAddCustomSkill}
                  >
                    <Plus size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Selected Skills Chips */}
                <Text style={styles.fieldLabel}>
                  {language === "EN"
                    ? "Selected Skills"
                    : "Compétences sélectionnées"}{" "}
                  ({selectedSkills.length})
                </Text>
                <View style={styles.selectedSkillsWrap}>
                  {selectedSkills.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={styles.selectedSkillChip}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text style={styles.selectedSkillText}>{skill}</Text>
                      <X size={14} color="#ffffff" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Suggested Skills */}
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                  {language === "EN"
                    ? "Suggested for Cameroon Market"
                    : "Recommandé sur le marché camerounais"}
                </Text>
                <View style={styles.suggestedSkillsWrap}>
                  {SUGGESTED_SKILLS.filter(
                    (s) => !selectedSkills.includes(s),
                  ).map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={styles.suggestedChip}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Plus size={14} color={theme.colors.primary} />
                      <Text style={styles.suggestedChipText}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* STEP 4: Bio & Expected Pay */}
            {step === 4 && (
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>{t.wizard.step4Title}</Text>
                  <Text style={styles.stepSub}>{t.wizard.step4Sub}</Text>
                </View>

                {/* Bio TextArea */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t.wizard.bioLabel}</Text>
                  <TextInput
                    placeholder={t.wizard.bioPlaceholder}
                    style={styles.textArea}
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={bio}
                    onChangeText={setBio}
                  />
                </View>

                {/* Rate Expectation */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t.wizard.rateLabel}</Text>
                  <View style={styles.inputWrap}>
                    <DollarSign
                      size={20}
                      color="#94a3b8"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t.wizard.ratePlaceholder}
                      style={styles.input}
                      placeholderTextColor="#94a3b8"
                      value={expectedRate}
                      onChangeText={setExpectedRate}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Nav Actions */}
          <View style={styles.bottomNav}>
            {step > 1 && (
              <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
                <ArrowLeft size={18} color={theme.colors.text} />
                <Text style={styles.prevBtnText}>{t.wizard.prevBtn}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.nextBtn, step === 1 && { flex: 1 }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {step === 4 ? t.wizard.finishBtn : t.wizard.nextBtn}
              </Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  stepProgressWrap: {
    flex: 1,
    marginHorizontal: 16,
    gap: 4,
    alignItems: "center",
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  scrollBody: {
    paddingVertical: 12,
  },
  stepContainer: {
    gap: 20,
  },
  stepHeader: {
    gap: 6,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  stepSub: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  avatarSection: {
    alignItems: "center",
    gap: 6,
    marginVertical: 8,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
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
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: "#64748b",
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: theme.colors.text },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  chipTextActive: {
    color: "#ffffff",
  },
  availGrid: {
    gap: 8,
  },
  availCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  availCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  availText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
    marginLeft: 12,
  },
  availTextActive: {
    color: theme.colors.primary,
  },
  customSkillRow: {
    flexDirection: "row",
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedSkillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedSkillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedSkillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  suggestedSkillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  suggestedChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  textArea: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    minHeight: 110,
  },
  bottomNav: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  nextBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    height: 54,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
