import type {
  WebSearchProvider,
} from "./providers";

export type CitationSource = {
  index: number;

  title: string;

  url: string;

  domain: string;

  publishedDate?: string;

  providers?: WebSearchProvider[];

  providerCount: number;

  dualSourced: boolean;
};

function extractDomain(
  url: string
): string {
  try {
    return new URL(url)
      .hostname
      .replace(/^www\./, "");
  } catch {
    return url;
  }
}

function normalizeProviders(
  providers?: WebSearchProvider[]
): WebSearchProvider[] {
  return [
    ...new Set(
      providers ?? []
    ),
  ];
}

export function buildCitationSources(
  results: Array<{
    title: string;
    url: string;
    publishedDate?: string;
    providers?: WebSearchProvider[];
  }>
): CitationSource[] {
  return results.map(
    (result, index) => {
      const providers =
        normalizeProviders(
          result.providers
        );

      return {
        index:
          index + 1,

        title:
          result.title,

        url:
          result.url,

        domain:
          extractDomain(
            result.url
          ),

        publishedDate:
          result.publishedDate,

        providers:
          providers.length > 0
            ? providers
            : undefined,

        providerCount:
          providers.length,

        dualSourced:
          providers.length >= 2,
      };
    }
  );
}
