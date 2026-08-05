export class TextNormalizer {
    static normalize(text: string): string {
        return text
            .normalize("NFC")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    static sections(text: string): string[] {
        return text
            .split(/\n\s*\n/)
            .map(section => section.trim())
            .filter(section => section.length > 0);
    }
}