import {
  Intent,
} from "./types";

import {
  detectIntent,
} from "./detector";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Intent detector regression failed: ${message}`
    );
  }
}

const liveCases = [
  "What happened with OpenAI?",
  "Tell me what happened with OpenAI",
  "Give me an update on OpenAI",
  "What's going on with OpenAI?",
  "Can you check the latest OpenAI news?",
  "What is the current price of Bitcoin?",
  "What's happening in the NBA?",
  "Who won the game?",
];

for (const message of liveCases) {
  assert(
    detectIntent(message) ===
      Intent.LIVE_SEARCH,
    `"${message}" must be LIVE_SEARCH`
  );
}

const taskCases = [
  "Show me my tasks",
  "What are my tasks?",
  "What do I need to do?",
  "List my tasks",
  "Review my finances today",
  "Update my budget today",
  "Research this topic today",
  "I need to finish my taxes today",
  "I want to research AI companies",
];

for (const message of taskCases) {
  assert(
    detectIntent(message) ===
      Intent.TASK_MANAGEMENT,
    `"${message}" must be TASK_MANAGEMENT`
  );
}

assert(
  detectIntent(
    "I want to build an AI company"
  ) === Intent.PLANNING,
  "planning request must remain PLANNING"
);

assert(
  detectIntent(
    "Help me create a business plan"
  ) === Intent.STARTUP_PLANNING,
  "startup planning request must remain STARTUP_PLANNING"
);

assert(
  detectIntent(
    "Explain how transformers work"
  ) === Intent.LEARNING,
  "learning request must remain LEARNING"
);

console.log(
  "Intent detector regression verification passed."
);
