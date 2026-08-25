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
  BriefcaseBusiness,
  CreditCard,
  Plus,
  UserRound,
} from "lucide-react-native";
import { router } from "expo-router";
import { theme } from "./theme";
import { useUser } from "@/context/UserContext";

export default function EmployerDashboard() {
  const { user, jobs } = useUser();
  const ownJobs = jobs.filter(
    (job) => job.postedBy === user?.email && !job.isServiceRequest,
  );
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
      id: "profile",
      label: "Company profile",
      icon: UserRound,
      onPress: () => router.push("/(tabs)/profile"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ownJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>Employer workspace</Text>
                <Text style={styles.title}>{user?.name || "Your company"}</Text>
                <Text style={styles.subtitle}>
                  Manage offers, applicants, and protected payments.
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
            <Text style={styles.sectionTitle}>Your job offers</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() =>
              router.push({ pathname: "/job-detail", params: { id: item.id } })
            }
          >
            <View style={styles.jobIcon}>
              <BriefcaseBusiness size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.jobBody}>
              <Text style={styles.jobTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.jobMeta}>
                {item.location} · {item.postedTime}
              </Text>
              <Text style={styles.jobDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BriefcaseBusiness size={40} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No job offers yet</Text>
            <Text style={styles.emptyText}>
              Create your first offer to start building your hiring reputation.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 18, paddingBottom: 36 },
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
    marginTop:25,
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
  actionText: { color: theme.colors.text, fontSize: 12, fontWeight: "800", flexShrink: 1 },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  jobCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  jobIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  jobBody: { flex: 1 },
  jobTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "800" },
  jobMeta: { color: theme.colors.primary, fontSize: 12, marginTop: 3 },
  jobDescription: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
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
