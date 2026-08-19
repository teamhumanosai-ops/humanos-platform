import {
  scrapeFirecrawl,
} from "./firecrawl";

export type WebContentResponse = {
  url: string;

  title: string;

  text: string;

  status: number;

  contentType: string;

  fetchedAt: string;
};

const MAX_CONTENT_LENGTH =
  20000;

function assertSafeUrl(
  value: string
): URL {
  let url: URL;

  try {
    url = new URL(
      value.trim()
    );
  } catch {
    throw new Error(
      "Web content URL is invalid."
    );
  }

  if (
    url.protocol !== "http:" &&
    url.protocol !== "https:"
  ) {
    throw new Error(
      "Web content URL must use HTTP or HTTPS."
    );
  }

  if (
    url.username ||
    url.password
  ) {
    throw new Error(
      "Web content URLs cannot contain embedded credentials."
    );
  }

  const hostname =
    url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    throw new Error(
      "Web content requests cannot target local hosts."
    );
  }

  if (
    isPrivateIpv4(
      hostname
    )
  ) {
    throw new Error(
      "Web content requests cannot target private IPv4 addresses."
    );
  }

  return url;
}

function isPrivateIpv4(
  hostname: string
): boolean {
  const octets =
    hostname.split(".");

  if (
    octets.length !== 4 ||
    octets.some(
      (octet) =>
        !/^\d+$/.test(
          octet
        )
    )
  ) {
    return false;
  }

  const values =
    octets.map(
      (octet) =>
        Number(octet)
    );

  if (
    values.some(
      (value) =>
        value < 0 ||
        value > 255
    )
  ) {
    return true;
  }

  const [
    first,
    second,
  ] = values;

  return (
    first === 10 ||
    first === 127 ||
    (
      first === 172 &&
      second >= 16 &&
      second <= 31
    ) ||
    (
      first === 192 &&
      second === 168
    ) ||
    (
      first === 169 &&
      second === 254
    )
  );
}

function extractTitle(
  html: string
): string {
  const match =
    html.match(
      /<title[^>]*>([\s\S]*?)<\/title>/i
    );

  if (!match?.[1]) {
    return "Untitled source";
  }

  return decodeHtmlEntities(
    stripTags(
      match[1]
    )
  ).trim() ||
    "Untitled source";
}

function stripTags(
  value: string
): string {
  return value
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<noscript[\s\S]*?<\/noscript>/gi,
      " "
    )
    .replace(
      /<[^>]+>/g,
      " "
    );
}

function decodeHtmlEntities(
  value: string
): string {
  return value
    .replace(
      /&nbsp;/gi,
      " "
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&lt;/gi,
      "<"
    )
    .replace(
      /&gt;/gi,
      ">"
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    );
}

function normalizeText(
  html: string
): string {
  return decodeHtmlEntities(
    stripTags(
      html
    )
  )
    .replace(
      /[\t\r]+/g,
      " "
    )
    .replace(
      /\n\s*\n\s*\n+/g,
      "\n\n"
    )
    .replace(
      /[ ]{2,}/g,
      " "
    )
    .trim()
    .slice(
      0,
      MAX_CONTENT_LENGTH
    );
}

export async function fetchWebContent(
  value: string
): Promise<WebContentResponse> {
  const url =
    assertSafeUrl(
      value
    );

  const fetchedAt =
    new Date().toISOString();

  const response =
    await fetch(
      url,
      {
        method: "GET",
        redirect: "manual",
        headers: {
          Accept:
            "text/html,text/plain;q=0.9,*/*;q=0.1",
        },
      }
    );

  if (
    response.status >= 300 &&
    response.status < 400
  ) {
    throw new Error(
      `Web content fetch returned a redirect (${response.status}); redirects are disabled for safety.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Web content fetch failed (${response.status}).`
    );
  }

  const contentType =
    response.headers
      .get("content-type") ??
    "";

  const body =
    await response.text();

  const isHtml =
    contentType
      .toLowerCase()
      .includes("text/html") ||
    /<html[\s>]/i.test(
      body
    );

  const title =
    isHtml
      ? extractTitle(body)
      : url.hostname;

  const text =
    isHtml
      ? normalizeText(body)
      : body
          .trim()
          .slice(
            0,
            MAX_CONTENT_LENGTH
          );

  if (!text) {
    throw new Error(
      "Web content fetch returned no readable content."
    );
  }

  return {
    url:
      url.toString(),

    title,

    text,

    status:
      response.status,

    contentType,

    fetchedAt,
  };
}

/**
 * Production web-content execution path.
 *
 * URL validation remains local and deterministic, while the actual
 * remote content retrieval is delegated to the required Firecrawl
 * provider boundary.
 */
export async function fetchWebContentViaFirecrawl(
  value: string
): Promise<WebContentResponse> {
  const url =
    assertSafeUrl(
      value
    );

  const result =
    await scrapeFirecrawl(
      url.toString()
    );

  const text =
    result.markdown
      .trim()
      .slice(
        0,
        MAX_CONTENT_LENGTH
      );

  if (!text) {
    throw new Error(
      "Firecrawl web content execution returned no readable content."
    );
  }

  return {
    url:
      result.url,

    title:
      result.title,

    text,

    status:
      result.status,

    contentType:
      result.contentType,

    fetchedAt:
      result.fetchedAt,
  };
}
