import type {
  SearchResponse,
} from "./search";

export type WebSearchProvider =
  | "tavily"
  | "firecrawl";

export const REQUIRED_WEB_SEARCH_PROVIDERS: readonly WebSearchProvider[] = [
  "tavily",
  "firecrawl",
];

export type WebSearchProviderClient = {
  name:
    WebSearchProvider;

  isConfigured():
    boolean;

  search(
    query: string
  ): Promise<SearchResponse>;
};
