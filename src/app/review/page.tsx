"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import HumanInLoopNote from "@/components/HumanInLoopNote";
import { readDraft, writeDraft, type TextSource } from "@/lib/session";
import { btnGhost, btnPrimary, btnSecondary, card, cx, field } from "@/lib/ui";

const SOURCE_LABELS: Record<TextSource, string> = {
  "pdf-text": "Read from PDF text",
  "image-ocr": "Read from a photo (OCR)",
  "plain-text": "Pasted text",
  sample: "Sample notice",
};

export default function ReviewPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [source, setSource] = useState<TextSource | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [warning, setWarning] = useState<string | undefined>();
  const [confirmed, setConfirmed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (!draft.rawText) {
      router.replace("/upload");
      return;
    }
    setText(draft.rawText);
    setSource(draft.source);
    setFileName(draft.fileName);
    setWarning(draft.warning);
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Stepper current={2} />
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
      </div>
    );
  }

  const isOcr = source === "image-ocr";

  function continueToIntake() {
    writeDraft({ rawText: text });
    router.push("/intake");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
      <Stepper current={2} />

      <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
        <span aria-hidden>🫶</span> Your turn — you’re in control here
      </div>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
        Check the text we read
      </h1>
      <p className="mt-2 text-stone-600">
        Before anything is analyzed, please read this over and fix anything that
        looks wrong. The explanation is only as good as the text it’s based on —
        so this step really matters.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        {source && (
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600 ring-1 ring-stone-200">
            {SOURCE_LABELS[source]}
          </span>
        )}
        {fileName && (
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 font-medium text-stone-600 ring-1 ring-stone-200">
            {fileName}
          </span>
        )}
      </div>

      <div className="mt-6">
        <HumanInLoopNote
          title={isOcr ? "Photos can be misread — your check matters most here" : "Nothing has been analyzed yet"}
          tone="teal"
        >
          {isOcr
            ? "Text recognition isn’t perfect. Compare the text below to your notice and correct any mistakes — this keeps the analysis accurate. Nothing is sent for analysis until you say it looks right."
            : "Your notice is only analyzed after you confirm the text below is correct. You decide when it’s ready."}
        </HumanInLoopNote>
      </div>

      {warning && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <span aria-hidden>⚠️</span>
          <p>{warning}</p>
        </div>
      )}

      <section className={cx(card, "mt-6 p-5 sm:p-6")}>
        <label htmlFor="extracted" className="block text-sm font-medium text-stone-700">
          Notice text (editable)
        </label>
        <textarea
          id="extracted"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className={cx(field, "mt-2 resize-y font-mono text-[13px] leading-relaxed")}
        />
        <p className="mt-2 text-xs text-stone-500">
          Tip: you can remove anything you don’t want to share, like your full name or case number.
        </p>

        {text.trim().length === 0 ? (
          <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-500">
            The text is empty. Paste or restore your notice text to continue.
          </p>
        ) : (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-teal-700"
            />
            <span>I’ve read this and it matches my notice closely enough to continue.</span>
          </label>
        )}
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => router.push("/upload")} className={btnGhost}>
          ← Back to upload
        </button>
        <div className="flex gap-3">
          <button onClick={() => { setText(""); setConfirmed(false); }} className={btnSecondary}>
            Clear
          </button>
          <button
            onClick={continueToIntake}
            disabled={text.trim().length === 0 || !confirmed}
            className={btnPrimary}
          >
            Looks right — continue →
          </button>
        </div>
      </div>
    </div>
  );
}
