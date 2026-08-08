"use client";

import { useState } from "react";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

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
      </div>
    </div>
  );
}