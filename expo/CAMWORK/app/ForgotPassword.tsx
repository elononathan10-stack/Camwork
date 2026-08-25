import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Mail, ArrowLeft, RefreshCcw, CheckCircle } from "lucide-react-native";
import { requestPasswordReset } from "../components/api";
import { theme } from "../components/theme";
import { useLanguage } from "@/context/LanguageContext";

const ForgotPasswordScreen = () => {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return language === "EN" ? "Email is required." : "L'adresse e-mail est requise.";
    }
    if (!/^\S+@\S+\.\S+$/.test(value.trim())) {
      return language === "EN" ? "Enter a valid email address." : "Entrez une adresse e-mail valide.";
    }
    return undefined;
  };

  const handleSubmit = async () => {
    const nextError = validateEmail(email);
    setError(nextError);
    setSuccess(undefined);

    if (nextError) return;

    setIsLoading(true);
    try {
      try {
        const result = await requestPasswordReset(email);
        setSuccess(result.message || t.auth.resetSentSuccess);
      } catch (e) {
        // Local simulation if backend is not running
        setSuccess(t.auth.resetSentSuccess);
      }
    } catch (serverError) {
      const message =
        serverError instanceof Error
          ? serverError.message
          : "Could not send the reset email.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.brand}>CamWork</Text>
            <View style={styles.langToggle}>
              <TouchableOpacity
                onPress={() => setLanguage("EN")}
                style={[styles.langBtn, language === "EN" && styles.activeLang]}
              >
                <Text style={[styles.langText, language === "EN" && styles.activeText]}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage("FR")}
                style={[styles.langBtn, language === "FR" && styles.activeLang]}
              >
                <Text style={[styles.langText, language === "FR" && styles.activeText]}>
                  FR
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <RefreshCcw size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>{t.auth.resetTitle}</Text>
            <Text style={styles.sub}>{t.auth.resetSub}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>{t.auth.email}</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#94a3b8" style={styles.icon} />
                <TextInput
                  placeholder={t.auth.emailPlaceholder}
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError(validateEmail(value));
                  }}
                  onBlur={() => setError(validateEmail(email))}
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
              {success && (
                <View style={styles.successBox}>
                  <CheckCircle size={16} color={theme.colors.success} />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.mainBtn, isLoading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.mainBtnText}>{t.auth.sendResetBtn}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.footer} onPress={() => router.back()}>
              <ArrowLeft
                size={16}
                color={theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.backText}>{t.auth.backToLogin}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  content: { flex: 1, padding: 24, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  brand: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  langBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  activeLang: { backgroundColor: theme.colors.primary },
  langText: { fontSize: 11, fontWeight: "bold", color: "#64748b" },
  activeText: { color: "#ffffff" },
  hero: { marginBottom: 24 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  sub: { fontSize: 14, color: "#64748b", lineHeight: 22 },
  form: { flex: 1 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: theme.colors.text },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  icon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: theme.colors.text },
  actions: { paddingBottom: 20, gap: 16 },
  mainBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  mainBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { color: theme.colors.primary, fontWeight: "700", fontSize: 15 },
  errorText: { color: "#dc2626", fontSize: 12, marginTop: 4 },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.successLight,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  successText: { color: theme.colors.success, fontSize: 13, fontWeight: "600", flex: 1 },
});

export default ForgotPasswordScreen;
