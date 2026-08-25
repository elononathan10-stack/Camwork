import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Globe2,
  Bell,
  Lock,
  Eye,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsScreen() {
  const { user, logout } = useUser();
  const { switchRole } = useUser();
  const { language, setLanguage, t } = useLanguage();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      language === "EN" ? "Log Out" : "Déconnexion",
      t.settings.logoutConfirm,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.profile.logout,
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ],
    );
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
        <Text style={styles.navTitle}>{t.settings.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Workspace role</Text>
          <Text style={styles.settingSub}>
            Switch between finding work and hiring talent. Your data stays
            separate.
          </Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                user?.role === "seeker" && styles.roleButtonActive,
              ]}
              onPress={() => switchRole("seeker")}
            >
              <Text
                style={[
                  styles.roleText,
                  user?.role === "seeker" && styles.roleTextActive,
                ]}
              >
                Job seeker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                user?.role === "employer" && styles.roleButtonActive,
              ]}
              onPress={() => switchRole("employer")}
            >
              <Text
                style={[
                  styles.roleText,
                  user?.role === "employer" && styles.roleTextActive,
                ]}
              >
                Employer
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.push("/payment")}
          >
            <ShieldCheck size={20} color={theme.colors.primary} />
            <Text style={styles.linkLabel}>Payment and transaction safety</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        {/* Language Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.settings.language}</Text>

          <View style={styles.langSwitchGroup}>
            <TouchableOpacity
              style={[
                styles.langOption,
                language === "EN" && styles.langOptionActive,
              ]}
              onPress={() => setLanguage("EN")}
            >
              <Text style={styles.langEmoji}>🇬🇧</Text>
              <Text
                style={[
                  styles.langLabel,
                  language === "EN" && styles.langLabelActive,
                ]}
              >
                English (EN)
              </Text>
              {language === "EN" && (
                <Check size={16} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[
                styles.langOption,
                language === "FR" && styles.langOptionActive,
              ]}
              onPress={() => setLanguage("FR")}
            >
              <Text style={styles.langEmoji}>🇨🇲</Text>
              <Text
                style={[
                  styles.langLabel,
                  language === "FR" && styles.langLabelActive,
                ]}
              >
                Français (FR)
              </Text>
              {language === "FR" && (
                <Check size={16} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.settings.notifications}</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>{t.settings.pushNotifs}</Text>
              <Text style={styles.settingSub}>
                {language === "EN"
                  ? "Receive application and chat updates"
                  : "Recevoir les alertes de candidatures et messages"}
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: "#cbd5e1", true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>{t.settings.jobAlerts}</Text>
              <Text style={styles.settingSub}>
                {language === "EN"
                  ? "Notifications when matching jobs are posted"
                  : "Alertes lors de la publication d'offres compatibles"}
              </Text>
            </View>
            <Switch
              value={jobAlertsEnabled}
              onValueChange={setJobAlertsEnabled}
              trackColor={{ false: "#cbd5e1", true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Privacy & Visibility */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.settings.privacy}</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>
                {t.settings.profilePublic}
              </Text>
              <Text style={styles.settingSub}>
                {language === "EN"
                  ? "Allow verified recruiters to discover your profile"
                  : "Permettre aux recruteurs certifiés de voir votre profil"}
              </Text>
            </View>
            <Switch
              value={profileVisible}
              onValueChange={setProfileVisible}
              trackColor={{ false: "#cbd5e1", true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t.settings.helpSupport}</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert(
                "CamWork Support",
                "Contact support through the in-app help channel. Personal phone numbers are not shared on CamWork.",
              )
            }
          >
            <HelpCircle size={20} color={theme.colors.primary} />
            <Text style={styles.linkLabel}>{t.settings.faq}</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              Alert.alert(
                "Terms & Privacy",
                "CamWork operates under the laws of the Republic of Cameroon regarding verified employment and worker data privacy.",
              )
            }
          >
            <FileText size={20} color={theme.colors.primary} />
            <Text style={styles.linkLabel}>{t.settings.terms}</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Logout Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutBtnText}>{t.profile.logout}</Text>
        </TouchableOpacity>

        {/* Version label */}
        <Text style={styles.versionText}>{t.settings.version}</Text>
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
  roleRow: { flexDirection: "row", gap: 8 },
  roleButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbe3ed",
  },
  roleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleText: { color: theme.colors.text, fontSize: 13, fontWeight: "800" },
  roleTextActive: { color: "#fff" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  langSwitchGroup: {
    gap: 8,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  langOptionActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  langEmoji: {
    fontSize: 20,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
  },
  langLabelActive: {
    fontWeight: "800",
    color: theme.colors.primary,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  settingTextWrap: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  settingSub: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.errorLight,
    height: 52,
    borderRadius: 16,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.error,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
});
