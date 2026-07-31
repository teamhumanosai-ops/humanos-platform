import { promises as fs } from "node:fs";
import path from "node:path";

import { Note } from "./types";

const FILE_PATH = path.join(
  process.cwd(),
  "data",
  "notes.json"
);

export async function loadNotes(): Promise<Note[]> {
  try {
    const content = await fs.readFile(FILE_PATH, "utf8");

    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function saveNotes(
  notes: Note[]
): Promise<void> {
  await fs.writeFile(
    FILE_PATH,
    JSON.stringify(notes, null, 2),
    "utf8"
  );
}