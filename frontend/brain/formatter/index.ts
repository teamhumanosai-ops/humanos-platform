export function formatResponse(text: string): string {
  let output = text;

  // Remove markdown headings
  output = output.replace(/^#{1,6}\s+/gm, "");

  // Remove excessive blank lines
  output = output.replace(/\n{3,}/g, "\n\n");

  // Remove markdown bold
  output = output.replace(/\*\*(.*?)\*\*/g, "$1");

  // Remove markdown italics
  output = output.replace(/\*(.*?)\*/g, "$1");

  // Remove duplicated spaces
  output = output.replace(/[ ]{2,}/g, " ");

  // Trim
  output = output.trim();

  return output;
}