import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, MessageSquare, Send } from "lucide-react-native";
import { PLATFORM_CONTACT_BLOCK_MESSAGE, useUser } from "@/context/UserContext";
import { theme } from "@/components/theme";

export default function NewChatScreen() {
  const { startConversation } = useUser();
  const [recipient, setRecipient] = useState("");
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");
  const submit = async () => {
    if (!recipient.trim() || !context.trim()) return;
    try {
      const id = await startConversation(
        recipient.trim(),
        company.trim() || "CamWork member",
        context.trim(),
      );
      router.replace({ pathname: "/chat-thread", params: { id } });
    } catch {
      Alert.alert("Unable to start chat", PLATFORM_CONTACT_BLOCK_MESSAGE);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={21} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New chat</Text>
        <View style={styles.spacer} />
      </View>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <MessageSquare size={22} color={theme.colors.primary} />
            <Text style={styles.introText}>
              Start a conversation about a job or service. Keep contact and
              meeting arrangements on CamWork.
            </Text>
          </View>
          <Text style={styles.label}>Recipient name</Text>
          <TextInput
            value={recipient}
            onChangeText={setRecipient}
            style={styles.input}
            placeholder="Name"
          />
          <Text style={styles.label}>Company or profile</Text>
          <TextInput
            value={company}
            onChangeText={setCompany}
            style={styles.input}
            placeholder="Optional"
          />
          <Text style={styles.label}>Job or service context</Text>
          <TextInput
            value={context}
            onChangeText={setContext}
            style={[styles.input, styles.textArea]}
            placeholder="What would you like to discuss?"
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.button,
              (!recipient.trim() || !context.trim()) && styles.disabled,
            ]}
            onPress={submit}
            disabled={!recipient.trim() || !context.trim()}
          >
            <Send size={18} color="#fff" />
            <Text style={styles.buttonText}>Start chat</Text>
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
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  spacer: { width: 40 },
  content: {
    padding: 18,
    gap: 10,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  intro: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    marginBottom: 8,
  },
  introText: { flex: 1, color: "#475569", lineHeight: 18, fontSize: 13 },
  label: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    minHeight: 48,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbe3ed",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: theme.colors.text,
  },
  textArea: { minHeight: 110, paddingTop: 12 },
  button: {
    minHeight: 48,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontWeight: "800" },
});
