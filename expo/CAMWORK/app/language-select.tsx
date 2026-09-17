import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  Check,
  Globe2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSelectScreen() {
  const { language, setLanguage, t } = useLanguage();

  const handleContinue = () => {
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Top Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <Globe2 size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.brandTitle}>CamWork</Text>
          <View style={styles.taglineBadge}>
            <ShieldCheck size={14} color={theme.colors.primary} />
            <Text style={styles.taglineText}>
              Cameroon&apos;s Verified Work Platform
            </Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t.onboarding.welcomeTitle}</Text>
          <Text style={styles.heroSub}>{t.onboarding.welcomeSubtitle}</Text>
        </View>

        {/* Language Selection Card Group */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionLabel}>{t.onboarding.chooseLang}</Text>

          {/* English Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLanguage("EN")}
            style={[
              styles.langCard,
              language === "EN" && styles.langCardSelected,
            ]}
          >
            <View style={styles.langFlagCircle}>
              <Text style={styles.flagEmoji}>🇬🇧</Text>
            </View>
            <View style={styles.langTextWrap}>
              <Text style={styles.langName}>English</Text>
              <Text style={styles.langSub}>Official & Business English</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                language === "EN" && styles.radioCircleActive,
              ]}
            >
              {language === "EN" && (
                <Check size={14} color="#ffffff" strokeWidth={3} />
              )}
            </View>
          </TouchableOpacity>

          {/* French Option */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setLanguage("FR")}
            style={[
              styles.langCard,
              language === "FR" && styles.langCardSelected,
            ]}
          >
            <View style={styles.langFlagCircle}>
              <Text style={styles.flagEmoji}>🇨🇲</Text>
            </View>
            <View style={styles.langTextWrap}>
              <Text style={styles.langName}>Français</Text>
              <Text style={styles.langSub}>Français usuel & professionnel</Text>
            </View>
            <View
              style={[
                styles.radioCircle,
                language === "FR" && styles.radioCircleActive,
              ]}
            >
              {language === "FR" && (
                <Check size={14} color="#ffffff" strokeWidth={3} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryBtn}
            onPress={handleContinue}
          >
            <Text style={styles.primaryBtnText}>{t.onboarding.getStarted}</Text>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerMuted}>
              {t.onboarding.alreadyHaveAccount}{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.footerLink}>{t.onboarding.login}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  brandSection: {
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  taglineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  heroSection: {
    marginVertical: 16,
    gap: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    lineHeight: 36,
  },
  heroSub: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  selectionSection: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  langCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: "#ffffff",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.15,
  },
  langFlagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  flagEmoji: {
    fontSize: 22,
  },
  langTextWrap: {
    flex: 1,
    gap: 2,
  },
  langName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  langSub: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  actionSection: {
    gap: 16,
    paddingTop: 12,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerMuted: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
  },
});
