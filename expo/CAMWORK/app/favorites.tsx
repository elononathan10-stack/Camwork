import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  Search as SearchIcon,
  Bookmark,
  BookmarkX,
  MapPin,
  Briefcase,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Building,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, JobListing } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const { jobs, savedJobIds, toggleSaveJob } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Formal" | "Gig">("All");

  const savedJobs = useMemo(() => {
    return jobs.filter((job) => savedJobIds.includes(job.id));
  }, [jobs, savedJobIds]);

  const filteredFavorites = useMemo(() => {
    return savedJobs.filter((job) => {
      const matchesQuery =
        searchQuery.trim() === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesType = typeFilter === "All" || job.type === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [savedJobs, searchQuery, typeFilter]);

  const handleRemoveFavorite = (job: JobListing) => {
    Alert.alert(
      language === "EN" ? "Remove from Favorites?" : "Retirer des favoris ?",
      language === "EN"
        ? `Do you want to remove "${job.title}" from your saved jobs?`
        : `Voulez-vous retirer "${job.title}" de vos offres sauvegardées ?`,
      [
        { text: language === "EN" ? "Cancel" : "Annuler", style: "cancel" },
        {
          text: language === "EN" ? "Remove" : "Retirer",
          style: "destructive",
          onPress: () => toggleSaveJob(job.id),
        },
      ],
    );
  };

  const isEn = language === "EN";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navbar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isEn ? "Favorite Job Offers" : "Offres d'emploi favorites"}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{savedJobs.length}</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter & Search Bar */}
      {savedJobs.length > 0 && (
        <View style={styles.controlsSection}>
          <View style={styles.searchBar}>
            <SearchIcon size={18} color="#94a3b8" />
            <TextInput
              placeholder={
                isEn ? "Search your saved jobs..." : "Rechercher parmi vos favoris..."
              }
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Type Filter Pills */}
          <View style={styles.typeFilterRow}>
            {(["All", "Formal", "Gig"] as const).map((type) => {
              const isActive = typeFilter === type;
              const label =
                type === "All"
                  ? isEn
                    ? "All Types"
                    : "Tous"
                  : type === "Formal"
                    ? isEn
                      ? "Formal"
                      : "Formel"
                    : isEn
                      ? "Gig / Mission"
                      : "Mission";
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typePill,
                    isActive && styles.typePillActive,
                  ]}
                  onPress={() => setTypeFilter(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      isActive && styles.typePillTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Favorites FlatList */}
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 32 + insets.bottom },
          savedJobs.length === 0 && styles.listContentEmpty,
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() =>
              router.push({
                pathname: "/job-detail",
                params: { id: item.id },
              })
            }
            activeOpacity={0.88}
          >
            {/* Card Top */}
            <View style={styles.cardTop}>
              <View style={styles.logoWrap}>
                <Text style={styles.logoLetter}>{item.company.charAt(0)}</Text>
              </View>

              <View style={styles.cardHeaderInfo}>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.companyName} numberOfLines={1}>
                  {item.company}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeBookmarkBtn}
                onPress={() => handleRemoveFavorite(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bookmark
                  size={20}
                  color={theme.colors.primary}
                  fill={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Tags / Meta Row */}
            <View style={styles.tagsRow}>
              <View
                style={[
                  styles.typeBadge,
                  item.type === "Gig"
                    ? { backgroundColor: theme.colors.accentLight }
                    : { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    item.type === "Gig"
                      ? { color: theme.colors.accentDark }
                      : { color: theme.colors.primary },
                  ]}
                >
                  {item.type === "Gig"
                    ? isEn
                      ? "Gig / Project"
                      : "Mission / Gig"
                    : isEn
                      ? "Formal Employment"
                      : "Emploi Formel"}
                </Text>
              </View>

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
            </View>

            {/* Skills */}
            {item.skills && item.skills.length > 0 && (
              <View style={styles.skillsRow}>
                {item.skills.slice(0, 3).map((skill) => (
                  <View key={skill} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.metaLocation}>
                <MapPin size={14} color="#64748b" />
                <Text style={styles.metaLocationText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

              <Text style={styles.salaryText}>{item.salary}</Text>
            </View>

            {/* Action Bar */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.viewDetailsBtn}
                onPress={() =>
                  router.push({
                    pathname: "/job-detail",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.viewDetailsText}>
                  {isEn ? "View Details & Apply" : "Voir & Postuler"}
                </Text>
                <ArrowUpRight size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <BookmarkX size={36} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {savedJobs.length === 0
                ? isEn
                  ? "No Favorite Jobs Yet"
                  : "Aucune offre favorite"
                : isEn
                  ? "No Matching Saved Jobs"
                  : "Aucune offre correspondante"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {savedJobs.length === 0
                ? isEn
                  ? "Browse open job listings and tap the bookmark icon to save offers you are interested in."
                  : "Parcourez les offres d'emploi et appuyez sur l'icône de signet pour enregistrer celles qui vous intéressent."
                : isEn
                  ? "Try changing your search query or filter."
                  : "Essayez de modifier votre recherche ou vos filtres."}
            </Text>

            {savedJobs.length === 0 && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.replace("/(tabs)/search")}
                activeOpacity={0.85}
              >
                <Briefcase size={18} color="#ffffff" />
                <Text style={styles.browseButtonText}>
                  {isEn ? "Explore Job Offers" : "Explorer les offres"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  headerSpacer: {
    width: 40,
  },
  controlsSection: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    height: "100%",
  },
  typeFilterRow: {
    flexDirection: "row",
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  typePillActive: {
    backgroundColor: theme.colors.primary,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  typePillTextActive: {
    color: "#ffffff",
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  companyName: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  removeBookmarkBtn: {
    padding: 6,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  categoryBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillPill: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  skillPillText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  metaLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metaLocationText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  salaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  actionRow: {
    marginTop: 4,
  },
  viewDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  browseButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
