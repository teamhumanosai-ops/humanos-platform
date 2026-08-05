import { Artifact } from "../models";

export interface ProcessingContext {
    artifact: Artifact;

    startedAt: Date;

    metadata: Record<string, unknown>;
}