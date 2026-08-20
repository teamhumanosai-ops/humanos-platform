import type { ChatRequest, ChatResponse } from "./contracts";

const DEFAULT_API_URL = "http://localhost:3000";

export class HumanOsApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HumanOsApiError";
    this.status = status;
  }
}

export function getApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  return (configured || DEFAULT_API_URL).replace(/\/$/, "");
}

export async function sendChat(
  request: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new Error("Unable to reach Human OS. Check the API URL and connection.");
  }

  if (!response.ok) {
    throw new HumanOsApiError(
      `Human OS API request failed (${response.status}).`,
      response.status
    );
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
