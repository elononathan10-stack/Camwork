import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Star } from "lucide-react-native";
import { theme } from "./theme";

const UserProfile = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge} />
        <Text style={styles.userName}>Your profile</Text>
        <View style={styles.ratingRow}>
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.ratingText}>No reviews yet</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work History</Text>
        <Text style={styles.workDesc}>
          Add your work history to build your reputation.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileHeader: { alignItems: "center", padding: 24, gap: 8 },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
  },
  userName: { fontSize: 20, fontWeight: "bold", color: theme.colors.text },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, color: "#64748b" },
  section: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.text },
  timelineItem: { paddingLeft: 20, gap: 4, position: "relative" },
  timelineLine: {
    position: "absolute",
    left: 4,
    top: 6,
    bottom: -10,
    width: 2,
    backgroundColor: "#e2e8f0",
  },
  timelineDot: {
    position: "absolute",
    left: 0,
    top: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  workTitle: { fontSize: 14, fontWeight: "bold", color: theme.colors.text },
  workCompany: { fontSize: 12, color: "#64748b" },
  workDesc: { fontSize: 13, color: "#334155" },
});

export default UserProfile;
