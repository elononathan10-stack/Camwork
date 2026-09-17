import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Send,
  Building2,
  Zap,
  Check,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CreateJobInput,
  PLATFORM_CONTACT_BLOCK_MESSAGE,
  useUser,
} from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  "Logistics & Transport",
  "Skilled Trades",
  "Technology",
  "Construction & Engineering",
  "Sales & Marketing",
  "Home Services",
  "Professional Services",
  "General",
];

export default function PostJobScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, jobs, createJob, updateJob } = useUser();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const isEn = language === "EN";

  const existingJob = id
    ? jobs.find(
        (job) =>
          job.id === id &&
          job.postedBy?.trim().toLowerCase() ===
            user?.email?.trim().toLowerCase(),
      )
    : undefined;
  const isEditing = Boolean(existingJob);
  // Both job seekers and employers can publish normal job offers.
  const isServiceRequest = false;

  const [title, setTitle] = useState(existingJob?.title || "");
  const [description, setDescription] = useState(
    existingJob?.description || "",
  );
  const [location, setLocation] = useState(existingJob?.location || "");
  const [category, setCategory] = useState(
    existingJob?.category || CATEGORIES[0],
  );
  const [jobType, setJobType] = useState<"Formal" | "Gig">(
    existingJob?.type || (isServiceRequest ? "Gig" : "Formal"),
  );
  const [contractDuration, setContractDuration] = useState(
    existingJob?.contractDuration || "",
  );
  const [salary, setSalary] = useState(existingJob?.salary || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!existingJob) return;
    setTitle(existingJob.title);
    setDescription(existingJob.description);
    setLocation(existingJob.location);
    setCategory(existingJob.category);
    setJobType(existingJob.type || "Formal");
    setContractDuration(existingJob.contractDuration || "");
    setSalary(existingJob.salary);
  }, [existingJob]);

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        isEn ? "Required fields" : "Champs requis",
        isEn
          ? "Add a job title and description before publishing."
          : "Ajoutez un titre et une description avant de publier.",
      );
      return;
    }
    setIsSaving(true);
    const job: CreateJobInput = {
      title: title.trim(),
      company: isServiceRequest
        ? user?.name || "Service seeker"
        : user?.name || "Employer",
      location: location.trim() || "Location not specified",
      category,
      type: jobType,
      contractDuration:
        contractDuration.trim() ||
        (jobType === "Formal" ? "Full-time CDI" : "Short-term / Project"),
      salary: salary.trim() || (isEn ? "Negotiable" : "À négocier"),
      description: description.trim(),
      responsibilities: [],
      requirements: [],
      skills: [],
    };
    try {
      if (isEditing && existingJob) {
        await updateJob(existingJob.id, job, existingJob.isServiceRequest);
      } else {
        await createJob(job, isServiceRequest);
      }
      setIsSaving(false);
      router.replace("/(tabs)/search");
    } catch (error) {
      setIsSaving(false);
      Alert.alert(
        "Listing blocked",
        error instanceof Error ? error.message : PLATFORM_CONTACT_BLOCK_MESSAGE,
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Responsive Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={21} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing
            ? isEn
              ? "Edit Job Post"
              : "Modifier l'offre"
            : isServiceRequest
              ? isEn
                ? "Request a Service"
                : "Demander un service"
              : isEn
                ? "Create a Job Offer"
                : "Créer une offre d'emploi"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 58 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 40 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {/* Banner Intro */}
          <View style={styles.intro}>
            {isServiceRequest ? (
              <Send size={22} color={theme.colors.primary} />
            ) : (
              <Briefcase size={22} color={theme.colors.primary} />
            )}
            <View style={styles.flex}>
              <Text style={styles.title}>
                {isEditing
                  ? isEn
                    ? "Update your listing"
                    : "Mettre à jour votre annonce"
                  : isServiceRequest
                    ? isEn
                      ? "Describe what you need"
                      : "Décrivez ce dont vous avez besoin"
                    : isEn
                      ? "Find the right talent"
                      : "Trouvez le bon candidat"}
              </Text>
              <Text style={styles.subtitle}>
                {isEditing
                  ? isEn
                    ? "Keep details accurate for applicants."
                    : "Gardez les informations précises pour les candidats."
                  : isServiceRequest
                    ? isEn
                      ? "Tell skilled professionals what service you are looking for."
                      : "Expliquez aux professionnels le travail ou service attendu."
                    : isEn
                      ? "Publish your job offer and get applications from verified workers."
                      : "Publiez votre offre et recevez des candidatures de professionnels vérifiés."}
              </Text>
            </View>
          </View>

          {/* Offer Type Selection (Formal vs Gig) */}
          <Text style={styles.label}>
            {isEn ? "Offer Category / Type *" : "Catégorie / Type d'offre *"}
          </Text>
          <View style={styles.typeSelectorRow}>
            {/* Formal Option */}
            <TouchableOpacity
              style={[
                styles.typeOptionCard,
                jobType === "Formal" && styles.typeOptionCardActive,
              ]}
              onPress={() => setJobType("Formal")}
              activeOpacity={0.85}
            >
              <View style={styles.typeHeaderRow}>
                <View
                  style={[
                    styles.typeIconWrap,
                    jobType === "Formal" && styles.typeIconWrapActive,
                  ]}
                >
                  <Building2
                    size={20}
                    color={
                      jobType === "Formal" ? "#ffffff" : theme.colors.primary
                    }
                  />
                </View>
                {jobType === "Formal" && (
                  <View style={styles.checkCircle}>
                    <Check size={12} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.typeOptionTitle,
                  jobType === "Formal" && styles.typeOptionTitleActive,
                ]}
              >
                {isEn ? "Formal Employment" : "Emploi Formel"}
              </Text>
              <Text style={styles.typeOptionSub}>
                {isEn
                  ? "Full-time / CDI / CDD / Long-term contract"
                  : "Temps plein / CDI / CDD / Contrat long"}
              </Text>
            </TouchableOpacity>

            {/* Gig Option */}
            <TouchableOpacity
              style={[
                styles.typeOptionCard,
                jobType === "Gig" && styles.typeOptionCardActive,
              ]}
              onPress={() => setJobType("Gig")}
              activeOpacity={0.85}
            >
              <View style={styles.typeHeaderRow}>
                <View
                  style={[
                    styles.typeIconWrap,
                    jobType === "Gig" && styles.typeIconWrapActive,
                  ]}
                >
                  <Zap
                    size={20}
                    color={
                      jobType === "Gig" ? "#ffffff" : theme.colors.accentDark
                    }
                  />
                </View>
                {jobType === "Gig" && (
                  <View style={styles.checkCircle}>
                    <Check size={12} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.typeOptionTitle,
                  jobType === "Gig" && styles.typeOptionTitleActive,
                ]}
              >
                {isEn ? "Gig / Freelance" : "Mission / Gig"}
              </Text>
              <Text style={styles.typeOptionSub}>
                {isEn
                  ? "Task-based / Short-term / Daily rate / Project"
                  : "Tâche ponctuelle / Courte durée / Tarif journalier"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Job Title */}
          <Text style={styles.label}>
            {isServiceRequest
              ? isEn
                ? "Service Needed *"
                : "Service requis *"
              : isEn
                ? "Job Title *"
                : "Intitulé du poste *"}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              isServiceRequest
                ? isEn
                  ? "e.g. Solar panel installation & wiring"
                  : "ex. Réparation et câblage de panneaux solaires"
                : isEn
                  ? "e.g. Senior Logistics & Fleet Planner"
                  : "ex. Responsable Logistique et Flotte"
            }
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          {/* Industry Category */}
          <Text style={styles.label}>
            {isEn ? "Industry Sector *" : "Secteur d'activité *"}
          </Text>
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === item && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Description */}
          <Text style={styles.label}>
            {isEn ? "Description *" : "Description détaillée *"}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={
              isEn
                ? "Describe the role, responsibilities, schedule, and expectations..."
                : "Décrivez la mission, les responsabilités, les horaires et vos attentes..."
            }
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          {/* Location */}
          <Text style={styles.label}>
            {isEn ? "Location / Region" : "Lieu / Région"}
          </Text>
          <View style={styles.inputRow}>
            <MapPin size={18} color="#94a3b8" />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder={
                isEn
                  ? "e.g. Douala, Littoral or Remote"
                  : "ex. Douala, Littoral ou Télétravail"
              }
              placeholderTextColor="#94a3b8"
              style={styles.rowInput}
            />
          </View>

          {/* Contract Duration */}
          <Text style={styles.label}>
            {isEn ? "Duration / Working Hours" : "Durée / Rythme"}
          </Text>
          <TextInput
            value={contractDuration}
            onChangeText={setContractDuration}
            placeholder={
              jobType === "Formal"
                ? isEn
                  ? "e.g. CDI Full-time (40h/week)"
                  : "ex. CDI Temps plein (40h/semaine)"
                : isEn
                  ? "e.g. 2-week project / Daily 8h"
                  : "ex. Projet de 2 semaines / Journalier"
            }
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          {/* Salary or Budget */}
          <Text style={styles.label}>
            {isServiceRequest
              ? isEn
                ? "Budget Offered"
                : "Budget proposé"
              : isEn
                ? "Salary / Rate"
                : "Salaire / Rémunération"}
          </Text>
          <TextInput
            value={salary}
            onChangeText={setSalary}
            placeholder={
              jobType === "Formal"
                ? "e.g. 350,000 - 500,000 FCFA / mo"
                : "e.g. 25,000 FCFA / day"
            }
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submit,
              (!title.trim() || !description.trim() || isSaving) &&
                styles.submitDisabled,
            ]}
            onPress={submit}
            disabled={!title.trim() || !description.trim() || isSaving}
            activeOpacity={0.88}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={18} color="#fff" />
                <Text style={styles.submitText}>
                  {isEditing
                    ? isEn
                      ? "Save Changes"
                      : "Enregistrer les modifications"
                    : isServiceRequest
                      ? isEn
                        ? "Publish Service Request"
                        : "Publier la demande"
                      : isEn
                        ? "Publish Job Offer"
                        : "Publier l'offre d'emploi"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  flex: { flex: 1 },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  headerSpacer: { width: 40 },
  content: {
    padding: 18,
    gap: 12,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  intro: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
  },
  title: { fontSize: 17, fontWeight: "800", color: theme.colors.text },
  subtitle: { marginTop: 4, color: "#64748b", fontSize: 13, lineHeight: 18 },
  label: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeOptionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  typeOptionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#f5f3ff",
  },
  typeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  typeIconWrapActive: {
    backgroundColor: theme.colors.primary,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  typeOptionTitleActive: {
    color: theme.colors.primary,
  },
  typeOptionSub: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#dbe3ed",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    color: theme.colors.text,
    fontSize: 15,
  },
  textArea: { minHeight: 120 },
  inputRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dbe3ed",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  rowInput: { flex: 1, color: theme.colors.text, fontSize: 15 },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dbe3ed",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: "#475569", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  submit: {
    minHeight: 52,
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
