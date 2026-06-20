import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the OCR/PDF libraries out of the bundle; they load their own
  // workers/wasm/native bits at runtime from node_modules.
  serverExternalPackages: ["pdf-parse", "tesseract.js"],
};

export default nextConfig;
