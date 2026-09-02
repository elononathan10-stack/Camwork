import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Paperclip,
  Sparkles,
  CheckCheck,
  Building2,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { PLATFORM_CONTACT_BLOCK_MESSAGE, useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, sendChatMessage } = useUser();
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();

  const conversation =
    conversations.find((c) => c.id === id) || conversations[0];

  const [inputMessage, setInputMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const quickReplies = [
    language === "EN" ? "Yes, I am available!" : "Oui, je suis disponible !",
    language === "EN"
      ? "Thank you for the update."
      : "Merci pour votre retour.",
    language === "EN"
      ? "Could you share the job details?"
      : "Pouvez-vous préciser les détails ?",
  ];

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage("");
    try {
      await sendChatMessage(conversation.id, text);
    } catch (error) {
      Alert.alert(
        "Message blocked",
        error instanceof Error ? error.message : PLATFORM_CONTACT_BLOCK_MESSAGE,
      );
      return;
    }
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickReply = async (reply: string) => {
    try {
      await sendChatMessage(conversation.id, reply);
    } catch (error) {
      Alert.alert(
        "Message blocked",
        error instanceof Error ? error.message : PLATFORM_CONTACT_BLOCK_MESSAGE,
      );
    }
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleStartVideoCall = () => {
    router.push({
      pathname: "/videocall",
      params: {
        callerName: conversation.employerName,
        companyName: conversation.companyName,
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {conversation.companyName.charAt(0)}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {conversation.employerName}
            </Text>
            <Text style={styles.headerStatus}>
              {conversation.companyName} •{" "}
              {conversation.isOnline ? t.messages.online : t.messages.offline}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleStartVideoCall}
          >
            <Video size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleStartVideoCall}
          >
            <Phone size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Job Context Banner */}
      <View style={styles.contextBanner}>
        <Building2 size={16} color={theme.colors.primary} />
        <Text style={styles.contextText} numberOfLines={1}>
          {t.messages.discussing}:{" "}
          <Text style={{ fontWeight: "800" }}>{conversation.jobContext}</Text>
        </Text>
      </View>

      {/* Messages Feed */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMe = item.isMe;
            return (
              <View
                style={[
                  styles.messageBubbleWrap,
                  isMe ? styles.bubbleMeWrap : styles.bubbleThemWrap,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe ? styles.messageTextMe : styles.messageTextThem,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <View style={styles.bubbleFooter}>
                    <Text
                      style={[
                        styles.bubbleTime,
                        isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem,
                      ]}
                    >
                      {item.timestamp}
                    </Text>
                    {isMe && (
                      <CheckCheck size={14} color="rgba(255,255,255,0.8)" />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* Quick Replies */}
        <View style={styles.quickRepliesWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesScroll}
          >
            {quickReplies.map((reply, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickReplyPill}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              paddingBottom:
                Platform.OS === "android" ? 10 + insets.bottom : 10,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() =>
              Alert.alert(
                "Attachments",
                "Attachments are available inside protected transactions.",
              )
            }
          >
            <Paperclip size={20} color="#64748b" />
          </TouchableOpacity>

          <TextInput
            placeholder={t.messages.typeMessage}
            style={styles.inputField}
            placeholderTextColor="#94a3b8"
            value={inputMessage}
            onChangeText={setInputMessage}
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputMessage.trim() && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputMessage.trim()}
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.text,
  },
  headerStatus: {
    fontSize: 11,
    color: "#64748b",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  contextBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contextText: {
    fontSize: 12,
    color: theme.colors.primary,
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 12,
    paddingBottom: 16,
  },
  messageBubbleWrap: {
    flexDirection: "row",
  },
  bubbleMeWrap: {
    justifyContent: "flex-end",
  },
  bubbleThemWrap: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#ffffff",
  },
  messageTextThem: {
    color: theme.colors.text,
  },
  bubbleFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  bubbleTime: {
    fontSize: 10,
  },
  bubbleTimeMe: {
    color: "rgba(255,255,255,0.7)",
  },
  bubbleTimeThem: {
    color: "#94a3b8",
  },
  quickRepliesWrap: {
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  quickRepliesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReplyPill: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 10,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  inputField: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 14,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
});
