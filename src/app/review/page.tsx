"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Stepper from "@/components/Stepper";
import HumanInLoopNote from "@/components/HumanInLoopNote";
import { readDraft, writeDraft } from "@/lib/session";
import { btnGhost, btnPrimary, btnSecondary, card, cx, field } from "@/lib/ui";

export default function ReviewPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (!draft.rawText) {
      router.replace("/upload");
      return;
    }
    setText(draft.rawText);
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

  function continueToIntake() {
    writeDraft({ rawText: text });
    router.push("/intake");
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Stepper current={2} />

      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        Check the text we read
      </h1>
      <p className="mt-2 text-stone-600">
        Please read this over and fix anything that looks wrong before we
        continue. This is an important step — the explanation is only as good as
        the text it’s based on.
      </p>

      <div className="mt-6">
        <HumanInLoopNote title="Nothing has been analyzed yet" tone="teal">
          Your notice is only read after you confirm the text below is correct.
          You stay in control of what gets analyzed.
        </HumanInLoopNote>
      </div>

      <section className={cx(card, "mt-6 p-6")}>
        <label htmlFor="extracted" className="block text-sm font-medium text-stone-700">
          Notice text (editable)
        </label>
        <textarea
          id="extracted"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={16}
          className={cx(field, "mt-2 resize-y font-mono text-[13px] leading-relaxed")}
        />
        <p className="mt-2 text-xs text-stone-500">
          Tip: remove anything you don’t want to share, like your full name or case number.
        </p>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => router.push("/upload")} className={btnGhost}>
          ← Back to upload
        </button>
        <div className="flex gap-3">
          <button onClick={() => setText("")} className={btnSecondary}>
            Clear
          </button>
          <button
            onClick={continueToIntake}
            disabled={text.trim().length === 0}
            className={btnPrimary}
          >
            Looks right — continue →
          </button>
        </div>
      </div>
    </div>
  );
}
