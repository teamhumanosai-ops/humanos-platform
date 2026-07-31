import { addNote, getNotes, Note } from "./index";

function createId() {
  return crypto.randomUUID();
}

export async function noteSkill(
  message: string
): Promise<string | null> {
  const lower = message.toLowerCase();

  // Save note
  if (lower.startsWith("save note:")) {
    const content = message.substring(10).trim();

    const note: Note = {
      id: createId(),
      title: "Untitled",
      content,
      createdAt: new Date().toISOString(),
    };

    await addNote(note);

    return "✅ Note saved successfully.";
  }

  // Show notes
  if (
    lower === "show notes" ||
    lower === "list notes"
  ) {
    const notes = await getNotes();

    if (notes.length === 0) {
      return "You don't have any notes yet.";
    }

    return notes
      .map(
        (n, i) =>
          `${i + 1}. ${n.title}\n${n.content}`
      )
      .join("\n\n");
  }

  return null;
}