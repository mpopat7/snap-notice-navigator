// Makes the human-in-the-loop design visible: the tool explains, the user
// decides, the agency makes the official call. Calm, three-role layout.

const ROLES = [
  { icon: "🧭", who: "This tool", does: "explains your notice and suggests possible steps" },
  { icon: "🫶", who: "You", does: "decide what to do next — you stay in control" },
  { icon: "🏛️", who: "Your SNAP agency", does: "makes the official, final decision" },
];

export default function HumanLoopStrip() {
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 sm:p-5">
      <ol className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((r, i) => (
          <li key={r.who} className="relative flex items-start gap-3 sm:block sm:text-center">
            <span aria-hidden className="text-xl sm:block sm:mb-1">{r.icon}</span>
            <div>
              <p className="text-sm font-semibold text-teal-900">{r.who}</p>
              <p className="text-xs leading-relaxed text-teal-900/80">{r.does}</p>
            </div>
            {i < ROLES.length - 1 && (
              <span
                aria-hidden
                className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-teal-400 sm:inline"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
