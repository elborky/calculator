---
storm-phase: build
storm-module: 04-theming
storm-depends-on:
  - storm/build/04-theming/_plan.md
storm-canonical: false
---

# Group G — WCAG AA Verification (T-430)

Orchestrator-led, real-browser verification of the M4 **light theme** ("Iridescent Dawn").
Method: live render at `localhost:5173` (Vite dev, source-truth), resolved-token extraction +
mathematical alpha-composite of each translucent scrim over the **worst-case (darkest) aurora
patch** `[120,110,210]` (deliberately darker than the typical lavender backdrop). Per the
headless-glass oracle caveat (`MEMORY.md`), contrast is computed from resolved token values, not
sampled from headless GPU-composited pixels.

WCAG AA thresholds: normal text ≥ 4.5:1, large text (≥18.66px or ≥14px bold) ≥ 3:1.

## Result — PASS (after 2 fixes)

| # | Surface pair | Class | Worst-case ratio | Threshold | Verdict |
|---|---|---|---|---|---|
| 1 | Display readout `#1a1040` over `--display-scrim` | normal | 12.62:1 | 4.5 | ✅ |
| 2 | Keypad digit `#1a1040` over white key (0.52) | normal | 9.48:1 | 4.5 | ✅ |
| 3 | Operator label white over coral-rose `#cc1f4a` | normal | 5.44:1 | 4.5 | ✅ |
| 4 | Equals label white over indigo `#5b3de8` | normal | 6.41:1 | 4.5 | ✅ |
| 5a | History result `#1a1040` over `--tape-scrim` | normal | 13.21:1 | 4.5 | ✅ |
| 5b | History expr / empty text (`--text-secondary`) | normal (14px/400) | **5.13:1** | 4.5 | ✅ (after fix) |

## Fixes applied during verification

- **`3956f08`** — `--tape-scrim` had no light override (defined as a local dark literal in
  `history.css`, outside the `tokens.css :root` Group A swapped). In light theme the history
  tape stayed dark → dark text on dark scrim (invisible + AA fail). Added
  `[data-theme="light"] --tape-scrim: rgba(240,238,255,0.86)` + light backdrop-filter fallback.
- **`d000e9e`** — light `--text-secondary` was `rgba(26,16,64,0.60)` → only 4.24–4.45:1 (under
  4.5 normal). Raised to `0.66` → ≥5.13:1 worst-case, preserving the dimmed character.

## Functional smoke (real browser)

- First-load default follows OS `prefers-color-scheme` (light on this machine). ✅
- Toggle click: light → dark → light; `data-theme` flips, `localStorage["calc-theme"]`
  persists, `aria-label` syncs ("Switch to light/dark theme"). ✅
- Dark v3 baseline renders unchanged (frozen default). ✅
- No-FOUC head script applies the resolved theme pre-paint. ✅
- Console: 0 errors. ✅
