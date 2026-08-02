import { loadTimelineEvents } from "./store";
import type { TimelineEvent } from "./types";

export async function getTimeline(): Promise<TimelineEvent[]> {
  return await loadTimelineEvents();
}

export async function getRecentTimelineEvents(
  limit = 10
): Promise<TimelineEvent[]> {
  const events = await loadTimelineEvents();

  return events.slice(0, limit);
}