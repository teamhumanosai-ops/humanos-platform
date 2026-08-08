export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
};

export type SearchResponse = {
  query: string;
  answer: string | null;
  results: SearchResult[];
  searchedAt: string;
};

type TavilySearchResponse = {
  query?: string;

  answer?: string | null;

  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    published_date?: string;
  }>;
};

const TAVILY_ENDPOINT =
  "https://api.tavily.com/search";

function isNewsOrCurrentQuery(
  query: string
): boolean {
  const text =
    query.toLowerCase();

  return [
    "news",
    "latest",
    "today",
    "current",
    "breaking",
    "update",
    "updates",
    "who won",
    "winner",
    "champion",
    "result",
    "results",
    "score",
    "scores",
    "standings",
    "fifa",
    "world cup",
    "ipl",
    "cricket",
    "nba",
    "nfl",
    "nhl",
    "premier league",
    "formula 1",
    "f1",
  ].some(
    (term) =>
      text.includes(term)
  );
}

function buildSearchQuery(
  query: string
): string {
  const year =
    new Date()
      .getFullYear()
      .toString();

  if (
    /\b20\d{2}\b/.test(query)
  ) {
    return query.trim();
  }

  return `${query.trim()} ${year}`;
}

export async function searchWeb(
  query: string
): Promise<SearchResponse> {
  const apiKey =
    process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is not configured."
    );
  }

  const searchedAt =
    new Date().toISOString();

  const searchQuery =
    buildSearchQuery(query);

  const response =
    await fetch(
      TAVILY_ENDPOINT,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          query: searchQuery,

          search_depth:
            "advanced",

          topic:
            isNewsOrCurrentQuery(
              query
            )
              ? "news"
              : "general",

          max_results: 6,

          chunks_per_source: 2,

          include_answer:
            "advanced",

          include_raw_content:
            false,
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

  const results =
    (data.results ?? [])
      .map(
        (result) => ({
          title:
            result.title?.trim() ??
            "Untitled source",

          url:
            result.url?.trim() ??
            "",

          snippet:
            result.content?.trim() ??
            "",

          publishedDate:
            result.published_date?.trim(),
        })
      )
      .filter(
        (result) =>
          result.url.length > 0 &&
          result.snippet.length > 0
      );

  return {
    query:
      data.query?.trim() ??
      searchQuery,

    answer:
      data.answer?.trim() ??
      null,

    results,

    searchedAt,
  };
}