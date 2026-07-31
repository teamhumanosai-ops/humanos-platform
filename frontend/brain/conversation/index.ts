type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

const MAX_MESSAGES = 20;

export function prepareConversation(
  messages: ChatMessage[]
): ChatMessage[] {
  return messages.slice(-MAX_MESSAGES);
}