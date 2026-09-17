import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Wallet,
  Phone,
  Clock,
  Building2,
  ArrowUpRight,
  Lock,
  Check,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, PaymentItem } from "@/context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PaymentMethod = "mtn-mobile-money" | "orange-money" | "card";
type FilterTab = "All" | "held" | "released" | "completed";

const escrowAmountFromSalary = (salary?: string) => {
  const firstAmount = salary?.match(/\d[\d\s,]*/)?.[0];
  return firstAmount?.replace(/[^0-9]/g, "") || "";
};

export default function PaymentScreen() {
  const params = useLocalSearchParams<{ applicationId?: string | string[] }>();
  const {
    user,
    applications,
    payments,
    refreshApplications,
    refreshPayments,
    fundEscrowPayment,
  } = useUser();
  const insets = useSafeAreaInsets();

  const [method, setMethod] = useState<PaymentMethod>("mtn-mobile-money");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [isMethodSaved, setIsMethodSaved] = useState(false);
  const [amount, setAmount] = useState("25000");
  const requestedApplicationId = Array.isArray(params.applicationId)
    ? params.applicationId[0]
    : params.applicationId;
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | undefined>(
    requestedApplicationId,
  );
  const [status, setStatus] = useState<"idle" | "processing" | "paid">("idle");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [refreshing, setRefreshing] = useState(false);

  // Applications that can be funded by employer
  const fundableApplications = useMemo(() => {
    if (user?.role !== "employer") return [];
    return applications.filter(
      (app) =>
        !app.paymentValidated &&
        ["Accepted", "Pending", "Reviewed", "Interviews"].includes(app.status),
    );
  }, [applications, user?.role]);
  const selectedApplication = fundableApplications.find(
    (application) => application.id === selectedApplicationId,
  );

  // If none selected yet and we have fundable applications, select the first one
  useEffect(() => {
    if (!selectedApplicationId && fundableApplications.length > 0) {
      setSelectedApplicationId(fundableApplications[0].id);
      const cleanSalary = escrowAmountFromSalary(fundableApplications[0].salary);
      if (cleanSalary && Number(cleanSalary) > 0) {
        setAmount(cleanSalary);
      }
    }
  }, [fundableApplications, selectedApplicationId]);

  useEffect(() => {
    if (!requestedApplicationId) return;
    const requestedApplication = fundableApplications.find(
      (application) => application.id === requestedApplicationId,
    );
    if (requestedApplication) {
      setSelectedApplicationId(requestedApplication.id);
      setAmount(escrowAmountFromSalary(requestedApplication.salary));
    }
  }, [fundableApplications, requestedApplicationId]);

  // Initial fetch
  useEffect(() => {
    refreshApplications().catch(() => undefined);
    refreshPayments().catch(() => undefined);
  }, [refreshApplications, refreshPayments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshApplications(), refreshPayments()]);
    } catch {
      // Ignored
    } finally {
      setRefreshing(false);
    }
  }, [refreshApplications, refreshPayments]);

  const handleSelectApplication = (appId: string) => {
    setSelectedApplicationId(appId);
    const selectedApp = fundableApplications.find((a) => a.id === appId);
    if (selectedApp) {
      const cleanSalary = escrowAmountFromSalary(selectedApp.salary);
      if (cleanSalary && Number(cleanSalary) > 0) {
        setAmount(cleanSalary);
      }
    }
  };

  const handleSavePaymentMethod = () => {
    if ((method === "mtn-mobile-money" || method === "orange-money") && !phoneNumber.trim()) {
      Alert.alert("Phone number required", "Please enter your Mobile Money phone number.");
      return;
    }
    setIsMethodSaved(true);
    Alert.alert(
      "Payment method saved",
      `Your ${
        method === "mtn-mobile-money"
          ? "MTN Mobile Money"
          : method === "orange-money"
            ? "Orange Money"
            : "Bank Card"
      } configuration is active for CamWork transactions.`,
    );
  };

  const handleFundEscrow = async () => {
    const cleanAmount = amount.replace(/[^0-9]/g, "");
    if (!cleanAmount || Number(cleanAmount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount in FCFA.");
      return;
    }

    if (!user?.email) {
      Alert.alert("Sign In Required", "Please sign in to make a payment.");
      return;
    }

    if (user?.role === "employer" && !selectedApplicationId) {
      Alert.alert("Select Job Offer", "Please choose an applicant to fund into escrow.");
      return;
    }

    const requiredAmount = escrowAmountFromSalary(selectedApplication?.salary);
    if (user?.role === "employer" && (!selectedApplication || cleanAmount !== requiredAmount)) {
      Alert.alert(
        "Use the offer amount",
        "Escrow must be funded with the compensation stated in the selected job offer.",
      );
      return;
    }

    setStatus("processing");
    try {
      await fundEscrowPayment({
        amount: cleanAmount,
        method,
        applicationId: selectedApplicationId,
      });
      await Promise.all([refreshApplications(), refreshPayments()]);
      setStatus("paid");
      Alert.alert(
        "Escrow Funded Successfully",
        `Funds of ${Number(cleanAmount).toLocaleString()} FCFA are now held safely in CamWork Escrow. They will be released once both you and the worker confirm completion.`,
      );
    } catch (error) {
      setStatus("idle");
      Alert.alert(
        "Payment Failed",
        error instanceof Error ? error.message : "Unable to process payment.",
      );
    }
  };

  // Metrics computation
  const totalHeldInEscrow = useMemo(() => {
    return payments
      .filter((p) => p.status === "held")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const totalReleased = useMemo(() => {
    return payments
      .filter((p) => p.status === "released" || p.status === "completed")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  // Filtered transactions for FlatList
  const filteredPayments = useMemo(() => {
    if (activeFilter === "All") return payments;
    return payments.filter((p) => p.status === activeFilter);
  }, [payments, activeFilter]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Trust & Guarantee Banner */}
      <View style={styles.trustBanner}>
        <View style={styles.trustIconWrap}>
          <ShieldCheck size={24} color="#059669" />
        </View>
        <View style={styles.trustTextWrap}>
          <Text style={styles.trustTitle}>CamWork Protected Escrow</Text>
          <Text style={styles.trustDescription}>
            Funds are secured in escrow before work begins and automatically released only when both
            parties confirm completion.
          </Text>
        </View>
      </View>

      {/* Escrow Balance & Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIconBadge}>
            <Lock size={15} color="#0284c7" />
          </View>
          <Text style={styles.statLabel}>In Escrow</Text>
          <Text style={styles.statValue}>{totalHeldInEscrow.toLocaleString()} FCFA</Text>
          <Text style={styles.statSub}>Held securely</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconBadge, { backgroundColor: "#dcfce7" }]}>
            <CheckCircle2 size={15} color="#15803d" />
          </View>
          <Text style={styles.statLabel}>Released</Text>
          <Text style={styles.statValue}>{totalReleased.toLocaleString()} FCFA</Text>
          <Text style={styles.statSub}>Completed payouts</Text>
        </View>
      </View>

      {/* Payment Methods Section */}
      <View style={styles.sectionHeader}>
        <Wallet size={18} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </View>

      <View style={styles.methodsContainer}>
        {/* MTN MoMo */}
        <TouchableOpacity
          style={[styles.methodCard, method === "mtn-mobile-money" && styles.methodCardActive]}
          onPress={() => {
            setMethod("mtn-mobile-money");
            setIsMethodSaved(false);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIconBadge, { backgroundColor: "#fef08a" }]}>
            <Phone size={18} color="#854d0e" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>MTN Mobile Money</Text>
            <Text style={styles.methodSub}>Instant Cameroon MoMo prompt</Text>
          </View>
          {method === "mtn-mobile-money" && (
            <View style={styles.checkCircle}>
              <Check size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Orange Money */}
        <TouchableOpacity
          style={[styles.methodCard, method === "orange-money" && styles.methodCardActive]}
          onPress={() => {
            setMethod("orange-money");
            setIsMethodSaved(false);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIconBadge, { backgroundColor: "#ffedd5" }]}>
            <Phone size={18} color="#c2410c" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Orange Money</Text>
            <Text style={styles.methodSub}>Orange Money Web & OM code</Text>
          </View>
          {method === "orange-money" && (
            <View style={styles.checkCircle}>
              <Check size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Bank Card */}
        <TouchableOpacity
          style={[styles.methodCard, method === "card" && styles.methodCardActive]}
          onPress={() => {
            setMethod("card");
            setIsMethodSaved(false);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.methodIconBadge, { backgroundColor: "#e0e7ff" }]}>
            <CreditCard size={18} color="#4338ca" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Bank Card (Visa / Mastercard)</Text>
            <Text style={styles.methodSub}>International & local cards</Text>
          </View>
          {method === "card" && (
            <View style={styles.checkCircle}>
              <Check size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Phone / Account Number Input */}
        {(method === "mtn-mobile-money" || method === "orange-money") && (
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Mobile Money Number (Cameroon)</Text>
            <View style={styles.phoneInputBox}>
              <Text style={styles.phonePrefix}>+237</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                placeholder="6XX XXX XXX"
                placeholderTextColor="#94a3b8"
                style={styles.phoneInput}
              />
              <TouchableOpacity
                onPress={Keyboard.dismiss}
                accessibilityLabel="Done entering phone number"
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveMethodBtn, isMethodSaved && styles.saveMethodBtnActive]}
          onPress={handleSavePaymentMethod}
        >
          <Text style={[styles.saveMethodBtnText, isMethodSaved && styles.saveMethodBtnTextActive]}>
            {isMethodSaved ? "Payment Method Active" : "Save Preferred Payment Method"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Employer Funding Section */}
      {user?.role === "employer" ? (
        <View style={styles.fundingSection}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={18} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Fund Accepted Contract</Text>
          </View>

          {fundableApplications.length === 0 ? (
            <View style={styles.noAppsBox}>
              <CheckCircle2 size={24} color="#059669" />
              <Text style={styles.noAppsTitle}>All Active Contracts Funded</Text>
              <Text style={styles.noAppsSub}>
                When you accept new applicants from your dashboard, they will appear here ready to
                be funded into escrow.
              </Text>
            </View>
          ) : (
            <View style={styles.fundingCard}>
              <Text style={styles.fundingSubtitle}>
                Select an applicant to deposit the agreed compensation into escrow:
              </Text>

              {fundableApplications.map((app) => {
                const isSelected = selectedApplicationId === app.id;
                return (
                  <TouchableOpacity
                    key={app.id}
                    style={[styles.appOptionCard, isSelected && styles.appOptionCardSelected]}
                    onPress={() => handleSelectApplication(app.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.appOptionLeft}>
                      <View style={styles.appIconCircle}>
                        <Building2 size={16} color={theme.colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appOptionJob}>{app.jobTitle}</Text>
                        <Text style={styles.appOptionApplicant}>
                          {app.applicantEmail || "Applicant"} • {app.companyName}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.appOptionRight}>
                      <Text style={styles.appOptionSalary}>{app.salary}</Text>
                      {isSelected && (
                        <View style={styles.checkCircleSmall}>
                          <Check size={12} color="#fff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Amount Input */}
              <View style={styles.amountInputWrap}>
                <Text style={styles.inputLabel}>Escrow Deposit Amount (FCFA)</Text>
                <Text style={styles.offerAmountHint}>
                  Matches this job offer: {selectedApplication?.salary || "Select an applicant"}
                </Text>
                <View style={styles.amountInputBox}>
                  <Text style={styles.currencySymbol}>FCFA</Text>
                  <TextInput
                    value={amount}
                    keyboardType="numeric"
                    editable={false}
                    placeholderTextColor="#94a3b8"
                    style={styles.amountInput}
                  />
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.fundButton,
                  status === "processing" && styles.fundButtonDisabled,
                ]}
                onPress={handleFundEscrow}
                disabled={status === "processing"}
                activeOpacity={0.8}
              >
                {status === "processing" ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.fundButtonText}>Securing Funds in Escrow...</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <ShieldCheck size={18} color="#fff" />
                    <Text style={styles.fundButtonText}>
                      Deposit {Number(amount.replace(/[^0-9]/g, "") || 0).toLocaleString()} FCFA in Escrow
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* Seeker Payout View */
        <View style={styles.seekerPayoutBox}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={18} color="#059669" />
            <Text style={styles.sectionTitle}>Worker Escrow Payouts</Text>
          </View>
          <Text style={styles.seekerPayoutDesc}>
            When an employer hires you, they deposit the compensation into escrow first. As soon as
            both you and the employer confirm job completion, your funds are immediately released to
            your configured payment account.
          </Text>
        </View>
      )}

      {/* Transaction History Section Header */}
      <View style={styles.historySectionHeader}>
        <View style={styles.sectionHeader}>
          <Clock size={18} color={theme.colors.text} />
          <Text style={styles.sectionTitle}>Transaction & Escrow History</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(["All", "held", "released", "completed"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text
                style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}
              >
                {tab === "All"
                  ? "All"
                  : tab === "held"
                    ? "In Escrow"
                    : tab === "released"
                      ? "Released"
                      : "Completed"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPaymentItem = ({ item }: { item: PaymentItem }) => {
    const isHeld = item.status === "held";
    const isReleased = item.status === "released" || item.status === "completed";
    const numericAmount = Number(item.amount) || 0;

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.txIconBox,
              isHeld
                ? { backgroundColor: "#e0f2fe" }
                : isReleased
                  ? { backgroundColor: "#dcfce7" }
                  : { backgroundColor: "#fef3c7" },
            ]}
          >
            {isHeld ? (
              <Lock size={18} color="#0284c7" />
            ) : isReleased ? (
              <ArrowUpRight size={18} color="#15803d" />
            ) : (
              <Clock size={18} color="#d97706" />
            )}
          </View>

          <View style={styles.txInfo}>
            <Text style={styles.txTitle}>{item.jobTitle || "Job Escrow Payment"}</Text>
            <Text style={styles.txMeta}>
              {item.method === "mtn-mobile-money"
                ? "MTN MoMo"
                : item.method === "orange-money"
                  ? "Orange Money"
                  : "Bank Card"}{" "}
              • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
            </Text>
            {item.applicantEmail && (
              <Text style={styles.txCounterparty}>
                Worker: {item.applicantEmail}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.txRight}>
          <Text style={styles.txAmount}>{numericAmount.toLocaleString()} FCFA</Text>
          <View
            style={[
              styles.statusBadge,
              isHeld
                ? styles.statusBadgeHeld
                : isReleased
                  ? styles.statusBadgeReleased
                  : styles.statusBadgePending,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                isHeld
                  ? styles.statusTextHeld
                  : isReleased
                    ? styles.statusTextReleased
                    : styles.statusTextPending,
              ]}
            >
              {isHeld ? "In Escrow" : isReleased ? "Released" : "Pending"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Wallet size={44} color="#94a3b8" />
      <Text style={styles.emptyTitle}>No Transactions Found</Text>
      <Text style={styles.emptySub}>
        {user?.role === "employer"
          ? "Deposit into escrow for an accepted applicant to start a protected job contract."
          : "Your escrow deposits and received payouts will appear here once an employer funds a job."}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={21} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Payments & Escrow</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main FlatList Container */}
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPaymentItem}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 36 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  navbar: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
  listContent: {
    padding: 16,
  },
  headerContent: {
    gap: 16,
    marginBottom: 12,
  },
  trustBanner: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  trustIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  trustTextWrap: {
    flex: 1,
  },
  trustTitle: {
    color: "#065f46",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  trustDescription: {
    color: "#047857",
    fontSize: 12,
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
  },
  statSub: {
    fontSize: 11,
    color: "#94a3b8",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: theme.colors.text,
  },
  methodsContainer: {
    gap: 10,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  methodCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  methodIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  methodSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    marginTop: 4,
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.text,
  },
  phoneInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  phonePrefix: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    height: "100%",
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: theme.colors.primaryLight,
  },
  doneButtonText: { color: theme.colors.primary, fontSize: 12, fontWeight: "800" },
  saveMethodBtn: {
    marginTop: 6,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  saveMethodBtnActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
  },
  saveMethodBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },
  saveMethodBtnTextActive: {
    color: "#15803d",
  },
  fundingSection: {
    gap: 12,
  },
  offerAmountHint: { color: "#64748b", fontSize: 12, lineHeight: 17 },
  noAppsBox: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    textAlign: "center",
    gap: 6,
  },
  noAppsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#059669",
  },
  noAppsSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 17,
  },
  fundingCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  fundingSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  appOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  appOptionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  appOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  appIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  appOptionJob: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  appOptionApplicant: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  appOptionRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  appOptionSalary: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  amountInputWrap: {
    gap: 6,
    marginTop: 4,
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
    height: "100%",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  chipBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipBtnActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  chipBtnTextActive: {
    color: theme.colors.primary,
  },
  fundButton: {
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  fundButtonDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fundButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  seekerPayoutBox: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  seekerPayoutDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
  },
  historySectionHeader: {
    gap: 10,
    marginTop: 8,
  },
  filterTabs: {
    flexDirection: "row",
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  filterTabTextActive: {
    color: "#ffffff",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
  },
  txMeta: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  txCounterparty: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeHeld: {
    backgroundColor: "#e0f2fe",
  },
  statusBadgeReleased: {
    backgroundColor: "#dcfce7",
  },
  statusBadgePending: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  statusTextHeld: {
    color: "#0369a1",
  },
  statusTextReleased: {
    color: "#15803d",
  },
  statusTextPending: {
    color: "#b45309",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },
});
