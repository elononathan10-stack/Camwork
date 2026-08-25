import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import {
  Search,
  MessageSquare,
  Building2,
  ChevronRight,
  Sparkles,
  Phone,
  Video,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MessagesScreen() {
  const { conversations } = useUser();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    (c) =>
      c.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobContext.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {t.messages.title}
          </Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => router.push("/new-chat")}
          >
            <MessageSquare size={17} color="#fff" />
            <Text style={styles.newChatText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder={t.messages.searchPlaceholder}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Conversation List */}
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.conversationCard}
              onPress={() =>
                router.push({
                  pathname: "/chat-thread",
                  params: { id: item.id },
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {item.companyName.charAt(0)}
                  </Text>
                </View>
                {item.isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.cardCenter}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.companyName}
                  </Text>
                  <Text style={styles.timeText}>{item.lastMessageTime}</Text>
                </View>

                {/* Job context pill */}
                <View style={styles.jobContextBadge}>
                  <Text style={styles.jobContextText} numberOfLines={1}>
                    {t.messages.discussing}: {item.jobContext}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.lastMessage,
                    item.unreadCount > 0 && styles.lastMessageUnread,
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>

              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>{t.messages.emptyTitle}</Text>
              <Text style={styles.emptySub}>{t.messages.emptySub}</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, paddingHorizontal: 18, paddingTop: 4 },
  header: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  newChatButton: {
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  newChatText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  cardCenter: {
    flex: 1,
    gap: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  companyName: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  jobContextBadge: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  jobContextText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  lastMessage: {
    fontSize: 13,
    color: "#64748b",
  },
  lastMessageUnread: {
    color: theme.colors.text,
    fontWeight: "700",
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
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
});
