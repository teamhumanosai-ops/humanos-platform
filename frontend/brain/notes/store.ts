import { Note } from "./types";
import { loadNotes, saveNotes } from "./fileStore";

let NOTES: Note[] = [];

let initialized = false;

async function ensureLoaded() {
  if (initialized) {
    return;
  }

  NOTES = await loadNotes();
  initialized = true;
}

export async function getNotes(): Promise<Note[]> {
  await ensureLoaded();
  return NOTES;
}

export async function addNote(note: Note) {
  await ensureLoaded();

  NOTES.push(note);

  await saveNotes(NOTES);
}

export async function deleteNote(id: string) {
  await ensureLoaded();

  NOTES = NOTES.filter((n) => n.id !== id);

  await saveNotes(NOTES);
}