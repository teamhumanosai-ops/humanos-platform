import { Intent } from "./types";

function includesAny(
  text: string,
  terms: readonly string[]
): boolean {
  return terms.some(
    (term) =>
      text.includes(term)
  );
}

const NOTE_TERMS = [
  "save note",
  "save this as a note",
  "write this down",
  "take a note",
  "make a note",
  "add a note",
  "show notes",
  "list notes",
];

const CALENDAR_TERMS = [
  "calendar",
  "meeting",
  "appointment",
  "schedule",
  "scheduled",
  "event",
  "book an appointment",
];

const PLANNING_TERMS = [
  "plan",
  "planning",
  "roadmap",
  "road map",
  "strategy",
  "strategize",
  "action plan",
  "game plan",
  "step by step plan",
  "make a plan",
  "create a plan",
  "build a plan",
];

const PLANNING_GOAL_PATTERNS = [
  "i want to build",
  "i want to create",
  "i want to develop",
  "i want to launch",
  "i want to start",
  "i want to organize",
  "i want to organise",
  "help me build",
  "help me create",
  "help me develop",
  "help me launch",
  "help me organize",
  "help me organise",
];

const TASK_TERMS = [
  "task",
  "tasks",
  "todo",
  "to-do",
  "remind me",
  "reminder",
  "finish",
  "complete",
  "need to",
  "trying to",
  "work on",
  "buy",
  "prepare",
  "organize",
  "organise",
  "handle",
  "review",
  "update",
  "fix",
  "clean",
  "call",
  "send",
  "pay",
  "book",
  "study",
  "practice",
  "research",
  "write",
  "read",
  "implement",
  "build",
  "create",
  "develop",
  "launch",
  "install",
  "set up",
  "setup",
];

const LIVE_INFORMATION_TERMS = [
  "today",
  "tonight",
  "tomorrow",
  "right now",
  "currently",
  "current",
  "latest",
  "recent",
  "recently",
  "this week",
  "this month",
  "this year",
  "breaking",
  "breaking news",
  "news",
  "update",
  "updates",
  "up-to-date",
  "up to date",
  "as of now",
  "as of today",
];

const LIVE_RESULT_TERMS = [
  "who won",
  "winner",
  "champion",
  "result",
  "results",
  "score",
  "scores",
  "standings",
  "ranking",
  "rankings",
  "release date",
  "released",
  "latest version",
  "new version",
  "version",
];

const LIVE_PEOPLE_TERMS = [
  "current president",
  "current prime minister",
  "current ceo",
  "current leader",
  "who is the president",
  "who is the prime minister",
  "who is the ceo",
  "who is currently",
];

const LIVE_MARKET_TERMS = [
  "price",
  "stock price",
  "share price",
  "market price",
  "pricing",
  "cost",
  "exchange rate",
  "interest rate",
  "bitcoin price",
  "crypto price",
];

const LIVE_WEATHER_TERMS = [
  "weather",
  "forecast",
  "temperature",
  "rain today",
  "snow today",
];

const LIVE_SPORTS_TERMS = [
  "fifa",
  "world cup",
  "nba",
  "nfl",
  "nhl",
  "mlb",
  "ipl",
  "cricket",
  "premier league",
  "champions league",
  "formula 1",
  "formula one",
  "f1",
  "tennis",
  "football",
  "basketball",
  "baseball",
  "soccer",
];

const LIVE_QUESTION_PATTERNS = [
  "what happened today",
  "what happened recently",
  "what's happening",
  "whats happening",
  "what is happening",
  "what are the latest",
  "what is the latest",
  "what's the latest",
  "whats the latest",
  "what is the current",
  "what's the current",
  "whats the current",
  "what is today's",
  "what's today's",
  "whats today's",
  "what is the latest news",
  "what's the latest news",
  "whats the latest news",
  "is it true that",
  "what happened with",
  "what happened about",
  "tell me what happened with",
  "tell me what happened about",
  "what's going on with",
  "whats going on with",
  "what is going on with",
  "what's new with",
  "whats new with",
  "what is new with",
  "give me an update on",
  "give me the latest on",
  "tell me the latest about",
  "any news about",
  "any news on",
  "latest news about",
  "latest news on",
];

const DOCUMENT_TERMS = [
  "pdf",
  "document",
  "file",
];

const LEARNING_TERMS = [
  "explain",
  "teach me",
  "learn",
  "how does",
  "what is",
];

function isExplicitPlanningRequest(
  text: string
): boolean {
  return (
    includesAny(
      text,
      PLANNING_TERMS
    ) ||
    includesAny(
      text,
      PLANNING_GOAL_PATTERNS
    )
  );
}

function isActionableTaskRequest(
  text: string
): boolean {
  if (
    isExplicitLiveQuestion(
      text
    )
  ) {
    return false;
  }

  return includesAny(
    text,
    TASK_TERMS
  );
}

function isExplicitLiveQuestion(
  text: string
): boolean {
  return (
    includesAny(
      text,
      LIVE_QUESTION_PATTERNS
    ) ||
    includesAny(
      text,
      LIVE_RESULT_TERMS
    ) ||
    includesAny(
      text,
      LIVE_PEOPLE_TERMS
    ) ||
    includesAny(
      text,
      LIVE_MARKET_TERMS
    ) ||
    includesAny(
      text,
      LIVE_WEATHER_TERMS
    ) ||
    includesAny(
      text,
      LIVE_SPORTS_TERMS
    )
  );
}

function containsLiveContext(
  text: string
): boolean {
  return includesAny(
    text,
    LIVE_INFORMATION_TERMS
  );
}

export function detectIntent(
  message: string
): Intent {
  const text =
    message
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        " "
      );

  if (!text) {
    return Intent.GENERAL_CHAT;
  }

  if (
    includesAny(
      text,
      NOTE_TERMS
    ) ||
    text.includes("note")
  ) {
    return Intent.NOTE_TAKING;
  }

  if (
    includesAny(
      text,
      CALENDAR_TERMS
    )
  ) {
    return Intent.CALENDAR;
  }

  if (
    text.includes(
      "plan my startup"
    ) ||
    text.includes(
      "startup"
    ) ||
    text.includes(
      "start a business"
    ) ||
    text.includes(
      "business idea"
    ) ||
    text.includes(
      "business plan"
    )
  ) {
    return Intent.STARTUP_PLANNING;
  }

  if (
    isExplicitPlanningRequest(
      text
    )
  ) {
    return Intent.PLANNING;
  }

  if (
    isExplicitLiveQuestion(
      text
    )
  ) {
    return Intent.LIVE_SEARCH;
  }

  if (
    isActionableTaskRequest(
      text
    )
  ) {
    return Intent.TASK_MANAGEMENT;
  }

  if (
    containsLiveContext(
      text
    )
  ) {
    return Intent.LIVE_SEARCH;
  }

  if (
    includesAny(
      text,
      DOCUMENT_TERMS
    )
  ) {
    return Intent.DOCUMENT;
  }

  if (
    includesAny(
      text,
      LEARNING_TERMS
    )
  ) {
    return Intent.LEARNING;
  }

  return Intent.GENERAL_CHAT;
}
