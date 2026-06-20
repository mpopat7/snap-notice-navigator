import type { ActionContext, Confidence, NoticeType, Urgency } from "@/types/snap";

// States with deep, curated guidance in this MVP. Others fall back to federal baseline.
export const SUPPORTED_STATES = new Set(["CA", "TX", "MO"]);

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const HOUSEHOLD_SIZES = ["1", "2", "3", "4", "5", "6", "7", "8+"];

export const INCOME_BANDS = [
  "Under $1,000 / month",
  "$1,000–$2,000 / month",
  "$2,000–$3,000 / month",
  "Over $3,000 / month",
  "Prefer not to say",
];

export const LANGUAGES = [
  "English",
  "Spanish",
  "Chinese",
  "Vietnamese",
  "Tagalog",
  "Other",
];

export const ACTION_CONTEXTS: { value: ActionContext; label: string; hint: string }[] = [
  { value: "applying", label: "Applying", hint: "I’m a new applicant" },
  { value: "recertifying", label: "Recertifying", hint: "Renewing existing benefits" },
  { value: "appealing", label: "Appealing", hint: "I disagree with a decision" },
  { value: "responding", label: "Responding", hint: "Replying to a request" },
  { value: "unsure", label: "Not sure", hint: "Help me figure it out" },
];

// Presentation metadata for each notice type (calm, non-alarming colors).
export const NOTICE_META: Record<
  NoticeType,
  { label: string; description: string; badge: string; accent: string }
> = {
  denial: {
    label: "Denial notice",
    description: "The agency says an application or request was not approved.",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    accent: "border-rose-200",
  },
  verification_request: {
    label: "Request for verification",
    description: "The agency needs documents or information from you.",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accent: "border-amber-200",
  },
  recertification: {
    label: "Recertification / renewal",
    description: "It’s time to renew so benefits don’t stop.",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    accent: "border-sky-200",
  },
  closure: {
    label: "Closure / termination",
    description: "Benefits are ending or have ended.",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    accent: "border-rose-200",
  },
  benefit_change: {
    label: "Change in benefits",
    description: "Your benefit amount is changing.",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accent: "border-amber-200",
  },
  unknown: {
    label: "Needs a closer look",
    description: "We couldn’t confidently classify this notice yet.",
    badge: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
    accent: "border-stone-200",
  },
};

export const CONFIDENCE_META: Record<
  Confidence,
  { label: string; badge: string; note: string }
> = {
  high: {
    label: "Higher confidence",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    note: "This reading matches the notice closely, but it’s still an interpretation — not a decision.",
  },
  medium: {
    label: "Medium confidence",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    note: "This is our best reading. Please double-check against the notice and confirm with your agency.",
  },
  low: {
    label: "Lower confidence",
    badge: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
    note: "We’re not sure about this one. Consider contacting your local office or a benefits advocate.",
  },
};

export const URGENCY_META: Record<
  Urgency,
  { label: string; badge: string }
> = {
  now: { label: "Do this first", badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
  soon: { label: "Soon", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  later: { label: "When you can", badge: "bg-stone-100 text-stone-600 ring-1 ring-stone-200" },
};
