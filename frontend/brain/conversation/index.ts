export type ChatMessage = {
  role:
    | "user"
    | "assistant";

  message: string;
};

/**
 * Maximum number of recent turns retained in the runtime request.
 *
 * Older turns remain available to the bounded continuity summary
 * and persistent cognitive systems such as memory, timeline,
 * and graph context.
 */
export const MAX_MESSAGES = 20;

/**
 * Maximum number of omitted messages represented in the compact
 * continuity summary.
 */
export const MAX_SUMMARY_MESSAGES = 12;

/**
 * Maximum number of characters retained from an individual
 * omitted message in the continuity summary.
 */
export const MAX_SUMMARY_MESSAGE_LENGTH = 280;

/**
 * Maximum total size of the compact continuity summary.
 */
export const MAX_SUMMARY_LENGTH = 3600;

/**
 * Normalize the incoming conversation without changing message order.
 * Empty messages are discarded because they add no cognitive context.
 */
export function normalizeConversation(
  messages: ChatMessage[]
): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" ||
          message.role === "assistant") &&
        message.message.trim().length > 0
    )
    .map(
      (message) => ({
        role: message.role,
        message: message.message.trim(),
      })
    );
}

/**
 * Prepare the bounded short-term conversation window used by the runtime.
 *
 * The returned array is a new value so callers cannot mutate the original
 * request payload through the prepared conversation reference.
 */
export function prepareConversation(
  messages: ChatMessage[]
): ChatMessage[] {
  const normalized =
    normalizeConversation(
      messages
    );

  return normalized.slice(
    -MAX_MESSAGES
  );
}

/**
 * Return the number of valid messages that were omitted from the runtime
 * window. This is useful for diagnostics and future summarization work.
 */
export function getOmittedMessageCount(
  messages: ChatMessage[]
): number {
  const normalized =
    normalizeConversation(
      messages
    );

  return Math.max(
    0,
    normalized.length -
      MAX_MESSAGES
  );
}

/**
 * Build a deterministic compact continuity representation for messages
 * that fall outside the short-term runtime window.
 *
 * This is intentionally a compression layer, not an invented semantic
 * summary. It preserves message roles and source wording while bounding
 * the amount of historical conversation entering the cognitive prompt.
 */
export function buildConversationContinuitySummary(
  messages: ChatMessage[]
): string {
  const normalized =
    normalizeConversation(
      messages
    );

  const omitted =
    normalized.slice(
      0,
      Math.max(
        0,
        normalized.length -
          MAX_MESSAGES
      )
    );

  if (
    omitted.length === 0
  ) {
    return "";
  }

  const selected =
    omitted.slice(
      -MAX_SUMMARY_MESSAGES
    );

  const omittedBeforeSelected =
    omitted.length -
    selected.length;

  const lines: string[] = [];

  if (
    omittedBeforeSelected >
    0
  ) {
    lines.push(
      `Earlier history also contains ${omittedBeforeSelected} omitted message(s) before the continuity window below.`
    );
  }

  for (
    const message of selected
  ) {
    const compactMessage =
      message.message
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    const clipped =
      compactMessage.length >
      MAX_SUMMARY_MESSAGE_LENGTH
        ? `${compactMessage.slice(
            0,
            MAX_SUMMARY_MESSAGE_LENGTH -
              1
          )}…`
        : compactMessage;

    lines.push(
      `${message.role}: ${clipped}`
    );
  }

  return lines
    .join("\n")
    .slice(
      0,
      MAX_SUMMARY_LENGTH
    );
}
