# Module Status

> AI-maintained deploy-pipeline tracker. Read on-demand by /storm-start-session + /storm-status.
> NOT auto-loaded (kept out of CLAUDE.md to avoid per-load context tax, per #FF-024 insight).
> This is STORM's CLAIM of what it deployed; prod ground-truth lives in the deploy platform
> (Dokploy / k8s / etc). Session start reconciles this grid against git ship-tags/commits.

| Module | Slug | Phase | Staging SHA | Prod SHA | SHIP date | Notes |
|---|---|---|---|---|---|---|
| M1 Calculation Engine | 01-calculation-engine | REVIEW-PASS | (exit marker below) | — | — | Pure headless TS library — no deploy surface (M2 will bundle). L7+L8 PASS; L8-01 P1 bug fixed (660d26b). 61 tests green. |
| M2 Calculator UI | 02-calculator-ui | REVIEW-PASS | (exit marker this commit) | — | — | 8-layer REVIEW PASS (0 P0). Fixed in-REVIEW: 3 a11y (axe 4→0: main-landmark/role, sr-only h1, scroll-region focusable), UR-029 rgba→channel-tokens, font-var consolidation, favicon, dead re-export. F1 "font collapse" RETRACTED (woff2 is a variable font — D-004 met). ⚠️ ran INLINE (forked dispatch #FF-008-blocked) → REVIEW commit Model:opus not dispatched-tier. Next: SHIP M2 (or continue M3/M4 — owner sequencing). |
| M3 History Tape | 03-history-tape | REVIEW-PASS | (exit marker this commit) | — | — | 8-layer REVIEW PASS (0 P0 / 0 P1 outstanding). All 4 REVIEW dispatches forked tier-clean (L1-crawl sonnet, L8-audit opus, fix sonnet, log sonnet) — #FF-037 gate fired at start, owner switched off 1M → clean baseline (unlike inline M2). Fixed in-REVIEW (a303f3b): P1 desktop scroll-bound (tape panel scrolled the page body + conditional tabindex never fired — US-M3-4 HE-016 / US-M3-8 HE-028; max-height on .history-slot), + 2 elevated P2 (seam try/catch guard on dispatch listener loop; justEvaluated===false test-gap closed), + P3 dup-import. Backdrop-filter P2 DISMISSED (Playwright-headless GPU artifact; glass verified real-Chrome). L4 axe 0 violations; L6 FCP372/CLS0; 75 tests + tsc0 + build clean. Next: SHIP (M2+M3) — owner sequencing. |
