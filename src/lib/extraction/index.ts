// Public entry point for the extraction layer (architecture module B).
// Routes a file to the right extractor by mime type / extension. Add or swap an
// extractor by editing the registry below — callers only use `extractDocument`.

import { pdfExtractor } from "./pdfExtractor";
import { textExtractor } from "./textExtractor";
import { ExtractionError, type ExtractionResult, type Extractor } from "./types";

export { ExtractionError } from "./types";
export type { ExtractionMethod, ExtractionResult, ExtractionErrorCode } from "./types";

export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Images are OCR'd in the browser (see lib/extraction/clientOcr) — Tesseract
// can't run in the serverless runtime — so the server only handles PDFs and text.
const EXTRACTORS: Extractor[] = [textExtractor, pdfExtractor];

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

  // Route by name/mime first; if that fails, fall back to the file's signature
  // so a real PDF/image with a missing extension or generic mime still works.
  const extractor =
    EXTRACTORS.find((e) => e.supports(mimeType, fileName)) ??
    EXTRACTORS.find((e) => e.method === sniffMethod(buffer));
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

// Identify a file by its leading magic bytes when name/mime are unreliable.
function sniffMethod(buffer: Buffer): ExtractionResult["method"] | null {
  const head = buffer.subarray(0, 16);
  const startsWith = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);
  // PDFs may carry a few leading whitespace/BOM bytes before "%PDF".
  if (buffer.subarray(0, 1024).includes(Buffer.from("%PDF"))) return "pdf-text";
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) return "image-ocr"; // PNG
  if (startsWith(0xff, 0xd8, 0xff)) return "image-ocr"; // JPEG
  if (startsWith(0x47, 0x49, 0x46)) return "image-ocr"; // GIF
  if (startsWith(0x42, 0x4d)) return "image-ocr"; // BMP
  if (startsWith(0x49, 0x49, 0x2a, 0x00) || startsWith(0x4d, 0x4d, 0x00, 0x2a))
    return "image-ocr"; // TIFF
  if (startsWith(0x52, 0x49, 0x46, 0x46) && head.subarray(8, 12).toString() === "WEBP")
    return "image-ocr"; // WEBP
  return null;
}
