"use client";

import { useState } from "react";

import type { Recommendation } from "@/brain/recommendation";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import VoiceControls from "./VoiceControls";

type Citation = {
  index: number;
  title: string;
  url: string;
  domain: string;
  publishedDate?: string;
};

type Message = {
  role: "user" | "assistant";
  message: string;
  citations?: Citation[];
  recommendations?: Recommendation[];
};

type PendingMedia = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unable to read the selected media."));
        return;
      }

      const separatorIndex = result.indexOf(",");
      if (separatorIndex === -1) {
        reject(new Error("Unable to normalize the selected media."));
        return;
      }

      resolve(result.slice(separatorIndex + 1));
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected media."));
    };

    reader.readAsDataURL(file);
  });
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      message: "Hello! I'm Human OS. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [media, setMedia] = useState<PendingMedia | null>(null);
  const [typing, setTyping] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.message ?? "";

  async function handleMediaSelected(file: File | null) {
    setMediaError(null);

    if (!file) {
      setMedia(null);
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("audio/")) {
      setMediaError("Only image and audio files are supported.");
      setMedia(null);
      return;
    }

    if (file.size > MAX_MEDIA_BYTES) {
      setMediaError("Media files must be 8 MB or smaller.");
      setMedia(null);
      return;
    }

    try {
      const dataBase64 = await readFileAsBase64(file);
      setMedia({
        name: file.name,
        mimeType: file.type,
        dataBase64,
      });
    } catch (error) {
      setMedia(null);
      setMediaError(
        error instanceof Error
          ? error.message
          : "Unable to read the selected media."
      );
    }
  }

  async function sendMessage() {
    const userMessage = input.trim();
    if (!userMessage && !media) {
      return;
    }

    const displayMessage =
      userMessage || `Attached media: ${media?.name ?? "file"}`;

    const updatedMessages = [
      ...messages.map(({ role, message }) => ({ role, message })),
      { role: "user" as const, message: displayMessage },
    ];

    const pendingMedia = media;

    setMessages(updatedMessages);
    setInput("");
    setMedia(null);
    setMediaError(null);
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          multimodal: pendingMedia
            ? {
                text: userMessage || undefined,
                ...(pendingMedia.mimeType.startsWith("image/")
                  ? {
                      image: {
                        mimeType: pendingMedia.mimeType,
                        dataBase64: pendingMedia.dataBase64,
                      },
                    }
                  : {
                      audio: {
                        mimeType: pendingMedia.mimeType,
                        dataBase64: pendingMedia.dataBase64,
                      },
                    }),
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Human OS returned an error while processing the message."
        );
      }

      const data = await response.json();
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          message:
            data.message ?? "Sorry, I couldn't generate a response.",
          citations: Array.isArray(data.citations) ? data.citations : [],
          recommendations: Array.isArray(data.recommendations)
            ? data.recommendations
            : [],
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          message:
            error instanceof Error
              ? error.message
              : "Sorry, something went wrong while contacting Human OS.",
          citations: [],
          recommendations: [],
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="h-[80vh] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col p-6">
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            role={msg.role}
            message={msg.message}
            citations={msg.citations}
            recommendations={msg.recommendations}
          />
        ))}
        {typing && <TypingIndicator />}
      </div>

      <div className="mt-6">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          mediaName={media?.name ?? null}
          onMediaSelected={handleMediaSelected}
        />

        {mediaError && (
          <p className="mt-2 text-sm text-red-300">{mediaError}</p>
        )}

        <VoiceControls
          text={latestAssistantMessage}
          onTranscript={setInput}
        />
      </div>
    </div>
  );
}
