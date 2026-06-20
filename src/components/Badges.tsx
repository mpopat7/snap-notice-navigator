import { CONFIDENCE_META, NOTICE_META, URGENCY_META } from "@/lib/constants";
import { cx } from "@/lib/ui";
import type { Confidence, NoticeType, Urgency } from "@/types/snap";

const pill = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

export function NoticeTypeBadge({ type }: { type: NoticeType }) {
  const meta = NOTICE_META[type];
  return <span className={cx(pill, meta.badge)}>{meta.label}</span>;
}

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const meta = CONFIDENCE_META[confidence];
  return <span className={cx(pill, meta.badge)}>{meta.label}</span>;
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const meta = URGENCY_META[urgency];
  return <span className={cx(pill, meta.badge)}>{meta.label}</span>;
}
