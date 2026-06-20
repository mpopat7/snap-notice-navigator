import * as z from "zod/v4";
import type { ActionStep, HelpReferral, SourceRef } from "@/types/snap";

// Architecture module F: recommendation generation. The LLM produces the prose +
// action plan; sources are attached deterministically from retrieval (never
// invented by the model), so every recommendation shows a real source basis.

export const RecommendationDraftSchema = z.object({
  explanation: z.string().describe("Plain-language explanation of what the notice likely means. Use 'may'/'likely'/'possible'; never guarantee eligibility."),
  likelyIssue: z.string().describe("A short summary of why this likely happened. Hedged language only."),
  steps: z
    .array(
      z.object({
        title: z.string().describe("Short imperative step the user can take."),
        rationale: z.string().describe("One sentence on why this step helps."),
        urgency: z.enum(["now", "soon", "later"]),
        deadline: z.string().describe("A deadline for this step if one applies, else empty string."),
      })
    )
    .describe("Prioritized next steps, most urgent first. The user decides whether to act."),
  documents: z.array(z.string()).describe("Documents the user may want to gather."),
  escalation: z.string().describe("Guidance to contact an office/advocate if the situation is uncertain, else empty string."),
});

export type RecommendationDraft = z.infer<typeof RecommendationDraftSchema>;

// The object the results page renders. Sources + help come from retrieval, not the LLM.
export interface Recommendation {
  explanation: string;
  likelyIssue: string;
  steps: ActionStep[];
  documents: string[];
  sources: SourceRef[];
  help: HelpReferral[];
  escalation?: string;
  stateSupported: boolean;
  source: "llm" | "template";
}
