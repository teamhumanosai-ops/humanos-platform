import {
  addNote,
  getNotes,
} from "./store";

import type {
  Note,
} from "./types";

function createId(): string {
  return crypto.randomUUID();
}

export async function noteSkill(
  message: string
): Promise<string | null> {
  const lower =
    message
      .trim()
      .toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | Save Note
  |--------------------------------------------------------------------------
  */

  if (
    lower.startsWith(
      "save note:"
    )
  ) {
    const content =
      message
        .trim()
        .slice(
          "save note:".length
        )
        .trim();

    if (!content) {
      return "Please provide the note content after 'Save note:'.";
    }

    const note: Note = {
      id: createId(),

      title:
        "Untitled",

      content,

      createdAt:
        new Date().toISOString(),
    };

    await addNote(
      note
    );

    return "✅ Note saved successfully.";
  }

  /*
  |--------------------------------------------------------------------------
  | Show Notes
  |--------------------------------------------------------------------------
  */

  if (
    lower ===
      "show notes" ||
    lower ===
      "list notes"
  ) {
    const notes =
      await getNotes();

    if (
      notes.length ===
      0
    ) {
      return "You don't have any notes yet.";
    }

    return notes
      .map(
        (
          note,
          index
        ) =>
          `${index + 1}. ${note.title}\n${note.content}`
      )
      .join(
        "\n\n"
      );
  }

  return null;
}