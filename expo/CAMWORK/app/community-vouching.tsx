import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  Alert,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Plus,
  X,
  Send,
  Sparkles,
  Award,
  HeartHandshake,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, VouchItem } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

const INITIAL_VOUCHES: VouchItem[] = [
  {
    id: "v1",
    endorserName: "Henriette Ntone",
    endorserRole: "Supply Chain Director",
    company: "Maersk Line Cameroon",
    relationship: "Former Department Manager",
    date: "3 months ago",
    verifiedBadge: true,
    comment:
      "I mentored Jean for 3 years. His integrity, meticulous customs paperwork, and team leadership are exemplary.",
  },
  {
    id: "v2",
    endorserName: "Dr. Samuel Foko",
    endorserRole: "President",
    company: "Cameroon Logistics & Freight Association",
    relationship: "Trade Guild Peer",
    date: "5 months ago",
    verifiedBadge: true,
    comment:
      "Jean is a certified member in good standing with verified peer track record across regional corridors.",
  },
];

export default function CommunityVouchingScreen() {
  const { user, requestVouch } = useUser();
  const { language, t } = useLanguage();

  const [vouches, setVouches] = useState<VouchItem[]>(INITIAL_VOUCHES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactInput, setContactInput] = useState("");
  const [relationInput, setRelationInput] = useState("");

  const handleSendRequest = async () => {
    if (!contactInput.trim()) return;
    await requestVouch(
      contactInput.trim(),
      relationInput.trim() || "Colleague",
    );
    setIsModalOpen(false);
    setContactInput("");
    setRelationInput("");
    Alert.alert(
      language === "EN" ? "Request Sent!" : "Demande Envoyée !",
      language === "EN"
        ? "We sent an invitation to your peer to endorse your profile."
        : "Nous avons envoyé une invitation à votre contact pour valider votre recommandation.",
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
        <Text style={styles.navTitle}>{t.vouching.title}</Text>
        <TouchableOpacity
          style={styles.requestBtnHeader}
          onPress={() => setIsModalOpen(true)}
        >
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vouches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 8 }}>
            {/* Reputation Banner */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerIconCircle}>
                <HeartHandshake size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.bannerInfo}>
                <Text style={styles.bannerTitle}>{t.vouching.bannerTitle}</Text>
                <Text style={styles.bannerSub}>{t.vouching.bannerDesc}</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {t.vouching.vouchesReceived} ({vouches.length})
              </Text>
              <TouchableOpacity
                style={styles.actionPill}
                onPress={() => setIsModalOpen(true)}
              >
                <Plus size={14} color={theme.colors.primary} />
                <Text style={styles.actionPillText}>
                  {t.vouching.requestVouchBtn}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.vouchCard}>
            <View style={styles.vouchHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {item.endorserName.charAt(0)}
                </Text>
              </View>
              <View style={styles.endorserInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.endorserName}>{item.endorserName}</Text>
                  {item.verifiedBadge && (
                    <ShieldCheck size={14} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={styles.endorserRole}>
                  {item.endorserRole} • {item.company}
                </Text>
                <Text style={styles.relationText}>{item.relationship}</Text>
              </View>
              <Text style={styles.vouchDate}>{item.date}</Text>
            </View>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>&quot;{item.comment}&quot;</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Users size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.vouching.noVouchesYet}</Text>
          </View>
        }
      />

      {/* Request Vouch Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t.vouching.requestModalTitle}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={22} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {language === "EN"
                    ? "Contact Info"
                    : "Coordonnées du contact"}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t.vouching.contactPlaceholder}
                  placeholderTextColor="#94a3b8"
                  value={contactInput}
                  onChangeText={setContactInput}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {language === "EN"
                    ? "Professional Relationship"
                    : "Relation professionnelle"}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t.vouching.relationPlaceholder}
                  placeholderTextColor="#94a3b8"
                  value={relationInput}
                  onChangeText={setRelationInput}
                />
              </View>

              <TouchableOpacity
                style={styles.sendRequestBtn}
                onPress={handleSendRequest}
              >
                <Send size={18} color="#ffffff" />
                <Text style={styles.sendRequestBtnText}>
                  {t.vouching.sendRequestBtn}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  requestBtnHeader: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 18,
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerInfo: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  bannerSub: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  vouchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  vouchHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  endorserInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  endorserName: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  endorserRole: {
    fontSize: 12,
    color: "#64748b",
  },
  relationText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  vouchDate: {
    fontSize: 11,
    color: "#94a3b8",
  },
  quoteBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  quoteText: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  modalForm: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.text,
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  sendRequestBtn: {
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  sendRequestBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
