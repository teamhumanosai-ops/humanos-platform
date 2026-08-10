import { desc } from "drizzle-orm";

import { db } from "@/database/db";
import { timelineEvents } from "@/database/schema";

import {
  timelineGraphAdapter,
} from "../graph/TimelineGraphAdapter";

import type {
  TimelineCategory,
  TimelineEvent,
} from "./types";

export async function saveTimelineEvent(
  event: TimelineEvent
): Promise<void> {
  await db.insert(
    timelineEvents
  ).values({
    timestamp:
      event.timestamp,

    title:
      event.title,

    description:
      event.description,

    category:
      event.category,

    confidence:
      event.confidence,

    source:
      event.source,

    createdAt:
      event.createdAt,
  });

  /*
  |--------------------------------------------------------------------------
  | Synchronize the persisted Timeline event
  | with the Knowledge Graph.
  |--------------------------------------------------------------------------
  |
  | The database remains the Timeline persistence
  | source of truth. The graph is a cognitive
  | representation of the same event.
  |
  */

  timelineGraphAdapter.sync(
    event
  );
}

export async function loadTimelineEvents():
  Promise<TimelineEvent[]> {
  const events =
    await db
      .select()
      .from(
        timelineEvents
      )
      .orderBy(
        desc(
          timelineEvents.timestamp
        )
      );

  return events.map(
    (event) => ({
      ...event,

      category:
        event.category as TimelineCategory,
    })
  );
}