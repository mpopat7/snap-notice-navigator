@AGENTS.md

# SNAP Notice Navigator

AI-powered **SNAP notice interpreter and next-step navigator**: a user uploads a confusing
SNAP letter (denial, verification request, recertification, closure, change), answers a few
calm intake questions, and gets a plain-language explanation + a prioritized, source-backed
next-steps checklist. It interprets and recommends — it never decides eligibility. Built for
the USAII Global AI Hackathon (Undergraduate track, Brief 4 / Direction A: Benefits Navigator).

> Full authoritative spec: [docs/context.md](docs/context.md). Read it before major work.
> Next.js here is a very new major version — see AGENTS.md; check `node_modules/next/dist/docs/`
> before writing framework code.

## Commands
```bash
npm install            # install deps
npm run dev            # local dev server (http://localhost:3000)
npm run build          # production build
npm run lint           # lint
npx tsc --noEmit       # typecheck
```

## Prerequisites
- **Node.js ≥ 18** (installed via Homebrew: Node 26).
- `.env.local` with `ANTHROPIC_API_KEY` for the LLM steps (app must degrade gracefully /
  fall back to seeded sample output if the key is absent — demo must never hard-fail).

## Configuration
| Setting | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` | Key for extraction + recommendation LLM calls |
| `LLM_MODEL` | `.env.local` / config | Default `claude-sonnet-4-6` (Sonnet) |
| `DEMO_MODE` | `.env.local` / UI toggle | Use seeded sample cases; skip live OCR/LLM for reliable demos |
| Supported states | `data/states/` | States with deep guidance (start with 1–3, e.g. CA/TX/MO) |

## Architecture (pipeline)
A → G modules, kept separate (no mixing I/O, computation, output):
1. **ingestion** — accept PDF / image / pasted text; store temporarily.
2. **extraction (OCR)** — extract text; user reviews/edits before analysis (HITL gate).
3. **classification** — notice type: denial / verification request / recertification /
   closure / change / unknown-low-confidence.
4. **field extraction** — agency, dates, deadlines, reasons, requested docs, contacts.
5. **intake enrichment** — short adaptive questions (state, household, income band, action,
   docs submitted, language).
6. **retrieval** — lightweight RAG over curated official SNAP/USDA/state docs by state + topic.
7. **recommendation generation** — explanation, likely issue, urgency-ordered checklist,
   citations, low-confidence escalation.
8. **output rendering** — structured results page (see docs/context.md §7).

## Responsible-AI invariants (non-negotiable, enforce in code + UX)
- Hedged wording only ("may qualify", "this notice may mean"). Never "you definitely
  qualify", "this decision is wrong", "you will receive benefits".
- Always show source links + a confidence band; always show the agency-final-decision
  disclaimer.
- Require user review of extracted text before generating recommendations.
- Keep extraction and recommendation as **separate** steps.
- Low confidence → say so, route to office / advocate.
- The AI never decides eligibility, whether to appeal, or whether the agency erred. The user
  stays in control (human-in-the-loop).

## Status
Phases 1–3 done.
- **Phase 2** — document pipeline: `src/lib/extraction/` (Extractor interface +
  pdf-text / image-ocr / plain-text; OCR is one swappable module) behind
  `POST /api/extract`. Upload calls it with loading/error/sample+paste fallback.
- **Phase 3** — classification + field extraction: `src/lib/analysis/`
  (`schema.ts` zod + `NoticeUnderstanding`, `rules.ts` deterministic keyword
  classifier + regex extractor, `llm.ts` Claude structured-output via
  `messages.parse`, `index.ts` `analyzeNotice` orchestrator) behind
  `POST /api/analyze`. Rules + LLM hybrid: rules always run (offline-safe), the
  LLM (`claude-sonnet-4-6`) refines when `ANTHROPIC_API_KEY` is set. Results page
  drives the status card + extracted fields + reasoning from this; low-confidence
  handling + escalation included. Recommendations are still the Phase 1 mock.

- **Phase 4** — retrieval + recommendation: curated KB in `src/data/knowledge/`
  (federal baseline + CA/TX/MO; `retrieve()` scores by state + notice type +
  topic, federal-only fallback for unsupported states). `src/lib/recommend/`
  generates the recommendation grounded in retrieved sources (LLM via
  `messages.parse`, deterministic `template.ts` fallback) — sources/help are
  attached from the KB, never invented by the model. One call `POST /api/recommend`
  returns understanding + recommendation; results page renders explanation, likely
  issue, prioritized steps, documents, real source links, help referrals,
  escalation, and a limited-support banner for unsupported states. This replaces
  the Phase 1 `getAnalysis` mock (kept only as a client network-failure fallback).

- **Phase 5** — UX polish + responsible AI. New components: `HumanLoopStrip`
  (AI explains → you decide → agency decides, on landing + results) and
  `ConfidenceMeter` (calm segmented confidence). Results page re-prioritized
  (meaning + next-steps lead; transparency tucked into a "See how we read your
  notice" disclosure), with a supportive low-confidence card, distinct
  Official-sources and Need-more-help cards, and proper loading/empty/error
  states. Review page adds an explicit "I've read this" confirmation gate before
  analysis. Mobile padding/typography pass across pages.

Next: Phase 6 (demo assets + docs: README, architecture diagram, seeded test
cases, optional demo mode, judging-aligned snippets). Phases: docs/context.md §13.
