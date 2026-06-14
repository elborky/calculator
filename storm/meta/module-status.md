# Module Status

> AI-maintained deploy-pipeline tracker. Read on-demand by /storm-start-session + /storm-status.
> NOT auto-loaded (kept out of CLAUDE.md to avoid per-load context tax, per #FF-024 insight).
> This is STORM's CLAIM of what it deployed; prod ground-truth lives in the deploy platform
> (Dokploy / k8s / etc). Session start reconciles this grid against git ship-tags/commits.

| Module | Slug | Phase | Staging SHA | Prod SHA | SHIP date | Notes |
|---|---|---|---|---|---|---|
| M1 Calculation Engine | 01-calculation-engine | REVIEW-PASS | (exit marker below) | — | — | Pure headless TS library — no deploy surface (M2 will bundle). L7+L8 PASS; L8-01 P1 bug fixed (660d26b). 61 tests green. |
| M2 Calculator UI | 02-calculator-ui | SPECIFY-APPROVED | — | — | — | First demo-able surface — bundles M1. 7 concerns + 3 mockups, cross-file audit PASS. Visual baseline LOCKED = v3 Wildcard aurora glass. Vanilla TS + Vite 8 static. 87 BUILD tasks (T-101–T-187). Next: BUILD. |
