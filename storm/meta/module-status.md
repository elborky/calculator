# Module Status

> AI-maintained deploy-pipeline tracker. Read on-demand by /storm-start-session + /storm-status.
> NOT auto-loaded (kept out of CLAUDE.md to avoid per-load context tax, per #FF-024 insight).
> This is STORM's CLAIM of what it deployed; prod ground-truth lives in the deploy platform
> (Dokploy / k8s / etc). Session start reconciles this grid against git ship-tags/commits.

| Module | Slug | Phase | Staging SHA | Prod SHA | SHIP date | Notes |
|---|---|---|---|---|---|---|
| M1 Calculation Engine | 01-calculation-engine | REVIEW-PASS | (exit marker below) | — | — | Pure headless TS library — no deploy surface (M2 will bundle). L7+L8 PASS; L8-01 P1 bug fixed (660d26b). 61 tests green. |
| M2 Calculator UI | 02-calculator-ui | REVIEW-PASS | (exit marker this commit) | — | — | 8-layer REVIEW PASS (0 P0). Fixed in-REVIEW: 3 a11y (axe 4→0: main-landmark/role, sr-only h1, scroll-region focusable), UR-029 rgba→channel-tokens, font-var consolidation, favicon, dead re-export. F1 "font collapse" RETRACTED (woff2 is a variable font — D-004 met). ⚠️ ran INLINE (forked dispatch #FF-008-blocked) → REVIEW commit Model:opus not dispatched-tier. Next: SHIP M2 (or continue M3/M4 — owner sequencing). |
| M3 History Tape | 03-history-tape | BUILD-COMPLETE | — | — | — | 44 tasks (groups A–I) all forked-sonnet, tier-clean. In-memory tape: record-on-genuine-= (INT-M3-1 predicate), newest-on-top single-line v1, repeated-=/error/bare-= excluded, AC clears. Subscriber-list seam on dispatch() (zero new runtime deps; jsdom added test-only). LIVE browser smoke PASS (6 flows). 75 tests (61 engine + 14 M3 jsdom). ⚠️ startup-crash bug (missing static tape skeleton in index.html) found by live-smoke + fixed in-BUILD (35e8530) — green build/tests had masked it. Next: REVIEW M3. |
