import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, MessageSquare } from 'lucide-react-native';
import { theme } from './theme';

const VideoCallScreen = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  return (
    <View style={styles.container}>
      {/* Remote Video Placeholder */}
      <View style={styles.remoteVideo}>
        <Text style={styles.participantName}>Recruiter @ Orange</Text>
      </View>

      {/* Local Video Preview */}
      <View style={styles.localPreview} />

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={() => setIsMuted(!isMuted)} 
          style={[styles.btn, isMuted && styles.btnActive]}
        >
          {isMuted ? <MicOff color="#fff" /> : <Mic color="#fff" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsVideoOn(!isVideoOn)} 
          style={[styles.btn, !isVideoOn && styles.btnActive]}
        >
          {isVideoOn ? <Video color="#fff" /> : <VideoOff color="#fff" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn}>
          <ScreenShare color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.endCallBtn]}>
          <PhoneOff color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  remoteVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  participantName: { color: '#fff', fontSize: 18, fontWeight: 'bold', position: 'absolute', top: 60 },
  localPreview: { width: 100, height: 150, backgroundColor: '#333', borderRadius: 12, position: 'absolute', top: 120, right: 20, borderWidth: 2, borderColor: '#fff' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingBottom: 40, position: 'absolute', bottom: 0, width: '100%' },
  btn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  btnActive: { backgroundColor: theme.colors.error },
  endCallBtn: { backgroundColor: theme.colors.error },
});

export default VideoCallScreen;