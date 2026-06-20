// Lightweight client-side draft store that carries the user's flow state across
// the upload → review → intake → results pages. Phase 1 only: in-memory via
// sessionStorage, no backend, cleared when the tab closes.

import type { IntakeAnswers } from "@/types/snap";

export interface Draft {
  caseId?: string; // set when a seeded sample case was chosen
  rawText?: string; // extracted/pasted/edited notice text
  fileName?: string; // display only (no parsing in Phase 1)
  intake?: Partial<IntakeAnswers>;
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
