"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import HumanInLoopNote from "@/components/HumanInLoopNote";
import HumanLoopStrip from "@/components/HumanLoopStrip";
import ConfidenceMeter from "@/components/ConfidenceMeter";
import { ConfidenceBadge, NoticeTypeBadge, UrgencyBadge } from "@/components/Badges";
import { getAnalysis } from "@/lib/analyze";
import { clearDraft, readDraft, writeDraft } from "@/lib/session";
import { btnGhost, btnPrimary, btnSecondary, card, cx } from "@/lib/ui";
import type { NoticeUnderstanding } from "@/lib/analysis/schema";
import type { Recommendation } from "@/lib/recommend";

export default function ResultsPage() {
  const router = useRouter();
  const [understanding, setUnderstanding] = useState<NoticeUnderstanding | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = readDraft();
    if (!draft.rawText) {
      router.replace("/upload");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: draft.rawText, intake: draft.intake ?? {} }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok) {
          setUnderstanding(data.understanding);
          setRec(data.recommendation);
          writeDraft({ understanding: data.understanding });
        } else {
          setError(data.message ?? "We couldn’t put together your results.");
        }
      } catch {
        if (!cancelled) setRec(fallbackRecommendation(draft)); // offline / network blip
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Stepper current={4} />
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-stone-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
          Reading your notice, classifying it, and matching it to official guidance…
        </p>
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-20 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Stepper current={4} />
        <div className={cx(card, "p-8 text-center")}>
          <span aria-hidden className="text-3xl">🌥️</span>
          <h1 className="mt-3 text-lg font-semibold text-stone-900">Let’s try that again</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
            {error ?? "Something went wrong putting your results together."} Your
            notice text is safe — you can go back and check it, or start over.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={() => router.push("/review")} className={btnSecondary}>
              ← Back to my notice text
            </button>
            <button
              onClick={() => {
                clearDraft();
                router.push("/upload");
              }}
              className={btnPrimary}
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  const noticeType = understanding?.noticeType ?? "unknown";
  const band = understanding?.confidenceBand ?? "low";
  const headline = understanding?.summary ?? "Here’s what we found in your notice.";
  const agency = understanding?.fields.agencyName ?? "";
  const deadline = understanding?.fields.deadline ?? "";

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <Stepper current={4} />

      {!rec.stateSupported && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <span aria-hidden>ℹ️</span>
          <p>
            We have detailed guidance for a few states so far. For your state we’re
            showing <strong>federal baseline</strong> guidance — still useful, but
            please confirm specifics with your state agency.
          </p>
        </div>
      )}

      {/* Status */}
      <section className={cx(card, "p-5 sm:p-6")}>
        <div className="flex flex-wrap items-center gap-2">
          <NoticeTypeBadge type={noticeType} />
          <ConfidenceBadge confidence={band} />
        </div>
        <h1 className="mt-4 text-xl font-bold leading-snug tracking-tight text-stone-900 sm:text-2xl">
          {headline}
        </h1>
        {agency && <p className="mt-2 text-sm text-stone-500">From: {agency}</p>}
        {deadline && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <span aria-hidden>⏰</span>
            <p className="text-sm font-medium text-amber-900">{deadline}</p>
          </div>
        )}
      </section>

      {/* Human-in-the-loop, made visible */}
      <div className="mt-4">
        <HumanLoopStrip />
      </div>

      {/* Low-confidence: supportive, not alarming */}
      {band === "low" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <span aria-hidden className="text-lg">🤝</span>
          <div className="text-sm leading-relaxed text-amber-900">
            <p className="font-semibold">We’re not fully sure about this one — and that’s okay.</p>
            <p className="mt-1">
              {rec.escalation ??
                "Please double-check the details against your notice, and consider contacting your local SNAP office or a free benefits advocate. They can confirm what this means for your case."}
            </p>
          </div>
        </div>
      )}

      {/* Meaning first */}
      <Section title="What this notice likely means">
        <p className="text-sm leading-relaxed text-stone-700">{rec.explanation}</p>
      </Section>

      <Section title="Why this may have happened">
        <p className="text-sm leading-relaxed text-stone-700">{rec.likelyIssue}</p>
      </Section>

      {/* Primary action — visually emphasized */}
      <section className={cx(card, "mt-4 border-teal-200 p-5 sm:p-6")}>
        <div className="mb-3 flex items-center gap-2">
          <span aria-hidden className="text-base">✅</span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            What you can do next
          </h2>
        </div>
        <p className="mb-3 text-xs text-stone-500">
          These are options, not instructions — you choose what makes sense for you.
        </p>
        <ol className="space-y-3">
          {rec.steps.map((s, i) => (
            <li key={i} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-stone-900">
                  {i + 1}. {s.title}
                </h3>
                <UrgencyBadge urgency={s.urgency} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.rationale}</p>
              {s.deadline && (
                <p className="mt-2 text-xs font-medium text-amber-700">Deadline: {s.deadline}</p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <Section title="Documents to gather">
        <ul className="space-y-2">
          {rec.documents.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm text-stone-700">
              <span aria-hidden className="mt-0.5 text-teal-600">▢</span>
              {d}
            </li>
          ))}
        </ul>
      </Section>

      {/* Official sources — trust anchor card */}
      <section className={cx(card, "mt-4 p-5 sm:p-6")}>
        <div className="mb-1 flex items-center gap-2">
          <span aria-hidden className="text-base">📎</span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
            Official sources behind this guidance
          </h2>
        </div>
        <p className="mb-3 text-xs text-stone-500">
          Everything above is based on these official pages — not guesses.
        </p>
        <ul className="space-y-3">
          {rec.sources.map((s) => (
            <li key={s.url + s.title} className="text-sm">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800"
              >
                {s.title} ↗
              </a>
              <span className="block text-xs text-stone-500">{s.publisher}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Need more help — human support card */}
      <section className={cx(card, "mt-4 border-teal-200 bg-teal-50/40 p-5 sm:p-6")}>
        <div className="mb-3 flex items-center gap-2">
          <span aria-hidden className="text-base">🤙</span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Need more help from a person?
          </h2>
        </div>
        <ul className="space-y-3">
          {rec.help.map((h) => (
            <li key={h.name} className="rounded-xl border border-stone-200 bg-white p-4">
              <p className="text-sm font-semibold text-stone-900">{h.name}</p>
              <p className="text-sm text-stone-600">{h.detail}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {h.phone && <span className="font-medium text-stone-700">📞 {h.phone}</span>}
                {h.url && (
                  <a
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-teal-700 underline underline-offset-2"
                  >
                    Visit website ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Transparency, tucked away to keep cognitive load low */}
      {understanding && (
        <details className={cx(card, "group mt-4 p-5 sm:p-6")}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-stone-700">
            <span>See how we read your notice</span>
            <span aria-hidden className="text-stone-400 transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-4 space-y-4">
            <ConfidenceMeter confidence={understanding.confidence} band={understanding.confidenceBand} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Our reasoning</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">{understanding.reasoning}</p>
              <p className="mt-2 text-xs text-stone-400">
                {rec.source === "llm"
                  ? "Guidance generated from official sources by an AI model and curated rules."
                  : "Guidance from curated rules and templates (offline mode)."}
              </p>
            </div>
            <ExtractedFieldsView understanding={understanding} />
          </div>
        </details>
      )}

      {/* Persistent disclaimer */}
      <div className="mt-6">
        <HumanInLoopNote title="This is guidance, not a decision">
          This explanation may not be perfect, and it does not decide whether you
          qualify or whether you should appeal. Your state SNAP agency makes the
          final decision. You choose what to do next — and you can always call the
          number on your notice or a benefits advocate.
        </HumanInLoopNote>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => router.push("/intake")} className={btnGhost}>
          ← Edit my answers
        </button>
        <button
          onClick={() => {
            clearDraft();
            router.push("/upload");
          }}
          className={btnSecondary}
        >
          Start over with a new notice
        </button>
      </div>
    </div>
  );
}

function fallbackRecommendation(draft: ReturnType<typeof readDraft>): Recommendation {
  const a = getAnalysis(draft);
  return {
    explanation: a.explanation,
    likelyIssue: a.likelyIssue,
    steps: a.steps,
    documents: a.documents,
    sources: a.sources,
    help: a.help,
    escalation: a.lowConfidenceNote,
    stateSupported: true,
    source: "template",
  };
}

function ExtractedFieldsView({ understanding }: { understanding: NoticeUnderstanding }) {
  const f = understanding.fields;
  const rows = [
    { label: "Agency", value: f.agencyName },
    { label: "Date on notice", value: f.noticeDate },
    { label: "Case number", value: f.caseNumber },
    { label: "Deadline", value: f.deadline },
    { label: "Stated reason / issue", value: f.likelyIssue },
    { label: "Contact", value: f.contactInfo },
  ].filter((r) => r.value.trim().length > 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">What we found in the notice</p>
        {rows.length > 0 ? (
          <dl className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-xs font-medium text-stone-500">{r.label}</dt>
                <dd className="text-sm text-stone-800">{r.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-1 text-sm text-stone-500">We couldn’t pull specific fields out of this text.</p>
        )}
      </div>

      {f.requestedDocuments.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Documents the notice asks for</p>
          <ul className="mt-1 space-y-1">
            {f.requestedDocuments.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-stone-700">
                <span aria-hidden className="mt-0.5 text-teal-600">▢</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={cx(card, "mt-4 p-5 sm:p-6")}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">{title}</h2>
      {children}
    </section>
  );
}
