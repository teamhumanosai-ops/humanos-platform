import { Artifact, ArtifactType } from "../../models";

import { BaseProcessor } from "../BaseProcessor";

import { JsonExtractor } from "./JsonExtractor";

export class JsonProcessor extends BaseProcessor {
    readonly name = "JsonProcessor";

    canProcess(
        artifact: Artifact
    ): boolean {
        return (
            artifact.metadata.type ===
            ArtifactType.JSON
        );
    }

    protected async extract(
        artifact: Artifact
    ): Promise<string> {
        return JsonExtractor.extract(
            artifact.rawContent
        );
    }
}