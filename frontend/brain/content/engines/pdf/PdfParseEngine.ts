import { PDFParse } from "pdf-parse";

import {
    PdfEngine,
    PdfExtractionResult,
} from "./PdfEngine";

export class PdfParseEngine extends PdfEngine {
    async extractText(
        content: Buffer
    ): Promise<PdfExtractionResult> {
        const parser = new PDFParse({
            data: content,
        });

        try {
            const textResult = await parser.getText();

            const infoResult = await parser.getInfo();

            return {
                text: textResult.text,

                pageCount: textResult.total ?? 0,

                metadata: {
                    title: infoResult.info?.Title,

                    author: infoResult.info?.Author,

                    subject: infoResult.info?.Subject,

                    creator: infoResult.info?.Creator,

                    producer: infoResult.info?.Producer,

                    keywords:
                        infoResult.info?.Keywords
                            ?.split(",")
                            .map((keyword: string) =>
                                keyword.trim()
                            ) ?? [],
                },
            };
        } finally {
            await parser.destroy();
        }
    }
}