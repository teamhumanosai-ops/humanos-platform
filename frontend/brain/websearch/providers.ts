import type {
  SearchResponse,
} from "./search";

export type WebSearchProvider =
  | "tavily"
  | "firecrawl";

export type WebSearchProviderClient = {
  name:
    WebSearchProvider;

  isConfigured():
    boolean;

  search(
    query: string
  ): Promise<SearchResponse>;
};