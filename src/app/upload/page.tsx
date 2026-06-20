"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import Spinner from "@/components/Spinner";
import { NoticeTypeBadge } from "@/components/Badges";
import { MOCK_CASES } from "@/data/cases";
import { writeDraft } from "@/lib/session";
import { btnGhost, btnPrimary, card, cx, field } from "@/lib/ui";

type Status =
  | { kind: "idle" }
  | { kind: "extracting"; fileName: string }
  | { kind: "error"; message: string };

const ACCEPT = ".txt,.pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*,text/plain";

export default function UploadPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const fileInput = useRef<HTMLInputElement>(null);

  function chooseSample(id: string, rawText: string) {
    writeDraft({
      caseId: id,
      rawText,
      fileName: undefined,
      source: "sample",
      warning: undefined,
      intake: undefined,
    });
    router.push("/review");
  }

  function continueWithPaste() {
    writeDraft({
      caseId: undefined,
      rawText: text.trim(),
      fileName: undefined,
      source: "plain-text",
      warning: undefined,
      intake: undefined,
    });
    router.push("/review");
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus({ kind: "extracting", fileName: file.name });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!data.ok) {
        setStatus({ kind: "error", message: data.message ?? "We couldn’t read that file." });
        return;
      }
      writeDraft({
        caseId: undefined,
        rawText: data.result.text,
        fileName: file.name,
        source: data.result.method,
        warning: data.result.warning,
        intake: undefined,
      });
      router.push("/review");
    } catch {
      setStatus({
        kind: "error",
        message:
          "We couldn’t reach the reader service. You can paste the text below, or try a sample notice.",
      });
    }
  }

  const busy = status.kind === "extracting";

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Stepper current={1} />

      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        Add your SNAP notice
      </h1>
      <p className="mt-2 text-stone-600">
        Upload it, paste it, or try a sample. Nothing is analyzed until you’ve
        had a chance to review the text on the next step.
      </p>

      {/* Extracting overlay */}
      {busy && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4">
          <Spinner />
          <div className="text-sm text-teal-900">
            <p className="font-semibold">Reading “{status.fileName}”…</p>
            <p className="text-teal-800">
              Photos and scans use on-device text recognition and can take a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Error banner with fallback guidance */}
      {status.kind === "error" && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
        >
          <span aria-hidden>⚠️</span>
          <div className="text-sm text-rose-900">
            <p className="font-semibold">We couldn’t read that file</p>
            <p className="mt-0.5">{status.message}</p>
            <p className="mt-1 text-rose-800">
              Try pasting the text below, or use one of the sample notices.
            </p>
          </div>
        </div>
      )}

      {/* Sample cases */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Try a sample notice
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Synthetic examples (no real personal info) — the most reliable way to see how it works.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {MOCK_CASES.map((c) => (
            <button
              key={c.id}
              disabled={busy}
              onClick={() => chooseSample(c.id, c.rawText)}
              className={cx(
                card,
                "group p-4 text-left transition hover:border-teal-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50"
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

      {/* Upload + paste */}
      <section className={cx(card, "p-6")}>
        <div
          onClick={() => !busy && fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!busy) handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cx(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition",
            busy
              ? "cursor-not-allowed border-stone-200 bg-stone-50 opacity-60"
              : "cursor-pointer border-stone-300 bg-stone-50 hover:border-teal-400 hover:bg-teal-50/40"
          )}
        >
          <span aria-hidden className="text-2xl">📄</span>
          <p className="mt-2 text-sm font-medium text-stone-700">
            Drop a PDF or image here, or click to choose a file
          </p>
          <p className="mt-1 text-xs text-stone-500">
            PDF, PNG, JPG, or .txt · up to 10 MB · photos are read with OCR
          </p>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            disabled={busy}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="paste" className="block text-sm font-medium text-stone-700">
            …or paste the text from your notice
          </label>
          <textarea
            id="paste"
            value={text}
            disabled={busy}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Paste what the letter says here…"
            className={cx(field, "mt-2 resize-y font-mono text-[13px] leading-relaxed disabled:opacity-60")}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={() => router.push("/")} disabled={busy} className={btnGhost}>
            ← Back
          </button>
          <button
            onClick={continueWithPaste}
            disabled={busy || text.trim().length === 0}
            className={btnPrimary}
          >
            Review extracted text →
          </button>
        </div>
      </section>
    </div>
  );
}
