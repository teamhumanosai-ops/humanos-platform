export class JsonExtractor {
    static async extract(
        content?: Buffer | string
    ): Promise<string> {
        if (!content) {
            return "{}";
        }

        const text =
            typeof content === "string"
                ? content
                : content.toString("utf-8");

        try {
            const parsed = JSON.parse(text);

            return JSON.stringify(
                parsed,
                null,
                2
            );
        } catch {
            return "{}";
        }
    }
}