import { ExtractionError, type Extractor } from "./types";

const MIN_CHARS = 8;
const LOW_CONFIDENCE = 60;

// Serverless filesystems are read-only except for the temp dir, so Tesseract's
// language-data cache must live there.
const CACHE_PATH = process.env.TMPDIR ?? "/tmp";

// Cap OCR so a slow/stuck worker (Tesseract is fragile in serverless runtimes)
// returns a helpful error well before the function's wall-clock limit instead
// of hanging until a gateway timeout.
const OCR_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new ExtractionError(
              "extraction_failed",
              "Reading this image took too long. Try a smaller or clearer photo, upload a PDF, or paste the text below."
            )
          ),
        ms
      )
    ),
  ]);
}

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
    const worker = await withTimeout(
      createWorker("eng", undefined, { cachePath: CACHE_PATH }),
      OCR_TIMEOUT_MS
    );
    try {
      const { data } = await withTimeout(worker.recognize(buffer), OCR_TIMEOUT_MS);
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
      await worker.terminate().catch(() => {});
    }
  },
};
