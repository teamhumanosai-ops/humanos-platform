import { ExtractedContent } from "./ExtractedContent";
import { ExtractionMetadata } from "./ExtractionMetadata";

export interface ExtractionResult {
    content: ExtractedContent;

    metadata: ExtractionMetadata;
}