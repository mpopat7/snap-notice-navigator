import { ExtractionError, type Extractor } from "./types";

const MIN_CHARS = 8;
const LOW_CONFIDENCE = 60;

// Serverless filesystems are read-only except for the temp dir, so Tesseract's
// language-data cache must live there.
const CACHE_PATH = process.env.TMPDIR ?? "/tmp";

// OCR for photos/screenshots of notices via Tesseract. This is the single module
// to replace if you want a different OCR backend (e.g. a cloud OCR API): keep the
// same `Extractor` shape and nothing else needs to change.
//
// tesseract.js is imported lazily so a load failure surfaces as a catchable
// extraction error (returned as JSON) instead of crashing the route at import.
export const imageExtractor: Extractor = {
  method: "image-ocr",
  supports: (mime, name) =>
    mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(name),
  async extract(buffer) {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", undefined, { cachePath: CACHE_PATH });
    try {
      const { data } = await worker.recognize(buffer);
      const text = (data.text ?? "").trim();
      if (text.length < MIN_CHARS) {
        throw new ExtractionError(
          "no_text_found",
          "We couldn’t read clear text from this image. Try a sharper, well-lit photo, or paste the text below."
        );
      }
      const warning =
        data.confidence < LOW_CONFIDENCE
          ? "This image was hard to read, so the text below may contain mistakes. Please check it carefully before continuing."
          : undefined;
      return { text, method: "image-ocr", charCount: text.length, warning };
    } finally {
      await worker.terminate();
    }
  },
};
