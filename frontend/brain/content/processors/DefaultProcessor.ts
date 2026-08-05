import { Artifact } from "../models";

import { ContentProcessor } from "./ContentProcessor";

export class DefaultProcessor implements ContentProcessor {
    readonly name = "DefaultProcessor";

    canProcess(): boolean {
        return true;
    }

    async process(artifact: Artifact): Promise<Artifact> {
        return artifact;
    }
}