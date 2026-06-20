import * as z from "zod/v4";
import type { Confidence } from "@/types/snap";

// Architecture modules C (classification) + D (field extraction).
// One structured schema drives both the deterministic rules layer and the LLM,
// so callers always get the same shape regardless of which path produced it.

export const NOTICE_TYPES = [
  "denial",
  "verification_request",
  "recertification",
  "closure",
  "benefit_change",
  "unknown",
] as const;

export const ExtractedFieldsSchema = z.object({
  agencyName: z.string().describe("The agency/office that sent the notice, or empty string if absent."),
  noticeDate: z.string().describe("The date printed on the notice, verbatim, or empty string."),
  deadline: z.string().describe("Any due date, deadline, or timeframe to act, or empty string."),
  caseNumber: z.string().describe("The case or reference number, or empty string."),
  likelyIssue: z.string().describe("The main reason or issue the notice states, in plain language, or empty string."),
  requestedDocuments: z.array(z.string()).describe("Documents or proof the notice asks for. Empty list if none."),
  contactInfo: z.string().describe("Any phone number, website, or address to contact, or empty string."),
});

export const NoticeExtractionSchema = z.object({
  noticeType: z.enum(NOTICE_TYPES).describe("The single best-fitting notice type."),
  confidence: z.number().describe("0 to 1 — how clearly the text supports this classification."),
  summary: z.string().describe("One plain-language sentence describing what the notice is."),
  reasoning: z.string().describe("Brief, plain explanation of why this type was chosen, citing words from the notice."),
  fields: ExtractedFieldsSchema,
});

export type ExtractedFields = z.infer<typeof ExtractedFieldsSchema>;
export type NoticeExtraction = z.infer<typeof NoticeExtractionSchema>;

// The clean object later steps (Phase 4 retrieval + recommendation) consume.
export interface NoticeUnderstanding extends NoticeExtraction {
  confidenceBand: Confidence;
  source: "llm" | "rules";
  lowConfidence: boolean;
  escalation?: string;
  modelUsed?: string;
}

export function bandFromConfidence(confidence: number): Confidence {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.45) return "medium";
  return "low";
}

export const EMPTY_FIELDS: ExtractedFields = {
  agencyName: "",
  noticeDate: "",
  deadline: "",
  caseNumber: "",
  likelyIssue: "",
  requestedDocuments: [],
  contactInfo: "",
};
