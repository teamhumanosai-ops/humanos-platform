export interface JsonNormalizationResult {
    text: string;

    valid: boolean;

    keys: string[];
}

export class JsonNormalizer {
    static normalize(
        input: string
    ): JsonNormalizationResult {
        try {
            const parsed = JSON.parse(input);

            return {
                text: JSON.stringify(
                    parsed,
                    null,
                    2
                ),

                valid: true,

                keys:
                    parsed &&
                    typeof parsed === "object"
                        ? Object.keys(parsed)
                        : [],
            };
        } catch {
            return {
                text: input,

                valid: false,

                keys: [],
            };
        }
    }
}