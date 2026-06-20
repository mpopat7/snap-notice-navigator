import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { KBEntry } from "@/data/knowledge";
import type { IntakeAnswers } from "@/types/snap";
import type { NoticeUnderstanding } from "@/lib/analysis/schema";
import { RecommendationDraftSchema, type RecommendationDraft } from "./schema";

const MODEL = process.env.LLM_MODEL || "claude-sonnet-4-6";

const SYSTEM = `You help people understand a SNAP (food assistance) notice and figure out possible next steps. You are not a government agency and not a lawyer.

Hard safety rules — follow exactly:
- Never claim guaranteed eligibility or a guaranteed outcome. Use "may", "likely", "possible", "you might".
- Do not tell the user they definitely qualify, that the decision is wrong, or that they will receive benefits.
- The user decides whether to appeal, reapply, submit documents, or contact the agency. Frame steps as options, not commands.
- Emphasize that the state SNAP agency makes the final decision.
- Base your guidance ONLY on the SUPPORTED SOURCES provided. Do not invent policies, deadlines, or facts not present in the notice or the sources. Do not output URLs (sources are attached separately).
- If the information is thin or the classification is uncertain, fill "escalation" with a short note to contact the local office or a benefits advocate.

Keep language calm, plain, and non-judgmental.`;

export function recommendAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function recommendLLM(
  understanding: NoticeUnderstanding,
  intake: Partial<IntakeAnswers>,
  entries: KBEntry[]
): Promise<{ draft: RecommendationDraft; model: string }> {
  const sources = entries
    .map((e, i) => `[${i + 1}] ${e.title} (${e.publisher})\n${e.snippet}`)
    .join("\n\n");

  const f = understanding.fields;
  const context = [
    `Notice type: ${understanding.noticeType} (confidence ${Math.round(understanding.confidence * 100)}%)`,
    `Summary: ${understanding.summary}`,
    f.likelyIssue && `Stated reason/issue: ${f.likelyIssue}`,
    f.deadline && `Deadline mentioned: ${f.deadline}`,
    f.requestedDocuments.length ? `Documents requested: ${f.requestedDocuments.join("; ")}` : null,
    `User state: ${intake.state ?? "unknown"}`,
    intake.householdSize && `Household size: ${intake.householdSize}`,
    intake.incomeBand && `Income band: ${intake.incomeBand}`,
    intake.actionContext && `Situation: ${intake.actionContext}`,
    intake.submittedDocs && `Already submitted documents: ${intake.submittedDocs}`,
  ]
    .filter(Boolean)
    .join("\n");

  const client = new Anthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `NOTICE CONTEXT:\n${context}\n\nSUPPORTED SOURCES:\n${sources}\n\nUsing only the notice context and supported sources, produce a grounded recommendation.`,
      },
    ],
    output_config: { format: zodOutputFormat(RecommendationDraftSchema) },
  });
  if (!res.parsed_output) throw new Error("LLM returned no parseable recommendation");
  return { draft: res.parsed_output, model: MODEL };
}
