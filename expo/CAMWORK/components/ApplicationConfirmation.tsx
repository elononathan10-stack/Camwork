import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { CheckCircle2, ArrowRight, Briefcase, Search, Sparkles } from "lucide-react-native";
import { theme } from "./theme";
import { useLanguage } from "@/context/LanguageContext";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onBrowseMore?: () => void;
  jobTitle: string;
  companyName: string;
}

const ApplicationConfirmation = ({
  visible,
  onClose,
  onBrowseMore,
  jobTitle,
  companyName,
}: ConfirmationModalProps) => {
  const { language, t } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Animated Celebration Icon */}
          <View style={styles.iconCircle}>
            <CheckCircle2 size={54} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>{t.applyFlow.successTitle}</Text>
          <Text style={styles.subtitle}>
            {language === "EN" ? (
              <>
                Your application for <Text style={styles.bold}>{jobTitle}</Text> at{" "}
                <Text style={styles.bold}>{companyName}</Text> has been successfully transmitted.
              </>
            ) : (
              <>
                Votre candidature pour le poste <Text style={styles.bold}>{jobTitle}</Text> chez{" "}
                <Text style={styles.bold}>{companyName}</Text> a bien été transmise.
              </>
            )}
          </Text>

          {/* Timeline notice */}
          <View style={styles.statusBox}>
            <Sparkles size={18} color={theme.colors.primary} />
            <Text style={styles.statusBoxText}>
              {language === "EN"
                ? "Recruiter review expected within 24 to 48 hours."
                : "Examen du recruteur prévu sous 24 à 48 heures."}
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.mainBtn} onPress={onClose} activeOpacity={0.85}>
            <Briefcase size={18} color="#ffffff" />
            <Text style={styles.mainBtnText}>{t.applyFlow.goToApplications}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onBrowseMore || onClose}
            activeOpacity={0.7}
          >
            <Search size={16} color={theme.colors.primary} />
            <Text style={styles.secondaryBtnText}>{t.applyFlow.browseMore}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  bold: { fontWeight: "800", color: theme.colors.text },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    borderRadius: 14,
    marginBottom: 24,
    width: "100%",
  },
  statusBoxText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "700",
    flex: 1,
  },
  mainBtn: {
    backgroundColor: theme.colors.primary,
    width: "100%",
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  mainBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});

export default ApplicationConfirmation;