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

    updatedAt: text(
      "updated_at"
    ).notNull(),
  }
);