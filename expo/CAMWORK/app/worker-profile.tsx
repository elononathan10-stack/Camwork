import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, UserRound } from "lucide-react-native";
import { searchWorkersApi } from "@/components/api";
import { theme } from "@/components/theme";

type Worker = {
  id: number | string;
  name: string;
  email: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  rating?: number;
  reviewCount?: number;
  workHistory?: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    status: string;
    date: string;
  }>;
};

export default function WorkerProfileScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    email: string;
  }>();
  const [worker, setWorker] = React.useState<Partial<Worker>>(params);

  React.useEffect(() => {
    searchWorkersApi("")
      .then((workers: Worker[]) => {
        const match = workers.find(
          (item) =>
            String(item.id) === String(params.id) ||
            item.email?.toLowerCase() === params.email?.toLowerCase(),
        );
        if (match) setWorker(match);
      })
      .catch(() => undefined);
  }, [params.id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee profile</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          {worker.avatar ? (
            <Image source={{ uri: worker.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <UserRound size={36} color={theme.colors.primary} />
            </View>
          )}
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.email}>{worker.email}</Text>
          {!!worker.headline && (
            <Text style={styles.headline}>{worker.headline}</Text>
          )}
        </View>
        {!!worker.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.text}>{worker.bio}</Text>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.text}>
            {worker.skills?.length
              ? worker.skills.join(", ")
              : "No skills provided"}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <Text style={styles.text}>
            {worker.reviewCount
              ? `${worker.rating}/5 (${worker.reviewCount} reviews)`
              : "No completed reviews yet"}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work history</Text>
          {worker.workHistory?.length ? (
            worker.workHistory.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.text}>
                  {item.company} · {item.location}
                </Text>
                <Text style={styles.historyStatus}>{item.status}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No accepted work history yet</Text>
          )}
        </View>
        {!!worker.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.text}>{worker.location}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  spacer: { width: 22 },
  content: { padding: 18, paddingBottom: 66 },
  profileHeader: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 14 },
  avatarEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
  },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: "900" },
  email: { color: "#64748b", marginTop: 4 },
  headline: { color: theme.colors.primary, marginTop: 10, fontWeight: "700" },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  text: { color: "#475569", lineHeight: 21 },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  historyTitle: { color: theme.colors.text, fontWeight: "800" },
  historyStatus: {
    color: theme.colors.primary,
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
  },
});
