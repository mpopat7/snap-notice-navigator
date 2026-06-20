import type { KBEntry } from "./types";

// Federal SNAP baseline (USDA Food and Nutrition Service). Always in scope —
// these apply to every state and are the fallback for unsupported states.

export const FEDERAL_KB: KBEntry[] = [
  {
    id: "fed-eligibility",
    scope: "federal",
    title: "SNAP Eligibility Overview",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    noticeTypes: ["any"],
    topics: ["general", "income_verification"],
    snippet:
      "SNAP eligibility depends on household size, income, and certain deductions (housing, childcare, medical). Gross income before deductions is compared to a limit; some deductions can lower the income that actually counts.",
  },
  {
    id: "fed-verification",
    scope: "federal",
    title: "Verifying Your Information for SNAP",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    noticeTypes: ["verification_request", "denial", "recertification"],
    topics: ["income_verification", "residency", "identity", "documents", "deadlines"],
    snippet:
      "States often ask for proof of income (recent pay stubs), identity, and where you live (lease, utility bill, or mail). Sending requested documents by the due date is usually what keeps a case open — benefits are most often lost to missed deadlines, not ineligibility.",
  },
  {
    id: "fed-fair-hearing",
    scope: "federal",
    title: "Your Right to a Fair Hearing",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/fair-hearing",
    noticeTypes: ["denial", "closure", "benefit_change"],
    topics: ["appeals_hearing", "deadlines"],
    snippet:
      "If you disagree with a decision, you have the right to request a fair hearing. There is a deadline to request one (often up to 90 days from the notice date). Requesting a hearing does not guarantee a different outcome, but it lets you explain your side.",
  },
  {
    id: "fed-recertification",
    scope: "federal",
    title: "Keeping Your SNAP Benefits (Recertification)",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/recipient/eligibility",
    noticeTypes: ["recertification", "closure"],
    topics: ["recertification", "deadlines", "documents"],
    snippet:
      "SNAP must be renewed periodically. Recertification usually requires completing an interview and returning a renewal form with current proof of income and any changes. Finishing before the deadline typically prevents a gap in benefits.",
  },
  {
    id: "fed-work-requirements",
    scope: "federal",
    title: "SNAP Work Requirements",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/work-requirements",
    noticeTypes: ["denial", "closure", "benefit_change"],
    topics: ["work_requirements"],
    snippet:
      "Some adults must meet work requirements to keep SNAP. Exemptions exist (for example for age, disability, or caring for a child). If a notice mentions work rules, an exemption may apply to your situation.",
  },
  {
    id: "fed-apply",
    scope: "federal",
    title: "How to Apply for SNAP",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/apply",
    noticeTypes: ["denial", "closure"],
    topics: ["reapply", "general"],
    snippet:
      "You can apply or reapply for SNAP at any time through your state agency. If your circumstances recently changed (for example your income dropped), a new application may be a faster path than an appeal.",
  },
  {
    id: "fed-state-directory",
    scope: "federal",
    title: "SNAP State Directory of Resources",
    publisher: "USDA Food and Nutrition Service",
    url: "https://www.fns.usda.gov/snap/state-directory",
    noticeTypes: ["any"],
    topics: ["office_contact", "general"],
    snippet:
      "Each state runs its own SNAP program and has its own offices and contact numbers. Your state agency makes the final decision on your case.",
  },
];
