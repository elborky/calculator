---
storm-phase: build
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_index.md
---

# M2 Calculator UI / Keypad — BUILD Plan

> Drafted from `storm/specify/02-calculator-ui/_index.md` (the authoritative 87-task list).
> Granularity: each task ≤ 1 file / 1 logical unit, carries its own **Done when** check in `_index.md`.
> **Execution:** dispatched per-group via forked **sonnet** sub-agents; each sub-agent makes **atomic
> per-task commits** inside its group (preserves #FF-017 per-task `Model:` trailer + #FF-013 turn budget).
> Build target = `storm/specify/02-calculator-ui/04-ui/mockup-v3.html` (v3 Wildcard). Accessibility floor
> NON-NEGOTIABLE (design §8 / UR §6). M1 (`src/engine.ts`, `src/types.ts`) is FROZEN — consumed read-only.
>
> **Status tracking:** [PENDING] → [IN PROGRESS] → [DONE]

## Group 0 — Vite scaffold over the existing M1 package
- [DONE] T-101 — add `vite@8.0.16` dev-dependency to root `package.json`
- [DONE] T-102 — add `"dev": "vite"` script
- [DONE] T-103 — add `"build": "tsc --noEmit && vite build"` script
- [DONE] T-104 — add `"preview": "vite preview"` script
- [DONE] T-105 — create `vite.config.ts` (minimal, default root, default dist)
- [DONE] T-106 — create `index.html` with `#app` mount + module script
- [DONE] T-107 — create placeholder `src/ui/main.ts` stub
- [DONE] T-108 — verify `npm run build` emits static `dist/`

## Group 1 — HTML structure (port v3 markup, 15-key grid)
- [DONE] T-109 — calculator body glass-panel wrapper in `#app`
- [DONE] T-110 — display sub-panel container `role="status"` + `aria-live="polite"`
- [DONE] T-111 — pending-expression line element
- [DONE] T-112 — primary readout element (init `0`)
- [DONE] T-113 — keypad grid container
- [DONE] T-114 — row-1 `AC CE ÷ ×` buttons + aria-labels
- [DONE] T-115 — row-2 `7 8 9 −` buttons (subtract U+2212)
- [DONE] T-116 — row-3 `4 5 6 +` buttons
- [DONE] T-117 — row-4/5 `1 2 3 =` (= spans 2 rows)
- [DONE] T-118 — row-5 `0` (span 2 cols) + `.`
- [DONE] T-119 — stable data-attr identifier per button (INT-4)

## Group 2 — Design tokens as CSS custom properties
- [DONE] T-120 — `src/ui/styles/tokens.css` v3 color tokens on `:root`
- [DONE] T-121 — aurora/background gradient tokens
- [DONE] T-122 — glass-recipe structural tokens (blur/radius/shadow)
- [DONE] T-123 — import `tokens.css` first in stylesheet entry

## Group 3 — Glass CSS (port v3 visual, token-driven)
- [DONE] T-124 — `src/ui/styles/layout.css` gradient canvas + flex-center body
- [DONE] T-125 — calculator-body glass recipe (backdrop-filter + -webkit- twin)
- [DONE] T-126 — `@supports not` higher-alpha fallback
- [DONE] T-127 — display sub-panel recessed contrast scrim
- [DONE] T-128 — primary readout type (clamp, tabular-nums)
- [DONE] T-129 — pending-line type (reserved vertical space)
- [DONE] T-130 — `src/ui/styles/keypad.css` 4-col grid
- [DONE] T-131 — `=` 2-row span + `0` 2-col span
- [DONE] T-132 — digit button style (≥64px glass pane)
- [DONE] T-133 — operator button style (accent fill + glyph)
- [DONE] T-134 — equals button style (accent, high-emphasis)
- [DONE] T-135 — AC/CE util button de-emphasis
- [DONE] T-136 — v3 signature effects (aurora drift, glow, sheen)

## Group 4 — M1 import + held-state wiring (INT-1)
- [PENDING] T-137 — `src/ui/state.ts` import M1 public API
- [PENDING] T-138 — single held `let state: EngineState = initialState()`
- [PENDING] T-139 — `dispatch(fn)` replace-cell + render helper

## Group 5 — Operator/glyph/key map constant (INT-5)
- [PENDING] T-140 — `src/ui/operator-map.ts` key→Operator frozen map
- [PENDING] T-141 — Operator→true-Unicode glyph frozen map

## Group 6 — Render function (display + pending line + glyphs)
- [PENDING] T-142 — `src/ui/render.ts` `render(state)` primary readout
- [PENDING] T-143 — tag→sentence exhaustive switch over ErrorTag
- [PENDING] T-144 — `pendingLine(state)` derivation
- [PENDING] T-145 — error CSS class toggle (derived)
- [PENDING] T-146 — call `render(state)` once at app start

## Group 7 — Click binding (click ≡ keyboard convergence)
- [PENDING] T-147 — digit-button clicks → inputDigit
- [PENDING] T-148 — `.` click → inputDecimal
- [PENDING] T-149 — operator clicks → inputOperator (via map)
- [PENDING] T-150 — `=` click → inputEquals
- [PENDING] T-151 — `CE` click → inputClearEntry
- [PENDING] T-152 — `AC` click → inputAllClear

## Group 8 — Keyboard binding + whitelist (INT-4, flow 8)
- [PENDING] T-153 — single document-level keydown listener
- [PENDING] T-154 — early-return on ctrl/meta/alt
- [PENDING] T-155 — whitelist digits 0–9
- [PENDING] T-156 — whitelist `.`
- [PENDING] T-157 — whitelist `+ - * /` (preventDefault on `/`)
- [PENDING] T-158 — whitelist Enter + `=`
- [PENDING] T-159 — whitelist Escape → all-clear
- [PENDING] T-160 — non-whitelisted keys early-return (Backspace no-op)

## Group 9 — Error-state rendering polish (INT-2, INT-6)
- [PENDING] T-161 — error sentence style (color + words)
- [PENDING] T-162 — pending line hidden during error (assertion hook)
- [PENDING] T-163 — CE/AC reachable during error

## Group 10 — Long-number display: shrink → scroll (D-006)
- [PENDING] T-164 — `fitDisplay()` shrink font toward floor
- [PENDING] T-165 — horizontal scroll (right-anchored) at floor
- [PENDING] T-166 — exponent strings render fully

## Group 11 — Motion + reduced-motion (F11, UR-025)
- [PENDING] T-167 — button `:active` press-scale
- [PENDING] T-168 — `:hover` fill-alpha + glow
- [PENDING] T-169 — focus ring 3px accent + 3px offset
- [PENDING] T-170 — result fade+rise on equals
- [PENDING] T-171 — guard repeated `=` no re-fire
- [PENDING] T-172 — `prefers-reduced-motion` → instant

## Group 12 — Responsive layout + reserved M3/M4 slots
- [PENDING] T-173 — body max-width 360px centered (desktop)
- [PENDING] T-174 — phone layout (≤640px, ≥44px targets)
- [PENDING] T-175 — flex container w/ reserved M3 history slot
- [PENDING] T-176 — reserve top-right corner for M4 toggle
- [PENDING] T-177 — landscape-phone reachable (scroll not clip)

## Group 13 — Fonts (self-hosted Inter, D-004)
- [PENDING] T-178 — add Inter `.woff2` (300/400/500) to `src/ui/fonts/`
- [PENDING] T-179 — `@font-face` declarations (font-display: swap)
- [PENDING] T-180 — preload display weight (300)
- [PENDING] T-181 — reconcile v3 display font (Space Grotesk CDN → self-host or Inter-300)

## Group 14 — Verification (tsc + build + manual; REVIEW does browser e2e)
- [PENDING] T-182 — `tsc --noEmit` across M1+M2
- [PENDING] T-183 — `npm run build` static `dist/`
- [PENDING] T-184 — manual smoke (12+3=15, 5÷0=error, AC)
- [PENDING] T-185 — manual a11y spot-check (focus order, role=status)
- [PENDING] T-186 — grep: no theme hex outside tokens.css
- [PENDING] T-187 — hand off to REVIEW (Playwright e2e queued)
