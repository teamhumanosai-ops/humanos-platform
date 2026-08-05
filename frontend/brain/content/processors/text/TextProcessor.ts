import { Artifact, ArtifactType } from "../../models";

import { BaseProcessor } from "../BaseProcessor";

import { TextExtractor } from "./TextExtractor";

export class TextProcessor extends BaseProcessor {
    readonly name = "TextProcessor";

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
        return TextExtractor.extract(
            artifact.rawContent
        );
    }
}