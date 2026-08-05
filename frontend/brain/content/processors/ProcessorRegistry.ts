import { Artifact } from "../models";

import { ContentProcessor } from "./ContentProcessor";
import { DefaultProcessor } from "./DefaultProcessor";

import { PdfProcessor } from "./pdf";
import { MarkdownProcessor } from "./markdown";
import { TextProcessor } from "./text";
import { JsonProcessor } from "./json";

export class ProcessorRegistry {
    private static readonly processors: ContentProcessor[] = [
        new PdfProcessor(),
        new MarkdownProcessor(),
        new TextProcessor(),
        new JsonProcessor(),
        new DefaultProcessor(),
    ];

    static register(processor: ContentProcessor): void {
        this.processors.unshift(processor);
    }

    static resolve(
        artifact: Artifact
    ): ContentProcessor {
        return (
            this.processors.find((processor) =>
                processor.canProcess(
                    artifact
                )
            ) ?? new DefaultProcessor()
        );
    }
}