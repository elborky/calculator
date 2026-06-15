# Module Status

> AI-maintained deploy-pipeline tracker. Read on-demand by /storm-start-session + /storm-status.
> NOT auto-loaded (kept out of CLAUDE.md to avoid per-load context tax, per #FF-024 insight).
> This is STORM's CLAIM of what it deployed; prod ground-truth lives in the deploy platform
> (Dokploy / k8s / etc). Session start reconciles this grid against git ship-tags/commits.

| Module | Slug | Phase | Staging SHA | Prod SHA | SHIP date | Notes |
|---|---|---|---|---|---|---|
| M1 Calculation Engine | 01-calculation-engine | PROD (bundled) | — | e0ee19b | 2026-06-15 | Pure headless TS library — ships INSIDE the M2/M3 static bundle (no own surface). L7+L8 PASS; L8-01 P1 bug fixed (660d26b). 61 tests green. Live in prod as part of the deployed bundle. |
| M2 Calculator UI | 02-calculator-ui | **PROD** | e0ee19b | e0ee19b | 2026-06-15 | LIVE: https://calc.elborky.my.id (HTTP/2, valid Let's Encrypt cert, all security headers present). 8-layer REVIEW PASS (0 P0). Fixed in-REVIEW: 3 a11y (axe 4→0), UR-029 rgba→tokens, font-var consolidation, favicon, dead re-export. F1 "font collapse" RETRACTED. Prod functional smoke PASS (arithmetic click≡keyboard). |
| M3 History Tape | 03-history-tape | **PROD** | e0ee19b | e0ee19b | 2026-06-15 | LIVE: https://calc.elborky.my.id (bundled with M2). 8-layer REVIEW PASS (0 P0 / 0 P1). Fixed in-REVIEW (a303f3b): P1 desktop scroll-bound + 2 elevated P2 + P3 dup-import. Prod functional smoke PASS (record/dedup/error-no-record/AC-clear/keyboard, 0 console errors). ⚠️ Glass (backdrop-filter) confirmed rendering in owner's Chrome on prod; build drops unprefixed `backdrop-filter` → Firefox glass gap parked as #001 (non-blocking, functional unaffected). |
| M4 Theming | 04-theming | **PROD** | f772fa7 | dd13281 | 2026-06-15 | LIVE as **v1.1.0**: https://calc.elborky.my.id (Light/Dark toggle). Dokploy redeploy from `main@dd13281` (Dockerfile build), HTTP/2 + HTTPS, security headers intact (CSP/XFO/XCTO/Referrer). Prod smoke PASS: HTML serves M4 markers (toggle-slot, calc-theme no-FOUC script, prefers-color-scheme); JS+CSS assets 200 with byte-identical hashes to REVIEW-verified local build (index-8zsskZrx.js / index-YCTcM2l1.css). 8-layer REVIEW PASS (0 P0): L1-L7 real-browser PASS; L8 opus (0a0558b) 0 P0 / 1 P1 fixed in-REVIEW (50a1c7f, 96->106 tests) / 1 P2 parked #002 / 3 P3. 106 tests green. Delta-SHIP (0 new deps, npm audit 0 vulns -> reused v1.0.0 audit/QA/runbook). HSTS still deferred; Firefox glass #001, dead-CSS #002 open. |
