import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CreditCard,
  Plus,
  UserRound,
  CheckCircle2,
  XCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { theme } from "./theme";
import { searchWorkersApi } from "./api";
import { useUser } from "@/context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Worker = {
  id: number | string;
  name: string;
  email: string;
  skills?: string[];
};

export default function EmployerDashboard() {
  const { user, jobs, applications, updateApplicationStatus } = useUser();
  const insets = useSafeAreaInsets();
  const [workers, setWorkers] = React.useState<Worker[]>([]);
  const [workersLoading, setWorkersLoading] = React.useState(false);
  const ownJobs = jobs.filter(
    (job) => job.postedBy === user?.email && !job.isServiceRequest,
  );
  const employerApplications = applications.filter((application) =>
    ownJobs.some((job) => job.id === application.jobId),
  );

  React.useEffect(() => {
    if (user?.role !== "employer") return;
    setWorkersLoading(true);
    searchWorkersApi("")
      .then(setWorkers)
      .catch(() => setWorkers([]))
      .finally(() => setWorkersLoading(false));
  }, [user?.role]);

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
        data={workers}
        keyExtractor={(item) => String(item.id)}
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
                  Find registered employees and review their available skills.
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
            <Text style={styles.sectionTitle}>Employees and skills</Text>
            {employerApplications.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Applicant review</Text>
                {employerApplications.map((application) => (
                  <View key={application.id} style={styles.applicationCard}>
                    <View style={styles.body}>
                      <Text style={styles.workerName}>
                        {application.jobTitle}
                      </Text>
                      <Text style={styles.meta}>
                        {application.companyName} · {application.status}
                      </Text>
                    </View>
                    {application.status === "Pending" && (
                      <View style={styles.applicationActions}>
                        <TouchableOpacity
                          style={styles.reviewButton}
                          onPress={() =>
                            updateApplicationStatus(application.id, "Rejected")
                          }
                          accessibilityLabel="Refuse application"
                        >
                          <XCircle size={20} color={theme.colors.error} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.reviewButton}
                          onPress={() =>
                            updateApplicationStatus(application.id, "Accepted")
                          }
                          accessibilityLabel="Validate application"
                        >
                          <CheckCircle2
                            size={20}
                            color={theme.colors.success}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.workerCard}>
            <View style={styles.workerIcon}>
              <UserRound size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.body}>
              <Text style={styles.workerName}>{item.name}</Text>
              <Text style={styles.meta}>{item.email}</Text>
              <Text style={styles.skills}>
                {item.skills?.length
                  ? item.skills.join(", ")
                  : "Skills not provided"}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <UserRound size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              {workersLoading
                ? "Loading employees..."
                : "No employee profiles found"}
            </Text>
            <Text style={styles.emptyText}>
              Only registered seeker accounts appear here. No sample employees
              are shown.
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
  workerCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  applicationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  workerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  body: { flex: 1 },
  workerName: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
  meta: { color: theme.colors.primary, fontSize: 12, marginTop: 3 },
  skills: { color: "#64748b", fontSize: 12, marginTop: 6 },
  applicationActions: { flexDirection: "row", gap: 8 },
  reviewButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
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
