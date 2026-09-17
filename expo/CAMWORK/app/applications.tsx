import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Star,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, ApplicationItem } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabFilter =
  | "All"
  | "Pending"
  | "Reviewed"
  | "Interviews"
  | "Accepted"
  | "Funded"
  | "In Progress"
  | "Rejected"
  | "Completed";

export default function ApplicationsScreen() {
  const {
    user,
    applications,
    validateApplication,
    confirmApplicationCompletion,
    updateJobStatus,
  } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabFilter>("All");
  const [completionTarget, setCompletionTarget] = useState<ApplicationItem | null>(null);
  const [rating, setRating] = useState(5);
  const [payoutMethod, setPayoutMethod] = useState<
    "mtn-mobile-money" | "orange-money" | "card"
  >("mtn-mobile-money");
  const [payoutAccount, setPayoutAccount] = useState(user?.phone || "");
  const [submittingCompletion, setSubmittingCompletion] = useState(false);

  const openCompletion = (application: ApplicationItem) => {
    setCompletionTarget(application);
    setRating(5);
    setPayoutMethod(application.payoutMethod || "mtn-mobile-money");
    setPayoutAccount(application.payoutAccount || user?.phone || "");
  };

  const manageCompletedJob = (application: ApplicationItem) => {
    Alert.alert(
      "Job completed",
      "Escrow has been released to the seeker. Would you like to reopen this offer or remove it from active listings?",
      [
        { text: "Keep completed", style: "cancel" },
        {
          text: "Remove offer",
          style: "destructive",
          onPress: () => updateJobStatus(application.jobId, "archived"),
        },
        {
          text: "Reopen offer",
          onPress: () => updateJobStatus(application.jobId, "open"),
        },
      ],
    );
  };

  const submitCompletion = async () => {
    if (!completionTarget) return;
    if (user?.role !== "employer" && !payoutAccount.trim()) {
      Alert.alert("Payout details required", "Enter the account or phone number where you want the escrow payout sent.");
      return;
    }
    setSubmittingCompletion(true);
    try {
      const savedApplication = await confirmApplicationCompletion(completionTarget.id, {
        rating,
        ...(user?.role === "employer"
          ? {}
          : { payoutMethod, payoutAccount: payoutAccount.trim() }),
      });
      setCompletionTarget(null);
      if (savedApplication.status === "Completed") {
        Alert.alert(
          "Escrow released",
          "Both parties confirmed completion. The seeker payout is now released.",
          user?.role === "employer"
            ? [
                {
                  text: "Manage job offer",
                  onPress: () => manageCompletedJob(savedApplication),
                },
                { text: "Done" },
              ]
            : [{ text: "Done" }],
        );
      } else {
        Alert.alert(
          "Completion recorded",
          "Your confirmation and rating were saved. Escrow will release after the other party confirms.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Could not confirm completion",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSubmittingCompletion(false);
    }
  };

  const tabs: Array<{ key: TabFilter; label: string }> = [
    { key: "All", label: t.applications.tabs.all },
    { key: "Pending", label: t.applications.tabs.pending },
    { key: "Reviewed", label: t.applications.tabs.reviewed },
    { key: "Interviews", label: t.applications.tabs.interviews },
    { key: "Accepted", label: t.applications.tabs.accepted },
    { key: "Funded", label: "Funded Escrow" },
    { key: "In Progress", label: "In Progress" },
    { key: "Rejected", label: t.applications.tabs.rejected },
    { key: "Completed", label: "Completed" },
  ];

  const filteredApps = applications.filter((app) => {
    if (activeTab === "All") return true;
    return app.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return {
          bg: theme.colors.successLight,
          text: theme.colors.success,
          icon: CheckCircle2,
        };
      case "Funded":
        return {
          bg: "#dcfce7",
          text: "#15803d",
          icon: ShieldCheck,
        };
      case "In Progress":
        return {
          bg: theme.colors.purpleLight,
          text: theme.colors.purple,
          icon: Sparkles,
        };
      case "Completed":
        return {
          bg: theme.colors.successLight,
          text: theme.colors.success,
          icon: CheckCircle2,
        };
      case "Interviews":
        return {
          bg: theme.colors.purpleLight,
          text: theme.colors.purple,
          icon: Sparkles,
        };
      case "Reviewed":
        return {
          bg: theme.colors.infoLight,
          text: theme.colors.info,
          icon: Clock,
        };
      case "Rejected":
        return {
          bg: theme.colors.errorLight,
          text: theme.colors.error,
          icon: XCircle,
        };
      default:
        return {
          bg: theme.colors.accentLight,
          text: theme.colors.accentDark,
          icon: Clock,
        };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        <Text style={styles.navTitle}>{t.applications.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Horizontal Status Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => {
            const count =
              tab.key === "All"
                ? applications.length
                : applications.filter((a) => a.status === tab.key).length;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    isActive && styles.tabBtnTextActive,
                  ]}
                >
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Applications List */}
      <FlatList
        style={styles.applicationsList}
        data={filteredApps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          const IconComp = badge.icon;
          return (
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardTop}>
                <View style={styles.companyIconCircle}>
                  <Text style={styles.companyInitial}>
                    {item.companyName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {item.jobTitle}
                  </Text>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.companyName} • {item.location}
                  </Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                >
                  <IconComp size={12} color={badge.text} />
                  <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Next Step / Status Timeline snippet */}
              {item.nextStep && (
                <View style={styles.nextStepBox}>
                  <Text style={styles.nextStepLabel}>
                    {t.applications.statusTimeline}:
                  </Text>
                  <Text style={styles.nextStepText}>{item.nextStep}</Text>
                </View>
              )}

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.dateWrap}>
                  <Calendar size={13} color="#94a3b8" />
                  <Text style={styles.dateText}>
                    {t.applications.appliedOn} {item.appliedDate}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.chatBtn}
                  onPress={() => router.push("/(tabs)/messages")}
                >
                  <MessageSquare size={14} color={theme.colors.primary} />
                  <Text style={styles.chatBtnText}>
                    {t.applications.contactEmployer}
                  </Text>
                </TouchableOpacity>
                {["Accepted", "Funded", "In Progress"].includes(item.status) &&
                  !item.seekerValidated &&
                  user?.role !== "employer" && (
                    <TouchableOpacity
                      style={styles.validateBtn}
                      onPress={() => validateApplication(item.id, true)}
                    >
                      <CheckCircle2 size={14} color="#fff" />
                      <Text style={styles.validateText}>Validate employment</Text>
                    </TouchableOpacity>
                  )}
                {user?.role === "employer" &&
                  (item.status === "Accepted" || item.status === "Pending") &&
                  !item.paymentValidated && (
                    <TouchableOpacity
                      style={[styles.validateBtn, { backgroundColor: "#0284c7" }]}
                      onPress={() => router.push("/payment")}
                    >
                      <ShieldCheck size={14} color="#fff" />
                      <Text style={styles.validateText}>Fund Escrow</Text>
                    </TouchableOpacity>
                  )}
                {["Accepted", "Funded", "In Progress"].includes(item.status) &&
                  item.employmentStatus === "active" &&
                  !(user?.role === "employer"
                    ? item.employerCompletionConfirmed
                    : item.seekerCompletionConfirmed) && (
                    <TouchableOpacity
                      style={styles.validateBtn}
                      onPress={() => openCompletion(item)}
                    >
                      <CheckCircle2 size={14} color="#fff" />
                      <Text style={styles.validateText}>
                        Confirm completion
                      </Text>
                    </TouchableOpacity>
                  )}
                {user?.role === "employer" && item.status === "Completed" && (
                  <TouchableOpacity
                    style={[styles.validateBtn, { backgroundColor: "#475569" }]}
                    onPress={() => manageCompletedJob(item)}
                  >
                    <Briefcase size={14} color="#fff" />
                    <Text style={styles.validateText}>Manage job offer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.applications.emptyTitle}</Text>
            <Text style={styles.emptySub}>{t.applications.emptySub}</Text>
          </View>
        }
      />
      <Modal
        visible={Boolean(completionTarget)}
        transparent
        animationType="fade"
        onRequestClose={() => !submittingCompletion && setCompletionTarget(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm task completion</Text>
            <Text style={styles.modalText}>
              Confirm that {completionTarget?.jobTitle} is complete and leave a rating. Escrow releases only after both parties confirm.
            </Text>
            <Text style={styles.ratingLabel}>Your rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)}>
                  <Star size={30} color={value <= rating ? "#f59e0b" : "#cbd5e1"} fill={value <= rating ? "#f59e0b" : "transparent"} />
                </TouchableOpacity>
              ))}
            </View>
            {user?.role !== "employer" && (
              <>
                <Text style={styles.ratingLabel}>Payout method</Text>
                <View style={styles.payoutMethods}>
                  {(["mtn-mobile-money", "orange-money", "card"] as const).map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[styles.payoutMethod, payoutMethod === method && styles.payoutMethodActive]}
                      onPress={() => setPayoutMethod(method)}
                    >
                      <Text style={[styles.payoutMethodText, payoutMethod === method && styles.payoutMethodTextActive]}>
                        {method === "mtn-mobile-money" ? "MTN MoMo" : method === "orange-money" ? "Orange Money" : "Bank card"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  value={payoutAccount}
                  onChangeText={setPayoutAccount}
                  keyboardType={payoutMethod === "card" ? "default" : "phone-pad"}
                  placeholder={payoutMethod === "card" ? "Card or account reference" : "Mobile Money number"}
                  placeholderTextColor="#94a3b8"
                  style={styles.payoutInput}
                />
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity disabled={submittingCompletion} onPress={() => setCompletionTarget(null)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={submittingCompletion} onPress={submitCompletion} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>{submittingCompletion ? "Saving..." : "Confirm & rate"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  tabsContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabBtnTextActive: {
    color: "#ffffff",
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  applicationsList: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.55)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, gap: 12 },
  modalTitle: { color: theme.colors.text, fontSize: 20, fontWeight: "900" },
  modalText: { color: "#475569", lineHeight: 20 },
  ratingLabel: { color: theme.colors.text, fontWeight: "800", marginTop: 4 },
  starsRow: { flexDirection: "row", gap: 8 },
  payoutMethods: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  payoutMethod: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  payoutMethodActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  payoutMethodText: { color: "#475569", fontSize: 12, fontWeight: "700" },
  payoutMethodTextActive: { color: "#fff" },
  payoutInput: { height: 46, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, paddingHorizontal: 12, color: theme.colors.text },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 10 },
  cancelButtonText: { color: "#475569", fontWeight: "800" },
  confirmButton: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  confirmButtonText: { color: "#fff", fontWeight: "800" },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  companyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  companyInitial: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  companyName: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  nextStepBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    gap: 2,
  },
  nextStepLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  nextStepText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
    flexShrink: 1,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexShrink: 1,
    minHeight: 38,
    justifyContent: "center",
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    flexShrink: 1,
    textAlign: "center",
  },
  validateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  validateText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 260,
  },
});
