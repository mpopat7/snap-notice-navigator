import { cx } from "@/lib/ui";

const STEPS = ["Upload", "Review text", "Questions", "Results"];

// 1-based current step. Steps before it render as complete.
export default function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const state =
            step < current ? "done" : step === current ? "active" : "upcoming";
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-current={state === "active" ? "step" : undefined}
                  className={cx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1",
                    state === "done" && "bg-teal-700 text-white ring-teal-700",
                    state === "active" && "bg-teal-50 text-teal-700 ring-teal-300",
                    state === "upcoming" && "bg-white text-stone-400 ring-stone-200"
                  )}
                >
                  {state === "done" ? "✓" : step}
                </span>
                <span
                  className={cx(
                    "hidden text-xs font-medium sm:inline",
                    state === "upcoming" ? "text-stone-400" : "text-stone-700"
                  )}
                >
                  {label}
                </span>
              </div>
              {step < STEPS.length && (
                <span
                  className={cx(
                    "h-px flex-1",
                    step < current ? "bg-teal-300" : "bg-stone-200"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
