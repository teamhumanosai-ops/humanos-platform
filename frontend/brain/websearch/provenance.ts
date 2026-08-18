import type {
  WebSearchProvider,
} from "./providers";

import type {
  SearchResult,
} from "./search";

export type SearchProvenance = {
  requiredProviders: WebSearchProvider[];

  observedProviders: WebSearchProvider[];

  resultCount: number;

  dualProviderResultCount: number;

  dualProviderCoverage: number;
};

const REQUIRED_PROVIDERS: WebSearchProvider[] = [
  "tavily",
  "firecrawl",
];

export function buildSearchProvenance(
  results: SearchResult[]
): SearchProvenance {
  const observedProviders = [
    ...new Set(
      results.flatMap(
        (result) =>
          result.providers ?? []
      )
    ),
  ];

  const dualProviderResultCount =
    results.filter(
      (result) =>
        new Set(
          result.providers ?? []
        ).size >= 2
    ).length;

  return {
    requiredProviders: [
      ...REQUIRED_PROVIDERS,
    ],

    observedProviders,

    resultCount:
      results.length,

    dualProviderResultCount,

    dualProviderCoverage:
      results.length > 0
        ? dualProviderResultCount /
          results.length
        : 0,
  };
}
