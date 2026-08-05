import { ArtifactMetadata } from "./ArtifactMetadata";

export interface Artifact {
  metadata: ArtifactMetadata;

  rawContent?: Buffer | string;

  extractedContent?: string;

  embeddingId?: string;

  tags: string[];

  attributes: Record<string, unknown>;
}