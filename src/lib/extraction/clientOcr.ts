// Browser-side OCR for photos/screenshots of notices. Tesseract.js runs as WASM
// in the user's browser, so the image never leaves their device (matching the
// "on-device text recognition" promise) and it sidesteps the serverless runtime,
// where Tesseract's worker can't run. PDFs and text files still go to the server
// extraction route; only images use this path.

import type { ExtractionResult } from "./types";

const MIN_CHARS = 8;
const LOW_CONFIDENCE = 60;

// Detect images by mime/extension — the same rule the server extractor used.
export function isImageFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file.name)
  );
}

export async function extractImageInBrowser(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<ExtractionResult> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", undefined, {
    logger: (m) => {
      if (m.status === "recognizing text") onProgress?.(m.progress);
    },
  });
  try {
    const { data } = await worker.recognize(file);
    const text = (data.text ?? "").trim();
    if (text.length < MIN_CHARS) {
      throw new Error(
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
}
