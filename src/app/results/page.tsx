"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import HumanInLoopNote from "@/components/HumanInLoopNote";
import { ConfidenceBadge, NoticeTypeBadge, UrgencyBadge } from "@/components/Badges";
import { CONFIDENCE_META } from "@/lib/constants";
import { getAnalysis } from "@/lib/analyze";
import { clearDraft, readDraft, writeDraft } from "@/lib/session";
import { card, btnGhost, btnSecondary, cx } from "@/lib/ui";
import type { NoticeUnderstanding } from "@/lib/analysis/schema";
import type { Recommendation } from "@/lib/recommend";

export default function ResultsPage() {
  const router = useRouter();
  const [understanding, setUnderstanding] = useState<NoticeUnderstanding | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (!cancelled && data.ok) {
          setUnderstanding(data.understanding);
          setRec(data.recommendation);
          writeDraft({ understanding: data.understanding });
          return;
        }
        if (!cancelled) setRec(fallbackRecommendation(draft));
      } catch {
        // API unreachable — fall back to the seeded/mock recommendation
        if (!cancelled) setRec(fallbackRecommendation(draft));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !rec) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Stepper current={4} />
        <p className="mb-4 text-sm font-medium text-stone-600">
          Reading your notice, classifying it, and matching it to official guidance…
        </p>
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      </div>
    );
  }

  const noticeType = understanding?.noticeType ?? "unknown";
  const confidenceBand = understanding?.confidenceBand ?? "low";
  const headline = understanding?.summary ?? "Here’s what we found in your notice.";
  const agency = understanding?.fields.agencyName ?? "";
  const deadline = understanding?.fields.deadline ?? "";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Stepper current={4} />

      {/* Limited-support banner for unsupported states */}
      {!rec.stateSupported && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <span aria-hidden>ℹ️</span>
          <p>
            We have detailed guidance for a few states so far. For your state we’re
            showing <strong>federal baseline</strong> guidance — still useful, but
            confirm specifics with your state agency.
          </p>
        </div>
      )}

      {/* Top status card */}
      <section className={cx(card, "p-6")}>
        <div className="flex flex-wrap items-center gap-2">
          <NoticeTypeBadge type={noticeType} />
          <ConfidenceBadge confidence={confidenceBand} />
        </div>
        <h1 className="mt-4 text-xl font-bold leading-snug tracking-tight text-stone-900">{headline}</h1>
        {agency && <p className="mt-2 text-sm text-stone-500">From: {agency}</p>}
        {deadline && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <span aria-hidden>⏰</span>
            <p className="text-sm font-medium text-amber-900">{deadline}</p>
          </div>
        )}
        <p className="mt-4 text-xs italic text-stone-500">{CONFIDENCE_META[confidenceBand].note}</p>
      </section>

      {/* AI reasoning + extracted fields (Phase 3) */}
      {understanding && (
        <>
          <Section title="How we read this notice">
            <p className="text-sm leading-relaxed text-stone-700">{understanding.reasoning}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium ring-1 ring-stone-200">
                Confidence: {Math.round(understanding.confidence * 100)}%
              </span>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 font-medium ring-1 ring-stone-200">
                {rec.source === "llm" ? "Guidance generated from official sources" : "Guidance from curated templates (offline)"}
              </span>
            </div>
          </Section>

          <Section title="What we found in the notice">
            <ExtractedFieldsView understanding={understanding} />
          </Section>
        </>
      )}

      <Section title="What this notice likely means">
        <p className="text-sm leading-relaxed text-stone-700">{rec.explanation}</p>
      </Section>

      <Section title="Why this may have happened">
        <p className="text-sm leading-relaxed text-stone-700">{rec.likelyIssue}</p>
      </Section>

      <Section title="What you can do next">
        <ol className="space-y-3">
          {rec.steps.map((s, i) => (
            <li key={i} className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-stone-900">
                  {i + 1}. {s.title}
                </h3>
                <UrgencyBadge urgency={s.urgency} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{s.rationale}</p>
              {s.deadline && <p className="mt-2 text-xs font-medium text-amber-700">Deadline: {s.deadline}</p>}
            </li>
          ))}
        </ol>
      </Section>

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

      <Section title="Official sources behind this guidance">
        <p className="mb-3 text-xs text-stone-500">
          Every recommendation above is based on these official pages.
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
      </Section>

      <Section title="Need more help?">
        <ul className="space-y-3">
          {rec.help.map((h) => (
            <li key={h.name} className="rounded-xl border border-stone-200 p-4">
              <p className="text-sm font-semibold text-stone-900">{h.name}</p>
              <p className="text-sm text-stone-600">{h.detail}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                {h.phone && <span className="font-medium text-stone-700">📞 {h.phone}</span>}
                {h.url && (
                  <a href={h.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 underline underline-offset-2">
                    Visit website ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-6 space-y-4">
        {rec.escalation && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <span aria-hidden>⚠️</span>
            <p>{rec.escalation}</p>
          </div>
        )}
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

// Client-side fallback when /api/recommend is unreachable: reuse the seeded/mock
// analysis so the page still renders something useful.
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
  const rows: { label: string; value: string }[] = [
    { label: "Agency", value: f.agencyName },
    { label: "Date on notice", value: f.noticeDate },
    { label: "Case number", value: f.caseNumber },
    { label: "Deadline", value: f.deadline },
    { label: "Stated reason / issue", value: f.likelyIssue },
    { label: "Contact", value: f.contactInfo },
  ].filter((r) => r.value.trim().length > 0);

  return (
    <div className="space-y-4">
      {rows.length > 0 ? (
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{r.label}</dt>
              <dd className="text-sm text-stone-800">{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-stone-500">We couldn’t pull specific fields out of this text.</p>
      )}

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
    <section className={cx(card, "mt-4 p-6")}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">{title}</h2>
      {children}
    </section>
  );
}
