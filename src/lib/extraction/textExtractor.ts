import { ExtractionError, type Extractor } from "./types";

// Plain .txt files (and the in-app paste path conceptually) — no parsing needed.
export const textExtractor: Extractor = {
  method: "plain-text",
  supports: (mime, name) =>
    mime === "text/plain" || name.toLowerCase().endsWith(".txt"),
  async extract(buffer) {
    const text = buffer.toString("utf-8").trim();
    if (!text) {
      throw new ExtractionError("empty_file", "This file looks empty.");
    }
    return { text, method: "plain-text", charCount: text.length };
  },
};
