"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import {
  ACTION_CONTEXTS,
  HOUSEHOLD_SIZES,
  INCOME_BANDS,
  LANGUAGES,
  SUPPORTED_STATES,
  US_STATES,
} from "@/lib/constants";
import { readDraft, writeDraft } from "@/lib/session";
import { btnGhost, btnPrimary, card, cx, field } from "@/lib/ui";
import type { ActionContext, IntakeAnswers } from "@/types/snap";

export default function IntakePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({
    language: "English",
    submittedDocs: "unsure",
  });

  useEffect(() => {
    const draft = readDraft();
    if (!draft.rawText) {
      router.replace("/upload");
      return;
    }
    setAnswers((prev) => ({ ...prev, ...draft.intake }));
    setReady(true);
  }, [router]);

  function set<K extends keyof IntakeAnswers>(key: K, value: IntakeAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    writeDraft({ intake: answers });
    router.push("/results");
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Stepper current={3} />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    );
  }

  const stateSupported = answers.state && SUPPORTED_STATES.has(answers.state);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <Stepper current={3} />

      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        A few quick questions
      </h1>
      <p className="mt-2 text-stone-600">
        These help us tailor the next steps to your situation. Answer what you
        can — you can skip anything you’re unsure about.
      </p>

      <section className={cx(card, "mt-6 space-y-6 p-6")}>
        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-stone-700">
            Which state are you in?
          </label>
          <select
            id="state"
            value={answers.state ?? ""}
            onChange={(e) => set("state", e.target.value)}
            className={cx(field, "mt-2")}
          >
            <option value="">Select a state…</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
                {SUPPORTED_STATES.has(s.code) ? " (detailed guidance)" : ""}
              </option>
            ))}
          </select>
          {answers.state && !stateSupported && (
            <p className="mt-2 text-xs text-amber-700">
              We have limited guidance for this state right now — you’ll get
              federal baseline help instead of state-specific detail.
            </p>
          )}
        </div>

        {/* Household + income */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="household" className="block text-sm font-medium text-stone-700">
              How many people are in your household?
            </label>
            <select
              id="household"
              value={answers.householdSize ?? ""}
              onChange={(e) => set("householdSize", e.target.value)}
              className={cx(field, "mt-2")}
            >
              <option value="">Select…</option>
              {HOUSEHOLD_SIZES.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-stone-700">
              Roughly, your household income?
            </label>
            <select
              id="income"
              value={answers.incomeBand ?? ""}
              onChange={(e) => set("incomeBand", e.target.value)}
              className={cx(field, "mt-2")}
            >
              <option value="">Select…</option>
              {INCOME_BANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action context */}
        <fieldset>
          <legend className="text-sm font-medium text-stone-700">
            What best describes your situation?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ACTION_CONTEXTS.map((opt) => {
              const selected = answers.actionContext === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("actionContext", opt.value as ActionContext)}
                  className={cx(
                    "rounded-xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                    selected
                      ? "border-teal-500 bg-teal-50 ring-1 ring-teal-300"
                      : "border-stone-300 bg-white hover:bg-stone-50"
                  )}
                >
                  <span className="block text-sm font-semibold text-stone-900">{opt.label}</span>
                  <span className="block text-xs text-stone-500">{opt.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Submitted docs */}
        <fieldset>
          <legend className="text-sm font-medium text-stone-700">
            Have you already sent any documents the agency asked for?
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["yes", "no", "unsure"] as const).map((v) => {
              const selected = answers.submittedDocs === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("submittedDocs", v)}
                  className={cx(
                    "rounded-full border px-4 py-2 text-sm font-medium capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-300"
                      : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                  )}
                >
                  {v === "unsure" ? "Not sure" : v}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-stone-700">
            Preferred language
          </label>
          <select
            id="language"
            value={answers.language ?? "English"}
            onChange={(e) => set("language", e.target.value)}
            className={cx(field, "mt-2 sm:max-w-xs")}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-500">
            (Phase 1 shows results in English; translated output comes later.)
          </p>
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={() => router.push("/review")} className={btnGhost}>
          ← Back
        </button>
        <button onClick={submit} className={btnPrimary}>
          See my next steps →
        </button>
      </div>
    </div>
  );
}
