/**
 * VIDEO CALL INTERFACE
 * Mock video call UI with state tracking and call history
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RotateCcw,
  Phone as PhoneIcon,
  Clock,
  User,
  MessageCircle,
} from "lucide-react-native";
import { theme } from "./theme";
import { VideoCall, CallHistoryEntry, CallStatus } from "@/types/domain";
import { formatCallDuration, formatCallDate } from "@/utils/videoCallService";

export interface VideoCallInterfaceProps {
  activeCall?: VideoCall;
  callHistory: CallHistoryEntry[];
  onInitiateCall?: (receiverId: string) => void;
  onAcceptCall?: (callId: string) => void;
  onDeclineCall?: (callId: string) => void;
  onEndCall?: (callId: string) => void;
  onUpdateCallStatus?: (callId: string, status: CallStatus) => void;
}

export const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  activeCall,
  callHistory,
  onInitiateCall,
  onAcceptCall,
  onDeclineCall,
  onEndCall,
  onUpdateCallStatus,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showHistory, setShowHistory] = useState(!activeCall);

  // Simulate call timer
  useEffect(() => {
    if (!activeCall || activeCall.status !== "connected") return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall]);

  const getStatusLabel = (status: CallStatus): string => {
    switch (status) {
      case "initiating":
        return "Initiating call...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return "Connected";
      case "ended":
        return "Call ended";
    }
  };

  if (activeCall && activeCall.status !== "ended") {
    return (
      <SafeAreaView style={styles.callContainer}>
        {/* Call Header */}
        <View
          style={[
            styles.callHeader,
            isVideoOff && { backgroundColor: theme.colors.text },
          ]}
        >
          <View style={styles.callInfo}>
            <Text style={styles.otherUserName}>John Doe</Text>
            <Text style={styles.callStatus}>
              {getStatusLabel(activeCall.status)}
            </Text>
          </View>

          {activeCall.status === "connected" && (
            <Text style={styles.duration}>
              {formatCallDuration(callDuration)}
            </Text>
          )}
        </View>

        {/* Video Area (Placeholder) */}
        <View style={styles.videoArea}>
          <View style={styles.videoPlaceholder}>
            <User size={60} color={theme.colors.white} />
            <Text style={styles.videoPlaceholderText}>
              {isVideoOff ? "Camera Off" : "Video Stream"}
            </Text>
          </View>

          {/* Local Preview */}
          <View style={styles.localPreview}>
            <View style={styles.previewContent}>
              <Text style={styles.previewText}>You</Text>
            </View>
          </View>
        </View>

        {/* Call Controls */}
        <View style={styles.controlsBar}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <MicOff size={24} color={theme.colors.white} />
            ) : (
              <Mic size={24} color={theme.colors.white} />
            )}
          </TouchableOpacity>

          {/* Video Button */}
          <TouchableOpacity
            style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? (
              <VideoOff size={24} color={theme.colors.white} />
            ) : (
              <Video size={24} color={theme.colors.white} />
            )}
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={[styles.controlBtn, styles.endCallBtn]}
            onPress={() => {
              onEndCall?.(activeCall.id);
              setCallDuration(0);
              setShowHistory(true);
            }}
          >
            <PhoneOff size={24} color={theme.colors.white} />
          </TouchableOpacity>

          {/* Message Button */}
          <TouchableOpacity style={styles.controlBtn}>
            <MessageCircle size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons for Ringing */}
        {activeCall.status === "ringing" && (
          <View style={styles.ringingActions}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => {
                onDeclineCall?.(activeCall.id);
                setShowHistory(true);
              }}
            >
              <PhoneOff size={20} color={theme.colors.white} />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => {
                onAcceptCall?.(activeCall.id);
                onUpdateCallStatus?.(activeCall.id, "connected");
              }}
            >
              <Phone size={20} color={theme.colors.white} />
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Call History View
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Call History</Text>
          <Text style={styles.headerSubtitle}>{callHistory.length} calls</Text>
        </View>

        {callHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <PhoneIcon size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No call history</Text>
            <Text style={styles.emptySubtext}>Calls will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={callHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.callId}
            renderItem={({ item }) => (
              <View style={styles.callHistoryCard}>
                <View style={styles.historyContent}>
                  <View>
                    <Text style={styles.historyName}>
                      {item.initiatedBy === "caller"
                        ? `Called ${item.receiver}`
                        : `Received from ${item.caller}`}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatCallDate(new Date(item.date))}
                    </Text>
                  </View>
                  <View style={styles.historyDuration}>
                    <Clock size={14} color={theme.colors.textMuted} />
                    <Text style={styles.durationText}>
                      {formatCallDuration(item.duration)}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyActions}>
                  <TouchableOpacity style={styles.callAgainBtn}>
                    <Phone size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.messageBtn}>
                    <MessageCircle size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
  },
  callHistoryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: 8,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  historyDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: "500",
  },
  historyActions: {
    flexDirection: "row",
    gap: 12,
  },
  callAgainBtn: {
    padding: 8,
  },
  messageBtn: {
    padding: 8,
  },
  // Active Call Styles
  callContainer: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDark,
  },
  callHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  callInfo: {
    flex: 1,
  },
  otherUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  callStatus: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  duration: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.white,
  },
  videoArea: {
    flex: 1,
    position: "relative",
    backgroundColor: theme.colors.text,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlaceholderText: {
    color: theme.colors.white,
    fontSize: 14,
    marginTop: 12,
  },
  localPreview: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 100,
    height: 140,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  previewContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  endCallBtn: {
    backgroundColor: theme.colors.error,
  },
  ringingActions: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.md,
  },
  declineBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
  },
  acceptBtnText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
