import Link from "next/link";
import HumanLoopStrip from "@/components/HumanLoopStrip";
import { btnPrimary, btnSecondary, card, cx } from "@/lib/ui";

const VALUE_PROPS = [
  {
    title: "Plain language, not legalese",
    body: "We translate confusing government wording into clear, everyday English so you know what the notice is actually saying.",
  },
  {
    title: "Next steps, not guesses",
    body: "Get a short, prioritized checklist of what you can do — with the reason behind each step and any deadlines we spot.",
  },
  {
    title: "Official sources, not false certainty",
    body: "Every suggestion points to official USDA and state pages. We never claim you do or don’t qualify — your agency decides.",
  },
];

const HOW_IT_WORKS = [
  { n: "1", t: "Add your notice", d: "Upload it or paste the text. You can also try a sample." },
  { n: "2", t: "Review the text", d: "Check what we read before anything is analyzed." },
  { n: "3", t: "Answer a few questions", d: "A short, calm set of questions about your situation." },
  { n: "4", t: "Get your next steps", d: "A clear explanation and an action checklist." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5">
      {/* Hero */}
      <section className="py-12 sm:py-24">
        <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
          For people who got a confusing SNAP letter
        </span>
        <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Understand your SNAP notice in plain language.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
          Got a denial, a request for documents, or a renewal letter you don’t
          understand? Add it here and get a clear explanation plus possible next
          steps — calmly, and at your own pace.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/upload" className={btnPrimary}>
            Start with my notice →
          </Link>
          <Link href="/upload" className={btnSecondary}>
            Try a sample notice
          </Link>
        </div>
        <p className="mt-4 text-sm text-stone-500">
          Free · No account needed · Your text stays in your browser for this preview.
        </p>
      </section>

      {/* Value props */}
      <section className="grid gap-4 pb-12 sm:grid-cols-3">
        {VALUE_PROPS.map((v) => (
          <div key={v.title} className={cx(card, "p-6")}>
            <h2 className="text-base font-semibold text-stone-900">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{v.body}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="pb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          How it works
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-4">
          {HOW_IT_WORKS.map((s) => (
            <li key={s.n} className={cx(card, "p-5")}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-stone-900">{s.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Who decides what (human-in-the-loop) */}
      <section className="pb-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Who decides what
        </h2>
        <HumanLoopStrip />
      </section>

      {/* Responsible AI strip */}
      <section className="mb-16">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <h2 className="text-base font-semibold text-teal-900">
            Built to be careful with your situation
          </h2>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-teal-900/90 sm:grid-cols-2">
            <li>• We say “this may mean” — never “you definitely qualify.”</li>
            <li>• You review the notice text before anything is analyzed.</li>
            <li>• Every recommendation shows its official source.</li>
            <li>• Your state SNAP agency makes all final decisions, not us.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
