import { Intent } from "./types";

function containsAny(
  text: string,
  phrases: string[]
): boolean {
  return phrases.some(
    (phrase) =>
      text.includes(phrase)
  );
}

function containsYear(
  text: string
): boolean {
  return /\b20\d{2}\b/.test(text);
}

export function detectIntent(
  message: string
): Intent {
  const text =
    message
      .toLowerCase()
      .trim();

  if (
    text.includes("plan my startup") ||
    text.includes("startup")
  ) {
    return Intent.STARTUP_PLANNING;
  }

  /*
   * Live information indicators.
   *
   * These intentionally include event/result
   * questions such as:
   *
   * - Who won FIFA 2026?
   * - Who won IPL 2026?
   * - What is today's score?
   * - What are the latest OpenAI updates?
   */
  const liveIndicators = [
    "today",
    "latest",
    "current",
    "right now",
    "just now",
    "recent",
    "recently",
    "this week",
    "this month",
    "this year",
    "yesterday",
    "news",
    "update",
    "updates",
    "breaking",
    "live",
    "who won",
    "who is the winner",
    "winner of",
    "champion of",
    "champions of",
    "final result",
    "results",
    "result",
    "score",
    "scores",
    "standings",
    "table",
    "fixture",
    "fixtures",
    "schedule",
    "released",
    "release date",
    "launched",
    "price",
    "pricing",
    "stock price",
    "share price",
    "market",
    "weather",
    "forecast",
    "election",
    "elections",
  ];

  const liveEntities = [
    "fifa",
    "world cup",
    "ipl",
    "indian premier league",
    "cricket",
    "nfl",
    "nba",
    "nhl",
    "premier league",
    "uefa",
    "formula 1",
    "f1",
    "openai",
    "anthropic",
    "google ai",
    "gemini",
    "nvidia",
    "bitcoin",
    "ethereum",
    "crypto",
  ];

  const asksForLiveInformation =
    containsAny(
      text,
      liveIndicators
    );

  const containsLiveEntity =
    containsAny(
      text,
      liveEntities
    );

  if (
    asksForLiveInformation ||
    (containsLiveEntity &&
      containsYear(text))
  ) {
    return Intent.LIVE_SEARCH;
  }

  if (
    text.includes("task")
  ) {
    return Intent.TASK_MANAGEMENT;
  }

  if (
    text.includes("note")
  ) {
    return Intent.NOTE_TAKING;
  }

  if (
    text.includes("calendar") ||
    text.includes("meeting")
  ) {
    return Intent.CALENDAR;
  }

  if (
    text.includes("pdf") ||
    text.includes("document")
  ) {
    return Intent.DOCUMENT;
  }

  if (
    text.includes("explain") ||
    text.includes("learn")
  ) {
    return Intent.LEARNING;
  }

  return Intent.GENERAL_CHAT;
}