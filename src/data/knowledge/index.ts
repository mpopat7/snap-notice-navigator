// Architecture module E: retrieval. Picks the most relevant curated sources for
// a notice, scoped to the user's state (federal-only when unsupported).

import { SUPPORTED_STATES } from "@/lib/constants";
import type { HelpReferral, NoticeType, SourceRef } from "@/types/snap";
import { FEDERAL_KB } from "./federal";
import { FEDERAL_REFERRALS, STATE_KB, STATE_REFERRALS } from "./states";
import type { KBEntry, Scope, Topic } from "./types";

export type { KBEntry, Topic } from "./types";

const KB: KBEntry[] = [...FEDERAL_KB, ...STATE_KB];

// Base topics implied by the notice type.
const TYPE_TOPICS: Record<NoticeType, Topic[]> = {
  denial: ["appeals_hearing", "reapply", "income_verification", "general"],
  verification_request: ["documents", "income_verification", "residency", "identity", "deadlines"],
  recertification: ["recertification", "deadlines", "documents"],
  closure: ["appeals_hearing", "reapply", "deadlines"],
  benefit_change: ["appeals_hearing", "income_verification", "general"],
  unknown: ["general", "office_contact"],
};

// Extra topics inferred from words in the notice (reason, requested docs, summary).
const TOPIC_KEYWORDS: { topic: Topic; re: RegExp }[] = [
  { topic: "income_verification", re: /income|pay ?stub|wage|earning|salary/i },
  { topic: "residency", re: /address|residen|lease|utility|where you live/i },
  { topic: "identity", re: /identit|\bID\b|social security/i },
  { topic: "work_requirements", re: /work requirement|employment|ABAWD|work hours/i },
  { topic: "recertification", re: /interview|renew|recertif/i },
  { topic: "appeals_hearing", re: /hearing|appeal|disagree/i },
];

export function deriveTopics(noticeType: NoticeType, freeText: string): Topic[] {
  const topics = new Set<Topic>(TYPE_TOPICS[noticeType]);
  for (const { topic, re } of TOPIC_KEYWORDS) {
    if (re.test(freeText)) topics.add(topic);
  }
  return [...topics];
}

export function isSupportedState(state: string | undefined): boolean {
  return Boolean(state && SUPPORTED_STATES.has(state));
}

export interface Retrieved {
  entries: KBEntry[];
  sources: SourceRef[];
  stateSupported: boolean;
}

export function retrieve(
  state: string | undefined,
  noticeType: NoticeType,
  topics: Topic[],
  limit = 6
): Retrieved {
  const supported = isSupportedState(state);
  const topicSet = new Set(topics);

  const scored = KB.filter((e) => e.scope === "federal" || (supported && e.scope === state))
    .map((e) => {
      let score = 0;
      if (e.noticeTypes.includes(noticeType)) score += 3;
      if (e.noticeTypes.includes("any")) score += 1;
      for (const t of e.topics) if (topicSet.has(t)) score += 2;
      if (e.scope !== "federal") score += 1; // prefer state-specific when relevant
      return { e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.e);

  return {
    entries: scored,
    sources: scored.map((e) => ({ title: e.title, publisher: e.publisher, url: e.url })),
    stateSupported: supported,
  };
}

export function referralsFor(state: string | undefined): HelpReferral[] {
  const match = STATE_REFERRALS.find((r) => r.state === (state as Scope));
  return match ? match.referrals : FEDERAL_REFERRALS;
}
