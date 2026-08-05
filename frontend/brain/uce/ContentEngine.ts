import {
    Artifact,
    ArtifactMetadata,
} from "../content/models";

import { ArtifactDetector } from "../content/detectors";

import {
    ProcessingContext,
    ProcessingPipeline,
} from "../content/pipeline";

import { ProcessingResult } from "../content/processing";

export interface ContentEngineRequest {
    input?: string;

    filename?: string;

    mimeType?: string;

    content?: Buffer | string;
}

export class ContentEngine {
    static async process(
        request: ContentEngineRequest
    ): Promise<ProcessingResult> {
        const artifactType = ArtifactDetector.detect(request);

        const now = new Date();

        const metadata: ArtifactMetadata = {
            id: crypto.randomUUID(),

            name: request.filename ?? "Untitled",

            type: artifactType,

            mimeType: request.mimeType ?? "",

            extension:
                request.filename
                    ?.split(".")
                    .pop()
                    ?.toLowerCase() ?? "",

            size: 0,

            createdAt: now,

            updatedAt: now,
        };

        const artifact: Artifact = {
            metadata,

            rawContent: request.content,

            tags: [],

            attributes: {},
        };

        const context: ProcessingContext = {
            artifact,

            startedAt: now,

            metadata: {},
        };

        return ProcessingPipeline.execute(context);
    }
}