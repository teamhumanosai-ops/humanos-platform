import { saveMemory } from "./store";

type ConversationMemoryMessage = {
  role:
    | "user"
    | "assistant";

  message: string;
};

export type MemoryExtractionCandidate = {
  key: string;

  value: string;

  confidence: number;
};

function normalizeMessage(
  message: string
): string {
  return message
    .trim()
    .replace(
      /\s+/g,
      " "
    );
}

function buildCollectionKey(
  category: string,
  value: string
): string {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(
        0,
        80
      );

  return normalized
    ? `${category}:${normalized}`
    : category;
}

function pushCandidate(
  candidates: MemoryExtractionCandidate[],
  key: string,
  value: string,
  confidence = 1
): void {
  const normalizedValue =
    value.trim();

  if (
    !normalizedValue
  ) {
    return;
  }

  const duplicate =
    candidates.some(
      (candidate) =>
        candidate.key === key &&
        candidate.value.toLowerCase() ===
          normalizedValue.toLowerCase()
    );

  if (
    duplicate
  ) {
    return;
  }

  candidates.push({
    key,
    value:
      normalizedValue,
    confidence,
  });
}

/**
 * Extract explicit, user-authored durable facts from one message.
 *
 * This remains intentionally deterministic. The extractor only persists
 * information when the user explicitly states it in a known form; it does
 * not infer personal facts from ambiguous language.
 */
export function extractMemoryCandidates(
  message: string
): MemoryExtractionCandidate[] {
  const text =
    normalizeMessage(
      message
    );

  const lower =
    text.toLowerCase();

  const candidates: MemoryExtractionCandidate[] =
    [];

  if (
    lower.startsWith(
      "my name is "
    )
  ) {
    pushCandidate(
      candidates,
      "name",
      text.substring(11),
      1
    );
  }

  if (
    lower.startsWith(
      "i live in "
    )
  ) {
    pushCandidate(
      candidates,
      "city",
      text.substring(10),
      1
    );
  }

  if (
    lower.startsWith(
      "my favorite color is "
    )
  ) {
    pushCandidate(
      candidates,
      "favorite_color",
      text.substring(21),
      1
    );
  }

  if (
    lower.startsWith(
      "my favourite color is "
    )
  ) {
    pushCandidate(
      candidates,
      "favorite_color",
      text.substring(22),
      1
    );
  }

  if (
    lower.startsWith(
      "i am building "
    )
  ) {
    pushCandidate(
      candidates,
      "project",
      text.substring(14),
      1
    );
  }

  if (
    lower.startsWith(
      "i'm building "
    )
  ) {
    pushCandidate(
      candidates,
      "project",
      text.substring(13),
      1
    );
  }

  if (
    lower.startsWith(
      "i work as "
    )
  ) {
    pushCandidate(
      candidates,
      "occupation",
      text.substring(10),
      0.95
    );
  }

  if (
    lower.startsWith(
      "i work at "
    )
  ) {
    pushCandidate(
      candidates,
      "workplace",
      text.substring(10),
      0.95
    );
  }

  if (
    lower.startsWith(
      "i prefer "
    )
  ) {
    const value =
      text.substring(9);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "preference",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "i like "
    )
  ) {
    const value =
      text.substring(7);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "preference",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "i love "
    )
  ) {
    const value =
      text.substring(7);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "preference",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "i dislike "
    )
  ) {
    const value =
      text.substring(10);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "dislike",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "i don't like "
    )
  ) {
    const value =
      text.substring(13);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "dislike",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "i dont like "
    )
  ) {
    const value =
      text.substring(12);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "dislike",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "my goal is "
    )
  ) {
    const value =
      text.substring(11);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "goal",
        value
      ),
      value,
      0.9
    );
  }

  if (
    lower.startsWith(
      "i want to "
    )
  ) {
    const value =
      text.substring(10);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "goal",
        value
      ),
      value,
      0.85
    );
  }

  if (
    lower.startsWith(
      "i am trying to "
    )
  ) {
    const value =
      text.substring(15);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "goal",
        value
      ),
      value,
      0.85
    );
  }

  if (
    lower.startsWith(
      "i'm trying to "
    )
  ) {
    const value =
      text.substring(14);

    pushCandidate(
      candidates,
      buildCollectionKey(
        "goal",
        value
      ),
      value,
      0.85
    );
  }

  return candidates;
}

/**
 * Extract and persist explicit memories from one user message.
 *
 * This is the runtime-compatible entry point. Existing callers retain the
 * same function name and behavior while benefiting from the expanded set of
 * explicit statements supported by Conversation Memory v2.
 */
export async function extractSimpleMemory(
  message: string
): Promise<void> {
  const candidates =
    extractMemoryCandidates(
      message
    );

  for (
    const candidate of
    candidates
  ) {
    await saveMemory(
      candidate.key,
      candidate.value,
      candidate.confidence
    );
  }
}

/**
 * Process user-authored messages from the current conversation window.
 *
 * Assistant messages are intentionally ignored because durable personal
 * memory must originate from the user rather than from model-generated text.
 */
export async function extractConversationMemories(
  messages: ConversationMemoryMessage[]
): Promise<void> {
  for (
    const message of
    messages
  ) {
    if (
      message.role !==
      "user"
    ) {
      continue;
    }

    await extractSimpleMemory(
      message.message
    );
  }
}
