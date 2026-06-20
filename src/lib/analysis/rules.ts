import type { NoticeType } from "@/types/snap";
import { EMPTY_FIELDS, type ExtractedFields } from "./schema";

// Deterministic, no-network layer. Always runs: it classifies by keyword signals
// and extracts fields by regex. Used as the offline fallback when no LLM key is
// present, and to backfill any fields the LLM leaves blank.

const SIGNALS: { type: Exclude<NoticeType, "unknown">; patterns: RegExp[] }[] = [
  {
    type: "denial",
    patterns: [/\bdenied\b/i, /\bdenial\b/i, /not\s+(approved|eligible)/i, /\bineligible\b/i, /cannot\s+approve/i],
  },
  {
    type: "verification_request",
    patterns: [/verification/i, /request for information/i, /please\s+(provide|submit|send)/i, /proof of/i, /\bH1020\b/i, /missing\s+(information|document)/i, /we need (more )?information/i],
  },
  {
    type: "recertification",
    patterns: [/recertif/i, /renewal/i, /\brenew\b/i, /periodic report/i, /\binterview\b/i],
  },
  {
    type: "closure",
    patterns: [/\bclosed\b/i, /\bclosure\b/i, /terminat/i, /discontinu/i, /benefits will (stop|end)/i, /will be (stopped|ended)/i],
  },
  {
    type: "benefit_change",
    patterns: [/change in benefits/i, /benefit amount/i, /\breduced\b/i, /\breduction\b/i, /\bincrease[ds]?\b/i, /adjusted/i, /your benefits (have|will) (change|decrease|increase)/i],
  },
];

export interface RuleClassification {
  type: NoticeType;
  score: number; // 0..1
  signals: string[];
}

export function rulesClassify(text: string): RuleClassification {
  let best: { type: NoticeType; hits: string[] } = { type: "unknown", hits: [] };
  for (const { type, patterns } of SIGNALS) {
    const hits: string[] = [];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) hits.push(m[0].toLowerCase());
    }
    if (hits.length > best.hits.length) best = { type, hits };
  }
  if (best.hits.length === 0) return { type: "unknown", score: 0.25, signals: [] };
  const score = Math.min(0.85, 0.4 + 0.2 * best.hits.length);
  return { type: best.type, score, signals: Array.from(new Set(best.hits)) };
}

const DATE = /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/;
const PHONE = /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/;
const URL = /\b(?:https?:\/\/)?[a-z0-9.-]+\.(?:gov|org|com)\b/i;

export function rulesExtract(text: string): ExtractedFields {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fields: ExtractedFields = { ...EMPTY_FIELDS, requestedDocuments: [] };

  const caseMatch = text.match(/case\s*(?:number|no\.?|#)\s*[:#]?\s*([A-Za-z0-9-]+)/i);
  if (caseMatch) fields.caseNumber = caseMatch[1];

  const dateLabel = text.match(/date[:\s]+([A-Za-z0-9,\/\-. ]{6,24})/i);
  fields.noticeDate = (dateLabel?.[1].trim() || text.match(DATE)?.[0] || "").trim();

  const deadlineLine = lines.find((l) =>
    /\bby\s+\w|within\s+\d+\s+days|due (date|by)|no later than|must (request|complete|return)/i.test(l)
  );
  if (deadlineLine) fields.deadline = deadlineLine;

  fields.agencyName =
    lines.find((l) => /department|county|division|services|administration|commission|HHSC|\bDSS\b/i.test(l)) ??
    lines[0] ??
    "";

  fields.contactInfo = text.match(PHONE)?.[0] ?? text.match(URL)?.[0] ?? "";

  const reason = text.match(/reason[:\s]+(.+)/i);
  if (reason) fields.likelyIssue = reason[1].trim();

  fields.requestedDocuments = lines
    .filter((l) => /^[-*•]/.test(l) || /\b(pay ?stub|proof of|lease|utility bill|verification|identification|social security)\b/i.test(l))
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .slice(0, 6);

  return fields;
}
