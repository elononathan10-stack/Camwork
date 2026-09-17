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
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  User,
  Mail,
  MapPin,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import ApplicationConfirmation from "@/components/ApplicationConfirmation";

export default function ApplyJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { jobs, user, applyToJob, startConversation } = useUser();
  const { language, t } = useLanguage();

  const job = jobs.find((j) => j.id === id);

  const [coverNote, setCoverNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const handleSubmitApplication = async () => {
    if (!job) {
      Alert.alert(
        "Job unavailable",
        "This job post could not be found. Please return to search and choose an active listing.",
      );
      return;
    }
    setIsSubmitting(true);
    // Simulate submission latency
    await new Promise((res) => setTimeout(res, 600));

    try {
      await applyToJob(job, coverNote);
      setIsSubmitting(false);
      setIsConfirmationVisible(true);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        "Application failed",
        error instanceof Error
          ? error.message
          : "Unable to submit application.",
      );
    }
  };

  const handleCloseConfirmation = async () => {
    if (!job) {
      setIsConfirmationVisible(false);
      router.replace("/(tabs)/search");
      return;
    }
    setIsConfirmationVisible(false);
    const conversationId = await startConversation(
      job.company,
      job.company,
      job.title,
      job.postedBy,
    );
    router.replace({
      pathname: "/chat-thread",
      params: { id: conversationId },
    });
  };

  const handleBrowseMore = () => {
    setIsConfirmationVisible(false);
    router.replace("/(tabs)/search");
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
        <Text style={styles.navTitle}>{t.applyFlow.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {/* Target Job Summary Card */}
          <View style={styles.jobSummaryCard}>
            <View style={styles.jobLogoCircle}>
              <Text style={styles.logoLetter}>
                {job?.company?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={styles.jobInfoWrap}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {job?.title || "Job unavailable"}
              </Text>
              <Text style={styles.jobCompany}>
                {job?.company} • {job?.location}
              </Text>
              <Text style={styles.jobSalary}>{job?.salary}</Text>
            </View>
          </View>

          {/* Seeker Profile Snapshot */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.applyFlow.contactInfo}</Text>
              {user?.isVerified && (
                <View style={styles.verifiedTag}>
                  <ShieldCheck size={12} color={theme.colors.primary} />
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.profileDataList}>
              <View style={styles.dataRow}>
                <User size={16} color="#64748b" />
                <Text style={styles.dataText}>
                  {user?.name || "Name not added"}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <Mail size={16} color="#64748b" />
                <Text style={styles.dataText}>
                  {user?.email || "Email not available"}
                </Text>
              </View>
              <View style={styles.dataRow}>
                <MapPin size={16} color="#64748b" />
                <Text style={styles.dataText}>
                  {user?.location || "Location not added"}
                </Text>
              </View>
            </View>
          </View>

          {/* Optional Message / Cover Note */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {t.applyFlow.coverNoteLabel}
            </Text>
            <TextInput
              placeholder={t.applyFlow.coverNotePlaceholder}
              style={styles.textArea}
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={coverNote}
              onChangeText={setCoverNote}
            />
          </View>

          {/* Rate & Availability Guarantee */}
          <View style={styles.guaranteeCard}>
            <CheckCircle2 size={20} color={theme.colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.guaranteeTitle}>
                {t.applyFlow.rateExpectation}
              </Text>
              <Text style={styles.guaranteeSub}>
                Your availability ({user?.availability || "not specified"}) and
                rate preference will be shared securely.
              </Text>
            </View>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmitApplication}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Send size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  {t.applyFlow.submitBtn}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Celebratory Modal */}
      <ApplicationConfirmation
        visible={isConfirmationVisible}
        onClose={handleCloseConfirmation}
        onBrowseMore={handleBrowseMore}
        jobTitle={job?.title || "Job"}
        companyName={job?.company || "CamWork"}
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
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  scrollContent: {
    padding: 18,
    gap: 16,
    paddingBottom: 80,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  jobSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  jobLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  jobInfoWrap: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  jobCompany: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  jobSalary: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  profileDataList: {
    gap: 10,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dataText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    minHeight: 120,
  },
  guaranteeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.primaryLight,
    padding: 14,
    borderRadius: 14,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  guaranteeSub: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
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
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
