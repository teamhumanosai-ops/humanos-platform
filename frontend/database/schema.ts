import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";

export const memories = sqliteTable(
  "memories",
  {
    key: text("key").primaryKey(),

    value: text("value").notNull(),

    confidence: integer(
      "confidence"
    ).notNull(),

    kind: text("kind")
      .notNull()
      .default("short_term"),

    importance: integer(
      "importance"
    )
      .notNull()
      .default(0),

    updatedAt: text(
      "updated_at"
    ).notNull(),
  }
);

export const timelineEvents = sqliteTable(
  "timeline_events",
  {
    id: integer("id")
      .primaryKey({ autoIncrement: true }),

    timestamp: text("timestamp")
      .notNull(),

    title: text("title")
      .notNull(),

    description: text("description")
      .notNull(),

    category: text("category")
      .notNull(),

    confidence: integer(
      "confidence"
    ).notNull(),

    source: text("source")
      .notNull(),

    createdAt: text(
      "created_at"
    ).notNull(),
  }
);

export const reflections = sqliteTable(
  "reflections",
  {
    id: integer("id")
      .primaryKey({
        autoIncrement: true,
      }),

    summary: text(
      "summary"
    ).notNull(),

    evidence: text(
      "evidence"
    ).notNull(),

    confidence: integer(
      "confidence"
    ).notNull(),

    createdAt: text(
      "created_at"
    ).notNull(),
  }
);

export const plans = sqliteTable(
  "plans",
  {
    id: text("id")
      .primaryKey(),

    title: text("title")
      .notNull(),

    goal: text("goal")
      .notNull(),

    description: text(
      "description"
    ).notNull(),

    status: text("status")
      .notNull()
      .default("active"),

    milestones: text(
      "milestones"
    ).notNull(),

    completedMilestones:
      text(
        "completed_milestones"
      ).notNull(),

    nextAction: text(
      "next_action"
    ).notNull(),

    priority: integer(
      "priority"
    ).notNull(),

    confidence: integer(
      "confidence"
    ).notNull(),

    createdAt: text(
      "created_at"
    ).notNull(),

    updatedAt: text(
      "updated_at"
    ).notNull(),
  }
);

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id")
      .primaryKey(),

    data: text("data")
      .notNull(),

    createdAt: text(
      "created_at"
    ).notNull(),

    updatedAt: text(
      "updated_at"
    ).notNull(),
  }
);
