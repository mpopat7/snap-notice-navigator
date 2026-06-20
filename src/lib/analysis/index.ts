// Public entry point for the analysis layer. `analyzeNotice` never throws — it
// always returns a NoticeUnderstanding, falling back from LLM → rules so the app
// works offline and degrades gracefully. Phase 4 consumes this object.

import type { NoticeType } from "@/types/snap";
import { llmAvailable, llmExtract } from "./llm";
import { rulesClassify, rulesExtract, type RuleClassification } from "./rules";
import {
  bandFromConfidence,
  type ExtractedFields,
  type NoticeExtraction,
  type NoticeUnderstanding,
} from "./schema";

export type { NoticeUnderstanding, NoticeExtraction, ExtractedFields } from "./schema";

const TYPE_SUMMARY: Record<NoticeType, string> = {
  denial: "This appears to be a denial notice.",
  verification_request: "This appears to be a request for documents or information.",
  recertification: "This appears to be a recertification or renewal notice.",
  closure: "This appears to be a closure or termination notice.",
  benefit_change: "This appears to be a notice about a change in benefits.",
  unknown: "We couldn’t confidently identify what kind of notice this is.",
};

export async function analyzeNotice(text: string): Promise<NoticeUnderstanding> {
  const ruleClass = rulesClassify(text);
  const ruleFields = rulesExtract(text);

  if (llmAvailable()) {
    try {
      const { extraction, model } = await llmExtract(text);
      const merged = backfill(extraction, ruleFields);
      return finalize(merged, "llm", ruleClass, model);
    } catch {
      // fall through to deterministic rules
    }
  }

  const baseline: NoticeExtraction = {
    noticeType: ruleClass.type,
    confidence: ruleClass.score,
    summary: TYPE_SUMMARY[ruleClass.type],
    reasoning: ruleClass.signals.length
      ? `Matched keywords in the notice: ${ruleClass.signals.join(", ")}.`
      : "No strong keywords were found, so this is a low-confidence guess.",
    fields: ruleFields,
  };
  return finalize(baseline, "rules", ruleClass);
}

// Fill any field the LLM left blank with the deterministic regex result.
function backfill(extraction: NoticeExtraction, rules: ExtractedFields): NoticeExtraction {
  const f = { ...extraction.fields };
  f.agencyName ||= rules.agencyName;
  f.noticeDate ||= rules.noticeDate;
  f.deadline ||= rules.deadline;
  f.caseNumber ||= rules.caseNumber;
  f.likelyIssue ||= rules.likelyIssue;
  f.contactInfo ||= rules.contactInfo;
  if (f.requestedDocuments.length === 0) f.requestedDocuments = rules.requestedDocuments;
  return { ...extraction, fields: f };
}

function finalize(
  extraction: NoticeExtraction,
  source: "llm" | "rules",
  ruleClass: RuleClassification,
  model?: string
): NoticeUnderstanding {
  let confidence = extraction.confidence;

  // If the LLM and the keyword rules confidently disagree, lower confidence —
  // the interpretation is shakier than either signal alone suggests.
  const disagrees =
    source === "llm" &&
    ruleClass.type !== "unknown" &&
    ruleClass.score >= 0.7 &&
    ruleClass.type !== extraction.noticeType;
  if (disagrees) confidence = Math.min(confidence, 0.5);

  const confidenceBand = bandFromConfidence(confidence);
  const lowConfidence = confidenceBand === "low" || source === "rules";

  const escalation = lowConfidence
    ? "Because this reading is uncertain, please confirm the details with your local SNAP office or a benefits advocate before acting."
    : undefined;

  const summary = extraction.summary?.trim() || TYPE_SUMMARY[extraction.noticeType];

  return {
    ...extraction,
    summary,
    confidence,
    confidenceBand,
    source,
    lowConfidence,
    escalation,
    modelUsed: model,
  };
}
