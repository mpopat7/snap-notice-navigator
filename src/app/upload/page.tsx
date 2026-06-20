"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import { NoticeTypeBadge } from "@/components/Badges";
import { MOCK_CASES } from "@/data/cases";
import { writeDraft } from "@/lib/session";
import { btnGhost, btnPrimary, card, cx, field } from "@/lib/ui";

export default function UploadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function chooseSample(id: string, rawText: string) {
    writeDraft({ caseId: id, rawText, fileName: undefined, intake: undefined });
    router.push("/review");
  }

  function continueWithPaste() {
    writeDraft({ caseId: undefined, rawText: text.trim(), fileName: undefined });
    router.push("/review");
  }

  // Phase 1: no OCR. We accept .txt directly; other files are recorded by name
  // only and the user is told extraction arrives later.
  function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    if (file.type === "text/plain") {
      file.text().then((t) => setText(t));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Stepper current={1} />

      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        Add your SNAP notice
      </h1>
      <p className="mt-2 text-stone-600">
        Choose one of the options below. Nothing is analyzed until you’ve had a
        chance to review the text on the next step.
      </p>

      {/* Sample cases */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Try a sample notice
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Synthetic examples (no real personal info) — the quickest way to see how it works.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {MOCK_CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => chooseSample(c.id, c.rawText)}
              className={cx(
                card,
                "group p-4 text-left transition hover:border-teal-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              )}
            >
              <NoticeTypeBadge type={c.noticeType} />
              <h3 className="mt-3 text-sm font-semibold text-stone-900">{c.label}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{c.blurb}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-teal-700 group-hover:underline">
                Use this sample →
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="my-8 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> or add your own <span className="h-px flex-1 bg-stone-200" />
      </div>

      {/* Paste + upload */}
      <section className={cx(card, "p-6")}>
        {/* File dropzone (stub) */}
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center transition hover:border-teal-400 hover:bg-teal-50/40"
        >
          <span aria-hidden className="text-2xl">📄</span>
          <p className="mt-2 text-sm font-medium text-stone-700">
            Drop a PDF or image here, or click to choose a file
          </p>
          <p className="mt-1 text-xs text-stone-500">
            In this preview, .txt is read directly. PDF/image text extraction (OCR) arrives in Phase 2.
          </p>
          {fileName && (
            <p className="mt-3 rounded-lg bg-white px-3 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
              Selected: {fileName}
            </p>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.pdf,image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="paste" className="block text-sm font-medium text-stone-700">
            …or paste the text from your notice
          </label>
          <textarea
            id="paste"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Paste what the letter says here…"
            className={cx(field, "mt-2 resize-y font-mono text-[13px] leading-relaxed")}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={() => router.push("/")} className={btnGhost}>
            ← Back
          </button>
          <button
            onClick={continueWithPaste}
            disabled={text.trim().length === 0}
            className={btnPrimary}
          >
            Review extracted text →
          </button>
        </div>
      </section>
    </div>
  );
}
