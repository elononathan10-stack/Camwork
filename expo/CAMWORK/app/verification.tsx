import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileCheck,
  Award,
  AlertCircle,
  FileText,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

export default function VerificationScreen() {
  const { user, uploadVerificationDocument } = useUser();
  const { language, t } = useLanguage();

  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleUpload = async (type: "id" | "certificate") => {
    setIsUploading(type);
    await new Promise((r) => setTimeout(r, 600));
    await uploadVerificationDocument(type);
    setIsUploading(null);
    Alert.alert(
      language === "EN" ? "Document Uploaded" : "Document Téléversé",
      language === "EN"
        ? "Your document has been submitted for validation."
        : "Votre document a été soumis pour validation.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t.verification.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Trust Banner */}
        <View style={styles.trustBanner}>
          <ShieldCheck size={32} color={theme.colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.trustBannerTitle}>
              {language === "EN"
                ? "Trust & Safety Score"
                : "Indice de Confiance & Sécurité"}
            </Text>
            <Text style={styles.trustBannerSub}>{t.verification.subtitle}</Text>
          </View>
        </View>

        {/* Item 1: National ID Card */}
        <View style={styles.docCard}>
          <View style={styles.docCardTop}>
            <View style={styles.docIconCircle}>
              <FileCheck size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>{t.verification.idCardTitle}</Text>
              <Text style={styles.docDesc}>{t.verification.idCardDesc}</Text>
            </View>
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor: user?.idDocumentUploaded
                    ? theme.colors.successLight
                    : "#f1f5f9",
                },
              ]}
            >
              {user?.idDocumentUploaded && (
                <CheckCircle2 size={12} color={theme.colors.success} />
              )}
              <Text
                style={[
                  styles.statusTagText,
                  {
                    color: user?.idDocumentUploaded
                      ? theme.colors.success
                      : "#64748b",
                  },
                ]}
              >
                {user?.idDocumentUploaded
                  ? t.verification.statusApproved
                  : t.verification.statusPending}
              </Text>
            </View>
          </View>

          <View style={styles.uploadPreview}>
            <Text style={styles.uploadPreviewText}>
              {user?.idDocumentUploaded
                ? "Identity document submitted for review."
                : "No identity document submitted yet."}
            </Text>
          </View>
        </View>

        {/* Item 2: Trade / Professional Certificate */}
        <View style={styles.docCard}>
          <View style={styles.docCardTop}>
            <View style={styles.docIconCircle}>
              <Award size={22} color={theme.colors.accentDark} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>
                {t.verification.certificateTitle}
              </Text>
              <Text style={styles.docDesc}>
                {t.verification.certificateDesc}
              </Text>
            </View>
            <View
              style={[
                styles.statusTag,
                {
                  backgroundColor: user?.certificateUploaded
                    ? theme.colors.purpleLight
                    : "#f1f5f9",
                },
              ]}
            >
              {user?.certificateUploaded && (
                <Clock size={12} color={theme.colors.purple} />
              )}
              <Text
                style={[
                  styles.statusTagText,
                  {
                    color: user?.certificateUploaded
                      ? theme.colors.purple
                      : "#64748b",
                  },
                ]}
              >
                {user?.certificateUploaded
                  ? t.verification.statusReview
                  : t.verification.statusPending}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.uploadActionBtn}
            onPress={() => handleUpload("certificate")}
          >
            <UploadCloud size={18} color={theme.colors.primary} />
            <Text style={styles.uploadActionText}>
              {t.verification.uploadDocument} (PDF / JPG)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Item 3: Police Record / Casier Judiciaire (Optional) */}
        <View style={styles.docCard}>
          <View style={styles.docCardTop}>
            <View style={styles.docIconCircle}>
              <FileText size={22} color="#64748b" />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docTitle}>{t.verification.policeTitle}</Text>
              <Text style={styles.docDesc}>{t.verification.policeDesc}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: "#f1f5f9" }]}>
              <Text style={[styles.statusTagText, { color: "#64748b" }]}>
                {t.verification.statusPending}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.uploadActionBtn}
            onPress={() => handleUpload("certificate")}
          >
            <UploadCloud size={18} color={theme.colors.primary} />
            <Text style={styles.uploadActionText}>
              {t.verification.uploadDocument}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 36,
  },
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 18,
  },
  trustBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  trustBannerSub: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 18,
  },
  docCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  docCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  docIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  docInfo: {
    flex: 1,
    gap: 3,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  docDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "800",
  },
  uploadPreview: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  uploadPreviewText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.success,
  },
  uploadActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.primaryLight,
    height: 44,
    borderRadius: 12,
  },
  uploadActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
});
