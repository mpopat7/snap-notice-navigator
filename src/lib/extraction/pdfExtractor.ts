import { PDFParse } from "pdf-parse";
import { ExtractionError, type Extractor } from "./types";

const MIN_CHARS = 20;

// Extracts the embedded text layer from a digital PDF. Scanned/photographed
// PDFs have no text layer — those are reported as "no_text_found" so the user
// can re-upload as an image (OCR) or paste instead.
export const pdfExtractor: Extractor = {
  method: "pdf-text",
  supports: (mime, name) =>
    mime === "application/pdf" || name.toLowerCase().endsWith(".pdf"),
  async extract(buffer) {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      const text = (result.text ?? "").trim();
      if (text.length < MIN_CHARS) {
        throw new ExtractionError(
          "no_text_found",
          "This PDF doesn’t contain selectable text — it’s likely a scan or photo. Try uploading it as an image instead, or paste the text below."
        );
      }
      return { text, method: "pdf-text", charCount: text.length };
    } finally {
      await parser.destroy();
    }
  },
};
