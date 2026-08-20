import { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File } from "expo-file-system";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { sendChat } from "./src/api/client";
import { createAudioInput, createImageInput } from "./src/api/contracts";
import type { ChatMessage, MultimodalInput } from "./src/api/contracts";

type ImageAttachment = { uri: string; input: MultimodalInput };
type AudioAttachment = { input: MultimodalInput; durationSeconds: number };

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [audioAttachment, setAudioAttachment] = useState<AudioAttachment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    return () => {
      requestController.current?.abort();
      requestController.current = null;
      if (recorderState.isRecording) {
        void recorder.stop().catch(() => undefined);
      }
      void setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    };
  }, [recorder, recorderState.isRecording]);

  async function handlePickImage() {
    if (sending || recorderState.isRecording) return;
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      if (!asset.base64) throw new Error("The selected image could not be read.");
      const input = createImageInput(asset.mimeType || "image/jpeg", asset.base64);
      setAttachment({ uri: asset.uri, input });
      setAudioAttachment(null);
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : "Unable to attach the selected image.");
    }
  }

  async function handleToggleRecording() {
    if (sending) return;
    setError(null);
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) throw new Error("The recording did not produce an audio file.");
        const base64 = await new File(uri).base64();
        const mimeType = Platform.OS === "web" ? "audio/webm" : "audio/m4a";
        const input = createAudioInput(mimeType, base64);
        setAudioAttachment({ input, durationSeconds: Math.max(1, Math.round(recorder.currentTime)) });
        setAttachment(null);
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        return;
      }

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error("Microphone permission is required for voice input.");
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (recordingError) {
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
      setError(recordingError instanceof Error ? recordingError.message : "Unable to record audio.");
    }
  }

  async function handleSend() {
    if (sending || recorderState.isRecording) return;
    const message = draft.trim() ||
      (attachment ? "Please analyze the attached image." :
        audioAttachment ? "Please process the attached voice message." : "");
    if (!message) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", message }];
    const controller = new AbortController();
    requestController.current = controller;
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setSending(true);

    try {
      const response = await sendChat(
        { messages: nextMessages, multimodal: attachment?.input || audioAttachment?.input },
        controller.signal
      );
      setMessages([...nextMessages, { role: "assistant", message: response.message }]);
      setAttachment(null);
      setAudioAttachment(null);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "Unable to reach Human OS.");
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setSending(false);
      }
    }
  }

  function handleCancel() { requestController.current?.abort(); }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HUMAN OS</Text>
          <Text style={styles.title}>Mobile Brain</Text>
          <Text style={styles.subtitle}>Connected to the canonical chat runtime.</Text>
        </View>

        <ScrollView style={styles.messages} contentContainerStyle={styles.messageContent} keyboardShouldPersistTaps="handled">
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptyText}>Text, image, and voice requests use the existing Human OS Brain API.</Text>
            </View>
          ) : messages.map((item, index) => (
            <View key={`${item.role}-${index}`} style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
              <Text style={styles.role}>{item.role}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          ))}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {attachment ? (
          <View style={styles.attachmentPreview}>
            <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
            <View style={styles.attachmentMeta}>
              <Text style={styles.attachmentTitle}>Image attached</Text>
              <Text style={styles.attachmentText}>Ready for Human OS analysis.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove image" disabled={sending} onPress={() => setAttachment(null)} style={styles.removeButton}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ) : null}
        {audioAttachment ? (
          <View style={styles.audioPreview}>
            <View style={styles.audioMeta}>
              <Text style={styles.attachmentTitle}>Voice message attached</Text>
              <Text style={styles.attachmentText}>{audioAttachment.durationSeconds}s ready for Human OS analysis.</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove voice message" disabled={sending} onPress={() => setAudioAttachment(null)} style={styles.removeButton}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.composer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Attach image" disabled={sending || recorderState.isRecording} onPress={handlePickImage} style={({ pressed }) => [styles.attachButton, pressed && styles.sendButtonPressed]}>
            <Text style={styles.attachText}>+</Text>
          </Pressable>
          <TextInput value={draft} onChangeText={setDraft} placeholder="Ask Human OS..." placeholderTextColor="#7a7a82" multiline maxLength={4000} style={styles.input} editable={!sending && !recorderState.isRecording} onSubmitEditing={handleSend} />
          <Pressable accessibilityRole="button" accessibilityLabel={recorderState.isRecording ? "Stop voice recording" : "Start voice recording"} disabled={sending} onPress={handleToggleRecording} style={({ pressed }) => [styles.voiceButton, recorderState.isRecording && styles.voiceButtonActive, pressed && styles.sendButtonPressed]}>
            <Text style={styles.voiceText}>{recorderState.isRecording ? "Stop" : "Voice"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={sending ? "Cancel request" : "Send message"} disabled={!sending && !draft.trim() && !attachment && !audioAttachment} onPress={sending ? handleCancel : handleSend} style={({ pressed }) => [styles.sendButton, !sending && !draft.trim() && !attachment && !audioAttachment && styles.sendButtonDisabled, pressed && styles.sendButtonPressed]}>
            {sending ? <><ActivityIndicator /><Text style={styles.cancelText}>Cancel</Text></> : <Text style={styles.sendText}>Send</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f7f5" }, container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 2, color: "#66666e" },
  title: { marginTop: 4, fontSize: 30, fontWeight: "700", color: "#17171b" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#66666e" }, messages: { flex: 1 },
  messageContent: { padding: 20, gap: 12 }, emptyState: { marginTop: 100, alignItems: "center", paddingHorizontal: 24 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#17171b" },
  emptyText: { marginTop: 8, textAlign: "center", fontSize: 15, lineHeight: 22, color: "#66666e" },
  bubble: { maxWidth: "88%", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#17171b" }, assistantBubble: { alignSelf: "flex-start", backgroundColor: "#e8e8e4" },
  role: { marginBottom: 4, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: "#77777f" },
  message: { fontSize: 16, lineHeight: 23, color: "#17171b" }, error: { marginHorizontal: 20, marginBottom: 8, color: "#b42318", fontSize: 13 },
  attachmentPreview: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 8, padding: 8, borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 14, backgroundColor: "#ffffff" },
  attachmentImage: { width: 56, height: 56, borderRadius: 10 }, attachmentMeta: { flex: 1 },
  attachmentTitle: { fontSize: 13, fontWeight: "700", color: "#17171b" }, attachmentText: { marginTop: 2, fontSize: 12, color: "#66666e" },
  audioPreview: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 8, padding: 12, borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 14, backgroundColor: "#ffffff" }, audioMeta: { flex: 1 },
  removeButton: { paddingHorizontal: 8, paddingVertical: 8 }, removeText: { fontSize: 12, fontWeight: "700", color: "#b42318" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#d7d7d2", backgroundColor: "#ffffff" },
  attachButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 16, backgroundColor: "#fafaf8" },
  attachText: { fontSize: 28, lineHeight: 28, color: "#17171b", fontWeight: "300" },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: "#17171b", backgroundColor: "#fafaf8" },
  voiceButton: { minWidth: 64, minHeight: 48, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 1, borderColor: "#d7d7d2", backgroundColor: "#fafaf8" },
  voiceButtonActive: { backgroundColor: "#fee4e2", borderColor: "#f3a6a0" }, voiceText: { fontSize: 12, fontWeight: "700", color: "#17171b" },
  sendButton: { minWidth: 70, minHeight: 48, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#17171b" },
  sendButtonDisabled: { opacity: 0.45 }, sendButtonPressed: { opacity: 0.8 }, sendText: { color: "#ffffff", fontWeight: "700" }, cancelText: { marginTop: 2, color: "#ffffff", fontSize: 11, fontWeight: "700" },
});
