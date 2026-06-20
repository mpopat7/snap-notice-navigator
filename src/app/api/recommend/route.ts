import { NextResponse } from "next/server";
import { analyzeNotice } from "@/lib/analysis";
import { generateRecommendation } from "@/lib/recommend";
import type { IntakeAnswers } from "@/types/snap";

// Anthropic SDK needs the Node.js runtime.
export const runtime = "nodejs";
export const maxDuration = 60;

// One call drives Phase 3 (classify + extract) and Phase 4 (retrieve + recommend),
// returning both so the results page can render the full picture in one request.
export async function POST(req: Request) {
  let text = "";
  let intake: Partial<IntakeAnswers> = {};
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
    intake = body?.intake && typeof body.intake === "object" ? body.intake : {};
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  if (text.trim().length === 0) {
    return NextResponse.json({ ok: false, message: "No notice text provided." }, { status: 400 });
  }

  const understanding = await analyzeNotice(text);
  const recommendation = await generateRecommendation(understanding, intake);
  return NextResponse.json({ ok: true, understanding, recommendation });
}
