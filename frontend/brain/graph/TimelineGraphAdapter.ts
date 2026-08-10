import {
  graphBuilder,
} from "./GraphBuilder";

import type {
  TimelineEvent,
} from "../timeline/types";

export class TimelineGraphAdapter {
  sync(
    event: TimelineEvent
  ): void {
    const timelineId =
      buildGraphId(event);

    graphBuilder.addTimelineEvent(
      timelineId,
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

    /*
    |--------------------------------------------------------------------------
    | Connect the Timeline event to its category.
    |--------------------------------------------------------------------------
    |
    | Categories are represented as entity nodes so the
    | existing GraphNode model can represent them without
    | introducing another node type.
    |
    */

    const categoryId =
      `entity:timeline-category:${event.category
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

    graphBuilder.addEntity(
      categoryId,
      event.category,
      {
        source:
          "timeline",

        category:
          event.category,
      }
    );

    graphBuilder.connect(
      timelineId,
      categoryId,
      "belongs_to",
      event.confidence,
      {
        source:
          "timeline",

        relationship:
          "category",
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