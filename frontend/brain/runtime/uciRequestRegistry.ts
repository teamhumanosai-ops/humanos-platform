import type {
  CognitiveResponse,
} from "./uci";

const MAX_ENTRIES =
  256;

type RequestEntry = {
  fingerprint: string;
  promise: Promise<CognitiveResponse>;
};

const entries =
  new Map<string, RequestEntry>();

function trimRegistry(): void {
  while (
    entries.size >
    MAX_ENTRIES
  ) {
    const oldest =
      entries.keys().next().value;

    if (
      typeof oldest !==
      "string"
    ) {
      return;
    }

    entries.delete(
      oldest
    );
  }
}

export function getRegisteredRequest(
  requestId: string,
  fingerprint: string
): Promise<CognitiveResponse> | null {
  const entry =
    entries.get(requestId);

  if (!entry) {
    return null;
  }

  if (
    entry.fingerprint !==
    fingerprint
  ) {
    throw new Error(
      `UCI requestId "${requestId}" was reused with a different request payload.`
    );
  }

  return entry.promise;
}

export function registerRequest(
  requestId: string,
  fingerprint: string,
  promise: Promise<CognitiveResponse>
): void {
  entries.delete(
    requestId
  );

  entries.set(
    requestId,
    {
      fingerprint,
      promise,
    }
  );

  trimRegistry();
}

export function clearRegisteredRequest(
  requestId: string,
  fingerprint: string
): void {
  const entry =
    entries.get(requestId);

  if (
    entry?.fingerprint ===
    fingerprint
  ) {
    entries.delete(
      requestId
    );
  }
}

export function clearUciRequestRegistry(): void {
  entries.clear();
}
