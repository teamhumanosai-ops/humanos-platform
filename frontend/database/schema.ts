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

    confidence: integer("confidence")
      .notNull(),

    source: text("source")
      .notNull(),

    createdAt: text("created_at")
      .notNull(),
  }
);

export const reflections = sqliteTable(
  "reflections",
  {
    id: integer("id")
      .primaryKey({ autoIncrement: true }),

    summary: text("summary")
      .notNull(),

    evidence: text("evidence")
      .notNull(),

    confidence: integer("confidence")
      .notNull(),

    createdAt: text("created_at")
      .notNull(),
  }
);