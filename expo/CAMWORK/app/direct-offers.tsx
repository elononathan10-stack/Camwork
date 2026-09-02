import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Gift,
  Check,
  X,
  MessageSquare,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, DirectOfferItem } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DirectOffersScreen() {
  const { directOffers, acceptOffer, declineOffer } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleAccept = (offer: DirectOfferItem) => {
    acceptOffer(offer.id);
    Alert.alert(
      language === "EN" ? "Offer Accepted!" : "Offre Acceptée !",
      language === "EN"
        ? `You have accepted the direct offer from ${offer.companyName}. The recruiter has been notified.`
        : `Vous avez accepté l'offre directe de ${offer.companyName}. Le recruteur a été informé.`,
    );
  };

  const handleDecline = (offer: DirectOfferItem) => {
    declineOffer(offer.id);
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
        <Text style={styles.navTitle}>{t.directOffers.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={directOffers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          /* Explanatory Two-Way Match Banner */
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconCircle}>
              <Gift size={24} color={theme.colors.accentDark} />
            </View>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitle}>
                {t.directOffers.bannerTitle}
              </Text>
              <Text style={styles.bannerSub}>{t.directOffers.bannerSub}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isPending = item.status === "Pending";
          const isAccepted = item.status === "Accepted";
          const isDeclined = item.status === "Declined";

          return (
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.companyLogo}>
                  <Text style={styles.logoLetter}>
                    {item.companyName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.companyInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                    <ShieldCheck size={14} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.recruiterName}>{item.employerName}</Text>
                </View>
                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isAccepted && {
                      backgroundColor: theme.colors.successLight,
                    },
                    isDeclined && { backgroundColor: theme.colors.errorLight },
                    isPending && { backgroundColor: theme.colors.accentLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isAccepted && { color: theme.colors.success },
                      isDeclined && { color: theme.colors.error },
                      isPending && { color: theme.colors.accentDark },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Offer Details */}
              <View style={styles.offerBody}>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <DollarSign size={14} color={theme.colors.primary} />
                    <Text style={styles.metaText}>{item.rateOffered}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color="#64748b" />
                    <Text style={styles.metaText}>
                      {t.directOffers.startDate}: {item.startDate}
                    </Text>
                  </View>
                </View>

                {/* Recruiter Message */}
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>
                    &quot;{item.message}&quot;
                  </Text>
                </View>
              </View>

              {/* Actions */}
              {isPending && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDecline(item)}
                  >
                    <X size={16} color={theme.colors.error} />
                    <Text style={styles.declineBtnText}>
                      {t.directOffers.declineBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => router.push("/(tabs)/messages")}
                  >
                    <MessageSquare size={16} color={theme.colors.primary} />
                    <Text style={styles.chatBtnText}>
                      {t.directOffers.chatBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAccept(item)}
                  >
                    <Check size={16} color="#ffffff" />
                    <Text style={styles.acceptBtnText}>
                      {t.directOffers.acceptBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isPending && (
                <View style={styles.resolvedRow}>
                  <Text style={styles.resolvedText}>
                    {isAccepted
                      ? language === "EN"
                        ? "Offer accepted. The recruiter will contact you soon."
                        : "Offre acceptée. Le recruteur vous contactera sous peu."
                      : language === "EN"
                        ? "Offer declined."
                        : "Offre refusée."}
                  </Text>
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() => router.push("/(tabs)/messages")}
                  >
                    <MessageSquare size={14} color={theme.colors.primary} />
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Gift size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.directOffers.emptyTitle}</Text>
            <Text style={styles.emptySub}>{t.directOffers.emptySub}</Text>
          </View>
        }
      />
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
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  listContent: {
    padding: 16,
    gap: 14,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  bannerCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.accentLight,
    padding: 16,
    borderRadius: 18,
    gap: 12,
    alignItems: "center",
    marginBottom: 6,
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTextWrap: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.accentDark,
  },
  bannerSub: {
    fontSize: 12,
    color: theme.colors.accentDark,
    lineHeight: 16,
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
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  companyInfo: {
    flex: 1,
    minWidth: 150,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  recruiterName: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  offerBody: {
    gap: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  messageBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  messageText: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  declineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.errorLight,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.error,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.primary,
    height: 42,
    borderRadius: 12,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  resolvedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  resolvedText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    flex: 1,
  },
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
