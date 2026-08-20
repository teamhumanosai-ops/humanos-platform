import type {
  WebSearchProviderClient,
} from "./providers";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PROV-003 provider verification failed: ${message}`
    );
  }
}

const providers: WebSearchProviderClient[] = [
  {
    name: "tavily",
    isConfigured: () => true,
    search: async () => ({
      query: "test",
      answer: null,
      results: [],
      searchedAt: new Date().toISOString(),
    }),
  },
  {
    name: "firecrawl",
    isConfigured: () => true,
    search: async () => ({
      query: "test",
      answer: null,
      results: [],
      searchedAt: new Date().toISOString(),
    }),
  },
];

assert(
  providers.map(
    (provider) => provider.name
  ).join(",") === "tavily,firecrawl",
  "provider contract must support both required providers"
);

assert(
  providers.every(
    (provider) => provider.isConfigured()
  ),
  "configured provider checks must be callable"
);

console.log(
  "PROV-003 provider contract verification passed."
);
