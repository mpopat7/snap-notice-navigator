import { cx } from "@/lib/ui";

// Reusable human-in-the-loop / responsible-AI callout. Used at the review gate
// and on the results page to keep the user in control of every decision.

export default function HumanInLoopNote({
  title = "You’re in control",
  children,
  tone = "neutral",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "neutral" | "teal";
}) {
  return (
    <div
      className={cx(
        "flex gap-3 rounded-xl border p-4",
        tone === "teal"
          ? "border-teal-200 bg-teal-50"
          : "border-stone-200 bg-stone-50"
      )}
    >
      <span aria-hidden className="text-lg leading-none">🛡️</span>
      <div className="text-sm leading-relaxed text-stone-700">
        <p className="font-semibold text-stone-800">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
