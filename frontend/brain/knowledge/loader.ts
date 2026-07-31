import fs from "fs/promises";
import path from "path";

export async function loadDocument(
  filename: string
): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "documents",
    filename
  );

  return await fs.readFile(filePath, "utf8");
}