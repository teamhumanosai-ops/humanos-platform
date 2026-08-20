"use client";

import { useState } from "react";

import type {
  Recommendation,
} from "@/brain/recommendation";

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

export default function ChatWindow() {
  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        message:
          "Hello! I'm Human OS. How can I help you today?",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [typing, setTyping] =
    useState(false);

  const latestAssistantMessage =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "assistant"
      )?.message ?? "";

  async function sendMessage() {
    if (!input.trim()) {
      return;
    }

    const userMessage =
      input;

    const updatedMessages = [
      ...messages.map(
        ({
          role,
          message,
        }) => ({
          role,
          message,
        })
      ),

      {
        role: "user" as const,
        message:
          userMessage,
      },
    ];

    setMessages(
      updatedMessages
    );

    setInput("");

    setTyping(true);

    try {
      const response =
        await fetch(
          "/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              messages:
                updatedMessages,
            }),
          }
        );

      const data =
        await response.json();

      setMessages([
        ...updatedMessages,

        {
          role: "assistant",

          message:
            data.message ??
            "Sorry, I couldn't generate a response.",

          citations:
            Array.isArray(
              data.citations
            )
              ? data.citations
              : [],

          recommendations:
            Array.isArray(
              data.recommendations
            )
              ? data.recommendations
              : [],
        },
      ]);
    } catch (error) {
      console.error(
        error
      );

      setMessages([
        ...updatedMessages,

        {
          role: "assistant",

          message:
            "Sorry, something went wrong while contacting Human OS.",

          citations: [],

          recommendations: [],
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div
      className="
        h-[80vh]
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        flex
        flex-col
        p-6
      "
    >
      <div
        className="
          flex-1
          overflow-y-auto
          space-y-6
          pr-2
        "
      >
        {messages.map(
          (msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role}
              message={
                msg.message
              }
              citations={
                msg.citations
              }
              recommendations={
                msg.recommendations
              }
            />
          )
        )}

        {typing && (
          <TypingIndicator />
        )}
      </div>

      <div className="mt-6">
        <ChatInput
          value={input}
          onChange={
            setInput
          }
          onSend={
            sendMessage
          }
        />

        <VoiceControls
          text={
            latestAssistantMessage
          }
          onTranscript={
            setInput
          }
        />
      </div>
    </div>
  );
}
