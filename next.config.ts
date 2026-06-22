import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the OCR/PDF libraries out of the bundle; they load their own
  // workers/wasm/native bits at runtime from node_modules. @napi-rs/canvas is
  // the native polyfill pdf-parse's pdfjs needs for DOMMatrix/ImageData in the
  // Node serverless runtime — it must stay external so its binary isn't bundled.
  serverExternalPackages: ["pdf-parse", "tesseract.js", "@napi-rs/canvas"],
};

export default nextConfig;
