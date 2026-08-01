import fs from "fs/promises";
import path from "path";

const DOCUMENTS_DIR = path.join(
  process.cwd(),
  "data",
  "documents"
);

export async function loadDocument(
  filename: string
): Promise<string> {
  const filePath = path.join(
    DOCUMENTS_DIR,
    filename
  );

  return fs.readFile(filePath, "utf8");
}

export async function listDocuments(): Promise<string[]> {
  const files = await fs.readdir(DOCUMENTS_DIR);

  return files.filter((file) =>
    file.toLowerCase().endsWith(".txt")
  );
}