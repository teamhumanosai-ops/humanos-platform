import {
  runtimeServices,
} from "./runtimeServices";

describe(
  "runtime service boundary",
  () => {
    it(
      "freezes the canonical provider service registry",
      () => {
        expect(
          Object.isFrozen(
            runtimeServices
          )
        ).toBe(true);
      }
    );

    it(
      "preserves every required provider boundary",
      () => {
        expect(
          typeof runtimeServices.aiService
        ).toBe("function");

        expect(
          typeof runtimeServices.searchWeb
        ).toBe("function");

        expect(
          typeof runtimeServices.fetchWebContent
        ).toBe("function");

        expect(
          typeof runtimeServices.fetchWebContentViaFirecrawl
        ).toBe("function");

        expect(
          typeof runtimeServices.scrapeFirecrawl
        ).toBe("function");
      }
    );
  }
);
