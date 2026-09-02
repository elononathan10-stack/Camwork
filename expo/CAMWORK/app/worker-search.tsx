import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Search, Send, UserRound } from "lucide-react-native";
import { searchWorkersApi, createDirectOfferApi } from "@/components/api";
import { useUser } from "@/context/UserContext";
import { theme } from "@/components/theme";

type Worker = { id: number; name: string; email: string };

export default function WorkerSearchScreen() {
  const { user, jobs } = useUser();
  const [query, setQuery] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      setWorkers(await searchWorkersApi(query));
    } catch (error) {
      Alert.alert(
        "Search unavailable",
        error instanceof Error ? error.message : "Unable to find workers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void search();
  }, []);

  const offerJob = async (worker: Worker) => {
    const job = jobs.find(
      (item) =>
        item.postedBy === user?.email &&
        !item.isServiceRequest &&
        item.status !== "closed",
    );
    if (!job) {
      Alert.alert(
        "Create a job first",
        "Publish an open job offer before sending a direct offer.",
      );
      return;
    }
    try {
      await createDirectOfferApi({
        jobId: job.id,
        seekerEmail: worker.email,
        rateOffered: job.salary,
        contractType: job.type,
        startDate: "To be agreed in CamWork",
        message: `We would like to invite you to discuss ${job.title}.`,
      });
      Alert.alert(
        "Offer sent",
        `Your direct offer was sent to ${worker.name}.`,
      );
    } catch (error) {
      Alert.alert(
        "Offer blocked",
        error instanceof Error ? error.message : "Unable to send offer.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Find workers</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.search}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          placeholder="Search by name"
          style={styles.input}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={workers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: 66 }]}
        refreshing={loading}
        onRefresh={search}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <UserRound size={21} color={theme.colors.primary} />
            </View>
            <TouchableOpacity
              style={styles.body}
              onPress={() =>
                router.push({
                  pathname: "/worker-profile",
                  params: {
                    id: String(item.id),
                    name: item.name,
                    email: item.email,
                  },
                })
              }
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.offer}
              onPress={() => offerJob(item)}
              accessibilityLabel={`Offer a job to ${item.name}`}
            >
              <Send size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No verified worker profiles match this search.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: { fontSize: 19, fontWeight: "900", color: theme.colors.text },
  spacer: { width: 22 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    margin: 16,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3ed",
  },
  input: { flex: 1, color: theme.colors.text },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  body: { flex: 1, marginLeft: 12 },
  name: { fontWeight: "800", color: theme.colors.text },
  email: { marginTop: 3, color: "#64748b", fontSize: 12 },
  offer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 },
});
