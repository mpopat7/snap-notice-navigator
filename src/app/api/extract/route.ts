import { NextResponse } from "next/server";
import { ExtractionError, extractDocument } from "@/lib/extraction";

// OCR (Tesseract) and pdf-parse need the Node.js runtime, not Edge.
export const runtime = "nodejs";
// OCR on a photo can take a few seconds; give it headroom.
export const maxDuration = 60;

export async function POST(req: Request) {
  let file: File | null = null;
  try {
    const form = await req.formData();
    const value = form.get("file");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json(
      { ok: false, code: "extraction_failed", message: "Could not read the upload." },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json(
      { ok: false, code: "empty_file", message: "No file was received." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await extractDocument(buffer, file.type, file.name);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    if (err instanceof ExtractionError) {
      return NextResponse.json(
        { ok: false, code: err.code, message: err.message },
        { status: 422 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        code: "extraction_failed",
        message: "Unexpected error while reading the file.",
      },
      { status: 500 }
    );
  }
}
