import { saveTimelineEvent } from "./store";
import type {
  TimelineCategory,
  TimelineEvent,
} from "./types";

function createEvent(
  title: string,
  description: string,
  category: TimelineCategory,
  source: string
): TimelineEvent {
  const now = new Date().toISOString();

  return {
    timestamp: now,
    title,
    description,
    category,
    confidence: 1,
    source,
    createdAt: now,
  };
}

export async function extractTimelineEvent(
  message: string
): Promise<void> {
  const lower = message.toLowerCase();

  let event: TimelineEvent | null = null;

  if (
    lower.includes("started human os") ||
    lower.includes("started building human os")
  ) {
    event = createEvent(
      "Started Human OS",
      "User started building Human OS.",
      "Project",
      message
    );
  } else if (
    lower.includes("completed ms-") ||
    lower.includes("finished ms-")
  ) {
    event = createEvent(
      "Completed Milestone",
      message,
      "Achievement",
      message
    );
  } else if (
    lower.includes("launched")
  ) {
    event = createEvent(
      "Project Launch",
      message,
      "Startup",
      message
    );
  }

  if (event) {
    await saveTimelineEvent(event);
  }
}