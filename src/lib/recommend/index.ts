// Orchestrates retrieval (module E) + recommendation generation (module F).
// Sources/help come from the curated KB; prose/steps come from the LLM (grounded
// in those sources) or the deterministic template. Never throws.

import { deriveTopics, referralsFor, retrieve } from "@/data/knowledge";
import type { ActionStep, IntakeAnswers } from "@/types/snap";
import type { NoticeUnderstanding } from "@/lib/analysis/schema";
import { recommendAvailable, recommendLLM } from "./llm";
import { recommendTemplate } from "./template";
import type { Recommendation, RecommendationDraft } from "./schema";

export type { Recommendation } from "./schema";

export async function generateRecommendation(
  understanding: NoticeUnderstanding,
  intake: Partial<IntakeAnswers>
): Promise<Recommendation> {
  const freeText = [
    understanding.summary,
    understanding.fields.likelyIssue,
    understanding.fields.requestedDocuments.join(" "),
  ].join(" ");
  const topics = deriveTopics(understanding.noticeType, freeText);
  const { entries, sources, stateSupported } = retrieve(intake.state, understanding.noticeType, topics);

  let draft: RecommendationDraft;
  let source: "llm" | "template" = "template";

  if (recommendAvailable()) {
    try {
      draft = (await recommendLLM(understanding, intake, entries)).draft;
      source = "llm";
    } catch {
      draft = recommendTemplate(understanding);
    }
  } else {
    draft = recommendTemplate(understanding);
  }

  const steps: ActionStep[] = draft.steps.map((s) => ({
    title: s.title,
    rationale: s.rationale,
    urgency: s.urgency,
    deadline: s.deadline.trim() ? s.deadline.trim() : undefined,
  }));

  // For an unsupported state, make the limited-support fallback explicit.
  const escalation =
    [
      draft.escalation.trim(),
      !stateSupported && intake.state
        ? "We have limited state-specific guidance for your state, so this uses federal baseline information. Your state SNAP agency makes the final decision — contact them for details specific to your case."
        : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return {
    explanation: draft.explanation,
    likelyIssue: draft.likelyIssue,
    steps,
    documents: draft.documents,
    sources,
    help: referralsFor(intake.state),
    escalation,
    stateSupported,
    source,
  };
}
