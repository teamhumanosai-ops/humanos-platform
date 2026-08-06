import { Knowledge } from "../../knowledge/models";

import { ArtifactMetadata } from "./ArtifactMetadata";

export interface Artifact {
    metadata: ArtifactMetadata;

    rawContent?: Buffer | string;

    extractedContent?: string;

    knowledge?: Knowledge;

    embeddingId?: string;

    tags: string[];

    attributes: Record<string, unknown>;
}