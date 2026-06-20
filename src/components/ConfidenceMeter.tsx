import { CONFIDENCE_META } from "@/lib/constants";
import { cx } from "@/lib/ui";
import type { Confidence } from "@/types/snap";

const FILL: Record<Confidence, number> = { low: 1, medium: 2, high: 3 };
const BAR: Record<Confidence, string> = {
  low: "bg-stone-400",
  medium: "bg-amber-400",
  high: "bg-emerald-500",
};

// Calm, non-alarming confidence display: three segments + the honest caveat.
export default function ConfidenceMeter({
  confidence,
  band,
}: {
  confidence: number;
  band: Confidence;
}) {
  const filled = FILL[band];
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cx("h-2 w-7 rounded-full", i < filled ? BAR[band] : "bg-stone-200")}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-stone-600">
          {CONFIDENCE_META[band].label} · {Math.round(confidence * 100)}%
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-stone-500">{CONFIDENCE_META[band].note}</p>
    </div>
  );
}
