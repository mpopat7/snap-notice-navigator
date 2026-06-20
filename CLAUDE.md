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
Phase 1 (scaffolding) in progress. Phases: see docs/context.md §13.
