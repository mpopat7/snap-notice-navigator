import type { KBEntry, StateReferrals } from "./types";

// Deeply-supported states. Add a state by adding its entries here and to
// SUPPORTED_STATES in src/lib/constants.ts — nothing else changes.

export const STATE_KB: KBEntry[] = [
  // ---------- California (CalFresh) ----------
  {
    id: "ca-overview",
    scope: "CA",
    title: "CalFresh (California SNAP) — Overview & Apply",
    publisher: "California Department of Social Services",
    url: "https://www.cdss.ca.gov/calfresh",
    noticeTypes: ["any"],
    topics: ["general", "reapply", "income_verification"],
    snippet:
      "CalFresh is California's SNAP program, run by county offices. You can apply or check your case online at GetCalFresh.org or through your county.",
  },
  {
    id: "ca-hearing",
    scope: "CA",
    title: "CalFresh State Hearing Requests",
    publisher: "California Department of Social Services",
    url: "https://www.cdss.ca.gov/hearing-requests",
    noticeTypes: ["denial", "closure", "benefit_change"],
    topics: ["appeals_hearing", "deadlines"],
    snippet:
      "If you disagree with a CalFresh decision, you can request a state hearing, generally within 90 days of the notice. You may keep benefits during the appeal if you request the hearing before the change takes effect.",
  },
  {
    id: "ca-docs",
    scope: "CA",
    title: "CalFresh — Submitting Documents & Verifications",
    publisher: "GetCalFresh (Code for America)",
    url: "https://www.getcalfresh.org",
    noticeTypes: ["verification_request", "recertification", "denial"],
    topics: ["documents", "income_verification", "residency", "identity", "deadlines"],
    snippet:
      "You can upload requested documents (pay stubs, ID, proof of address) to your county online. Keep the confirmation in case the office says it wasn't received.",
  },

  // ---------- Texas (SNAP / HHSC) ----------
  {
    id: "tx-overview",
    scope: "TX",
    title: "Texas SNAP Food Benefits",
    publisher: "Texas Health and Human Services",
    url: "https://www.hhs.texas.gov/services/food/snap-food-benefits",
    noticeTypes: ["any"],
    topics: ["general", "reapply", "income_verification"],
    snippet:
      "Texas runs SNAP through HHSC. You manage your case, submit documents, and renew at YourTexasBenefits.com or by phone at 2-1-1.",
  },
  {
    id: "tx-manage",
    scope: "TX",
    title: "Your Texas Benefits — Manage Your Case",
    publisher: "Texas HHSC",
    url: "https://www.yourtexasbenefits.com",
    noticeTypes: ["verification_request", "recertification"],
    topics: ["documents", "income_verification", "residency", "deadlines"],
    snippet:
      "Upload requested documents (like Form H1020 items: pay stubs and proof of address) before the due date at YourTexasBenefits.com. Missing the deadline can pause or stop benefits.",
  },
  {
    id: "tx-appeals",
    scope: "TX",
    title: "Texas — Appeals and Fair Hearings",
    publisher: "Texas HHSC",
    url: "https://www.hhs.texas.gov/about/your-rights/appeals-fair-hearings",
    noticeTypes: ["denial", "closure", "benefit_change"],
    topics: ["appeals_hearing", "deadlines"],
    snippet:
      "If you disagree with an HHSC decision, you can request a fair hearing. There is a limited time to ask, so act soon after the notice date.",
  },

  // ---------- Missouri (Food Stamps / FSD) ----------
  {
    id: "mo-overview",
    scope: "MO",
    title: "Missouri Food Assistance (SNAP)",
    publisher: "Missouri Department of Social Services",
    url: "https://mydss.mo.gov/food-assistance",
    noticeTypes: ["any"],
    topics: ["general", "recertification", "reapply"],
    snippet:
      "Missouri's SNAP program is run by the Family Support Division. You can apply, renew, and upload documents through myDSS, or call the FSD information line.",
  },
  {
    id: "mo-recert",
    scope: "MO",
    title: "Missouri — Renewals and Interviews",
    publisher: "Missouri Family Support Division",
    url: "https://mydss.mo.gov/food-assistance",
    noticeTypes: ["recertification", "closure", "verification_request"],
    topics: ["recertification", "deadlines", "documents"],
    snippet:
      "Renewing Missouri SNAP usually means completing an interview and returning a renewal form with verification before benefits end. If you finish shortly after a lapse, ask whether benefits can be reinstated without a full new application.",
  },
  {
    id: "mo-appeals",
    scope: "MO",
    title: "Missouri — Hearing Rights",
    publisher: "Missouri Department of Social Services",
    url: "https://mydss.mo.gov/food-assistance",
    noticeTypes: ["denial", "closure", "benefit_change"],
    topics: ["appeals_hearing", "deadlines"],
    snippet:
      "You can ask for a hearing if you disagree with a Missouri SNAP decision. Note the deadline on your notice and call the number listed to start the request.",
  },
];

const REFERRAL_211 = {
  name: "Call 211",
  detail: "Free, confidential help finding local food and benefits support, 24/7.",
  phone: "211",
  url: "https://www.211.org",
};

export const STATE_REFERRALS: StateReferrals[] = [
  {
    state: "CA",
    referrals: [
      REFERRAL_211,
      { name: "Bay Area Legal Aid", detail: "Free help with CalFresh denials and state hearings.", url: "https://baylegal.org" },
    ],
  },
  {
    state: "TX",
    referrals: [
      REFERRAL_211,
      { name: "Texas Legal Services Center", detail: "Free legal help with benefits problems.", url: "https://www.tlsc.org" },
    ],
  },
  {
    state: "MO",
    referrals: [
      REFERRAL_211,
      { name: "Missouri Family Support Division", detail: "Schedule your interview and ask case questions.", phone: "(855) 373-4636" },
    ],
  },
];

export const FEDERAL_REFERRALS = [
  REFERRAL_211,
  {
    name: "Find your local SNAP office",
    detail: "Your state agency makes the final decision — contact them for case-specific answers.",
    url: "https://www.fns.usda.gov/snap/state-directory",
  },
];
