// Phase 1 stub for the analysis pipeline.
//
// When the user picks a seeded case we return its hand-authored analysis. When
// they paste their own text, we have no OCR/LLM yet (Phases 2–4), so we return a
// clearly-labeled low-confidence placeholder that still demonstrates the full
// results layout. This keeps the flow honest: no fabricated certainty.

import type { Draft } from "@/lib/session";
import { getCase } from "@/data/cases";
import type { NoticeAnalysis } from "@/types/snap";

export function getAnalysis(draft: Draft): NoticeAnalysis {
  const seeded = getCase(draft.caseId);
  if (seeded) return seeded.analysis;
  return buildPlaceholderAnalysis(draft);
}

function buildPlaceholderAnalysis(draft: Draft): NoticeAnalysis {
  const state = draft.intake?.state;
  return {
    noticeType: "unknown",
    confidence: "low",
    headline:
      "We saved your notice, but automated interpretation isn't turned on yet in this preview.",
    agency: "Your state SNAP agency",
    keyFields: [
      { label: "Notice type", value: "Not yet classified (AI step arrives in Phase 3)" },
      { label: "Text captured", value: draft.rawText ? "Yes" : "No" },
      { label: "Your state", value: state ?? "Not provided" },
    ],
    explanation:
      "This is a preview build. In the full version, the text you reviewed is read by an AI step that explains the notice in plain language. For now, this card shows where that explanation will appear. To see a complete, realistic result, go back and choose one of the sample notices.",
    likelyIssue:
      "The likely-issue summary will appear here once the classification and reasoning steps are connected (Phase 3–4).",
    steps: [
      {
        title: "Try a sample notice to see a full result",
        rationale:
          "The seeded denial, verification, and recertification cases show the complete experience end to end.",
        urgency: "now",
      },
      {
        title: "Contact your local office for anything time-sensitive",
        rationale:
          "Because automated analysis isn't available here yet, please rely on your agency for real deadlines.",
        urgency: "soon",
      },
    ],
    documents: [
      "Keep the original notice handy",
      "Recent proof of income",
      "Proof of address",
    ],
    sources: [
      {
        title: "SNAP Eligibility Overview",
        publisher: "USDA Food and Nutrition Service",
        url: "https://www.fns.usda.gov/snap/recipient/eligibility",
      },
    ],
    help: [
      {
        name: "Call 211",
        detail: "Free, confidential help finding local food and benefits support, 24/7.",
        phone: "211",
        url: "https://www.211.org",
      },
    ],
    lowConfidenceNote:
      "This is placeholder output for a notice we haven't analyzed. Don't rely on it for decisions — contact your local SNAP office or a benefits advocate.",
  };
}
