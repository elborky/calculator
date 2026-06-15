# L5 Visual Regression — live app vs v3 Wildcard baseline (mockup-v3.html)

Baseline: storm/specify/02-calculator-ui/04-ui/mockup-v3.html (commit a45e580, owner-picked).
Method: side-by-side screenshots (baseline-v3-mockup.png vs L1-crawl/result-15-desktop.png + phone-360-fresh.png).

## Axis-by-axis (W-G55)
| Axis | Verdict | Note |
|---|---|---|
| Color | PASS | aurora gradient (indigo→magenta), coral operators, indigo equals, dark display scrim — all match. |
| Spacing | PASS | 4-col grid, gaps, panel padding match. |
| Layout | PASS | glass slab, = spans 2 rows, 0 spans 2 cols, reserved M3 slot, M4 toggle corner — all present. |
| Components | PASS | 18 keys, display sub-panel, pending line — faithful. |
| Typography | MINOR (P1 elsewhere) | display uses Inter-300 not Space Grotesk — KNOWN-OK per D-004 (mockup font was mockup-only). BUT all weights render from one file (font dedup bug) — keys look lighter than intended Medium. Logged P1 in L7/review-log. |
| Motion | PASS | press-scale, focus ring, equals fade-rise present (verified in L1). |
| a11y | see L4 | structural axe findings logged separately. |

## Intended divergences (NOT regressions)
- Mockup's decorative top-right display label (e.g. "SCI"/"DEG"-style) omitted — out of scope (no scientific mode). Intended.
- Space Grotesk → Inter-300 display font — D-004 self-host decision. Intended.

Visual verdict: **PASS** — faithful port of the v3 Wildcard baseline. No material divergence beyond the font-weight bug already captured.
