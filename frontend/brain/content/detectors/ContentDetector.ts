import { ArtifactType } from "../models";

export class ContentDetector {
    static detect(): ArtifactType | null {
        /**
         * UCE-003
         *
         * Content-based detection (magic bytes / binary signatures)
         * will be implemented in a future milestone.
         */

        return null;
    }
}