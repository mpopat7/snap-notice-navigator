import type { HelpReferral, NoticeType } from "@/types/snap";

// Curated knowledge base contracts. Scope is intentionally narrow: a federal
// baseline plus three deeply-supported states. Everything else falls back to
// federal-only guidance.

export type Scope = "federal" | "CA" | "TX" | "MO";

export type Topic =
  | "general"
  | "income_verification"
  | "residency"
  | "identity"
  | "recertification"
  | "work_requirements"
  | "appeals_hearing"
  | "reapply"
  | "deadlines"
  | "documents"
  | "office_contact";

export interface KBEntry {
  id: string;
  scope: Scope;
  title: string;
  publisher: string;
  url: string;
  noticeTypes: (NoticeType | "any")[];
  topics: Topic[];
  snippet: string; // short grounding text passed to the recommender
}

export interface StateReferrals {
  state: Scope;
  referrals: HelpReferral[];
}
