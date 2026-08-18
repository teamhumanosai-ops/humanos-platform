import {
  searchFirecrawl,
} from "./firecrawl";

import type {
  WebSearchProvider,
  WebSearchProviderClient,
} from "./providers";

export type SearchResult = {
  title: string;

  url: string;

  snippet: string;

  publishedDate?: string;

  providers?: WebSearchProvider[];
};

export type SearchResponse = {
  query: string;

  answer:
    string | null;

  results:
    SearchResult[];

  searchedAt: string;
};

type TavilySearchResponse = {
  query?: string;

  answer?:
    string | null;

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
    /\b20\d{2}\b/.test(
      query
    )
  ) {
    return query.trim();
  }

  return `${query.trim()} ${year}`;
}

function isTavilyConfigured():
  boolean {
  return Boolean(
    process.env.TAVILY_API_KEY
  );
}

async function searchTavily(
  query: string
): Promise<SearchResponse> {
  const apiKey =
    process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is not configured. Tavily is required for Human OS multi-provider web intelligence."
    );
  }

  const searchedAt =
    new Date().toISOString();

  const searchQuery =
    buildSearchQuery(
      query
    );

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
          query:
            searchQuery,

          search_depth:
            "advanced",

          topic:
            isNewsOrCurrentQuery(
              query
            )
              ? "news"
              : "general",

          max_results:
            6,

          chunks_per_source:
            2,

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
      `Tavily web search failed (${response.status}): ${errorText}`
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

          providers: [
            "tavily",
          ] as WebSearchProvider[],
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

const tavilyProvider:
  WebSearchProviderClient = {
    name:
      "tavily",

    isConfigured:
      isTavilyConfigured,

    search:
      searchTavily,
  };

const firecrawlProvider:
  WebSearchProviderClient = {
    name:
      "firecrawl",

    isConfigured:
      () =>
        Boolean(
          process.env.FIRECRAWL_API_KEY
        ),

    search:
      searchFirecrawl,
  };

function getRequiredProviders():
  WebSearchProviderClient[] {
  return [
    tavilyProvider,
    firecrawlProvider,
  ];
}

function mergeSearchResults(
  results: SearchResult[]
): SearchResult[] {
  const merged =
    new Map<
      string,
      SearchResult
    >();

  for (
    const result of results
  ) {
    const key =
      result.url
        .trim()
        .toLowerCase();

    if (!key) {
      continue;
    }

    const existing =
      merged.get(key);

    if (!existing) {
      merged.set(
        key,
        {
          ...result,
          providers: [
            ...(result.providers ?? []),
          ],
        }
      );
      continue;
    }

    const providers = [
      ...(existing.providers ?? []),
      ...(result.providers ?? []),
    ];

    existing.providers = [
      ...new Set(providers),
    ];

    if (
      !existing.publishedDate &&
      result.publishedDate
    ) {
      existing.publishedDate =
        result.publishedDate;
    }

    if (
      existing.snippet.length === 0 &&
      result.snippet.length > 0
    ) {
      existing.snippet =
        result.snippet;
    }
  }

  return [
    ...merged.values(),
  ];
}

export async function searchWeb(
  query: string
): Promise<SearchResponse> {
  const normalizedQuery =
    query.trim();

  if (
    !normalizedQuery
  ) {
    throw new Error(
      "Web search query cannot be empty."
    );
  }

  const providers =
    getRequiredProviders();

  const unconfigured =
    providers.filter(
      (provider) =>
        !provider.isConfigured()
    );

  if (
    unconfigured.length > 0
  ) {
    throw new Error(
      `Required web search providers are not configured: ${unconfigured
        .map(
          (provider) =>
            provider.name
        )
        .join(", ")}. Human OS requires both Tavily and Firecrawl.`
    );
  }

  const providerResults =
    await Promise.all(
      providers.map(
        async (
          provider
        ) => {
          try {
            return await provider.search(
              normalizedQuery
            );
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : String(error);

            throw new Error(
              `${provider.name} web search failed: ${message}`
            );
          }
        }
      )
    );

  const results =
    mergeSearchResults(
      providerResults.flatMap(
        (response) =>
          response.results
      )
    );

  const answers =
    providerResults
      .map(
        (response) =>
          response.answer?.trim()
      )
      .filter(
        (
          answer
        ): answer is string =>
          Boolean(answer)
      );

  const searchedAt =
    new Date().toISOString();

  return {
    query:
      normalizedQuery,

    answer:
      answers.length > 0
        ? answers.join(
            "\n\n"
          )
        : null,

    results,

    searchedAt,
  };
}
