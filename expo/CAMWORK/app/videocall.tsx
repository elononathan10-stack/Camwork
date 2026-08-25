import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  SwitchCamera,
  MessageSquare,
  ShieldCheck,
} from "lucide-react-native";
import { theme } from "@/components/theme";
import { useUser } from "@/context/UserContext";

export default function VideoCallScreen() {
  const params = useLocalSearchParams<{
    callerName?: string;
    companyName?: string;
  }>();

  const callerName = params.callerName || "Participant";
  const companyName = params.companyName || "CamWork call";
  const { user } = useUser();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Remote Video Participant View */}
      <View style={styles.remoteVideo}>
        <View style={styles.remotePlaceholder}>
          <Text style={styles.remoteInitial}>
            {callerName.charAt(0).toUpperCase()}
          </Text>
          <Text style={styles.connectionText}>Live call</Text>
        </View>
        <View style={styles.darkGradient} />

        {/* Top Floating Info Bar */}
        <SafeAreaView style={styles.topInfoBar}>
          <View style={styles.participantPill}>
            <ShieldCheck size={16} color={theme.colors.primary} />
            <View>
              <Text style={styles.participantName}>{callerName}</Text>
              <Text style={styles.participantSub}>{companyName}</Text>
            </View>
          </View>
          <View style={styles.timerBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Local Selfie PiP Video Preview */}
      <View style={styles.localPreview}>
        {isVideoOn ? (
          user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={[
                styles.localImage,
                !isFrontCamera && { transform: [{ scaleX: -1 }] },
              ]}
            />
          ) : (
            <Text
              style={[
                styles.localInitial,
                !isFrontCamera && { transform: [{ scaleX: -1 }] },
              ]}
            >
              {user?.name?.charAt(0) || "Y"}
            </Text>
          )
        ) : (
          <View style={styles.videoOffPlaceholder}>
            <VideoOff size={24} color="#ffffff" />
          </View>
        )}
      </View>

      {/* Bottom Floating Control Panel */}
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => setIsMuted(!isMuted)}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            {isMuted ? (
              <MicOff size={22} color="#ffffff" />
            ) : (
              <Mic size={22} color="#ffffff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsVideoOn(!isVideoOn)}
            style={[styles.controlBtn, !isVideoOn && styles.controlBtnActive]}
          >
            {isVideoOn ? (
              <Video size={22} color="#ffffff" />
            ) : (
              <VideoOff size={22} color="#ffffff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => setIsFrontCamera((current) => !current)}
          >
            <SwitchCamera size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.endCallBtn]}
            onPress={handleEndCall}
          >
            <PhoneOff size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  remoteVideo: { flex: 1, position: "relative" },
  remoteImage: { width: "100%", height: "100%", resizeMode: "cover" },
  remotePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#26354a",
  },
  remoteInitial: { color: "#ffffff", fontSize: 64, fontWeight: "800" },
  connectionText: { color: "#cbd5e1", marginTop: 8, fontSize: 13 },
  darkGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  topInfoBar: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  participantName: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  participantSub: { color: "#94a3b8", fontSize: 11 },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  timerText: { color: "#ffffff", fontSize: 12, fontWeight: "800" },
  localPreview: {
    width: 105,
    height: 155,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    position: "absolute",
    top: 110,
    right: 18,
    borderWidth: 2,
    borderColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  localImage: { width: "100%", height: "100%", resizeMode: "cover" },
  localInitial: { color: "#ffffff", fontSize: 32, fontWeight: "800" },
  videoOffPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 36,
    width: "100%",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 36,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnActive: { backgroundColor: theme.colors.error },
  endCallBtn: { backgroundColor: theme.colors.error },
});
