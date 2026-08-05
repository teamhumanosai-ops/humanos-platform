import { ArtifactDetector } from "../detectors";
import { ArtifactType } from "../models";

interface TestCase {
    name: string;
    expected: ArtifactType;
    input: {
        input?: string;
        filename?: string;
        mimeType?: string;
    };
}

const testCases: TestCase[] = [
    {
        name: "Detect URL",
        expected: ArtifactType.URL,
        input: {
            input: "https://openai.com",
        },
    },
    {
        name: "Detect PDF",
        expected: ArtifactType.PDF,
        input: {
            filename: "report.pdf",
        },
    },
    {
        name: "Detect DOCX",
        expected: ArtifactType.DOCX,
        input: {
            filename: "resume.docx",
        },
    },
    {
        name: "Detect TXT",
        expected: ArtifactType.TXT,
        input: {
            filename: "notes.txt",
        },
    },
    {
        name: "Detect Markdown",
        expected: ArtifactType.MARKDOWN,
        input: {
            filename: "README.md",
        },
    },
    {
        name: "Detect PNG",
        expected: ArtifactType.PNG,
        input: {
            filename: "image.png",
        },
    },
    {
        name: "Detect JPG",
        expected: ArtifactType.JPG,
        input: {
            filename: "photo.jpg",
        },
    },
    {
        name: "Detect CSV",
        expected: ArtifactType.CSV,
        input: {
            filename: "data.csv",
        },
    },
    {
        name: "Detect JSON",
        expected: ArtifactType.JSON,
        input: {
            filename: "config.json",
        },
    },
    {
        name: "Detect ZIP",
        expected: ArtifactType.ZIP,
        input: {
            filename: "archive.zip",
        },
    },
    {
        name: "Unknown File",
        expected: ArtifactType.UNKNOWN,
        input: {
            filename: "random.xyz",
        },
    },
];

export function runArtifactDetectorTests(): void {
    console.log("======================================");
    console.log("Human OS — Artifact Detector Tests");
    console.log("======================================");

    let passed = 0;

    for (const test of testCases) {
        const actual = ArtifactDetector.detect(test.input);

        const success = actual === test.expected;

        if (success) {
            passed++;
            console.log(`✅ ${test.name}`);
        } else {
            console.error(
                `❌ ${test.name} | expected=${test.expected} actual=${actual}`
            );
        }
    }

    console.log("--------------------------------------");
    console.log(`${passed}/${testCases.length} tests passed`);
    console.log("--------------------------------------");
}