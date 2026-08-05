import { Artifact, ArtifactType } from "../../models";

import { BaseProcessor } from "../BaseProcessor";

import { JsonExtractor } from "./JsonExtractor";

export class JsonProcessor extends BaseProcessor {
    readonly name = "JsonProcessor";

    private readonly extractor =
        new JsonExtractor();

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
        const result =
            await this.extractor.extract(
                artifact.rawContent
            );

        return result.content.text;
    }
}