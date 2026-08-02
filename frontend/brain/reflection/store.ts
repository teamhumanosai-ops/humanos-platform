import { and, desc, eq } from "drizzle-orm";

import { db } from "@/database/db";
import { reflections } from "@/database/schema";

import type { Reflection } from "./types";

export async function saveReflection(
  reflection: Reflection
): Promise<void> {
  const existing = await db
    .select()
    .from(reflections)
    .where(
      and(
        eq(reflections.summary, reflection.summary),
        eq(reflections.evidence, reflection.evidence)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  await db.insert(reflections).values({
    summary: reflection.summary,
    evidence: reflection.evidence,
    confidence: reflection.confidence,
    createdAt: reflection.createdAt,
  });
}

export async function loadReflections(): Promise<Reflection[]> {
  return db
    .select()
    .from(reflections)
    .orderBy(desc(reflections.createdAt));
}