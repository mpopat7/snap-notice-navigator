import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NoticeExtractionSchema, type NoticeExtraction } from "./schema";

// LLM layer: a single structured-output call that classifies + extracts.
// Kept deliberately small and explainable — one schema-constrained request,
// no chained prompts. Replaceable: swap this module to change providers.

const MODEL = process.env.LLM_MODEL || "claude-sonnet-4-6";

const SYSTEM = `You read U.S. SNAP (food assistance) notices and return structured facts only.

Rules:
- You classify and extract. You do NOT give advice, decide eligibility, or tell the user what to do.
- Use only information present in the notice text. Do not invent details.
- If a field is not present, return an empty string (or empty list for documents).
- Choose exactly one notice type. Set confidence (0 to 1) to reflect how clearly the text supports that type — be honest and use low values when the text is ambiguous.
- Keep "summary" to one plain, non-legal sentence. Keep "reasoning" brief and grounded in words that actually appear in the notice.`;

export function llmAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function llmExtract(text: string): Promise<{ extraction: NoticeExtraction; model: string }> {
  const client = new Anthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [{ role: "user", content: `Notice text:\n\n${text}` }],
    output_config: { format: zodOutputFormat(NoticeExtractionSchema) },
  });
  if (!res.parsed_output) throw new Error("LLM returned no parseable structured output");
  return { extraction: res.parsed_output, model: MODEL };
}
