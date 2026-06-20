// Extraction layer contracts. No runtime imports here so this file is safe to
// reference from both client and server code (client only uses the types).

export type ExtractionMethod = "pdf-text" | "image-ocr" | "plain-text";

export interface ExtractionResult {
  text: string;
  method: ExtractionMethod;
  charCount: number;
  warning?: string; // e.g. low OCR confidence — surfaced on the review page
}

export type ExtractionErrorCode =
  | "unsupported_type"
  | "empty_file"
  | "file_too_large"
  | "no_text_found"
  | "extraction_failed";

export class ExtractionError extends Error {
  code: ExtractionErrorCode;
  constructor(code: ExtractionErrorCode, message: string) {
    super(message);
    this.name = "ExtractionError";
    this.code = code;
  }
}

// One extractor per input kind. Swapping OCR providers means replacing a single
// module that satisfies this interface — nothing else in the app changes.
export interface Extractor {
  readonly method: ExtractionMethod;
  supports(mimeType: string, fileName: string): boolean;
  extract(buffer: Buffer, fileName: string): Promise<ExtractionResult>;
}
