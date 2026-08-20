import { useState } from "react";
import {
  ActivityIndicator,
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
import type { ChatMessage } from "./src/api/contracts";

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const message = draft.trim();
    if (!message || sending) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", message },
    ];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setSending(true);

    try {
      const response = await sendChat({ messages: nextMessages });
      setMessages([
        ...nextMessages,
        { role: "assistant", message: response.message },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach Human OS."
      );
    } finally {
      setSending(false);
    }
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
          <Text style={styles.subtitle}>Connected to the canonical chat runtime.</Text>
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
                Your messages are sent through the existing Human OS Brain API.
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

        <View style={styles.composer}>
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
            accessibilityLabel="Send message"
            disabled={sending || !draft.trim()}
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              (sending || !draft.trim()) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            {sending ? (
              <ActivityIndicator />
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f5",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#66666e",
  },
  title: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: "700",
    color: "#17171b",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#66666e",
  },
  messages: {
    flex: 1,
  },
  messageContent: {
    padding: 20,
    gap: 12,
  },
  emptyState: {
    marginTop: 100,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#17171b",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#66666e",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#17171b",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e8e8e4",
  },
  role: {
    marginBottom: 4,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#77777f",
  },
  message: {
    fontSize: 16,
    lineHeight: 23,
    color: "#17171b",
  },
  error: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: "#b42318",
    fontSize: 13,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#d7d7d2",
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#d7d7d2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#17171b",
    backgroundColor: "#fafaf8",
  },
  sendButton: {
    minWidth: 70,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#17171b",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
