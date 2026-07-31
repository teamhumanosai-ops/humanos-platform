import { Intent } from "./types";

export function detectIntent(
  message: string
): Intent {

  const text = message.toLowerCase();

  if (
    text.includes("plan my startup") ||
    text.includes("startup")
  ) {
    return Intent.STARTUP_PLANNING;
  }

  if (
    text.includes("today") ||
    text.includes("latest") ||
    text.includes("news") ||
    text.includes("current")
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