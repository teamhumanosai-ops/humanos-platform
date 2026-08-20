import {
  clearRegisteredRequest,
  clearUciRequestRegistry,
  getRegisteredRequest,
  registerRequest,
} from "./uciRequestRegistry";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `UCI registry verification failed: ${message}`
    );
  }
}

async function runRegistryVerification(): Promise<void> {
  clearUciRequestRegistry();

  const first =
    Promise.resolve({
      requestId: "registry-001",
      protocolVersion: "uci-1",
      state: null as never,
    });

  registerRequest(
    "registry-001",
    "fingerprint-a",
    first
  );

  assert(
    getRegisteredRequest(
      "registry-001",
      "fingerprint-a"
    ) === first,
    "identical request fingerprints must reuse the registered promise"
  );

  let mismatchRejected =
    false;

  try {
    getRegisteredRequest(
      "registry-001",
      "fingerprint-b"
    );
  } catch {
    mismatchRejected = true;
  }

  assert(
    mismatchRejected,
    "requestId reuse with a different fingerprint must be rejected"
  );

  clearRegisteredRequest(
    "registry-001",
    "fingerprint-b"
  );

  assert(
    getRegisteredRequest(
      "registry-001",
      "fingerprint-a"
    ) === first,
    "a mismatched cleanup attempt must not remove a valid registration"
  );

  clearRegisteredRequest(
    "registry-001",
    "fingerprint-a"
  );

  assert(
    getRegisteredRequest(
      "registry-001",
      "fingerprint-a"
    ) === null,
    "matching cleanup must release the registration"
  );

  console.log(
    "UCI request registry verification passed."
  );
}

runRegistryVerification().catch(
  (error) => {
    throw error;
  }
);
