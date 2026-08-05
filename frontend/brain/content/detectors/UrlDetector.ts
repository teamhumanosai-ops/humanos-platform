import { ArtifactType } from "../models";

export class UrlDetector {
    static detect(input?: string): ArtifactType | null {
        if (!input) {
            return null;
        }

        try {
            const url = new URL(input);

            if (
                url.protocol === "http:" ||
                url.protocol === "https:"
            ) {
                return ArtifactType.URL;
            }

            return null;
        } catch {
            return null;
        }
    }
}