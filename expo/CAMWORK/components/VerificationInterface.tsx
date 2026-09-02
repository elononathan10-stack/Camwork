/**
 * VERIFICATION & TRUST INTERFACE
 * Interface for job seekers to request and track verification status
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
  Alert,
} from "react-native";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  X,
  Shield,
  Award,
  FileText,
  Camera,
} from "lucide-react-native";
import { theme } from "./theme";
import { VerificationRequest, VouchRequest } from "@/types/domain";

export interface VerificationInterfaceProps {
  verificationStatus: "unverified" | "pending" | "verified" | "suspended";
  verificationRequest?: VerificationRequest;
  vouchRequests: VouchRequest[];
  onRequestVerification?: (
    documents: { documentType: string; documentUrl: string }[],
  ) => void;
  onEndorseVouch?: (vouchId: string) => void;
  onDeclineVouch?: (vouchId: string) => void;
  onRequestVouch?: (endorserInfo: {
    name: string;
    role: string;
    company: string;
  }) => void;
}

const getVerificationStatusColor = (status: string) => {
  switch (status) {
    case "verified":
      return {
        bg: theme.colors.successLight,
        text: theme.colors.success,
        icon: "✓",
      };
    case "pending":
      return {
        bg: theme.colors.infoLight,
        text: theme.colors.info,
        icon: "⏳",
      };
    case "unverified":
      return {
        bg: theme.colors.errorLight,
        text: theme.colors.error,
        icon: "!",
      };
    case "suspended":
      return {
        bg: theme.colors.errorLight,
        text: theme.colors.error,
        icon: "⛔",
      };
    default:
      return {
        bg: theme.colors.accentLight,
        text: theme.colors.accentDark,
        icon: "?",
      };
  }
};

const getVouchStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Awaiting response";
    case "endorsed":
      return "Endorsed";
    case "declined":
      return "Declined";
    default:
      return status;
  }
};

export const VerificationInterface: React.FC<VerificationInterfaceProps> = ({
  verificationStatus,
  verificationRequest,
  vouchRequests,
  onRequestVerification,
  onEndorseVouch,
  onDeclineVouch,
  onRequestVouch,
}) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showVouchModal, setShowVouchModal] = useState(false);
  const [documents, setDocuments] = useState<
    { documentType: string; documentUrl: string }[]
  >([]);
  const [newDocType, setNewDocType] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");

  const [vouchForm, setVouchForm] = useState({
    name: "",
    role: "",
    company: "",
  });

  const statusColor = getVerificationStatusColor(verificationStatus);

  const handleAddDocument = () => {
    if (newDocType && newDocUrl) {
      setDocuments([
        ...documents,
        { documentType: newDocType, documentUrl: newDocUrl },
      ]);
      setNewDocType("");
      setNewDocUrl("");
    }
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmitVerification = () => {
    if (documents.length === 0) {
      Alert.alert("Required", "Please add at least one document");
      return;
    }
    onRequestVerification?.(documents);
    setDocuments([]);
    setShowVerificationModal(false);
  };

  const handleRequestVouch = () => {
    if (vouchForm.name && vouchForm.role && vouchForm.company) {
      onRequestVouch?.(vouchForm);
      setVouchForm({ name: "", role: "", company: "" });
      setShowVouchModal(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Verification Card */}
      <View style={styles.verificationCard}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusIcon, { color: statusColor.text }]}>
            {statusColor.icon}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: statusColor.text }]}>
              {verificationStatus.charAt(0).toUpperCase() +
                verificationStatus.slice(1)}
            </Text>
            <Text style={styles.statusSubtext}>
              {verificationStatus === "verified"
                ? "Your profile is verified"
                : verificationStatus === "pending"
                  ? "Verification in progress"
                  : "Complete verification to build trust"}
            </Text>
          </View>
        </View>

        {verificationStatus !== "verified" && (
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={() => setShowVerificationModal(true)}
          >
            <Shield size={18} color={theme.colors.white} />
            <Text style={styles.verifyBtnText}>Request Verification</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Verification Request History */}
      {verificationRequest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification History</Text>
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyTitle}>
                  {verificationRequest.status === "pending"
                    ? "Pending Review"
                    : "Verified"}
                </Text>
                <Text style={styles.historyDate}>
                  Submitted:{" "}
                  {new Date(
                    verificationRequest.submissionDate,
                  ).toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.historyBadge,
                  {
                    backgroundColor:
                      verificationRequest.status === "pending"
                        ? theme.colors.infoLight
                        : theme.colors.successLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyBadgeText,
                    {
                      color:
                        verificationRequest.status === "pending"
                          ? theme.colors.info
                          : theme.colors.success,
                    },
                  ]}
                >
                  {verificationRequest.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {verificationRequest.documents.length > 0 && (
              <View style={styles.documentsList}>
                {verificationRequest.documents.map((doc, idx) => (
                  <View key={idx} style={styles.documentItem}>
                    <FileText size={16} color={theme.colors.primary} />
                    <Text style={styles.documentName}>{doc.documentType}</Text>
                  </View>
                ))}
              </View>
            )}

            {verificationRequest.rejectionReason && (
              <View style={styles.rejectionBox}>
                <AlertCircle size={16} color={theme.colors.error} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rejectionTitle}>Rejected</Text>
                  <Text style={styles.rejectionReason}>
                    {verificationRequest.rejectionReason}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Community Vouching Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Vouching</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowVouchModal(true)}
          >
            <Text style={styles.addBtnText}>+ Request</Text>
          </TouchableOpacity>
        </View>

        {vouchRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Award size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No vouching requests yet</Text>
            <Text style={styles.emptySubtext}>
              Ask colleagues to vouch for your work quality
            </Text>
          </View>
        ) : (
          <FlatList
            data={vouchRequests}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.vouchCard}>
                <View style={styles.vouchContent}>
                  <Text style={styles.vouchName}>{item.endorserName}</Text>
                  <Text style={styles.vouchRole}>
                    {item.endorserRole} at {item.company}
                  </Text>
                  <Text style={styles.vouchRelation}>
                    Relationship: {item.relationship}
                  </Text>
                  {item.comment && (
                    <Text style={styles.vouchComment}>{item.comment}</Text>
                  )}
                  <Text
                    style={[
                      styles.vouchStatus,
                      {
                        color:
                          item.status === "endorsed"
                            ? theme.colors.success
                            : item.status === "declined"
                              ? theme.colors.error
                              : theme.colors.info,
                      },
                    ]}
                  >
                    {getVouchStatusLabel(item.status)}
                  </Text>
                </View>

                {item.status === "pending" && (
                  <View style={styles.vouchActions}>
                    <TouchableOpacity
                      style={styles.endorseBtn}
                      onPress={() => onEndorseVouch?.(item.id)}
                    >
                      <CheckCircle size={16} color={theme.colors.success} />
                      <Text style={styles.endorseBtnText}>Endorse</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => onDeclineVouch?.(item.id)}
                    >
                      <X size={16} color={theme.colors.error} />
                      <Text style={styles.declineBtnText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>

      {/* Verification Modal */}
      <Modal visible={showVerificationModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Verification</Text>
            <TouchableOpacity onPress={() => setShowVerificationModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalInstruction}>
              Upload documents to verify your identity and qualifications. We
              accept:
            </Text>
            <Text style={styles.docType}>• National ID</Text>
            <Text style={styles.docType}>• Professional Certificates</Text>
            <Text style={styles.docType}>• Educational Credentials</Text>

            <View style={styles.documentForm}>
              <TextInput
                style={styles.input}
                placeholder="Document Type (e.g., ID, Certificate)"
                value={newDocType}
                onChangeText={setNewDocType}
              />
              <TextInput
                style={styles.input}
                placeholder="Document URL or File Path"
                value={newDocUrl}
                onChangeText={setNewDocUrl}
              />
              <TouchableOpacity
                style={styles.addDocBtn}
                onPress={handleAddDocument}
              >
                <Upload size={18} color={theme.colors.white} />
                <Text style={styles.addDocBtnText}>Add Document</Text>
              </TouchableOpacity>
            </View>

            {documents.length > 0 && (
              <View style={styles.uploadedDocs}>
                <Text style={styles.uploadedTitle}>Uploaded Documents</Text>
                {documents.map((doc, idx) => (
                  <View key={idx} style={styles.uploadedDocItem}>
                    <FileText size={16} color={theme.colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.uploadedDocName}>
                        {doc.documentType}
                      </Text>
                      <Text style={styles.uploadedDocPath} numberOfLines={1}>
                        {doc.documentUrl}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveDocument(idx)}>
                      <X size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                documents.length === 0 && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmitVerification}
              disabled={documents.length === 0}
            >
              <Text style={styles.submitBtnText}>Submit for Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Request Vouch Modal */}
      <Modal visible={showVouchModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Vouch</Text>
            <TouchableOpacity onPress={() => setShowVouchModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Endorser Name"
              value={vouchForm.name}
              onChangeText={(text) =>
                setVouchForm({ ...vouchForm, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Their Job Title"
              value={vouchForm.role}
              onChangeText={(text) =>
                setVouchForm({ ...vouchForm, role: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Their Company"
              value={vouchForm.company}
              onChangeText={(text) =>
                setVouchForm({ ...vouchForm, company: text })
              }
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRequestVouch}
            >
              <Text style={styles.submitBtnText}>Send Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  verificationCard: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    gap: 12,
  },
  statusIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  statusSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    gap: 8,
  },
  verifyBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  historyCard: {
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  historyDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  documentsList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  documentName: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "500",
  },
  rejectionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.md,
  },
  rejectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.error,
  },
  rejectionReason: {
    fontSize: 11,
    color: theme.colors.error,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
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
  vouchCard: {
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  vouchContent: {
    marginBottom: 12,
  },
  vouchName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  vouchRole: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  vouchRelation: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  vouchComment: {
    fontSize: 11,
    color: theme.colors.text,
    marginTop: 6,
    fontStyle: "italic",
  },
  vouchStatus: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 6,
  },
  vouchActions: {
    flexDirection: "row",
    gap: 8,
  },
  endorseBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.sm,
  },
  endorseBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.success,
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.sm,
  },
  declineBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.error,
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
  modalInstruction: {
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 12,
  },
  docType: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  documentForm: {
    marginTop: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  addDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    gap: 8,
  },
  addDocBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadedDocs: {
    marginBottom: 16,
  },
  uploadedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  uploadedDocItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  uploadedDocName: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.text,
  },
  uploadedDocPath: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
