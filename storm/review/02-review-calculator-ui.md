---
storm-phase: review
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_index.md
  - storm/build/02-calculator-ui/
---

# REVIEW M2 — Calculator UI / Keypad

> 8-layer auto-verification (REVIEW belongs to AI per #FF-015). Evidence:
> `storm/review/evidence/02-calculator-ui/`.

## ⚠️ Tier-purity caveat (honest)
Forked sub-agent dispatch was blocked all session by **#FF-008** (1M-context usage-credits
gate — rejects at 0 tokens before any work). Per the mandatory fallback + owner's explicit
"gas inline", **L1–L8 ran inline in the orchestrator**, not via the designed fresh/blind
sonnet crawler + independent opus auditor. Consequences recorded plainly:
- Lost the blind-verifier independence (the auditor shares the builder's session context).
- Commit `Model:` trailers read `opus` (orchestrator tier), NOT the dispatched `sonnet`/`opus`
  — measurement signal is degraded for these REVIEW commits (same class of caveat as Groups 0–3).
This is a degraded-but-complete REVIEW, not the canonical tiered path. Re-run forked once credits
are enabled if a clean measurement baseline is wanted.

## Per-layer results
| Layer | Verdict | Evidence |
|---|---|---|
| L1 Functional smoke | **PASS** | `L1-crawl/L1-findings.md` + screenshots. 12+3=15 (click & keyboard, convergence), 5÷0=error sentence, digit no-op + Esc escape during error, 1÷3 shrink→scroll full precision, `0.` decimal, repeated-`=` stable, `/` no quick-find. |
| L2 Console | PASS (after fix) | `L1-crawl/L2-console.log`. Only finding was `/favicon.ico` 404 → fixed (inline empty favicon). |
| L3 Network | PASS | `L1-crawl/L3-network.log`. No 5xx; one variable woff2 served; no @font-face 404. |
| L4 Accessibility | **PASS (after fix)** | `L4-axe/*.json`. axe 4→**0** (rest + scroll states). Manual: real buttons, 3px focus ring, role=status/aria-live, text-not-colour error, glyph+fill operators. |
| L5 Visual regression | PASS | `L5-visual/`. Faithful v3 Wildcard port; rgba→token refactor pixel-identical. |
| L6 Perf smoke | PASS | `L6-perf/L6-perf.json`. FCP 204ms, load 103ms, ~2KB transfer, CLS ~0. |
| L7 Static guards | PASS | `L7-pre.log`. tsc 0 err, 61/61 tests, build GREEN, token-purity CLEAN. nav-coverage + resource-existence N/A (single-page, no DB). |
| L8 Code audit | PASS | `L8-code-review.md`. textContent-only (no XSS), exhaustive error switch, INT-1..6 honoured, no dead branches of consequence. 0 P0/P1 in code. |

## Findings log (categorized + severity, W-G32)
| # | Finding | Layer | Category | Sev | Status | Fix commit |
|---|---|---|---|---|---|---|
| F1 | **(RETRACTED — not a bug)** "font weights collapsed". Verify-before-flag (#FF-001): the woff2 is a latin-subset **variable font** (fvar wght 100–900). 3 @font-face pull genuine 300/400/500 from the axis; widths grow 300<400<500 (measured). D-004 self-host IS met. | L7 | — | — | retracted | — |
| F2 | `<main role="application">` stripped the main landmark + role not appropriate (axe landmark-one-main + aria-allowed-role). | L4 | Impl bug | P1 | **Resolved** | fix commit |
| F3 | No level-one heading (axe page-has-heading-one). | L4 | Impl bug | P1 | **Resolved** (`<h1 class="sr-only">`) | fix commit |
| F4 | `.readout` was a focus-less scrollable region (axe scrollable-region-focusable, serious). Root cause: base `overflow-x:hidden` forced `overflow-y:auto` → spurious vertical scroll at rest. | L4 | Impl bug | P1 | **Resolved** (`overflow:hidden` at rest; conditional `tabindex=0`+aria-label only while horizontally scrolling) | fix commit |
| F5 | Coloured theme `rgba()` literals outside tokens.css (aurora sheen, @supports fallback fills, operator/equals text-shadow tints) — UR-029 nuance. | L7 | Impl bug | P2 | **Resolved** (RGB-channel tokens `--accent-rgb` etc.; structural black/white shadows left literal per T-122) | fix commit |
| F6 | `/favicon.ico` 404. | L2 | Impl bug | P3 | **Resolved** (inline empty favicon) | fix commit |
| F7 | `state.ts` re-exports `getDisplayValue` unused (render.ts imports from `../engine`). | L8 | Impl bug | P3 | **Resolved** (removed) | fix commit |
| F8 | 3 byte-identical woff2 copies, misleadingly named per-weight. | L7 | Impl bug | P3 | **Resolved** (consolidated to one `Inter-latin-var.woff2`; single variable @font-face `font-weight:100 900` — also makes keypad's weight-600 render genuinely). | fix commit |
| F9 | M2 view layer has no unit tests; pure helpers `pendingLine`/operator-map trivially testable. | L8 | (D-007 waiver) | P3 | **Won't-fix** — D-007 explicitly defers M2 unit tests to browser-e2e (REVIEW). Adding would contradict a recorded decision. Noted, not actioned. |

## Verdict
**PASS.** 0 P0. All P1 (3 a11y) + P2 (token-purity) resolved and re-verified (axe 0 in both rest
and scroll states; functional smoke green; visual pixel-identical; tsc/tests/build green). P3s
resolved except F9 (D-007 waiver). The one P1-presented item (F1 font) was **retracted** after
verify-before-flag proved it a non-bug.
