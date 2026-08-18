import type {
  SearchResponse,
} from "./search";

type FirecrawlWebResult = {
  title?: string;

  description?: string;

  url?: string;

  markdown?: string;

  metadata?: {
    title?: string;

    description?: string;

    sourceURL?: string;

    url?: string;
  };
};

type FirecrawlNewsResult = {
  title?: string;

  snippet?: string;

  url?: string;

  date?: string;

  markdown?: string;

  metadata?: {
    title?: string;

    description?: string;

    sourceURL?: string;

    url?: string;
  };
};

type FirecrawlSearchResponse = {
  success?: boolean;

  data?: {
    web?: FirecrawlWebResult[];

    news?: FirecrawlNewsResult[];
  };

  warning?: string;

  error?: string;
};

const FIRECRAWL_ENDPOINT =
  "https://api.firecrawl.dev/v2/search";

function getWebUrl(
  item: FirecrawlWebResult
): string {
  return (
    item.url?.trim() ??
    item.metadata?.url?.trim() ??
    item.metadata?.sourceURL?.trim() ??
    ""
  );
}

function getNewsUrl(
  item: FirecrawlNewsResult
): string {
  return (
    item.url?.trim() ??
    item.metadata?.url?.trim() ??
    item.metadata?.sourceURL?.trim() ??
    ""
  );
}

function getWebTitle(
  item: FirecrawlWebResult
): string {
  return (
    item.title?.trim() ??
    item.metadata?.title?.trim() ??
    "Untitled source"
  );
}

function getNewsTitle(
  item: FirecrawlNewsResult
): string {
  return (
    item.title?.trim() ??
    item.metadata?.title?.trim() ??
    "Untitled source"
  );
}

function getWebSnippet(
  item: FirecrawlWebResult
): string {
  return (
    item.description?.trim() ??
    item.markdown?.trim() ??
    item.metadata?.description?.trim() ??
    ""
  );
}

function getNewsSnippet(
  item: FirecrawlNewsResult
): string {
  return (
    item.snippet?.trim() ??
    item.markdown?.trim() ??
    item.metadata?.description?.trim() ??
    ""
  );
}

function deduplicateResults(
  results:
    SearchResponse["results"]
): SearchResponse["results"] {
  const seen =
    new Set<string>();

  return results.filter(
    (result) => {
      const normalizedUrl =
        result.url
          .trim()
          .toLowerCase();

      if (
        !normalizedUrl ||
        seen.has(
          normalizedUrl
        )
      ) {
        return false;
      }

      seen.add(
        normalizedUrl
      );

      return true;
    }
  );
}

export function isFirecrawlConfigured():
  boolean {
  return Boolean(
    process.env.FIRECRAWL_API_KEY
  );
}

export async function searchFirecrawl(
  query: string
): Promise<SearchResponse> {
  const apiKey =
    process.env.FIRECRAWL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FIRECRAWL_API_KEY is not configured. Firecrawl is required for Human OS multi-provider web intelligence."
    );
  }

  const searchedAt =
    new Date().toISOString();

  const response =
    await fetch(
      FIRECRAWL_ENDPOINT,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          query:
            query.trim(),

          limit:
            6,

          sources: [
            "web",
            "news",
          ],
        }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Firecrawl web search failed (${response.status}): ${errorText}`
    );
  }

  const data =
    (await response.json()) as FirecrawlSearchResponse;

  if (
    data.success === false
  ) {
    throw new Error(
      data.error ??
        "Firecrawl web search failed."
    );
  }

  const webResults =
    (data.data?.web ?? [])
      .map(
        (result) => ({
          title:
            getWebTitle(
              result
            ),

          url:
            getWebUrl(
              result
            ),

          snippet:
            getWebSnippet(
              result
            ),
        })
      );

  const newsResults =
    (data.data?.news ?? [])
      .map(
        (result) => ({
          title:
            getNewsTitle(
              result
            ),

          url:
            getNewsUrl(
              result
            ),

          snippet:
            getNewsSnippet(
              result
            ),

          publishedDate:
            result.date?.trim(),
        })
      );

  const results =
    deduplicateResults(
      [
        ...webResults,
        ...newsResults,
      ].filter(
        (result) =>
          result.url.length > 0 &&
          result.snippet.length > 0
      )
    );

  return {
    query:
      query.trim(),

    answer:
      null,

    results,

    searchedAt,
  };
}