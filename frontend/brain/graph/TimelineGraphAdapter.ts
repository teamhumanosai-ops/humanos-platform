import { graphBuilder } from "./GraphBuilder";

import type {
  TimelineEvent,
} from "../timeline/types";

export class TimelineGraphAdapter {
  sync(
    event: TimelineEvent
  ): void {
    const id =
      buildGraphId(event);

    graphBuilder.addTimelineEvent(
      id,
      event.title,
      {
        timestamp:
          event.timestamp,

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

        timelineId:
          event.id,
      }
    );
  }
}

function buildGraphId(
  event: TimelineEvent
): string {
  if (
    event.id !== undefined
  ) {
    return `timeline:${event.id}`;
  }

  return [
    "timeline",
    event.createdAt,
    event.timestamp,
    event.category,
    event.title,
  ]
    .join(":")
    .replace(
      /\s+/g,
      "_"
    );
}

export const timelineGraphAdapter =
  new TimelineGraphAdapter();