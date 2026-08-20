import type { ChatRequest, ChatResponse } from "./contracts";

const DEFAULT_API_URL = "http://localhost:3000";

export function getApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/$/, "");
}

export async function sendChat(
  request: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const response = await fetch(`${getApiUrl()}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Human OS API request failed (${response.status}).`);
  }

  const payload: unknown = await response.json();

  if (!isChatResponse(payload)) {
    throw new Error("Human OS API returned an invalid chat response.");
  }

  return payload;
}

function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.message === "string" &&
    Array.isArray(candidate.citations) &&
    Array.isArray(candidate.recommendations)
  );
}
