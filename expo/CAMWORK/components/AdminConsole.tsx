/**
 * ADMINISTRATOR CONSOLE
 * Moderation queue, verification desk, and user management
 */

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";
import {
  X,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  AlertTriangle,
  FileText,
  ToggleRight,
  ToggleLeft,
  MessageSquare,
  Ban,
  Check,
} from "lucide-react-native";
import { theme } from "./theme";
import { BaseUser, VerificationRequest, Dispute } from "@/types/domain";

export interface AdminConsoleProps {
  users: BaseUser[];
  verificationRequests: VerificationRequest[];
  disputes: Dispute[];
  onApproveVerification?: (verificationId: string, memo?: string) => void;
  onRejectVerification?: (verificationId: string, reason: string) => void;
  onSuspendUser?: (userId: string) => void;
  onReactivateUser?: (userId: string) => void;
  onResolveDispute?: (disputeId: string, resolution: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  users,
  verificationRequests,
  disputes,
  onApproveVerification,
  onRejectVerification,
  onSuspendUser,
  onReactivateUser,
  onResolveDispute,
}) => {
  const [activeTab, setActiveTab] = useState<
    "verification" | "moderation" | "users"
  >("verification");
  const [showVerificationDetail, setShowVerificationDetail] = useState(false);
  const [showResolveDispute, setShowResolveDispute] = useState(false);
  const [selectedVerification, setSelectedVerification] =
    useState<VerificationRequest | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [disputeResolution, setDisputeResolution] = useState("");

  const pendingVerifications = verificationRequests.filter(
    (v) => v.status === "pending",
  );
  const openDisputes = disputes.filter((d) => d.status === "open");
  const suspendedUsers = users.filter(
    (u) => u.verificationStatus === "suspended",
  );

  const handleApproveVerification = () => {
    if (selectedVerification) {
      onApproveVerification?.(selectedVerification.id);
      setShowVerificationDetail(false);
      setSelectedVerification(null);
    }
  };

  const handleRejectVerification = () => {
    if (selectedVerification && rejectionReason) {
      onRejectVerification?.(selectedVerification.id, rejectionReason);
      setShowVerificationDetail(false);
      setRejectionReason("");
      setSelectedVerification(null);
    }
  };

  const handleResolveDispute = () => {
    if (selectedDispute && disputeResolution) {
      onResolveDispute?.(selectedDispute.id, disputeResolution);
      setShowResolveDispute(false);
      setDisputeResolution("");
      setSelectedDispute(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {["verification", "moderation", "users"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab && styles.tabLabelActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* VERIFICATION TAB */}
        {activeTab === "verification" && (
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Verification Desk</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingVerifications.length}
                </Text>
              </View>
            </View>

            {pendingVerifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Shield size={40} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No pending verifications</Text>
                <Text style={styles.emptySubtext}>All users verified ✓</Text>
              </View>
            ) : (
              <FlatList
                data={pendingVerifications}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.verificationCard}>
                    <View style={styles.verificationHeader}>
                      <View>
                        <Text style={styles.userName}>
                          User ID: {item.userId}
                        </Text>
                        <Text style={styles.submittedDate}>
                          Submitted:{" "}
                          {new Date(item.submissionDate).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.pendingBadge}>
                        <AlertTriangle size={14} color={theme.colors.info} />
                        <Text style={styles.pendingText}>PENDING</Text>
                      </View>
                    </View>

                    {item.documents.length > 0 && (
                      <View style={styles.documentsList}>
                        <Text style={styles.documentsTitle}>Documents:</Text>
                        {item.documents.map((doc, idx) => (
                          <View key={idx} style={styles.documentItem}>
                            <FileText size={14} color={theme.colors.primary} />
                            <View>
                              <Text style={styles.docName}>
                                {doc.documentType}
                              </Text>
                              <Text style={styles.docPath} numberOfLines={1}>
                                {doc.documentUrl}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => {
                        setSelectedVerification(item);
                        setShowVerificationDetail(true);
                      }}
                    >
                      <MessageSquare size={16} color={theme.colors.white} />
                      <Text style={styles.reviewBtnText}>Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* MODERATION TAB */}
        {activeTab === "moderation" && (
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Moderation Queue</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{openDisputes.length}</Text>
              </View>
            </View>

            {openDisputes.length === 0 ? (
              <View style={styles.emptyState}>
                <AlertTriangle size={40} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No open disputes</Text>
                <Text style={styles.emptySubtext}>Platform is clean ✓</Text>
              </View>
            ) : (
              <FlatList
                data={openDisputes}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.disputeCard}>
                    <View style={styles.disputeHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.disputeReason}>{item.reason}</Text>
                        <Text style={styles.disputeDate}>
                          Reported:{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.openBadge}>
                        <AlertTriangle size={14} color={theme.colors.error} />
                      </View>
                    </View>

                    {item.description && (
                      <Text style={styles.disputeDescription}>
                        {item.description}
                      </Text>
                    )}

                    <TouchableOpacity
                      style={styles.resolveBtn}
                      onPress={() => {
                        setSelectedDispute(item);
                        setShowResolveDispute(true);
                      }}
                    >
                      <Check size={16} color={theme.colors.white} />
                      <Text style={styles.resolveBtnText}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>User Management</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{suspendedUsers.length}</Text>
              </View>
            </View>

            {suspendedUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={40} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No suspended users</Text>
                <Text style={styles.emptySubtext}>
                  {users.length} active users
                </Text>
              </View>
            ) : (
              <FlatList
                data={suspendedUsers}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.userRole}>
                          Role: {item.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.suspendedBadge}>
                      <Ban size={14} color={theme.colors.error} />
                      <Text style={styles.suspendedText}>SUSPENDED</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.reactivateBtn}
                      onPress={() => {
                        Alert.alert(
                          "Reactivate User",
                          `Reactivate ${item.name}?`,
                          [
                            { text: "Cancel", onPress: () => {} },
                            {
                              text: "Reactivate",
                              onPress: () => onReactivateUser?.(item.id),
                              style: "default",
                            },
                          ],
                        );
                      }}
                    >
                      <CheckCircle size={16} color={theme.colors.success} />
                      <Text style={styles.reactivateBtnText}>Reactivate</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}

            {/* All Users List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                All Users ({users.length})
              </Text>
              <FlatList
                data={users.slice(0, 10)}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userListItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View style={styles.itemMeta}>
                        <Text style={styles.itemRole}>{item.role}</Text>
                        <Text style={styles.itemStatus}>
                          {item.verificationStatus}
                        </Text>
                      </View>
                    </View>
                    {item.verificationStatus !== "suspended" && (
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert("Suspend User", `Suspend ${item.name}?`, [
                            { text: "Cancel", onPress: () => {} },
                            {
                              text: "Suspend",
                              onPress: () => onSuspendUser?.(item.id),
                              style: "destructive",
                            },
                          ]);
                        }}
                      >
                        <Ban size={18} color={theme.colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Verification Review Modal */}
      <Modal visible={showVerificationDetail} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Verification</Text>
            <TouchableOpacity onPress={() => setShowVerificationDetail(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.reviewUser}>
              User: {selectedVerification?.userId}
            </Text>
            <Text style={styles.reviewDate}>
              Submitted:{" "}
              {selectedVerification?.submissionDate
                ? new Date(
                    selectedVerification.submissionDate,
                  ).toLocaleDateString()
                : "N/A"}
            </Text>

            {selectedVerification?.documents && (
              <View style={styles.reviewDocuments}>
                <Text style={styles.reviewDocsTitle}>Submitted Documents</Text>
                {selectedVerification.documents.map((doc, idx) => (
                  <View key={idx} style={styles.reviewDocItem}>
                    <FileText size={16} color={theme.colors.primary} />
                    <View>
                      <Text style={styles.reviewDocName}>
                        {doc.documentType}
                      </Text>
                      <Text style={styles.reviewDocPath} numberOfLines={1}>
                        {doc.documentUrl}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.rejectionSection}>
              <Text style={styles.rejectionLabel}>
                Reason to Reject (if applicable)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter rejection reason"
                multiline
                numberOfLines={3}
                value={rejectionReason}
                onChangeText={setRejectionReason}
              />
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={handleApproveVerification}
              >
                <CheckCircle size={18} color={theme.colors.white} />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={handleRejectVerification}
              >
                <XCircle size={18} color={theme.colors.white} />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Dispute Resolution Modal */}
      <Modal visible={showResolveDispute} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resolve Dispute</Text>
            <TouchableOpacity onPress={() => setShowResolveDispute(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.reviewUser}>{selectedDispute?.reason}</Text>
            <Text style={styles.reviewDate}>
              Reported:{" "}
              {selectedDispute?.createdAt
                ? new Date(selectedDispute.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>

            {selectedDispute?.description && (
              <View style={styles.disputeDetailBox}>
                <Text style={styles.disputeDetailTitle}>Details</Text>
                <Text style={styles.disputeDetailText}>
                  {selectedDispute.description}
                </Text>
              </View>
            )}

            <View style={styles.resolutionSection}>
              <Text style={styles.resolutionLabel}>Resolution</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the resolution taken"
                multiline
                numberOfLines={4}
                value={disputeResolution}
                onChangeText={setDisputeResolution}
              />
            </View>

            <TouchableOpacity
              style={styles.markResolvedBtn}
              onPress={handleResolveDispute}
            >
              <Check size={18} color={theme.colors.white} />
              <Text style={styles.markResolvedBtnText}>Mark as Resolved</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    marginHorizontal: 16,
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  verificationCard: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  verificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  submittedDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.radius.sm,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.info,
  },
  documentsList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    marginBottom: 8,
  },
  documentsTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  docName: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.text,
  },
  docPath: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  reviewBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  disputeCard: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  disputeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  disputeReason: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  disputeDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disputeDescription: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
    marginBottom: 8,
  },
  resolveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
  },
  resolveBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  userCard: {
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  userRole: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  suspendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.sm,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  suspendedText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.error,
  },
  reactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.md,
  },
  reactivateBtnText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  userListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
  },
  itemMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  itemRole: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  itemStatus: {
    fontSize: 10,
    color: theme.colors.accent,
    fontWeight: "500",
  },
  modal: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  modalContent: {
    padding: 16,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  reviewDocuments: {
    marginBottom: 16,
  },
  reviewDocsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  reviewDocItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    marginBottom: 6,
  },
  reviewDocName: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.text,
  },
  reviewDocPath: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rejectionSection: {
    marginBottom: 16,
  },
  rejectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
  },
  approveBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.md,
  },
  rejectBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  disputeDetailBox: {
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 16,
  },
  disputeDetailTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  disputeDetailText: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
  },
  resolutionSection: {
    marginBottom: 16,
  },
  resolutionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  markResolvedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
    marginTop: 16,
  },
  markResolvedBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
