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

const CURRENT_INFORMATION_TERMS = [
  "today",
  "tonight",
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

const CURRENT_RESULT_TERMS = [
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

const CURRENT_PEOPLE_TERMS = [
  "current president",
  "current prime minister",
  "current ceo",
  "current leader",
  "who is the president",
  "who is the prime minister",
  "who is the ceo",
  "who is currently",
];

const CURRENT_MARKET_TERMS = [
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

const CURRENT_WEATHER_TERMS = [
  "weather",
  "forecast",
  "temperature",
  "rain today",
  "snow today",
];

const CURRENT_SPORTS_TERMS = [
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
  "is it true that",
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
];

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

  /*
  |--------------------------------------------------------------------------
  | Notes have priority over task language.
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | "Save note: Remember to finish the planner"
  |
  | contains "finish", but it is still NOTE_TAKING.
  |
  */

  if (
    includesAny(
      text,
      NOTE_TERMS
    ) ||
    text.includes("note")
  ) {
    return Intent.NOTE_TAKING;
  }

  /*
  |--------------------------------------------------------------------------
  | Calendar
  |--------------------------------------------------------------------------
  */

  if (
    includesAny(
      text,
      CALENDAR_TERMS
    )
  ) {
    return Intent.CALENDAR;
  }

  /*
  |--------------------------------------------------------------------------
  | Startup Planning
  |--------------------------------------------------------------------------
  |
  | Startup planning remains a specialized planning intent,
  | but it ultimately uses the same Planning Engine.
  |
  */

  if (
    text.includes(
      "plan my startup"
    ) ||
    text.includes(
      "startup"
    ) ||
    text.includes(
      "business plan"
    ) ||
    text.includes(
      "start a business"
    )
  ) {
    return Intent.STARTUP_PLANNING;
  }

  /*
  |--------------------------------------------------------------------------
  | Live / Current Information
  |--------------------------------------------------------------------------
  */

  if (
    includesAny(
      text,
      CURRENT_INFORMATION_TERMS
    ) ||
    includesAny(
      text,
      CURRENT_RESULT_TERMS
    ) ||
    includesAny(
      text,
      CURRENT_PEOPLE_TERMS
    ) ||
    includesAny(
      text,
      CURRENT_MARKET_TERMS
    ) ||
    includesAny(
      text,
      CURRENT_WEATHER_TERMS
    ) ||
    includesAny(
      text,
      CURRENT_SPORTS_TERMS
    ) ||
    includesAny(
      text,
      LIVE_QUESTION_PATTERNS
    )
  ) {
    return Intent.LIVE_SEARCH;
  }

  /*
  |--------------------------------------------------------------------------
  | Generic Planning
  |--------------------------------------------------------------------------
  */

  if (
    includesAny(
      text,
      PLANNING_TERMS
    ) ||
    includesAny(
      text,
      PLANNING_GOAL_PATTERNS
    )
  ) {
    return Intent.PLANNING;
  }

  /*
  |--------------------------------------------------------------------------
  | Task Management
  |--------------------------------------------------------------------------
  */

  if (
    includesAny(
      text,
      TASK_TERMS
    )
  ) {
    return Intent.TASK_MANAGEMENT;
  }

  /*
  |--------------------------------------------------------------------------
  | Documents
  |--------------------------------------------------------------------------
  */

  if (
    text.includes(
      "pdf"
    ) ||
    text.includes(
      "document"
    ) ||
    text.includes(
      "file"
    )
  ) {
    return Intent.DOCUMENT;
  }

  /*
  |--------------------------------------------------------------------------
  | Learning
  |--------------------------------------------------------------------------
  */

  if (
    text.includes(
      "explain"
    ) ||
    text.includes(
      "teach me"
    ) ||
    text.includes(
      "learn"
    ) ||
    text.includes(
      "how does"
    ) ||
    text.includes(
      "what is"
    )
  ) {
    return Intent.LEARNING;
  }

  return Intent.GENERAL_CHAT;
}