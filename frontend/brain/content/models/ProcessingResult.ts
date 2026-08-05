export interface ProcessingResult {
  success: boolean;

  content: string;

  summary?: string;

  extractedText?: string;

  language?: string;

  warnings: string[];

  errors: string[];
}