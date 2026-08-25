import { router } from "expo-router";
import React, { useState } from "react";
import { loginUser } from "./api";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react-native";
import { theme } from "./theme";

const LoginScreen = () => {
  const { setUser } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("elononathan10@gmail.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return language === "EN" ? "Email address is required." : "L'adresse e-mail est requise.";
    }
    if (!/^\S+@\S+\.\S+$/.test(value.trim())) {
      return language === "EN" ? "Please enter a valid email address." : "Entrez une adresse e-mail valide.";
    }
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return language === "EN" ? "Password is required." : "Le mot de passe est requis.";
    }
    return undefined;
  };

  const handleSubmit = async () => {
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);
    setServerError(null);
    setSuccessMessage(null);

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsLoading(true);
    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      const loggedUser = response?.user;
      const userName = loggedUser?.name || email.split("@")[0];
      const userRole =
        (loggedUser?.role || "").toLowerCase() === "employer"
          ? ("employer" as const)
          : ("seeker" as const);

      await setUser({
        name: userName,
        email: loggedUser?.email || email.trim(),
        role: userRole,
      });

      setSuccessMessage(
        language === "EN"
          ? "Login successful! Welcome back to CamWork."
          : "Connexion réussie ! Ravi de vous revoir sur CamWork."
      );

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 400);
    } catch (error) {
      console.error("Login error:", error);
      const rawMsg = error instanceof Error ? error.message : "Login failed.";
      
      let localizedMsg = rawMsg;
      if (rawMsg.toLowerCase().includes("invalid password") || rawMsg.toLowerCase().includes("invalid credentials")) {
        localizedMsg = language === "EN" ? "Incorrect password. Please try again." : "Mot de passe incorrect. Veuillez réessayer.";
      } else if (rawMsg.toLowerCase().includes("not found")) {
        localizedMsg = language === "EN" ? "No account found with this email." : "Aucun compte trouvé avec cette adresse e-mail.";
      } else if (rawMsg.toLowerCase().includes("unable to reach backend")) {
        localizedMsg = language === "EN" ? "Unable to connect to backend server. Please verify network." : "Impossible de joindre le serveur. Vérifiez la connexion.";
      }

      setServerError(localizedMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar: Brand & Language Selector */}
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
                style={[styles.langBtn, language === "EN" && styles.activeLangBtn]}
              >
                <Text style={[styles.langText, language === "EN" && styles.activeLangText]}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setLanguage("FR")}
                style={[styles.langBtn, language === "FR" && styles.activeLangBtn]}
              >
                <Text style={[styles.langText, language === "FR" && styles.activeLangText]}>
                  FR
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.pillBadge}>
              <Sparkles size={13} color={theme.colors.primary} />
              <Text style={styles.pillBadgeText}>
                {language === "EN" ? "Verified Career Network" : "Réseau Professionnel Vérifié"}
              </Text>
            </View>
            <Text style={styles.welcomeTitle}>{t.auth.loginTitle}</Text>
            <Text style={styles.welcomeSubtitle}>{t.auth.loginSub}</Text>
          </View>

          {/* Server Alert Banners */}
          {serverError && (
            <View style={styles.alertBoxError}>
              <AlertCircle size={18} color="#b91c1c" style={styles.alertIcon} />
              <Text style={styles.alertTextError}>{serverError}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.alertBoxSuccess}>
              <CheckCircle2 size={18} color="#15803d" style={styles.alertIcon} />
              <Text style={styles.alertTextSuccess}>{successMessage}</Text>
            </View>
          )}

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Field */}
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
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errors.email) setErrors({ ...errors, email: validateEmail(val) });
                    if (serverError) setServerError(null);
                  }}
                  onBlur={() => setErrors({ ...errors, email: validateEmail(email) })}
                />
              </View>
              {errors.email && <Text style={styles.errorCaption}>{errors.email}</Text>}
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>{t.auth.password}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/ForgotPassword")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotLink}>{t.auth.forgotPassword}</Text>
                </TouchableOpacity>
              </View>

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
                    if (errors.password) setErrors({ ...errors, password: validatePassword(val) });
                    if (serverError) setServerError(null);
                  }}
                  onBlur={() => setErrors({ ...errors, password: validatePassword(password) })}
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
              {errors.password && <Text style={styles.errorCaption}>{errors.password}</Text>}
            </View>
          </View>

          {/* Action & Footer */}
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
                  <Text style={styles.primaryBtnText}>{t.auth.loginBtn}</Text>
                  <ArrowRight size={19} color="#ffffff" strokeWidth={2.4} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>{t.auth.noAccount} </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/register")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.signUpLink}>{t.auth.signUp}</Text>
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
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    marginBottom: 20,
    gap: 8,
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
    marginBottom: 4,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  welcomeTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
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
  formContainer: {
    gap: 16,
    marginBottom: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
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
  actionsSection: {
    paddingTop: 12,
    gap: 18,
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
  signUpLink: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
});

export default LoginScreen;

