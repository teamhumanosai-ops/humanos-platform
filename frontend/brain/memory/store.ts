import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { memories } from "@/database/schema";

import { memoryGraphAdapter } from "@/brain/graph";

import type { Memory } from "./types";
import { analyzeMemory } from "./intelligence";

export async function saveMemory(
  key: string,
  value: string,
  confidence = 1
): Promise<void> {
  const analysis = analyzeMemory(key, value);

  const existing = await db
    .select()
    .from(memories)
    .where(eq(memories.key, key));

  if (existing.length > 0) {
    await db
      .update(memories)
      .set({
        value,
        confidence,
        kind: analysis.kind,
        importance: analysis.importance,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(memories.key, key));

    memoryGraphAdapter.sync({
      id: key,
      label: value,
      properties: {
        confidence,
        kind: analysis.kind,
        importance: analysis.importance,
        updatedAt: new Date().toISOString(),
      },
    });

    return;
  }

  await db.insert(memories).values({
    key,
    value,
    confidence,
    kind: analysis.kind,
    importance: analysis.importance,
    updatedAt: new Date().toISOString(),
  });

  memoryGraphAdapter.sync({
    id: key,
    label: value,
    properties: {
      confidence,
      kind: analysis.kind,
      importance: analysis.importance,
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function loadMemories(): Promise<Memory[]> {
  const rows = await db.select().from(memories);

  return rows.map((row) => ({
    key: row.key,
    value: row.value,
    confidence: row.confidence,
    kind: row.kind as Memory["kind"],
    importance: row.importance,
    updatedAt: row.updatedAt,
  }));
}

/**
 * Compatibility wrapper for the legacy API.
 */
export async function getMemories(): Promise<Memory[]> {
  return loadMemories();
}

/**
 * Compatibility wrapper for the legacy API.
 */
export async function getMemory(
  key: string
): Promise<Memory | undefined> {
  const list = await loadMemories();

  return list.find((memory) => memory.key === key);
}

/**
 * Compatibility wrapper for the legacy API.
 */
export async function remember(
  key: string,
  value: string,
  confidence = 1
): Promise<void> {
  await saveMemory(
    key,
    value,
    confidence
  );
}