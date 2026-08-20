import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

const sqlite = new Database("humanos.db");

/**
 * The runtime database is created directly by better-sqlite3 rather than by a
 * migration runner. Bootstrap the canonical schema idempotently before the
 * Drizzle instance is used so a fresh checkout cannot fail on its first
 * BrainState/profile read.
 */
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'short_term',
    importance INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    timestamp TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    summary TEXT NOT NULL,
    evidence TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    goal TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    milestones TEXT NOT NULL,
    completed_milestones TEXT NOT NULL,
    next_action TEXT NOT NULL,
    priority INTEGER NOT NULL,
    confidence INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export const db = drizzle(sqlite, {
  schema,
});
