// Lightweight client-side draft store that carries the user's flow state across
// the upload → review → intake → results pages. Phase 1 only: in-memory via
// sessionStorage, no backend, cleared when the tab closes.

import type { IntakeAnswers } from "@/types/snap";
import type { ExtractionMethod } from "@/lib/extraction/types";
import type { NoticeUnderstanding } from "@/lib/analysis/schema";

// How the notice text got into the draft. "sample" is a seeded case; the rest
// come from the extraction layer.
export type TextSource = ExtractionMethod | "sample";

export interface Draft {
  caseId?: string; // set when a seeded sample case was chosen
  rawText?: string; // extracted/pasted/edited notice text
  fileName?: string; // display only
  source?: TextSource; // how the text was obtained
  warning?: string; // extraction warning (e.g. low OCR confidence)
  intake?: Partial<IntakeAnswers>;
  understanding?: NoticeUnderstanding; // Phase 3 classification + field extraction
}

const KEY = "snap-draft";

export function readDraft(): Draft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Draft;
  } catch {
    return {};
  }
}

export function writeDraft(patch: Partial<Draft>): Draft {
  const next = { ...readDraft(), ...patch };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  }
  return next;
}

export function clearDraft() {
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
}
