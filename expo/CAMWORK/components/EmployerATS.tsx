/**
 * EMPLOYER DASHBOARD - ENHANCED ATS & JOB MANAGEMENT
 * Comprehensive job management, applicant tracking, and worker discovery
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
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  Users,
  Star,
  MessageSquare,
  Briefcase,
} from "lucide-react-native";
import { theme } from "./theme";
import { JobPosting, Application, ApplicationStatus } from "@/types/domain";

export interface EmployerATSProps {
  postedJobs: JobPosting[];
  applications: Array<
    Application & { jobSeekerName: string; jobSeekerRating: number }
  >;
  onCreateJob?: (
    job: Omit<JobPosting, "id" | "applicants" | "createdAt" | "updatedAt">,
  ) => void;
  onDeleteJob?: (jobId: string) => void;
  onUpdateApplicationStatus?: (
    applicationId: string,
    status: ApplicationStatus,
  ) => void;
  onRateWorker?: (workerId: string, score: number, review: string) => void;
}

const getApplicationStatusColor = (status: ApplicationStatus) => {
  switch (status) {
    case "accepted":
      return { bg: theme.colors.successLight, text: theme.colors.success };
    case "rejected":
      return { bg: theme.colors.errorLight, text: theme.colors.error };
    case "interviews":
      return { bg: theme.colors.purpleLight, text: theme.colors.purple };
    case "reviewed":
      return { bg: theme.colors.infoLight, text: theme.colors.info };
    default:
      return { bg: theme.colors.accentLight, text: theme.colors.accentDark };
  }
};

export const EmployerATS: React.FC<EmployerATSProps> = ({
  postedJobs,
  applications,
  onCreateJob,
  onDeleteJob,
  onUpdateApplicationStatus,
  onRateWorker,
}) => {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<
    (typeof applications)[0] | null
  >(null);

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    skillsNeeded: "",
    salary: "",
    location: "",
    type: "Formal" as "Formal" | "Gig",
    contractDuration: "",
  });

  const [ratingForm, setRatingForm] = useState({
    score: 5,
    review: "",
  });

  const openApplications = applications.filter((a) => a.status === "pending");
  const acceptedApplicants = applications.filter(
    (a) => a.status === "accepted",
  );
  const rejectedApplicants = applications.filter(
    (a) => a.status === "rejected",
  );

  const handleCreateJob = () => {
    if (!jobForm.title || !jobForm.description) {
      Alert.alert("Required", "Please fill in all required fields");
      return;
    }

    onCreateJob?.({
      employerId: "mock-employer-id",
      title: jobForm.title,
      description: jobForm.description,
      requirements: jobForm.requirements.split(",").map((r) => r.trim()),
      skillsNeeded: jobForm.skillsNeeded.split(",").map((s) => s.trim()),
      category: "General",
      type: jobForm.type,
      location: {
        town: jobForm.location,
        region: "",
        division: "",
      },
      salary: jobForm.salary
        ? {
            min: parseInt(jobForm.salary),
            max: parseInt(jobForm.salary) * 1.2,
            currency: "XAF",
          }
        : undefined,
      contractDuration: jobForm.contractDuration,
      status: "open",
      postedTime: new Date().toISOString(),
    });

    setJobForm({
      title: "",
      description: "",
      requirements: "",
      skillsNeeded: "",
      salary: "",
      location: "",
      type: "Formal",
      contractDuration: "",
    });
    setShowJobModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{postedJobs.length}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{openApplications.length}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{acceptedApplicants.length}</Text>
            <Text style={styles.statLabel}>Hired</Text>
          </View>
        </View>

        {/* Posted Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Posted Jobs</Text>
            <TouchableOpacity
              onPress={() => setShowJobModal(true)}
              style={styles.addBtn}
            >
              <Plus size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {postedJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Briefcase size={40} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>No jobs posted yet</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setShowJobModal(true)}
              >
                <Text style={styles.primaryBtnText}>Post Your First Job</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={postedJobs}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.jobCard}>
                  <View style={styles.jobHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle}>{item.title}</Text>
                      <View style={styles.jobMeta}>
                        <MapPin size={14} color={theme.colors.textMuted} />
                        <Text style={styles.jobMetaText}>
                          {item.location.town}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            item.status === "open"
                              ? theme.colors.successLight
                              : theme.colors.errorLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              item.status === "open"
                                ? theme.colors.success
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.jobDescription} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.jobFooter}>
                    <View style={styles.applicantBadge}>
                      <Users size={14} color={theme.colors.info} />
                      <Text style={styles.applicantCount}>
                        {item.applicants.length} applicants
                      </Text>
                    </View>

                    {item.salary && (
                      <View style={styles.salaryBadge}>
                        <DollarSign size={14} color={theme.colors.accent} />
                        <Text style={styles.salaryText}>
                          {item.salary.min.toLocaleString()}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => onDeleteJob?.(item.id)}
                      style={{ marginLeft: "auto" }}
                    >
                      <Trash2 size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* Applications Tracking */}
        {openApplications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Applications ({openApplications.length})
            </Text>
            <FlatList
              data={openApplications}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.applicantCard}>
                  <View style={styles.applicantInfo}>
                    <View>
                      <Text style={styles.applicantName}>
                        {item.jobSeekerName}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Star
                          size={12}
                          color={theme.colors.accent}
                          fill={theme.colors.accent}
                        />
                        <Text style={styles.ratingText}>
                          {item.jobSeekerRating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.applicantActions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() =>
                        onUpdateApplicationStatus?.(item.id, "accepted")
                      }
                    >
                      <CheckCircle size={18} color={theme.colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() =>
                        onUpdateApplicationStatus?.(item.id, "rejected")
                      }
                    >
                      <XCircle size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedApplicant(item);
                        setShowRatingModal(true);
                      }}
                    >
                      <MessageSquare size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* Hired Section */}
        {acceptedApplicants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Hired ({acceptedApplicants.length})
            </Text>
            <FlatList
              data={acceptedApplicants}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.acceptedCard}>
                  <View style={styles.acceptedHeader}>
                    <Text style={styles.applicantName}>
                      {item.jobSeekerName}
                    </Text>
                    <View style={styles.acceptedBadge}>
                      <CheckCircle size={14} color={theme.colors.success} />
                      <Text style={styles.acceptedBadgeText}>Hired</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.rateBtn}
                    onPress={() => {
                      setSelectedApplicant(item);
                      setShowRatingModal(true);
                    }}
                  >
                    <Star size={16} color={theme.colors.accent} />
                    <Text style={styles.rateBtnText}>Rate This Worker</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal visible={showRatingModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rate Worker</Text>
            <TouchableOpacity onPress={() => setShowRatingModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.workerName}>
              {selectedApplicant?.jobSeekerName}
            </Text>

            <View style={styles.ratingSelector}>
              <Text style={styles.ratingLabel}>Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() =>
                      setRatingForm({ ...ratingForm, score: star })
                    }
                  >
                    <Star
                      size={32}
                      color={
                        star <= ratingForm.score
                          ? theme.colors.accent
                          : theme.colors.border
                      }
                      fill={
                        star <= ratingForm.score
                          ? theme.colors.accent
                          : "transparent"
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write a review (optional)"
              multiline
              numberOfLines={4}
              value={ratingForm.review}
              onChangeText={(text) =>
                setRatingForm({ ...ratingForm, review: text })
              }
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                if (selectedApplicant) {
                  onRateWorker?.(
                    selectedApplicant.id,
                    ratingForm.score,
                    ratingForm.review,
                  );
                  setShowRatingModal(false);
                  setRatingForm({ score: 5, review: "" });
                }
              }}
            >
              <Text style={styles.submitBtnText}>Submit Rating</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Job Creation Modal */}
      <Modal visible={showJobModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post a Job</Text>
            <TouchableOpacity onPress={() => setShowJobModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              value={jobForm.title}
              onChangeText={(text) => setJobForm({ ...jobForm, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Job Description"
              multiline
              numberOfLines={4}
              value={jobForm.description}
              onChangeText={(text) =>
                setJobForm({ ...jobForm, description: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Requirements (comma-separated)"
              value={jobForm.requirements}
              onChangeText={(text) =>
                setJobForm({ ...jobForm, requirements: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Skills Needed (comma-separated)"
              value={jobForm.skillsNeeded}
              onChangeText={(text) =>
                setJobForm({ ...jobForm, skillsNeeded: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Salary (XAF)"
              keyboardType="number-pad"
              value={jobForm.salary}
              onChangeText={(text) => setJobForm({ ...jobForm, salary: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={jobForm.location}
              onChangeText={(text) =>
                setJobForm({ ...jobForm, location: text })
              }
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleCreateJob}
            >
              <Text style={styles.submitBtnText}>Post Job</Text>
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
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
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
  primaryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  primaryBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  jobCard: {
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  jobMetaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  jobDescription: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  applicantBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.radius.sm,
  },
  applicantCount: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.info,
  },
  salaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.radius.sm,
  },
  salaryText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.accentDark,
  },
  applicantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  applicantActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  rejectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  acceptedCard: {
    padding: 12,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  acceptedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  acceptedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
  },
  acceptedBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.success,
  },
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
  },
  rateBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.text,
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
  workerName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 16,
  },
  ratingSelector: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  submitBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
