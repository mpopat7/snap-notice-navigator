// Public entry point for the extraction layer (architecture module B).
// Routes a file to the right extractor by mime type / extension. Add or swap an
// extractor by editing the registry below — callers only use `extractDocument`.

import { pdfExtractor } from "./pdfExtractor";
import { imageExtractor } from "./imageExtractor";
import { textExtractor } from "./textExtractor";
import { ExtractionError, type ExtractionResult, type Extractor } from "./types";

export { ExtractionError } from "./types";
export type { ExtractionMethod, ExtractionResult, ExtractionErrorCode } from "./types";

export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const EXTRACTORS: Extractor[] = [textExtractor, pdfExtractor, imageExtractor];

export const ACCEPTED_TYPES = ".txt, .pdf, .png, .jpg, .jpeg, .webp";

export async function extractDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractionResult> {
  if (buffer.length === 0) {
    throw new ExtractionError("empty_file", "That file appears to be empty.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new ExtractionError(
      "file_too_large",
      "That file is larger than 10 MB. Try a smaller file, or paste the text instead."
    );
  }

  const extractor = EXTRACTORS.find((e) => e.supports(mimeType, fileName));
  if (!extractor) {
    throw new ExtractionError(
      "unsupported_type",
      "We can read PDFs, images (PNG/JPG), and text files. For anything else, paste the text below."
    );
  }

  try {
    return await extractor.extract(buffer, fileName);
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    throw new ExtractionError(
      "extraction_failed",
      "Something went wrong while reading that file. You can paste the text instead, or try a sample notice."
    );
  }
}
