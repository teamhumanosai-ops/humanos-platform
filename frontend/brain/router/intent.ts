export enum Intent {
  CHAT = "chat",

  MEMORY = "memory",

  TASK = "task",

  CALENDAR = "calendar",

  NOTE = "note",

  SETTINGS = "settings",

  UNKNOWN = "unknown",
}

export function detectIntent(message: string): Intent {
  const text = message.toLowerCase();

  // Memory

  if (
    text.includes("remember") ||
    text.includes("my name") ||
    text.includes("i live") ||
    text.includes("my favorite") ||
    text.includes("my favourite") ||
    text.includes("birthday")
  ) {
    return Intent.MEMORY;
  }

  // Calendar

  if (
    text.includes("meeting") ||
    text.includes("calendar") ||
    text.includes("schedule") ||
    text.includes("appointment") ||
    text.includes("tomorrow") ||
    text.includes("next week")
  ) {
    return Intent.CALENDAR;
  }

  // Tasks

  if (
    text.includes("task") ||
    text.includes("todo") ||
    text.includes("buy") ||
    text.includes("remind") ||
    text.includes("finish")
  ) {
    return Intent.TASK;
  }

  // Notes

  if (
    text.includes("note") ||
    text.includes("write this down") ||
    text.includes("save this")
  ) {
    return Intent.NOTE;
  }

  // Settings

  if (
    text.includes("theme") ||
    text.includes("settings")
  ) {
    return Intent.SETTINGS;
  }

  return Intent.CHAT;
}