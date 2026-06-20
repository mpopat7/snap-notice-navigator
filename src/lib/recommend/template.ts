import type { NoticeType } from "@/types/snap";
import type { NoticeUnderstanding } from "@/lib/analysis/schema";
import type { RecommendationDraft } from "./schema";

// Deterministic, offline fallback. Hedged language baked in. Used when no API key
// is set or the LLM call fails — so the demo always produces a safe, grounded result.

type Template = {
  explanation: string;
  likelyIssue: string;
  steps: { title: string; rationale: string; urgency: "now" | "soon" | "later" }[];
  documents: string[];
};

const TEMPLATES: Record<NoticeType, Template> = {
  denial: {
    explanation:
      "This notice likely means an application or request was not approved right now. It does not necessarily mean you can never get benefits — it reflects the agency's reading of the information it had.",
    likelyIssue:
      "Denials often come from income being counted before deductions, a one-time payment treated as ongoing, or missing information. Some deductions can lower the income that actually counts.",
    steps: [
      { title: "Read the stated reason and check it against your situation", rationale: "If a number or detail looks wrong, that's the basis for a hearing or a new application.", urgency: "now" },
      { title: "Consider requesting a fair hearing if you disagree", rationale: "You have the right to a hearing within the deadline on your notice. You decide whether to appeal.", urgency: "now" },
      { title: "Consider reapplying if your circumstances changed", rationale: "If income recently dropped, a fresh application may be faster than an appeal.", urgency: "soon" },
    ],
    documents: ["Recent pay stubs", "Proof of rent and utilities", "A copy of this notice"],
  },
  verification_request: {
    explanation:
      "This notice is likely asking you to send documents so your case can continue. It is usually a routine step, not a denial — the most important thing is meeting the due date.",
    likelyIssue:
      "Verification requests are common at application, renewal, or when records need updating. Benefits are most often lost to a missed deadline rather than ineligibility.",
    steps: [
      { title: "Submit the requested documents before the due date", rationale: "Sending what was asked on time is usually what keeps the case open.", urgency: "now" },
      { title: "Keep proof that you submitted", rationale: "An upload confirmation or fax receipt helps if the office says it wasn't received.", urgency: "soon" },
      { title: "Call if you can't get a document in time", rationale: "The office may allow more time or an alternative — but ask before the deadline.", urgency: "soon" },
    ],
    documents: ["Last 30 days of pay stubs", "Proof of address (lease, utility bill, or mail)", "A copy of this notice"],
  },
  recertification: {
    explanation:
      "This notice likely means it's time to renew your benefits and the renewal isn't finished yet. Completing it in time usually prevents a gap.",
    likelyIssue:
      "Renewals often stall because an interview wasn't scheduled or a form or document is missing — usually not because you no longer qualify.",
    steps: [
      { title: "Call to schedule your renewal interview", rationale: "The interview is the step people most often miss; calling early gives more options.", urgency: "now" },
      { title: "Return the renewal form and verification", rationale: "Submit the form with proof of current income and any changes.", urgency: "now" },
      { title: "If benefits lapse, ask about reinstatement", rationale: "Finishing shortly after a deadline may still restore benefits without a full new application.", urgency: "later" },
    ],
    documents: ["The renewal form from your notice", "Recent proof of income", "A copy of this notice"],
  },
  closure: {
    explanation:
      "This notice likely means benefits are ending or have ended. You may be able to act before the change takes effect, or reapply.",
    likelyIssue:
      "Closures often follow an unfinished renewal, a missed document, or a reported change. The reason on the notice points to what to address.",
    steps: [
      { title: "Check the reason and the effective date", rationale: "Acting before the change takes effect may let you keep benefits during an appeal.", urgency: "now" },
      { title: "Consider a hearing if you disagree", rationale: "You can request a hearing within the deadline on your notice.", urgency: "now" },
      { title: "Consider reapplying if you still need help", rationale: "You can reapply at any time through your state agency.", urgency: "soon" },
    ],
    documents: ["A copy of this notice", "Recent proof of income", "Any document the notice says was missing"],
  },
  benefit_change: {
    explanation:
      "This notice likely means your benefit amount is changing. The notice should state the new amount and the reason.",
    likelyIssue:
      "Benefit amounts can change when income, household size, or expenses change. If the change looks wrong, the figures used are worth checking.",
    steps: [
      { title: "Compare the new amount and reason to your situation", rationale: "If the income or household details look off, that's the basis to follow up.", urgency: "now" },
      { title: "Consider a hearing if you disagree", rationale: "You can request a hearing within the deadline on your notice.", urgency: "soon" },
    ],
    documents: ["A copy of this notice", "Recent proof of income", "Proof of household expenses"],
  },
  unknown: {
    explanation:
      "We couldn't confidently tell what this notice is. Please read it carefully and, if anything is time-sensitive, rely on your local office.",
    likelyIssue: "The notice text wasn't clear enough to identify a specific issue.",
    steps: [
      { title: "Contact your local SNAP office for anything time-sensitive", rationale: "They can tell you exactly what this notice means for your case.", urgency: "now" },
    ],
    documents: ["A copy of this notice", "Recent proof of income"],
  },
};

export function recommendTemplate(understanding: NoticeUnderstanding): RecommendationDraft {
  const t = TEMPLATES[understanding.noticeType];
  const deadline = understanding.fields.deadline;

  const steps = t.steps.map((s, i) => ({
    ...s,
    // Attach a detected deadline to the first, most-urgent step.
    deadline: i === 0 && deadline ? deadline : "",
  }));

  const documents =
    understanding.fields.requestedDocuments.length > 0
      ? understanding.fields.requestedDocuments
      : t.documents;

  return {
    explanation: t.explanation,
    likelyIssue: understanding.fields.likelyIssue
      ? `The notice gives this reason: "${understanding.fields.likelyIssue}". ${t.likelyIssue}`
      : t.likelyIssue,
    steps,
    documents,
    escalation: understanding.lowConfidence
      ? "This reading is uncertain. Please confirm with your local SNAP office or a benefits advocate before acting."
      : "",
  };
}
