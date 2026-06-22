import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the OCR library out of the bundle; it loads its own worker/wasm bits
  // at runtime from node_modules.
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
