export type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
};

export type ChatResponse = {
  message: string;
  citations: unknown[];
  recommendations: unknown[];
};
