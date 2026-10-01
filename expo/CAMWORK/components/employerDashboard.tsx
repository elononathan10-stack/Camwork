import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import {
  CreditCard,
  Plus,
  UserRound,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Eye,
  Briefcase,
  MapPin,
  Sparkles,
} from "lucide-react-native";
import { router } from "expo-router";
import { theme } from "./theme";
import { useUser } from "@/context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EmployerDashboard() {
  const { user, jobs, applications, updateApplicationStatus, deleteJob } =
    useUser();
  const insets = useSafeAreaInsets();
  const ownJobs = jobs.filter(
    (job) =>
      job.postedBy?.trim().toLowerCase() === user?.email?.trim().toLowerCase() &&
      !job.isServiceRequest,
  );
  const employerApplications = applications.filter((application) =>
    ownJobs.some((job) => job.id === application.jobId),
  );

  const handleDeleteJob = (jobId: string, jobTitle: string) => {
    Alert.alert(
      "Delete Job Offer",
      `Are you sure you want to delete "${jobTitle}"? This will permanently remove the listing.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteJob(jobId);
              Alert.alert(
                "Offer Deleted",
                "The job offer has been successfully deleted.",
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete job offer.",
              );
            }
          },
        },
      ],
    );
  };

  const changeApplicationStatus = async (
    applicationId: string,
    status: "Accepted" | "Rejected",
  ) => {
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (error) {
      Alert.alert(
        "Status update failed",
        error instanceof Error
          ? error.message
          : "Unable to update application status.",
      );
    }
  };

  const validateAndFund = (applicationId: string) => {
    Alert.alert(
      "Fund escrow to validate",
      "Validation is completed when the job offer's compensation is deposited into escrow. The applicant will be notified once the funds are held.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Validate & fund",
          onPress: async () => {
            try {
              await updateApplicationStatus(applicationId, "Accepted");
              router.push({
                pathname: "/payment",
                params: { applicationId },
              });
            } catch (error) {
              Alert.alert(
                "Validation failed",
                error instanceof Error
                  ? error.message
                  : "Unable to validate this application.",
              );
            }
          },
        },
      ],
    );
  };

  const actions = [
    {
      id: "post",
      label: "Create job offer",
      icon: Plus,
      onPress: () => router.push("/post-job"),
    },
    {
      id: "payment",
      label: "Payments",
      icon: CreditCard,
      onPress: () => router.push("/payment"),
    },
    {
      id: "workers",
      label: "Find workers",
      icon: UserRound,
      onPress: () => router.push("/worker-search"),
    },
    {
      id: "profile",
      label: "Company profile",
      icon: UserRound,
      onPress: () => router.push("/(tabs)/profile"),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={employerApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 36 + insets.bottom },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Employer workspace</Text>
                <Text style={styles.title}>{user?.name || "Your company"}</Text>
                <Text style={styles.subtitle}>
                  Manage your job postings, active applicants, and worker hiring.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.avatar}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <UserRound size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={actions}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actions}
              renderItem={({ item }) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    style={styles.action}
                    onPress={item.onPress}
                  >
                    <Icon size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Posted Job Offers Management Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Your Posted Job Offers</Text>
              <TouchableOpacity
                style={styles.newJobLink}
                onPress={() => router.push("/post-job")}
              >
                <Plus size={15} color={theme.colors.primary} />
                <Text style={styles.newJobLinkText}>Post New</Text>
              </TouchableOpacity>
            </View>

            {ownJobs.length === 0 ? (
              <View style={styles.emptyJobsCard}>
                <Briefcase size={28} color="#94a3b8" />
                <Text style={styles.emptyJobsTitle}>No job offers posted yet</Text>
                <Text style={styles.emptyJobsSub}>
                  Create your first job offer to start receiving applications.
                </Text>
                <TouchableOpacity
                  style={styles.postJobEmptyBtn}
                  onPress={() => router.push("/post-job")}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.postJobEmptyBtnText}>Create Job Offer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.jobsList}>
                {ownJobs.map((job) => {
                  const jobAppCount = applications.filter(
                    (a) => a.jobId === job.id,
                  ).length;
                  return (
                    <View key={job.id} style={styles.jobOfferCard}>
                      <View style={styles.jobOfferHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.jobOfferTitle} numberOfLines={1}>
                            {job.title}
                          </Text>
                          <Text style={styles.jobOfferMeta}>
                            {job.category} · {job.type} · {job.salary}
                          </Text>
                        </View>
                        <View style={styles.applicantBadge}>
                          <Text style={styles.applicantBadgeText}>
                            {jobAppCount} {jobAppCount === 1 ? "applicant" : "applicants"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.jobOfferActions}>
                        <TouchableOpacity
                          style={styles.jobActionBtn}
                          onPress={() =>
                            router.push({
                              pathname: "/job-detail",
                              params: { id: job.id },
                            })
                          }
                        >
                          <Eye size={15} color={theme.colors.text} />
                          <Text style={styles.jobActionBtnText}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.jobActionBtn}
                          onPress={() =>
                            router.push({
                              pathname: "/post-job",
                              params: { id: job.id },
                            })
                          }
                        >
                          <Edit3 size={15} color={theme.colors.primary} />
                          <Text
                            style={[
                              styles.jobActionBtnText,
                              { color: theme.colors.primary },
                            ]}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.jobActionBtn, styles.jobDeleteBtn]}
                          onPress={() => handleDeleteJob(job.id, job.title)}
                          accessibilityLabel="Delete Job Offer"
                        >
                          <Trash2 size={15} color={theme.colors.error} />
                          <Text style={styles.jobDeleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Applicants for your job offers
            </Text>
            {employerApplications.length > 0 && (
              <View>
                {employerApplications.map((application) => (
                  <View key={application.id} style={styles.applicationCard}>
                    <View style={styles.body}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/worker-profile",
                            params: {
                              id: application.applicantEmail || application.id,
                              email: application.applicantEmail || "",
                              name: "Applicant",
                            },
                          })
                        }
                      >
                        <Text style={styles.workerName} numberOfLines={1}>
                          {application.applicantName ||
                            application.applicantEmail ||
                            "Applicant"}
                        </Text>
                        <Text style={styles.meta} numberOfLines={1}>
                          {application.jobTitle}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.applicantInfo} numberOfLines={1}>
                        Email: {application.applicantEmail || "Not provided"}
                      </Text>
                      {!!application.applicantHeadline && (
                        <Text style={styles.applicantInfo} numberOfLines={1}>
                          {application.applicantHeadline}
                        </Text>
                      )}
                      <Text style={styles.applicantInfo} numberOfLines={1}>
                        Location:{" "}
                        {application.applicantLocation || "Not provided"}
                      </Text>
                      <Text style={styles.applicantInfo} numberOfLines={1}>
                        Skills:{" "}
                        {application.applicantSkills?.length
                          ? application.applicantSkills.join(", ")
                          : "Not provided"}
                      </Text>
                      <Text style={styles.meta} numberOfLines={1}>
                        {application.companyName} · {application.status}
                      </Text>
                    </View>
                    {application.status === "Pending" && (
                      <View style={styles.applicationActions}>
                        <TouchableOpacity
                          style={styles.reviewButton}
                          onPress={() =>
                            changeApplicationStatus(application.id, "Rejected")
                          }
                          accessibilityLabel="Refuse application"
                        >
                          <XCircle size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.reviewButton}
                          onPress={() => validateAndFund(application.id)}
                          accessibilityLabel="Validate application and fund escrow"
                        >
                          <CheckCircle2
                            size={20}
                            color={theme.colors.success}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    {application.paymentValidated &&
                      application.status !== "Completed" && (
                        <View style={styles.applicationActions}>
                          {(["In Progress", "Completed"] as const).map(
                            (status) => (
                              <TouchableOpacity
                                key={status}
                                style={styles.statusButton}
                                onPress={() =>
                                  status === "Completed"
                                    ? router.push("/applications")
                                    : updateApplicationStatus(
                                        application.id,
                                        status,
                                      )
                                }
                              >
                                <Text style={styles.statusButtonText}>
                                  {status === "Completed"
                                    ? "Confirm completion"
                                    : status}
                                </Text>
                              </TouchableOpacity>
                            ),
                          )}
                        </View>
                      )}
                  </View>
                ))}
              </View>
            )}
          </>
        }
        renderItem={() => null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <UserRound size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No applicants yet</Text>
            <Text style={styles.emptyText}>
              Applicants for your job offers will appear here with their profile
              information.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 19,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: 25,
  },
  title: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4,
  },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4, maxWidth: 270 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  actions: { gap: 10, paddingBottom: 24 },
  action: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbe3ed",
  },
  actionText: { color: theme.colors.text, fontSize: 12, fontWeight: "800" },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  applicationCard: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  body: { width: "100%" },
  workerName: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
  meta: { color: theme.colors.primary, fontSize: 12, marginTop: 3 },
  skills: { color: "#64748b", fontSize: 12, marginTop: 6 },
  applicantInfo: { color: "#475569", fontSize: 12, marginTop: 5 },
  applicationActions: {
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statusButton: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusButtonText: { color: "#64748b", fontSize: 10, fontWeight: "800" },
  statusButtonTextActive: { color: "#fff" },
  reviewButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  newJobLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
  },
  newJobLinkText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  emptyJobsCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  emptyJobsTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
    marginTop: 8,
  },
  emptyJobsSub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  postJobEmptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  postJobEmptyBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  jobsList: {
    gap: 10,
    marginBottom: 10,
  },
  jobOfferCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  jobOfferHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  jobOfferTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  jobOfferMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
  },
  applicantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
  },
  applicantBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  jobOfferActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  jobActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  jobActionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.text,
  },
  jobDeleteBtn: {
    backgroundColor: "#fff5f5",
    borderColor: "#fecaca",
  },
  jobDeleteBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.error,
  },
  empty: { alignItems: "center", paddingVertical: 70, paddingHorizontal: 24 },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 6,
  },
});
