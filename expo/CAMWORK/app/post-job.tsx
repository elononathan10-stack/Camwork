import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Briefcase, MapPin, Send } from "lucide-react-native";
import { theme } from "@/components/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CreateJobInput,
  PLATFORM_CONTACT_BLOCK_MESSAGE,
  useUser,
} from "@/context/UserContext";

const CATEGORIES = [
  "General",
  "Technology",
  "Construction",
  "Logistics",
  "Home Services",
  "Professional Services",
];

export default function PostJobScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user, jobs, createJob, updateJob } = useUser();
  const insets = useSafeAreaInsets();
  const existingJob = id
    ? jobs.find(
        (job) =>
          job.id === id &&
          job.postedBy?.trim().toLowerCase() ===
            user?.email?.trim().toLowerCase(),
      )
    : undefined;
  const isEditing = Boolean(existingJob);
  const isServiceRequest = user?.role === "seeker";
  const [title, setTitle] = useState(existingJob?.title || "");
  const [description, setDescription] = useState(
    existingJob?.description || "",
  );
  const [location, setLocation] = useState(existingJob?.location || "");
  const [category, setCategory] = useState(
    existingJob?.category || CATEGORIES[0],
  );
  const [salary, setSalary] = useState(existingJob?.salary || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!existingJob) return;
    setTitle(existingJob.title);
    setDescription(existingJob.description);
    setLocation(existingJob.location);
    setCategory(existingJob.category);
    setSalary(existingJob.salary);
  }, [existingJob]);

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsSaving(true);
    const job: CreateJobInput = {
      title: title.trim(),
      company: isServiceRequest
        ? user?.name || "Service seeker"
        : user?.name || "Employer",
      location: location.trim() || "Location not specified",
      category,
      type: "Gig",
      contractDuration: isServiceRequest ? "Service request" : "Flexible",
      salary: salary.trim() || "Rate to be discussed",
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={21} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing
            ? "Edit job post"
            : isServiceRequest
              ? "Request a service"
              : "Create a job offer"}
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
            { paddingBottom: 36 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.intro}>
            {isServiceRequest ? (
              <Send size={22} color={theme.colors.primary} />
            ) : (
              <Briefcase size={22} color={theme.colors.primary} />
            )}
            <View style={styles.flex}>
              <Text style={styles.title}>
                {isEditing
                  ? "Update your published listing"
                  : isServiceRequest
                    ? "Describe what you need"
                    : "Find the right person"}
              </Text>
              <Text style={styles.subtitle}>
                {isEditing
                  ? "Keep the details accurate for applicants."
                  : isServiceRequest
                    ? "Tell skilled professionals what service you are looking for."
                    : "Publish the role and let qualified people contact you."}
              </Text>
            </View>
          </View>

          <Text style={styles.label}>
            {isServiceRequest ? "Service needed" : "Job title"}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              isServiceRequest
                ? "e.g. Repair my solar installation"
                : "e.g. Mobile app developer"
            }
            style={styles.input}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add the details, expectations, and useful context"
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Location</Text>
          <View style={styles.inputRow}>
            <MapPin size={18} color="#94a3b8" />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="City or remote"
              style={styles.rowInput}
            />
          </View>

          <Text style={styles.label}>Category</Text>
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

          <Text style={styles.label}>
            {isServiceRequest ? "Expected rate" : "Budget or salary"}
          </Text>
          <TextInput
            value={salary}
            onChangeText={setSalary}
            placeholder="e.g. 50,000 FCFA"
            style={styles.input}
          />

          <TouchableOpacity
            style={[
              styles.submit,
              (!title.trim() || !description.trim() || isSaving) &&
                styles.submitDisabled,
            ]}
            onPress={submit}
            disabled={!title.trim() || !description.trim() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Send size={18} color="#fff" />
                <Text style={styles.submitText}>
                  {isEditing
                    ? "Save changes"
                    : isServiceRequest
                      ? "Publish request"
                      : "Publish job offer"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
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
    gap: 10,
    paddingBottom: 36,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  intro: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 14,
  },
  title: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  subtitle: { marginTop: 4, color: "#64748b", fontSize: 13, lineHeight: 18 },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
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
    paddingHorizontal: 12,
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
    minHeight: 48,
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
