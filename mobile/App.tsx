import { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
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
import { createImageInput } from "./src/api/contracts";
import type { ChatMessage, MultimodalInput } from "./src/api/contracts";

type ImageAttachment = {
  uri: string;
  input: MultimodalInput;
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      requestController.current?.abort();
      requestController.current = null;
    };
  }, []);

  async function handlePickImage() {
    if (sending) return;

    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];

    try {
      if (!asset.base64) {
        throw new Error("The selected image could not be read.");
      }

      const input = createImageInput(
        asset.mimeType || "image/jpeg",
        asset.base64
      );

      setAttachment({ uri: asset.uri, input });
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : "Unable to attach the selected image."
      );
    }
  }

  async function handleSend() {
    if (sending) return;

    const message =
      draft.trim() ||
      (attachment ? "Please analyze the attached image." : "");

    if (!message) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", message },
    ];
    const controller = new AbortController();

    requestController.current = controller;
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setSending(true);

    try {
      const response = await sendChat(
        {
          messages: nextMessages,
          multimodal: attachment?.input,
        },
        controller.signal
      );

      setMessages([
        ...nextMessages,
        { role: "assistant", message: response.message },
      ]);
      setAttachment(null);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach Human OS."
      );
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setSending(false);
      }
    }
  }

  function handleCancel() {
    requestController.current?.abort();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HUMAN OS</Text>
          <Text style={styles.title}>Mobile Brain</Text>
          <Text style={styles.subtitle}>
            Connected to the canonical chat runtime.
          </Text>
        </View>

        <ScrollView
          style={styles.messages}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Start a conversation</Text>
              <Text style={styles.emptyText}>
                Text and image requests use the existing Human OS Brain API.
              </Text>
            </View>
          ) : (
            messages.map((item, index) => (
              <View
                key={`${item.role}-${index}`}
                style={[
                  styles.bubble,
                  item.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text style={styles.role}>{item.role}</Text>
                <Text style={styles.message}>{item.message}</Text>
              </View>
            ))
          )}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {attachment ? (
          <View style={styles.attachmentPreview}>
            <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
            <View style={styles.attachmentMeta}>
              <Text style={styles.attachmentTitle}>Image attached</Text>
              <Text style={styles.attachmentText}>Ready for Human OS analysis.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove image"
              disabled={sending}
              onPress={() => setAttachment(null)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Attach image"
            disabled={sending}
            onPress={handlePickImage}
            style={({ pressed }) => [
              styles.attachButton,
              pressed && styles.sendButtonPressed,
            ]}
          >
            <Text style={styles.attachText}>+</Text>
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask Human OS..."
            placeholderTextColor="#7a7a82"
            multiline
            maxLength={4000}
            style={styles.input}
            editable={!sending}
            onSubmitEditing={handleSend}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={sending ? "Cancel request" : "Send message"}
            disabled={!sending && !draft.trim() && !attachment}
            onPress={sending ? handleCancel : handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              !sending && !draft.trim() && !attachment && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            {sending ? (
              <>
                <ActivityIndicator />
                <Text style={styles.cancelText}>Cancel</Text>
              </>
            ) : (
              <Text style={styles.sendText}>Send</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f7f5" },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 2, color: "#66666e" },
  title: { marginTop: 4, fontSize: 30, fontWeight: "700", color: "#17171b" },
  subtitle: { marginTop: 4, fontSize: 14, color: "#66666e" },
  messages: { flex: 1 },
  messageContent: { padding: 20, gap: 12 },
  emptyState: { marginTop: 100, alignItems: "center", paddingHorizontal: 24 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#17171b" },
  emptyText: { marginTop: 8, textAlign: "center", fontSize: 15, lineHeight: 22, color: "#66666e" },
  bubble: { maxWidth: "88%", borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#17171b" },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#e8e8e4" },
  role: { marginBottom: 4, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: "#77777f" },
  message: { fontSize: 16, lineHeight: 23, color: "#17171b" },
  error: { marginHorizontal: 20, marginBottom: 8, color: "#b42318", fontSize: 13 },
  attachmentPreview: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 8, padding: 8, borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 14, backgroundColor: "#ffffff" },
  attachmentImage: { width: 56, height: 56, borderRadius: 10 },
  attachmentMeta: { flex: 1 },
  attachmentTitle: { fontSize: 13, fontWeight: "700", color: "#17171b" },
  attachmentText: { marginTop: 2, fontSize: 12, color: "#66666e" },
  removeButton: { paddingHorizontal: 8, paddingVertical: 8 },
  removeText: { fontSize: 12, fontWeight: "700", color: "#b42318" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#d7d7d2", backgroundColor: "#ffffff" },
  attachButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 16, backgroundColor: "#fafaf8" },
  attachText: { fontSize: 28, lineHeight: 28, color: "#17171b", fontWeight: "300" },
  input: { flex: 1, minHeight: 48, maxHeight: 120, borderWidth: 1, borderColor: "#d7d7d2", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: "#17171b", backgroundColor: "#fafaf8" },
  sendButton: { minWidth: 70, minHeight: 48, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#17171b" },
  sendButtonDisabled: { opacity: 0.45 },
  sendButtonPressed: { opacity: 0.8 },
  sendText: { color: "#ffffff", fontWeight: "700" },
  cancelText: { marginTop: 2, color: "#ffffff", fontSize: 11, fontWeight: "700" },
});
