/**
 * JOB SEEKER PROFILE & PORTABLE REPUTATION
 * Displays work history, skills, resume, and rating score
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
  Switch,
  SafeAreaView,
  FlatList,
} from "react-native";
import {
  Plus,
  Trash2,
  Star,
  Briefcase,
  Calendar,
  Edit2,
  X,
  Upload,
  Award,
  TrendingUp,
} from "lucide-react-native";
import { theme } from "./theme";
import { WorkHistoryEntry, SkillItem } from "@/types/domain";

export interface PortableReputationProps {
  workHistory: WorkHistoryEntry[];
  skills: SkillItem[];
  averageRating: number;
  ratingCount: number;
  resumeUrl?: string;
  onAddWorkHistory?: (
    entry: Omit<WorkHistoryEntry, "id" | "jobSeekerId">,
  ) => void;
  onRemoveWorkHistory?: (entryId: string) => void;
  onUpdateWorkHistory?: (
    entryId: string,
    entry: Partial<WorkHistoryEntry>,
  ) => void;
  onAddSkill?: (skill: Omit<SkillItem, "id">) => void;
  onRemoveSkill?: (skillId: string) => void;
}

export const PortableReputation: React.FC<PortableReputationProps> = ({
  workHistory,
  skills,
  averageRating,
  ratingCount,
  resumeUrl,
  onAddWorkHistory,
  onRemoveWorkHistory,
  onUpdateWorkHistory,
  onAddSkill,
  onRemoveSkill,
}) => {
  const [showAddWork, setShowAddWork] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "",
    level: "Intermediate" as "Beginner" | "Intermediate" | "Expert",
  });

  const handleAddWork = () => {
    if (formData.jobTitle && formData.company) {
      onAddWorkHistory?.({
        jobTitle: formData.jobTitle,
        company: formData.company,
        location: formData.location,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        description: formData.description,
      });
      setFormData({
        jobTitle: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      setShowAddWork(false);
    }
  };

  const handleAddSkill = () => {
    if (skillForm.name) {
      onAddSkill?.({
        name: skillForm.name,
        category: skillForm.category,
        level: skillForm.level,
      });
      setSkillForm({ name: "", category: "", level: "Intermediate" });
      setShowAddSkill(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Rating Card */}
      <View style={styles.ratingCard}>
        <View style={styles.ratingContent}>
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingScore}>{averageRating.toFixed(1)}</Text>
            <Star
              size={16}
              color={theme.colors.accent}
              fill={theme.colors.accent}
            />
          </View>
          <View>
            <Text style={styles.ratingLabel}>Your Platform Rating</Text>
            <Text style={styles.ratingCount}>
              {ratingCount} employers rated you
            </Text>
          </View>
        </View>
      </View>

      {/* Work History Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Work History</Text>
          <TouchableOpacity
            onPress={() => setShowAddWork(true)}
            style={styles.addBtn}
          >
            <Plus size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {workHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Briefcase size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No work history yet</Text>
            <Text style={styles.emptySubtext}>
              Add your work experience to build your reputation
            </Text>
          </View>
        ) : (
          <FlatList
            data={workHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.workCard}>
                <View style={styles.workContent}>
                  <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                  <Text style={styles.company}>{item.company}</Text>
                  <View style={styles.metaRow}>
                    <Calendar size={14} color={theme.colors.textMuted} />
                    <Text style={styles.meta}>
                      {item.startDate.toLocaleDateString()} -{" "}
                      {item.endDate?.toLocaleDateString() || "Present"}
                    </Text>
                  </View>
                  <Text style={styles.description}>{item.description}</Text>
                  {item.verifiedByEmployer && (
                    <View style={styles.verifiedBadge}>
                      <Award size={12} color={theme.colors.success} />
                      <Text style={styles.verifiedText}>
                        Verified by Employer
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => onRemoveWorkHistory?.(item.id)}
                >
                  <Trash2 size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <TouchableOpacity
            onPress={() => setShowAddSkill(true)}
            style={styles.addBtn}
          >
            <Plus size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {skills.length === 0 ? (
          <View style={styles.emptyState}>
            <Award size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No skills added yet</Text>
            <Text style={styles.emptySubtext}>
              Highlight your expertise to attract employers
            </Text>
          </View>
        ) : (
          <View style={styles.skillsGrid}>
            {skills.map((skill) => (
              <View key={skill.id} style={styles.skillChip}>
                <View>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillLevel}>{skill.level || "N/A"}</Text>
                </View>
                <TouchableOpacity onPress={() => onRemoveSkill?.(skill.id)}>
                  <X size={16} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Resume Section */}
      {resumeUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <TouchableOpacity style={styles.resumeCard}>
            <Upload size={24} color={theme.colors.primary} />
            <Text style={styles.resumeName}>My Resume.pdf</Text>
            <Text style={styles.resumeDate}>Updated 2 days ago</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Work History Modal */}
      <Modal visible={showAddWork} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Work Experience</Text>
            <TouchableOpacity onPress={() => setShowAddWork(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <TextInput
              style={styles.input}
              placeholder="Job Title"
              value={formData.jobTitle}
              onChangeText={(text) =>
                setFormData({ ...formData, jobTitle: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={formData.company}
              onChangeText={(text) =>
                setFormData({ ...formData, company: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              value={formData.startDate}
              onChangeText={(text) =>
                setFormData({ ...formData, startDate: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD)"
              value={formData.endDate}
              onChangeText={(text) =>
                setFormData({ ...formData, endDate: text })
              }
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddWork}>
              <Text style={styles.submitBtnText}>Add Experience</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Skill Modal */}
      <Modal visible={showAddSkill} animationType="slide" transparent>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Skill</Text>
            <TouchableOpacity onPress={() => setShowAddSkill(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <TextInput
              style={styles.input}
              placeholder="Skill Name"
              value={skillForm.name}
              onChangeText={(text) =>
                setSkillForm({ ...skillForm, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Category (e.g., Development, Design)"
              value={skillForm.category}
              onChangeText={(text) =>
                setSkillForm({ ...skillForm, category: text })
              }
            />

            <Text style={styles.label}>Proficiency Level</Text>
            {["Beginner", "Intermediate", "Expert"].map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.levelOption}
                onPress={() =>
                  setSkillForm({
                    ...skillForm,
                    level: level as "Beginner" | "Intermediate" | "Expert",
                  })
                }
              >
                <View
                  style={[
                    styles.radio,
                    skillForm.level === level && styles.radioSelected,
                  ]}
                />
                <Text style={styles.levelText}>{level}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddSkill}>
              <Text style={styles.submitBtnText}>Add Skill</Text>
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
  ratingCard: {
    margin: 16,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ratingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
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
    textAlign: "center",
  },
  workCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  workContent: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  company: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  meta: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  description: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.sm,
    alignSelf: "flex-start",
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.success,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.full,
    marginBottom: 8,
  },
  skillName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  skillLevel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  resumeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  resumeDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
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
  modalForm: {
    padding: 16,
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
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  levelOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: 10,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  levelText: {
    fontSize: 14,
    color: theme.colors.text,
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
