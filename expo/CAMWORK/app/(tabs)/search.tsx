import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Bookmark,
  Star,
  X,
  Check,
  Building,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser, JobListing } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "All",
  "Logistics & Transport",
  "Skilled Trades",
  "Sales & Marketing",
  "Construction & Engineering",
  "Technology",
];

const LOCATIONS = [
  "All",
  "Douala, Littoral",
  "Yaoundé, Centre",
  "Bafoussam, Ouest",
  "Kribi, Sud",
  "Buea, South-West (Hybrid)",
];

const JOB_TYPES = ["All", "Formal", "Gig"];

export default function SearchScreen() {
  const { jobs, savedJobIds, toggleSaveJob, user } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Filtered job list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery =
        searchQuery.trim() === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "All" || job.category === selectedCategory;

      const matchesLocation =
        selectedLocation === "All" ||
        job.location.includes(selectedLocation.split(",")[0]);

      const matchesType = selectedType === "All" || job.type === selectedType;

      return matchesQuery && matchesCategory && matchesLocation && matchesType;
    });
  }, [
    jobs,
    user?.role,
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedType,
  ]);

  const activeFiltersCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedLocation !== "All" ? 1 : 0) +
    (selectedType !== "All" ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedLocation("All");
    setSelectedType("All");
    setSearchQuery("");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.search.title}</Text>
          <TouchableOpacity
            style={styles.favShortcutBtn}
            onPress={() => router.push("/favorites")}
            activeOpacity={0.8}
          >
            <Bookmark
              size={20}
              color={theme.colors.primary}
              fill={savedJobIds.length > 0 ? theme.colors.primary : "transparent"}
            />
            {savedJobIds.length > 0 && (
              <View style={styles.favBadge}>
                <Text style={styles.favBadgeText}>{savedJobIds.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar & Filter Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <SearchIcon size={20} color="#94a3b8" />
            <TextInput
              placeholder={t.search.placeholder}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeFiltersCount > 0 && styles.filterBtnActive,
            ]}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <SlidersHorizontal
              size={20}
              color={activeFiltersCount > 0 ? "#ffffff" : theme.colors.text}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterCountDot}>
                <Text style={styles.filterCountText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Horizontal Filter Pills */}
        <View style={{ marginBottom: 4 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPillsScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.quickPill,
                  selectedCategory === cat && styles.quickPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.quickPillText,
                    selectedCategory === cat && styles.quickPillTextActive,
                  ]}
                >
                  {cat === "All" ? t.common.all : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Header Count */}
        <View style={styles.resultsMetaRow}>
          <Text style={styles.resultsCountText}>
            <Text style={styles.resultsCountBold}>{filteredJobs.length}</Text>{" "}
            {t.search.resultsFound}
          </Text>
          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearFiltersLink}>
                {t.search.clearFilters}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Job Results List */}
        <FlatList
          style={styles.resultsList}
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 24 + insets.bottom },
          ]}
          renderItem={({ item }) => {
            const isSaved = savedJobIds.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.jobCard}
                onPress={() =>
                  router.push({
                    pathname: "/job-detail",
                    params: { id: item.id },
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.jobCardTop}>
                  <View style={styles.companyLogo}>
                    <Text style={styles.logoText}>
                      {item.company.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.jobHeaderInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                    <Text style={styles.jobCompany} numberOfLines={1}>
                      {item.company}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSaveJob(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Bookmark
                      size={20}
                      color={isSaved ? theme.colors.primary : "#94a3b8"}
                      fill={isSaved ? theme.colors.primary : "transparent"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Skills tags preview */}
                <View style={styles.skillTagsRow}>
                  {item.skills.slice(0, 3).map((skill) => (
                    <View key={skill} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{skill}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.jobMetaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
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
                      {item.type === "Gig" ? t.common.gig : t.common.formal}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobCardBottom}>
                  <Text style={styles.jobSalary}>{item.salary}</Text>
                  <View style={styles.matchScoreBadge}>
                    <Sparkles size={12} color={theme.colors.primary} />
                    <Text style={styles.matchScoreText}>
                      {item.matchScore}% Match
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Briefcase size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>{t.search.noJobsFound}</Text>
              <Text style={styles.emptySub}>{t.search.noJobsFoundSub}</Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={clearAllFilters}
              >
                <Text style={styles.resetBtnText}>{t.search.clearFilters}</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Filter Modal */}
        <Modal
          visible={isFilterModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t.search.filters}</Text>
                <TouchableOpacity
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Category Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupTitle}>
                    {t.search.categories}
                  </Text>
                  <View style={styles.filterChipWrap}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.modalFilterChip,
                          selectedCategory === cat &&
                            styles.modalFilterChipActive,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.modalFilterChipText,
                            selectedCategory === cat &&
                              styles.modalFilterChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Location Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupTitle}>
                    {t.search.locations}
                  </Text>
                  <View style={styles.filterChipWrap}>
                    {LOCATIONS.map((loc) => (
                      <TouchableOpacity
                        key={loc}
                        style={[
                          styles.modalFilterChip,
                          selectedLocation === loc &&
                            styles.modalFilterChipActive,
                        ]}
                        onPress={() => setSelectedLocation(loc)}
                      >
                        <Text
                          style={[
                            styles.modalFilterChipText,
                            selectedLocation === loc &&
                              styles.modalFilterChipTextActive,
                          ]}
                        >
                          {loc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Job Type Filter */}
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupTitle}>
                    {t.search.jobType}
                  </Text>
                  <View style={styles.filterChipWrap}>
                    {JOB_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.modalFilterChip,
                          selectedType === type && styles.modalFilterChipActive,
                        ]}
                        onPress={() => setSelectedType(type)}
                      >
                        <Text
                          style={[
                            styles.modalFilterChipText,
                            selectedType === type &&
                              styles.modalFilterChipTextActive,
                          ]}
                        >
                          {type === "All"
                            ? t.common.all
                            : type === "Gig"
                              ? t.common.gig
                              : t.common.formal}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalClearBtn}
                  onPress={clearAllFilters}
                >
                  <Text style={styles.modalClearBtnText}>
                    {t.search.clearFilters}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalApplyBtn}
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <Text style={styles.modalApplyBtnText}>
                    {t.search.applyFilters}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  favShortcutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  favBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  favBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 42,
    paddingHorizontal: 13,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  filterBtn: {
    width: 46,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterCountDot: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#ffffff",
  },
  quickPillsScroll: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
  },
  quickPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quickPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.text,
  },
  quickPillTextActive: {
    color: "#ffffff",
  },
  resultsMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  resultsCountText: {
    fontSize: 13,
    color: "#64748b",
  },
  resultsCountBold: {
    fontWeight: "800",
    color: theme.colors.text,
  },
  clearFiltersLink: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  resultsList: {
    flex: 1,
    minWidth: 0,
  },
  jobCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  jobCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  jobHeaderInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
    flexShrink: 1,
  },
  jobCompany: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  skillTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  jobMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  jobCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
    flexShrink: 1,
  },
  matchScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 1,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.primary,
    flexShrink: 1,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 260,
  },
  resetBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
    minHeight: 42,
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary,
    flexShrink: 1,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
  },
  modalBody: {
    marginBottom: 20,
  },
  filterGroup: {
    marginBottom: 20,
    gap: 10,
  },
  filterGroupTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  filterChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalFilterChip: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  modalFilterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalFilterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  modalFilterChipTextActive: {
    color: "#ffffff",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  modalClearBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  modalClearBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
    flexShrink: 1,
    textAlign: "center",
  },
  modalApplyBtn: {
    flex: 2,
    minHeight: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalApplyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    flexShrink: 1,
    textAlign: "center",
  },
});
