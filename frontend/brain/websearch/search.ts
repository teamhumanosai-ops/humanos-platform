export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

type TavilySearchResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
  }>;
};

const TAVILY_ENDPOINT =
  "https://api.tavily.com/search";

export async function searchWeb(
  query: string
): Promise<SearchResult[]> {
  const apiKey =
    process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is not configured."
    );
  }

  const response = await fetch(
    TAVILY_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        topic: "general",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Web search failed (${response.status}): ${errorText}`
    );
  }

  const data =
    (await response.json()) as TavilySearchResponse;

  return (
    data.results
      ?.map((result) => ({
        title:
          result.title?.trim() ??
          "Untitled result",

        url:
          result.url?.trim() ?? "",

        snippet:
          result.content?.trim() ?? "",
      }))
      .filter(
        (result) =>
          result.title.length > 0 &&
          result.url.length > 0
      ) ?? []
  );
}