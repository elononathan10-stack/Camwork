import { router } from "expo-router";
import React, { useState } from "react";
import { registerUser } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react-native";
import { theme } from "./theme";

const RegisterScreen = () => {
  const { setUser } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const [role, setRole] = useState<"seeker" | "employer">("seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const validateName = (value: string) => {
    if (!value.trim()) {
      return language === "EN"
        ? "Full name is required."
        : "Le nom complet est requis.";
    }
    if (value.trim().length < 2) {
      return language === "EN"
        ? "Please enter at least 2 characters."
        : "Entrez au moins 2 caractères.";
    }
    return undefined;
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return language === "EN"
        ? "Email address is required."
        : "L'adresse e-mail est requise.";
    }
    if (!/^\S+@\S+\.\S+$/.test(value.trim())) {
      return language === "EN"
        ? "Please enter a valid email address."
        : "Entrez une adresse e-mail valide.";
    }
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return language === "EN"
        ? "Password is required."
        : "Le mot de passe est requis.";
    }
    if (value.length < 6) {
      return language === "EN"
        ? "Password must be at least 6 characters."
        : "Le mot de passe doit comporter au moins 6 caractères.";
    }
    return undefined;
  };

  const handleSubmit = async () => {
    const nextErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);
    setServerError(null);
    setSuccessMessage(null);

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      // 1. Register with backend
      const regResponse = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (regResponse.token) {
        await AsyncStorage.setItem("camwork_token", regResponse.token);
      }

      await setUser({
        name: regResponse?.name || name.trim(),
        email: regResponse?.email || email.trim(),
        role,
        isProfileComplete: false,
      });

      setSuccessMessage(
        language === "EN"
          ? "Account created successfully! Preparing your experience..."
          : "Compte créé avec succès ! Préparation de votre espace...",
      );

      setTimeout(() => {
        if (role === "seeker") {
          router.replace("/profile-setup");
        } else {
          router.replace("/(tabs)");
        }
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);
      const rawMsg =
        error instanceof Error ? error.message : "Registration failed.";

      let localizedMsg = rawMsg;
      if (rawMsg.toLowerCase().includes("already exists")) {
        localizedMsg =
          language === "EN"
            ? "An account already exists with this email address. Please log in."
            : "Un compte existe déjà avec cet e-mail. Veuillez vous connecter.";
        setErrors((prev) => ({
          ...prev,
          email:
            language === "EN"
              ? "This email is already in use."
              : "Cet e-mail est déjà utilisé.",
        }));
      } else if (rawMsg.toLowerCase().includes("unable to reach backend")) {
        localizedMsg =
          language === "EN"
            ? "Unable to connect to backend server. Please check your network."
            : "Impossible de joindre le serveur. Vérifiez votre connexion.";
      }

      setServerError(localizedMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <Text style={styles.brand}>CamWork</Text>
              <View style={styles.flagBadge}>
                <Text style={styles.flagText}>🇨🇲</Text>
              </View>
            </View>

            <View style={styles.langToggle}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLanguage("EN")}
                style={[
                  styles.langBtn,
                  language === "EN" && styles.activeLangBtn,
                ]}
              >
                <Text
                  style={[
                    styles.langText,
                    language === "EN" && styles.activeLangText,
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLanguage("FR")}
                style={[
                  styles.langBtn,
                  language === "FR" && styles.activeLangBtn,
                ]}
              >
                <Text
                  style={[
                    styles.langText,
                    language === "FR" && styles.activeLangText,
                  ]}
                >
                  FR
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Header */}
          <View style={styles.heroSection}>
            <View style={styles.pillBadge}>
              <Sparkles size={13} color={theme.colors.primary} />
              <Text style={styles.pillBadgeText}>
                {language === "EN"
                  ? "Quick & Free Registration"
                  : "Inscription Rapide et Gratuite"}
              </Text>
            </View>
            <Text style={styles.title}>{t.auth.registerTitle}</Text>
            <Text style={styles.subTitle}>
              {language === "EN"
                ? "Join Cameroon's most trusted network for verified jobs and top talents."
                : "Rejoignez le réseau le plus fiable du Cameroun pour l'emploi et les talents."}
            </Text>
          </View>

          {/* Server Alert Banner */}
          {serverError && (
            <View style={styles.alertBoxError}>
              <AlertCircle size={18} color="#b91c1c" style={styles.alertIcon} />
              <Text style={styles.alertTextError}>{serverError}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.alertBoxSuccess}>
              <CheckCircle2
                size={18}
                color="#15803d"
                style={styles.alertIcon}
              />
              <Text style={styles.alertTextSuccess}>{successMessage}</Text>
            </View>
          )}

          {/* Role Selection Group */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionLabel}>{t.auth.roleLabel}</Text>
            <View style={styles.roleGrid}>
              {/* Seeker Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setRole("seeker")}
                style={[
                  styles.roleCard,
                  role === "seeker" && styles.roleCardActive,
                ]}
              >
                <View
                  style={[
                    styles.roleIconCircle,
                    role === "seeker" && styles.roleIconCircleActive,
                  ]}
                >
                  <Briefcase
                    size={20}
                    color={role === "seeker" ? "#ffffff" : theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.roleText,
                    role === "seeker" && styles.roleTextActive,
                  ]}
                >
                  {t.auth.seekerRole}
                </Text>
                <Text style={styles.roleSub}>{t.auth.seekerRoleDesc}</Text>
                {role === "seeker" && (
                  <View style={styles.checkBadge}>
                    <CheckCircle2 size={16} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Employer Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setRole("employer")}
                style={[
                  styles.roleCard,
                  role === "employer" && styles.roleCardActive,
                ]}
              >
                <View
                  style={[
                    styles.roleIconCircle,
                    role === "employer" && styles.roleIconCircleActive,
                  ]}
                >
                  <Building2
                    size={20}
                    color={
                      role === "employer" ? "#ffffff" : theme.colors.primary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.roleText,
                    role === "employer" && styles.roleTextActive,
                  ]}
                >
                  {t.auth.employerRole}
                </Text>
                <Text style={styles.roleSub}>{t.auth.employerRoleDesc}</Text>
                {role === "employer" && (
                  <View style={styles.checkBadge}>
                    <CheckCircle2 size={16} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t.auth.fullName}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.name ? styles.inputWrapperError : null,
                ]}
              >
                <User size={19} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder={t.auth.namePlaceholder}
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errors.name)
                      setErrors({ ...errors, name: validateName(val) });
                    if (serverError) setServerError(null);
                  }}
                  onBlur={() =>
                    setErrors({ ...errors, name: validateName(name) })
                  }
                />
              </View>
              {errors.name && (
                <Text style={styles.errorCaption}>{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t.auth.email}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email ? styles.inputWrapperError : null,
                ]}
              >
                <Mail size={19} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder={t.auth.emailPlaceholder}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email)
                      setErrors({ ...errors, email: validateEmail(val) });
                    if (serverError) setServerError(null);
                  }}
                  onBlur={() =>
                    setErrors({ ...errors, email: validateEmail(email) })
                  }
                />
              </View>
              {errors.email && (
                <Text style={styles.errorCaption}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{t.auth.password}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password ? styles.inputWrapperError : null,
                ]}
              >
                <Lock size={19} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder={t.auth.passwordPlaceholder}
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errors.password)
                      setErrors({ ...errors, password: validatePassword(val) });
                    if (serverError) setServerError(null);
                  }}
                  onBlur={() =>
                    setErrors({
                      ...errors,
                      password: validatePassword(password),
                    })
                  }
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={19} color="#64748b" />
                  ) : (
                    <Eye size={19} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorCaption}>{errors.password}</Text>
              )}
            </View>
          </View>

          {/* Trust & Terms banner */}
          <View style={styles.termsBox}>
            <ShieldCheck
              size={18}
              color={theme.colors.primary}
              style={styles.shieldIcon}
            />
            <Text style={styles.termsText}>{t.auth.terms}</Text>
          </View>

          {/* Submit Button & Footer */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    {t.auth.createAccountBtn}
                  </Text>
                  <ArrowRight size={19} color="#ffffff" strokeWidth={2.4} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>{t.auth.hasAccount} </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.logInLink}>{t.auth.loginHere}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brand: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -0.6,
  },
  flagBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  flagText: {
    fontSize: 12,
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  activeLangBtn: {
    backgroundColor: theme.colors.primary,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  activeLangText: {
    color: "#ffffff",
  },
  heroSection: {
    marginBottom: 16,
    gap: 6,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginBottom: 2,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  subTitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  alertBoxError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fca5a5",
    gap: 8,
  },
  alertIcon: {
    flexShrink: 0,
  },
  alertTextError: {
    flex: 1,
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "600",
  },
  alertBoxSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#86efac",
    gap: 8,
  },
  alertTextSuccess: {
    flex: 1,
    color: "#15803d",
    fontSize: 13,
    fontWeight: "600",
  },
  roleSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    position: "relative",
    gap: 4,
    minHeight: 120,
    justifyContent: "center",
  },
  roleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#ffffff",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  roleIconCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  roleTextActive: {
    color: theme.colors.primary,
  },
  roleSub: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 14,
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  formContainer: {
    gap: 14,
    marginBottom: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  inputWrapperError: {
    borderColor: "#dc2626",
    backgroundColor: "#fffdfd",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    height: "100%",
  },
  eyeBtn: {
    padding: 4,
  },
  errorCaption: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  termsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 61, 0.15)",
  },
  shieldIcon: {
    flexShrink: 0,
  },
  termsText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  actionsSection: {
    gap: 16,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerPrompt: {
    color: "#64748b",
    fontSize: 14,
  },
  logInLink: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
});

export default RegisterScreen;
