// Shared domain types for the SNAP Notice Navigator.
// Phase 1: these describe the *shape* of analysis results; values are mocked.
// Phases 2–4 will populate them from OCR + LLM + retrieval instead of static data.

export type NoticeType =
  | "denial"
  | "verification_request"
  | "recertification"
  | "closure"
  | "benefit_change"
  | "unknown";

export type Confidence = "high" | "medium" | "low";

export type Urgency = "now" | "soon" | "later";

export interface KeyField {
  label: string;
  value: string;
}

export interface ActionStep {
  title: string;
  rationale: string;
  urgency: Urgency;
  deadline?: string;
}

export interface SourceRef {
  title: string;
  publisher: string;
  url: string;
}

export interface HelpReferral {
  name: string;
  detail: string;
  phone?: string;
  url?: string;
}

export interface NoticeAnalysis {
  noticeType: NoticeType;
  confidence: Confidence;
  headline: string; // one calm sentence for the top status card
  agency: string;
  deadline?: string; // human-readable, surfaced as an alert when present
  keyFields: KeyField[];
  explanation: string; // "What this notice likely means"
  likelyIssue: string; // "Why this may have happened"
  steps: ActionStep[]; // "What to do next" (urgency-ordered)
  documents: string[]; // "What documents to gather"
  sources: SourceRef[]; // official-source basis
  help: HelpReferral[]; // "Need more help?"
  lowConfidenceNote?: string; // shown when interpretation is uncertain
}

export type ActionContext =
  | "applying"
  | "recertifying"
  | "appealing"
  | "responding"
  | "unsure";

export interface IntakeAnswers {
  state: string; // two-letter code
  householdSize: string;
  incomeBand: string;
  actionContext: ActionContext;
  submittedDocs: "yes" | "no" | "unsure";
  language: string;
}

export interface MockCase {
  id: string;
  label: string; // picker title
  blurb: string; // short picker description
  noticeType: NoticeType;
  rawText: string; // stands in for OCR-extracted text in Phase 1
  suggestedIntake: Partial<IntakeAnswers>;
  analysis: NoticeAnalysis;
}
