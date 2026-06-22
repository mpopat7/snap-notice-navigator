import { ExtractionError, type Extractor } from "./types";

const MIN_CHARS = 20;

// Extracts the embedded text layer from a digital PDF. Scanned/photographed
// PDFs have no text layer — those are reported as "no_text_found" so the user
// can re-upload as an image (OCR) or paste instead.
//
// unpdf ships a serverless-friendly pdf.js build (no native canvas / DOMMatrix
// dependency), so it runs in the Node serverless runtime where pdf-parse's
// pdf.js fails to load. Imported lazily so any load failure is caught and
// returned as JSON rather than crashing the whole route at import time.
export const pdfExtractor: Extractor = {
  method: "pdf-text",
  supports: (mime, name) =>
    mime === "application/pdf" || name.toLowerCase().endsWith(".pdf"),
  async extract(buffer) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const trimmed = text.trim();
    if (trimmed.length < MIN_CHARS) {
      throw new ExtractionError(
        "no_text_found",
        "This PDF doesn’t contain selectable text — it’s likely a scan or photo. Try uploading it as an image instead, or paste the text below."
      );
    }
    return { text: trimmed, method: "pdf-text", charCount: trimmed.length };
  },
};
