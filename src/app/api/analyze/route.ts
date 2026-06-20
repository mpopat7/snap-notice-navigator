import { NextResponse } from "next/server";
import { analyzeNotice } from "@/lib/analysis";

// The Anthropic SDK needs the Node.js runtime.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  if (text.trim().length === 0) {
    return NextResponse.json({ ok: false, message: "No notice text provided." }, { status: 400 });
  }

  // analyzeNotice never throws — it falls back to deterministic rules.
  const understanding = await analyzeNotice(text);
  return NextResponse.json({ ok: true, understanding });
}
