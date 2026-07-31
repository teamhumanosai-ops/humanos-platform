export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export async function searchWeb(
  query: string
): Promise<SearchResult[]> {
  console.log("Searching web for:", query);

  // Placeholder.
  // Next milestone will connect this to a real search provider.

  return [];
}