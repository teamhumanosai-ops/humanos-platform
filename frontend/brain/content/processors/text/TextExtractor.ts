export class TextExtractor {
    static async extract(
        content?: Buffer | string
    ): Promise<string> {
        if (!content) {
            return "";
        }

        if (typeof content === "string") {
            return content;
        }

        return content.toString("utf-8");
    }
}