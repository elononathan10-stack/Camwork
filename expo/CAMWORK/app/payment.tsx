import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from "lucide-react-native";
import { theme } from "@/components/theme";

export default function PaymentScreen() {
  const [method, setMethod] = useState<"mobile-money" | "card">("mobile-money");
  const [enabled, setEnabled] = useState(false);
  const save = () => {
    setEnabled(true);
    Alert.alert(
      "Payment method saved",
      "Payments are held in CamWork until both parties confirm the transaction.",
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={21} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <View style={styles.trust}>
          <ShieldCheck size={22} color={theme.colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.trustTitle}>Protected transactions</Text>
            <Text style={styles.sub}>
              Keep payment and delivery confirmation inside CamWork. Never share
              contact details to arrange payment.
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <TouchableOpacity
          style={[styles.method, method === "mobile-money" && styles.active]}
          onPress={() => setMethod("mobile-money")}
        >
          <CreditCard size={20} color={theme.colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.methodTitle}>Mobile Money</Text>
            <Text style={styles.sub}>
              MTN MoMo or Orange Money through the configured provider.
            </Text>
          </View>
          {method === "mobile-money" && (
            <CheckCircle2 size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.method, method === "card" && styles.active]}
          onPress={() => setMethod("card")}
        >
          <CreditCard size={20} color={theme.colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.methodTitle}>Bank card</Text>
            <Text style={styles.sub}>
              Available when a card payment provider is configured.
            </Text>
          </View>
          {method === "card" && (
            <CheckCircle2 size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={save}>
          <Text style={styles.buttonText}>
            {enabled ? "Payment method saved" : "Save payment method"}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.text,
  },
  spacer: { width: 40 },
  content: { padding: 18, gap: 12 },
  trust: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
  },
  trustTitle: { color: theme.colors.text, fontWeight: "800", marginBottom: 3 },
  sub: { color: "#64748b", fontSize: 12, lineHeight: 17 },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
  },
  method: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3ed",
    backgroundColor: "#fff",
  },
  active: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  methodTitle: { color: theme.colors.text, fontWeight: "800", marginBottom: 3 },
  button: {
    minHeight: 48,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});
