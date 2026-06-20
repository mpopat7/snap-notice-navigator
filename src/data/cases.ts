import type { MockCase } from "@/types/snap";

// Seeded demo cases. The notice text is synthetic (no real PII) and the analysis
// is hand-authored placeholder content for Phase 1. In later phases this analysis
// will be produced by the OCR + LLM + retrieval pipeline instead of being static.

const USDA_ELIGIBILITY = {
  title: "SNAP Eligibility Overview",
  publisher: "USDA Food and Nutrition Service",
  url: "https://www.fns.usda.gov/snap/recipient/eligibility",
};

const USDA_HEARING = {
  title: "Your Right to a Fair Hearing",
  publisher: "USDA Food and Nutrition Service",
  url: "https://www.fns.usda.gov/snap/fair-hearing",
};

const referral211 = {
  name: "Call 211",
  detail: "Free, confidential help finding local food and benefits support, 24/7.",
  phone: "211",
  url: "https://www.211.org",
};

export const MOCK_CASES: MockCase[] = [
  {
    id: "denial-ca",
    label: "Denial notice",
    blurb: "A CalFresh application was denied for income over the limit.",
    noticeType: "denial",
    suggestedIntake: { state: "CA", actionContext: "appealing" },
    rawText: `COUNTY OF ALAMEDA SOCIAL SERVICES AGENCY
CalFresh (SNAP) — Notice of Action
Date: March 4, 2025
Case Number: 1234567

We reviewed your application for CalFresh benefits dated February 15, 2025.

YOUR APPLICATION HAS BEEN DENIED.

Reason: Your household's countable monthly income is over the gross income
limit for your household size. (MPP 63-409; 7 CFR 273.9)

If you disagree with this decision, you have the right to ask for a state
hearing. You must request a hearing within 90 days of the date of this notice.

Questions? Contact your county worker at (510) 555-0148.`,
    analysis: {
      noticeType: "denial",
      confidence: "high",
      headline:
        "This notice says your CalFresh (SNAP) application was denied because the income you reported looked higher than the limit for your household size.",
      agency: "Alameda County Social Services Agency (CalFresh)",
      deadline: "You have 90 days from March 4, 2025 to request a state hearing (about June 2, 2025).",
      keyFields: [
        { label: "Notice type", value: "Denial (Notice of Action)" },
        { label: "Date on notice", value: "March 4, 2025" },
        { label: "Case number", value: "1234567" },
        { label: "Stated reason", value: "Countable monthly income over the gross income limit" },
        { label: "Hearing deadline", value: "Within 90 days of the notice date" },
        { label: "Phone on notice", value: "(510) 555-0148" },
      ],
      explanation:
        "The county looked at your application and decided not to approve it right now. The reason they gave is that the income they counted for your household appears to be above the cutoff for your household size. This is the county's reading of the numbers they had — it is possible some income was counted that shouldn't be, or that your situation has changed.",
      likelyIssue:
        "This often happens when gross income (before deductions) is used, when a one-time or irregular payment got counted as ongoing income, or when household size was recorded differently than expected. Some deductions (like housing or childcare costs) can also lower the income that counts — these may not have been included yet.",
      steps: [
        {
          title: "Read the reason and check the numbers",
          rationale:
            "Compare the income on the notice to what you actually earn each month. If it looks too high, note what seems off — that's the basis for a hearing or a new application.",
          urgency: "now",
        },
        {
          title: "Decide whether to request a state hearing",
          rationale:
            "If you believe the income was counted incorrectly, you can ask for a hearing. You have 90 days, but acting sooner keeps your options open. You — not this app — decide whether to appeal.",
          urgency: "now",
          deadline: "Within 90 days of March 4, 2025",
        },
        {
          title: "Gather proof of your income and deductions",
          rationale:
            "Recent pay stubs, plus proof of rent, utilities, and childcare, can show a lower countable income.",
          urgency: "soon",
        },
        {
          title: "Consider reapplying if your situation changed",
          rationale:
            "If your income recently dropped, a fresh application may be the faster path than a hearing.",
          urgency: "later",
        },
      ],
      documents: [
        "Last 30 days of pay stubs for everyone in the household",
        "Proof of rent or mortgage",
        "Utility bills",
        "Childcare or dependent-care costs, if any",
        "A copy of this denial notice",
      ],
      sources: [
        USDA_ELIGIBILITY,
        USDA_HEARING,
        {
          title: "CalFresh — How to Apply & State Hearings",
          publisher: "California Department of Social Services",
          url: "https://www.cdss.ca.gov/calfresh",
        },
      ],
      help: [
        referral211,
        {
          name: "Bay Area Legal Aid",
          detail: "Free help with CalFresh denials and state hearings.",
          url: "https://baylegal.org",
        },
      ],
    },
  },
  {
    id: "verification-tx",
    label: "Request for verification",
    blurb: "Texas HHSC needs income and address documents to keep benefits going.",
    noticeType: "verification_request",
    suggestedIntake: { state: "TX", actionContext: "responding" },
    rawText: `TEXAS HEALTH AND HUMAN SERVICES COMMISSION
Request for Information / Verification — Form H1020
Date: April 10, 2025
Case Number: 100200300

To keep your SNAP (food) benefits, we need more information from you.

Please provide the following by April 24, 2025:
  - Proof of income for everyone in your home (last 30 days of pay stubs)
  - Proof of your current address (lease, utility bill, or recent mail)

If we do not receive these documents by the due date, your benefits may be
denied or stopped.

You can upload documents at YourTexasBenefits.com or send them to your local
office by mail or fax.`,
    analysis: {
      noticeType: "verification_request",
      confidence: "high",
      headline:
        "This notice is asking you to send documents so your SNAP benefits can continue — it is not a denial.",
      agency: "Texas Health and Human Services Commission (HHSC)",
      deadline: "Documents are due April 24, 2025. Missing this date may pause or stop benefits.",
      keyFields: [
        { label: "Notice type", value: "Request for verification (Form H1020)" },
        { label: "Date on notice", value: "April 10, 2025" },
        { label: "Case number", value: "100200300" },
        { label: "Due date", value: "April 24, 2025" },
        { label: "Requested", value: "Proof of income (30 days), proof of address" },
        { label: "How to submit", value: "YourTexasBenefits.com, or mail/fax to local office" },
      ],
      explanation:
        "The state needs a couple of documents to confirm your case details. As long as you send what they asked for by the due date, this is usually a routine step — not a sign that anything is wrong. The most important thing is meeting the deadline.",
      likelyIssue:
        "Verification requests are common at application, renewal, or when records need updating. Benefits are most often lost not because someone didn't qualify, but because the documents arrived late or were incomplete.",
      steps: [
        {
          title: "Submit the requested documents before the due date",
          rationale:
            "This is the single most important action. Uploading online is usually fastest and gives you a confirmation.",
          urgency: "now",
          deadline: "By April 24, 2025",
        },
        {
          title: "Keep proof that you submitted",
          rationale:
            "Save the upload confirmation or fax receipt in case the office says they didn't receive it.",
          urgency: "soon",
        },
        {
          title: "Call if you can't get a document in time",
          rationale:
            "If something is hard to obtain, the office may give more time or accept an alternative — but you have to ask before the deadline.",
          urgency: "soon",
        },
      ],
      documents: [
        "Last 30 days of pay stubs for each working household member",
        "A lease, utility bill, or piece of recent mail showing your address",
        "A copy of this request notice (so you have the case number handy)",
      ],
      sources: [
        USDA_ELIGIBILITY,
        {
          title: "Your Texas Benefits — Manage your case",
          publisher: "Texas HHSC",
          url: "https://www.yourtexasbenefits.com",
        },
      ],
      help: [
        referral211,
        {
          name: "Texas SNAP Hotline",
          detail: "Questions about your case and what counts as proof.",
          phone: "2-1-1, then option 2",
        },
      ],
    },
  },
  {
    id: "recert-mo",
    label: "Recertification issue",
    blurb: "A Missouri renewal is incomplete and benefits will stop without action.",
    noticeType: "recertification",
    suggestedIntake: { state: "MO", actionContext: "recertifying" },
    rawText: `MISSOURI DEPARTMENT OF SOCIAL SERVICES
Family Support Division — SNAP Recertification (Renewal) Notice
Date: May 1, 2025
Case Number: MO-558877

Your SNAP benefits are scheduled to end on May 31, 2025.

To keep receiving benefits, you must complete your recertification:
  1. Complete the renewal interview.
  2. Return the renewal form and required verification.

Our records show your recertification is not yet complete. If you do not
finish your recertification by May 31, 2025, your benefits will stop and you
may need to reapply.

Call (855) 555-0199 to schedule your interview.`,
    analysis: {
      noticeType: "recertification",
      confidence: "medium",
      headline:
        "This notice says it's time to renew your SNAP benefits, and the renewal isn't finished yet — without action, benefits may stop at the end of the month.",
      agency: "Missouri Family Support Division",
      deadline: "Complete the renewal by May 31, 2025 to avoid a gap in benefits.",
      keyFields: [
        { label: "Notice type", value: "Recertification / renewal" },
        { label: "Date on notice", value: "May 1, 2025" },
        { label: "Case number", value: "MO-558877" },
        { label: "Benefits end", value: "May 31, 2025" },
        { label: "Required", value: "Renewal interview + renewal form + verification" },
        { label: "Phone on notice", value: "(855) 555-0199" },
      ],
      explanation:
        "SNAP has to be renewed periodically. This notice is letting you know your renewal is due and not yet complete. Two things are usually needed: a short interview and a renewal form with supporting documents. If both are done in time, benefits typically continue without a break.",
      likelyIssue:
        "Renewals often stall because the interview wasn't scheduled, the form wasn't returned, or a document was missing. It usually isn't about whether you still qualify — it's about completing the steps before the deadline.",
      steps: [
        {
          title: "Call to schedule your renewal interview",
          rationale:
            "The interview is often the step people miss. Calling early gives you the most appointment choices before the deadline.",
          urgency: "now",
          deadline: "Before May 31, 2025",
        },
        {
          title: "Return the renewal form and verification",
          rationale:
            "Submit the form along with proof of income and any changes (address, household, expenses).",
          urgency: "now",
          deadline: "Before May 31, 2025",
        },
        {
          title: "If benefits lapse, ask about reinstatement",
          rationale:
            "If the deadline passes, finishing the renewal shortly after may still restore benefits without a full new application — ask the office.",
          urgency: "later",
        },
      ],
      documents: [
        "The renewal form included with your notice",
        "Recent pay stubs or proof of current income",
        "Proof of any changes: address, household members, rent, utilities",
        "A copy of this recertification notice",
      ],
      sources: [
        USDA_ELIGIBILITY,
        {
          title: "Missouri SNAP / Food Stamps — Renewals",
          publisher: "Missouri Department of Social Services",
          url: "https://mydss.mo.gov/food-assistance",
        },
      ],
      help: [
        referral211,
        {
          name: "Missouri Family Support Division",
          detail: "Schedule your interview and ask renewal questions.",
          phone: "(855) 373-4636",
        },
      ],
      lowConfidenceNote:
        "Renewal steps vary by county and by how far along your renewal already is. Please confirm exactly what's outstanding by calling the number on your notice.",
    },
  },
];

export function getCase(id: string | undefined): MockCase | undefined {
  return MOCK_CASES.find((c) => c.id === id);
}
