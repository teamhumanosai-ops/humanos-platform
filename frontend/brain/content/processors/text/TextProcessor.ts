import { Artifact, ArtifactType } from "../../models";

import { BaseProcessor } from "../BaseProcessor";

import { TextExtractor } from "./TextExtractor";

export class TextProcessor extends BaseProcessor {
    readonly name = "TextProcessor";

    private readonly extractor =
        new TextExtractor();

    canProcess(
        artifact: Artifact
    ): boolean {
        return (
            artifact.metadata.type ===
            ArtifactType.TXT
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