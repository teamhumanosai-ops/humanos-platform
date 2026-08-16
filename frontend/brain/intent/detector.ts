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

const CURRENT_INFORMATION_TERMS = [
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
  "schedule",
  "fixtures",
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
  | Startup Planning
  |--------------------------------------------------------------------------
  */

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
  |
  | Keep planning separate from startup planning.
  |
  */

  if (
    includesAny(
      text,
      PLANNING_TERMS
    )
  ) {
    return Intent.PLANNING;
  }

  /*
  |--------------------------------------------------------------------------
  | Calendar
  |--------------------------------------------------------------------------
  */

  if (
    text.includes(
      "calendar"
    ) ||
    text.includes(
      "meeting"
    ) ||
    text.includes(
      "appointment"
    ) ||
    text.includes(
      "schedule"
    )
  ) {
    return Intent.CALENDAR;
  }

  /*
  |--------------------------------------------------------------------------
  | Tasks
  |--------------------------------------------------------------------------
  */

  if (
    text.includes(
      "task"
    ) ||
    text.includes(
      "todo"
    ) ||
    text.includes(
      "to-do"
    ) ||
    text.includes(
      "remind me"
    ) ||
    text.includes(
      "reminder"
    )
  ) {
    return Intent.TASK_MANAGEMENT;
  }

  /*
  |--------------------------------------------------------------------------
  | Notes
  |--------------------------------------------------------------------------
  */

  if (
    text.includes(
      "note"
    ) ||
    text.includes(
      "write this down"
    ) ||
    text.includes(
      "save this"
    )
  ) {
    return Intent.NOTE_TAKING;
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