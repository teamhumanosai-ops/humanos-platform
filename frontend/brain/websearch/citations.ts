export type CitationSource = {
  index: number;
  title: string;
  url: string;
  domain: string;
  publishedDate?: string;
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

export function buildCitationSources(
  results: Array<{
    title: string;
    url: string;
    publishedDate?: string;
  }>
): CitationSource[] {
  return results.map(
    (result, index) => ({
      index: index + 1,
      title: result.title,
      url: result.url,
      domain:
        extractDomain(result.url),
      publishedDate:
        result.publishedDate,
    })
  );
}