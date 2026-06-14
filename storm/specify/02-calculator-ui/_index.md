---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/specify/02-calculator-ui/01-data-model.md
  - storm/specify/02-calculator-ui/02-flows.md
  - storm/specify/02-calculator-ui/03-rules.md
  - storm/specify/02-calculator-ui/04-ui.md
  - storm/specify/02-calculator-ui/04-ui/_picked.md
  - storm/specify/02-calculator-ui/05-edge-cases.md
  - storm/specify/02-calculator-ui/06-tech-choices.md
  - storm/specify/02-calculator-ui/_decisions.md
---

# M2 Calculator UI / Keypad — Module Index

> **Tiers used:** this index was drafted by a sonnet sub-agent per `_briefing.md`. It **collates** the
> seven M2 concern files into the authoritative BUILD task list. Field/function/token/rule names below
> match the verified M1 contract (`_briefing.md`) and the M2 concerns exactly.

## What M2 is

M2 is the **first demo-able surface** of the calculator — the screen that ends M1's one-module dark
stretch (`06-build-order.md:44,84`; `_briefing.md` intro). It is a **vanilla-TypeScript view + input
layer** over M1's pure, frozen arithmetic engine: a single glass keypad screen that renders M1's held
`EngineState` and binds click + keyboard input to M1's reducers.

The architecture is a **classic reducer host** (INT-1): M2 holds **one** `EngineState` value, calls the
matching M1 `inputX(state, …)` on every keypress, **replaces** the held value with the return, and
re-renders. M2 **never computes** (F2) — all arithmetic, chaining, precedence, decimal entry,
divide-by-zero, overflow, and error latching belong to M1 (`R-001..R-027`, frozen REVIEW-PASS). M2 owns
only **rendering** the state to pixels, **binding** input safely (INT-4 whitelist), and the **craft
floor** (accessibility, contrast, tokens, responsiveness) the rendered surface must clear. It consumes
M1 **read-only** as a typed import; it adds no engine field and invents no calculation path.

Scope boundary: M2 is the keypad + display **only**. **No history panel** (M3, F3 — M2 reserves a layout
slot, does not build it), **no theme toggle** (M4, F4 — M2 ships one default theme authored against
tokens, reserves the corner), **no `±`/`%`** (out of scope, `04-scope.md` — 4-function only), no
persistence (F5 — in-memory, dies with the tab).

**Tech stack (all CP-6 verified — `06-tech-choices.md`):**
- **UI approach:** Vanilla TypeScript — no UI framework (Svelte/Solid/Preact/Lit rejected, D-001). One
  held `EngineState` + a small imperative `render(state)`; a framework's reactive-diffing value is muted
  at a one-screen, one-state-value surface, and vanilla buys unmediated glass-CSS control + zero
  framework runtime-debt.
- **Language:** TypeScript 6.0.3 (continuity with M1 — the integration seam is compiler-checked).
- **Bundler / dev-server:** Vite 8.0.16 (D-002) — `vite build` emits a static `dist/` (HTML+CSS+JS, no
  server runtime) for the Dokploy Static / NGINX target; Vitest-aligned, one pipeline with M1.
- **CSS:** plain CSS with custom-property design tokens (D-003) — no CSS-in-JS, no CSS framework. The
  token layer is the swap surface M4 owns (F4).
- **Fonts:** Inter, self-hosted `.woff2`, weights 300/400/500 (D-004) — no Google Fonts CDN.
- **Runtime dependency footprint:** M1 (decimal.js, already in the tree) + M2's own code. No store,
  router, component kit, or animation library (`06-tech-choices.md` §6).

## Visual baseline — LOCKED BUILD target

The BUILD target is **v3 Wildcard (maximalist aurora glass)** — `04-ui/mockup-v3.html` (commit
`a45e580`, owner-picked 2026-06-15 per `_picked.md`). It maximizes the product's one first-class quality
axis ("simple aja, tapi secara design ga bosenin") at its ceiling: animated aurora canvas, sculptural
tilted slab, characterful display font, vibrant accent system — while preserving the owner-locked
glassmorphism DNA. v3 ships the exact 15-key 4-col grid (`AC CE ÷ ×` / `7 8 9 −` / `4 5 6 +` /
`1 2 3 =` / `0`-span2 `.` `=`-span2-rows).

**The accessibility craft floor is locked and may NOT regress in BUILD (C3, design §8, UR §6):** real
`<button>`s, visible focus rings (≥2px accent, ≥2px offset), ≥64px targets, `aria-live`/`role="status"`
display, true-Unicode glyphs, operators distinguished by glyph+fill (not color alone), error conveyed by
sentence text (not color alone), `prefers-reduced-motion` reduces all animation to instant, WCAG AA
contrast (display ≥4.5:1, labels ≥3:1) at the worst gradient point — v3 sits the readout on a near-opaque
contrast scrim (~17:1) to clear AA against the animated backdrop.

---

## Concern files

| File | Description |
|---|---|
| [`_briefing.md`](_briefing.md) | Orchestrator-authored entry brief — canonical facts (F1–F13), domain lens, the **M1 integration contract (INT-1..INT-6) verified against `src/`**, open questions (OQ1–OQ3), concern set. Read first by all sub-agents. |
| [`01-data-model.md`](01-data-model.md) | The held view state: **one** `EngineState` cell replaced atomically (INT-1); zero invented JS state fields (focus/reduced-motion/error-styling all DOM-native or derived); the three derivations (primary display tag→sentence §3.1, pending line §3.2, operator↔glyph↔key map §3.3); lifecycle; buffer-hygiene invariant (INT-4). Decisions D-M2-DM-01..04. |
| [`02-flows.md`](02-flows.md) | The 8 keypad flows (digit, decimal, operator, equals, CE/AC, error-latched, app-load, keyboard-binding). Every flow is the same three-beat shape: trigger → whitelist/map → one M1 `inputX` → replace cell → re-render. Click ≡ keyboard convergence (`03-modules.md:67`); flow 8 is the whitelist-then-dispatch table. |
| [`03-rules.md`](03-rules.md) | 32 numbered, testable UI rules (UR-001..UR-032): display rendering (§1), pending line (§2), input binding click≡keyboard + whitelist (§3), operator/glyph map (§4), error-state UI (§5), accessibility (§6, non-negotiable), contrast (§7), token consumption not hardcoding (§8), responsive 4-col grid + reserved M3 slot (§9). Consumer rules only — no arithmetic restated. Decision D-005. |
| [`04-ui.md`](04-ui.md) | Build-ready UI spec: single glass body center-stage, two-line display sub-panel, concrete 4-col 15-key grid, per-state visual spec (fresh/mid-entry/result/error), interaction states (hover/active/focus/result-motion/reduced-motion), responsive + reserved M3/M4 slots, accessibility callouts, the 3-variant mockup brief. Ties every visual to a `§N` design section or `UR-NNN`. |
| [`04-ui/_picked.md`](04-ui/_picked.md) | **The locked visual baseline:** v3 Wildcard (`mockup-v3.html`, commit `a45e580`) — owner taste pick (CP-7). What v3 keeps (glass DNA, accessibility floor, 15-key grid, token-as-custom-property). M4 reconciliation note (v3's aurora/Space-Grotesk/accents are the surface M4 themes — a real content-level dependency, not a blocker for M2). |
| [`05-edge-cases.md`](05-edge-cases.md) | 55 UI edge cases (UE-001..UE-055) across 10 categories: long-number display (shrink→scroll), error rendering, glass `backdrop-filter` fallback, keyboard whitelist + don't-hijack-shortcuts, focus/tap, pending-line derivation, responsive layout, reduced-motion, repeated-equals visual no-op, faithful decimal/edge-input rendering. Each row is a discrete REVIEW scenario; none re-tests M1 math. Decision D-006. |
| [`06-tech-choices.md`](06-tech-choices.md) | CP-6-verified picks: vanilla-TS (the OQ1 head-to-head, with bespoke-LOC delta + override-constraint named) vs Svelte 5.56.3 runner-up; Vite 8.0.16 bundler; TS 6.0.3 continuity; plain-CSS tokens; self-hosted Inter. Anti-inflation list (no store/router/component-kit/animation-lib). All claims carry live-tool cites (npm registry + Context7 + WebFetch, June 2026). |
| [`_decisions.md`](_decisions.md) | Index of 6 AI-autonomous technical decisions (D-001..D-006): vanilla-TS, Vite, plain-CSS-tokens, self-hosted Inter, Backspace no-op, long-number shrink→scroll. Plus the four data-model sub-decisions (D-M2-DM-01..04) and D-005 logged in their concern files. |

---

## BUILD task list — M2 Calculator UI / Keypad

> **Granularity discipline (HARD):** each task ≤ ~1.5 min of work, ≤ 1 file or 1 logical unit. No
> "and"-joined tasks, no "build the whole UI" tasks. Each task carries a **Done when** check.
> M2 is a view layer — TDD is less natural than M1's pure logic, so tasks state the *verifiable* check
> that fits (tsc passes / page renders / DOM assertion / focus ring visible). Full browser e2e
> verification (Playwright) is the **REVIEW** phase's job, not embedded here — but every task leaves the
> surface verifiable. Tasks trace to `UR-NNN` / `UE-NNN` / flow numbers where natural.
>
> **Decision authority:** every task below is AI-autonomous (technical) per CP-7.
> **Context note:** M1 lives at the repo root (`src/`, root `package.json` + `tsconfig.json` +
> `vitest.config.ts`). M2 adds Vite + `index.html` + the UI source into the **same** package — it does
> **not** create a second package; it extends the existing one (D-002 one-pipeline rationale).
> **Build target:** `04-ui/mockup-v3.html` (v3 Wildcard) is the literal markup/CSS source to port — UI
> tasks translate that mockup into the token-driven, M1-wired app, holding the §6/UR-§6 accessibility
> floor.

---

### Group 0 — Vite scaffold over the existing M1 package

| # | Task | Done when |
|---|---|---|
| T-101 | Add `vite@8.0.16` as a dev-dependency to the root `package.json` (D-002) | `vite` appears in `devDependencies`; `package-lock.json` updated; version pinned `8.0.16`. |
| T-102 | Add `"dev": "vite"` script to `package.json` scripts | `npm run dev` resolves to `vite`. |
| T-103 | Add `"build": "tsc --noEmit && vite build"` script to `package.json` | `npm run build` is defined and runs typecheck before bundling. |
| T-104 | Add `"preview": "vite preview"` script to `package.json` | `npm run preview` is defined. |
| T-105 | Create `vite.config.ts` at repo root — minimal config, default `root`, default `dist` outDir (D-002 static-build target) | File exists; `vite build` discovers `index.html` and emits to `dist/`. |
| T-106 | Create `index.html` at repo root with a `<div id="app">` mount node and a `<script type="module" src="/src/ui/main.ts">` tag (stub `main.ts` ok for now) | `npm run dev` serves a blank page with the mount node present; no console error for the script tag. |
| T-107 | Create placeholder `src/ui/main.ts` exporting/running nothing yet (structural stub) | File exists; `tsc --noEmit` passes; Vite dev server loads it without error. |
| T-108 | Verify `npm run build` produces a static `dist/` (HTML+CSS+JS, no server) from the stub | `dist/index.html` + hashed asset emitted; exit 0. |

---

### Group 1 — HTML structure (port v3 markup, 15-key grid)

> Source: `04-ui/mockup-v3.html` body + `04-ui.md §3` grid. Real `<button>`s only (UR-019).

| # | Task | Done when |
|---|---|---|
| T-109 | In `index.html`, add the calculator body container as a single glass panel wrapper inside `#app` (the center-stage glass object, `04-ui.md §1`) | A body container element exists; page renders one centered panel region. |
| T-110 | Add the display sub-panel container with `role="status"` + `aria-live="polite"` (UR-023, UE-031) inside the body | Display container present; `aria-live="polite"` + `role="status"` attributes set. |
| T-111 | Add the pending-expression line element (secondary, above the readout) inside the display sub-panel (UR-006, `04-ui.md §2.1`) | A dedicated pending-line element exists above the primary readout element. |
| T-112 | Add the primary readout element (large) inside the display sub-panel (UR-001, `04-ui.md §2.2`) | A primary readout element exists; initial text `0`. |
| T-113 | Add the keypad `<div>` as the grid container below the display (UR-030, 4-col grid) | Keypad container exists below the display sub-panel. |
| T-114 | Add the row-1 buttons `AC`, `CE`, `÷`, `×` as real `<button>`s with `aria-label`s ("All clear", "Clear entry", "Divide", "Multiply") (UE-031, `04-ui.md §6`) | 4 `<button>`s present; operator faces show U+00F7 / U+00D7 (UR-014); aria-labels spelled out. |
| T-115 | Add the row-2 buttons `7`, `8`, `9`, `−` as `<button>`s (subtract face = U+2212, aria-label "Subtract") | 4 `<button>`s present; subtract glyph is U+2212, not hyphen (UR-014). |
| T-116 | Add the row-3 buttons `4`, `5`, `6`, `+` as `<button>`s (add aria-label "Add") | 4 `<button>`s present; `+` is U+002B. |
| T-117 | Add the row-4/5 buttons `1`, `2`, `3`, `=` (equals aria-label "Equals"), with `=` marked to span 2 rows (`04-ui.md §3` span) | `1 2 3 =` present; `=` carries the row-span styling hook (class/attr). |
| T-118 | Add the row-5 buttons `0` (marked to span 2 cols) and `.` (`04-ui.md §3` span) | `0` carries the col-span hook; `.` present; 15 keys total now in DOM. |
| T-119 | Give each digit/operator button a stable identifier (e.g. `data-digit` / `data-op` / `data-action`) carrying its own value, so binding reads it (INT-4, no raw-string injection) | Every button exposes a typed data-attribute the handler can read (digit char, `Operator` union member, or action name). |

---

### Group 2 — Design tokens as CSS custom properties

> Source: v3 mockup `:root` token block. All theme colors are `var(--token)` (UR-029, D-003).

| # | Task | Done when |
|---|---|---|
| T-120 | Create `src/ui/styles/tokens.css` and define the v3 color tokens on `:root` (accent, operator-accent, error, text-on-scrim, text-primary, text-secondary, glass fills) ported from the v3 mockup | File exists; tokens defined as custom properties; no component rule yet. |
| T-121 | Add the v3 background/aurora gradient tokens (`--bg-gradient` + aurora stops) to `:root` in `tokens.css` | Gradient tokens defined as custom properties. |
| T-122 | Add the glass-recipe structural tokens (blur px, radius, border, elevation shadows) to `tokens.css` (these may be structural literals per UR-029 note) | Blur/radius/shadow values present as tokens or documented structural literals. |
| T-123 | Import `tokens.css` first in the app stylesheet entry (so component rules can reference tokens) | Tokens resolve in DevTools computed styles on `:root`. |

---

### Group 3 — Glass CSS (port v3 visual, token-driven)

> Source: v3 mockup `<style>`. Every theme color references a token (UR-029); no hardcoded theme hex in component rules.

| # | Task | Done when |
|---|---|---|
| T-124 | Create `src/ui/styles/layout.css` — full-viewport gradient canvas + flex-center the body, `min-height:100vh` (`04-ui.md §1`, UR-031) | Body panel renders centered on the gradient at desktop width. |
| T-125 | Add the calculator-body glass recipe to `layout.css` (`--glass-fill`, `backdrop-filter: blur() saturate()` + `-webkit-` twin, border, two-layer elevation, `border-radius:24px`) (`04-ui.md §1`, UE-017) | Body shows frosted glass with blur; `-webkit-backdrop-filter` twin present. |
| T-126 | Add the `@supports not (backdrop-filter: blur(1px))` higher-alpha fallback fill for the body (UE-015, design §5) | With blur disabled, body falls back to a higher-alpha solid-ish fill, never transparent-no-blur. |
| T-127 | Style the display sub-panel as the recessed contrast-scrim window (`--glass-fill-display`, near-opaque scrim per v3, `border-radius:20px`) (`04-ui.md §2`, UE-016) | Display sub-panel renders as a distinct recessed pane with the readout legible over it. |
| T-128 | Style the primary readout type: `clamp(2.5rem,12vw,4rem)`, weight 300, `--text-on-scrim`, right-aligned, `tabular-nums` (UR-003, UR-004, `04-ui.md §2.2`) | Readout renders large, right-aligned; typing `111` then `888` does not shift glyph x-positions (UR-004). |
| T-129 | Style the pending-expression line type: `0.875rem`, weight 400, `--text-on-scrim-soft`/`--text-secondary`, right-aligned, `tabular-nums`; reserve its vertical space so show/hide does not shove the readout (`04-ui.md §2.1`, UE-035) | Pending line renders smaller above the readout; toggling its text does not move the big number. |
| T-130 | Create `src/ui/styles/keypad.css` — the 4-col grid (`repeat(4,1fr)`, gap 10–12px) (UR-030) | Keypad renders as a 4-column grid. |
| T-131 | Add the `=` 2-row span and `0` 2-col span rules to `keypad.css` (`04-ui.md §3`) | `=` occupies 2 rows in the right column; `0` occupies 2 cols in the bottom row; layout matches the v3 grid. |
| T-132 | Style digit buttons: `--glass-fill` pane, `--text-primary` label, Inter 1.5rem/500, ≥64px (UR-022, `04-ui.md §3`) | Digit buttons render as glass panes ≥64×64px. |
| T-133 | Style operator buttons: `--operator-accent` fill + glyph (glyph+fill distinguishes, not color alone — UR-024) | Operator buttons render with the coral accent fill and the true-Unicode glyph. |
| T-134 | Style the equals button: `--accent` fill, high-emphasis (`04-ui.md §3`) | `=` renders with the indigo accent fill, visually dominant. |
| T-135 | Style AC/CE util buttons: de-emphasized `--text-secondary` label so they read secondary (`04-ui.md §3`) | AC/CE render visibly de-emphasized vs digits/operators, but reachable. |
| T-136 | Port the v3 signature effects (aurora drift, under-glow/blob, top-edge sheen, key glow) as CSS animations/layers (`04-ui.md §7 v3`, `_picked.md`) | v3 aurora + glow effects render; visual matches the picked mockup. |

---

### Group 4 — M1 import + held-state wiring (INT-1)

| # | Task | Done when |
|---|---|---|
| T-137 | In `src/ui/state.ts`, import M1's public API (`initialState`, the `inputX` reducers, `getDisplayValue`, `EngineState`, `Operator`, `ErrorTag`) from `../engine` / `../types` | tsc passes; imports resolve against M1's frozen exports. |
| T-138 | Declare the single held-state cell as a module-scoped `let state: EngineState` initialized to `initialState()` (INT-1, D-M2-DM-01, flow 7) | `state` holds a fresh `EngineState`; no second state object exists. |
| T-139 | Write a `dispatch(fn)` helper that replaces the held cell with `fn(state)`'s return then calls `render(state)` (INT-1 reducer contract, UR-010 — replace never mutate) | `dispatch` swaps the reference (no in-place mutation) and triggers a re-render. |

---

### Group 5 — Operator/glyph/key map constant (INT-5)

| # | Task | Done when |
|---|---|---|
| T-140 | In `src/ui/operator-map.ts`, define a frozen input-key/button → `Operator` map (`+`→`'add'`, `-`→`'subtract'`, `*`→`'multiply'`, `/`→`'divide'`) (UR-013, D-M2-DM-04) | Frozen constant exported; tsc passes; the four mappings present. |
| T-141 | In the same file, define a frozen `Operator` → true-Unicode glyph map (`'add'`→`+` U+002B, `'subtract'`→`−` U+2212, `'multiply'`→`×` U+00D7, `'divide'`→`÷` U+00F7) (UR-013, UR-014) | Frozen glyph map exported; subtract maps to U+2212 (not hyphen). |

---

### Group 6 — Render function (display + pending line + glyphs)

| # | Task | Done when |
|---|---|---|
| T-142 | In `src/ui/render.ts`, write `render(state)` that writes the primary readout from `getDisplayValue(state)` (UR-001, §3.1) | Readout text reflects `getDisplayValue` for a numeric state. |
| T-143 | Add the tag→sentence mapping in `render`: exhaustive `switch` over `ErrorTag` — `'divide-by-zero'`→"Cannot divide by zero", `'overflow'`→"Number too large" (UR-002, D-M2-DM-02, UE-008/UE-009) | Rendering a `'divide-by-zero'` state shows the sentence, not the raw tag; branch is on the literal. |
| T-144 | Add `pendingLine(state)` derivation in `render`: show `<accumulator.toString()> <glyph(op)>` only when `accumulator!==null && pendingOperator!==null && errorState===null && justEvaluated===false`; empty otherwise (UR-007, UR-008, D-M2-DM-03, UE-036/UE-037/UE-038) | Pending line shows `12 +` for that state and is empty in fresh/post-equals/error states. |
| T-145 | In `render`, toggle the error CSS class on the display from `state.errorState !== null` (derived, not stored — UR-016, §2, UE-011) | Error class is present iff `errorState` is non-null; cleared by derivation on the next non-error render (UR-018, UE-014). |
| T-146 | Call `render(state)` once at app start (flow 7, app-load) from `main.ts` | On load the readout shows `0`, pending line hidden, no error class. |

---

### Group 7 — Click binding (click ≡ keyboard convergence)

| # | Task | Done when |
|---|---|---|
| T-147 | Bind digit-button clicks → `dispatch(s => inputDigit(s, <data-digit>))` (flow 1, UR-009) | Clicking `7` updates the readout to `7`. |
| T-148 | Bind the `.` button click → `dispatch(inputDecimal)` (flow 2, UR-009) | Clicking `.` from fresh shows `0.` (UE-050). |
| T-149 | Bind operator-button clicks → map `data-op` via operator-map → `dispatch(s => inputOperator(s, op))` (flow 3, UR-009, INT-5) | Clicking `+` after `12` shows pending line `12 +`. |
| T-150 | Bind the `=` button click → `dispatch(inputEquals)` (flow 4, UR-009) | `12 + 3 =` shows `15`; pending line clears (UE-049). |
| T-151 | Bind the `CE` button click → `dispatch(inputClearEntry)` (flow 5.1, UR-009) | CE resets the readout to `0`, keeps a pending op visible (UE row, flow 5.1). |
| T-152 | Bind the `AC` button click → `dispatch(inputAllClear)` (flow 5.2, UR-009) | AC returns to fresh `0`, pending line hidden, error cleared. |

---

### Group 8 — Keyboard binding + whitelist (INT-4, flow 8)

| # | Task | Done when |
|---|---|---|
| T-153 | Attach one document-level `keydown` listener at mount (flow 8, flow 7) | A single global keydown handler is registered; keyboard input is live without first clicking. |
| T-154 | In the handler, early-return (ignore, no `preventDefault`) on any event with `ctrlKey`/`metaKey`/`altKey` set (UE-023, UE-024 — don't hijack browser shortcuts) | `Ctrl/Cmd+C`, `Cmd+R`, `F12` pass through; calculator does nothing. |
| T-155 | Whitelist+dispatch digits `'0'`–`'9'` → `dispatch(s => inputDigit(s, key))` (UR-011, flow 8) | Pressing number keys appends digits; matches the click path (UE-025). |
| T-156 | Whitelist+dispatch `'.'` → `dispatch(inputDecimal)` (UR-011) | `.` key behaves identically to the `.` button. |
| T-157 | Whitelist+dispatch operator keys `+ - * /` via operator-map → `dispatch(s => inputOperator(s, op))`; `preventDefault` on `/` (Firefox quick-find) (UR-011, flow 8) | `+ - * /` keys set the operator; `/` does not trigger browser quick-find. |
| T-158 | Whitelist+dispatch `'Enter'` and `'='` → `dispatch(inputEquals)` (UR-011, UR-015, UE-021) | Both Enter and `=` resolve equals. |
| T-159 | Whitelist+dispatch `'Escape'` → `dispatch(inputAllClear)` (UR-011, UR-015, UE-022) | Esc performs all-clear. |
| T-160 | Ensure every non-whitelisted key (letters, `Backspace`, `F5`, arrows, …) returns early with zero M1 call and no `preventDefault` (UR-011, UR-012 Backspace no-op, D-005, UE-020) | Pressing `a`/`Backspace`/`F5` produces no state change and no engine call. |

---

### Group 9 — Error-state rendering polish (INT-2, INT-6)

| # | Task | Done when |
|---|---|---|
| T-161 | Style the error sentence in the readout: `--error` color **plus** the words (not color alone — UR-026, UE-011), wrap/scale to fit the panel (`04-ui.md §2 note`, UE-010) | A `'divide-by-zero'` state renders "Cannot divide by zero" inside the panel without overflowing; conveyed by text, not tint only. |
| T-162 | Confirm the pending line is hidden during error (already by T-144 condition a) — add the assertion hook/markup state (UE-013, UE-038) | In an error state the pending line element renders empty. |
| T-163 | Keep CE/AC (and Esc) visually active/reachable during error so the escape is legible — do not disable other buttons (M1 no-ops them) (UR-017, UE-014, INT-6) | During error, CE/AC remain styled-active; digit clicks visibly do nothing (engine no-op), CE/AC clear the latch. |

---

### Group 10 — Long-number display: shrink → scroll (D-006)

| # | Task | Done when |
|---|---|---|
| T-164 | Add a `fitDisplay()` step in `render` that measures the readout text width against the panel and steps the font-size down from the `clamp()` default toward a `~1.25rem` floor (D-006, UE-001, UE-007) | A 21-digit value shrinks to fit; a short value renders at default size (UE-006 — not sticky). |
| T-165 | Make the readout line horizontally scrollable (`overflow-x`, right-anchored) when it still overflows at the font floor (D-006, UE-002, UE-005) | A value too long at the floor scrolls horizontally, right-anchored so least-significant digits + sign stay in view. |
| T-166 | Verify exponent strings (e.g. `1.23e+30`) render fully via the same path — the `e+NN` suffix is never clipped (UE-003, UE-004) | An exponent result shows the full `e+NN` suffix; `1 ÷ 3 =` renders the full precision string. |

---

### Group 11 — Motion + reduced-motion (F11, UR-025)

| # | Task | Done when |
|---|---|---|
| T-167 | Add the button `:active` press-scale `0.96` + fill-brightness lift (`transform 80ms`, `background 120ms`) (`04-ui.md §4.3`, design §7) | Pressing a button (mouse) scales it briefly and springs back. |
| T-168 | Add the `:hover` fill-alpha + faint glow (`150ms`) on desktop (`04-ui.md §4.3`) | Hovering a button raises its fill subtly. |
| T-169 | Add the focus ring: `2px solid var(--accent)` + `2px` offset on `:focus-visible`, never bare `outline:none` (UR-020, UE-027, UE-032) | Tabbing to any button shows a ≥2px accent ring fully outside the rounded edge (not clipped). |
| T-170 | Add the result fade+rise on the readout for equals: `opacity 0→1` + `translateY(6px→0)` over `200ms ease-out` (`04-ui.md §4.3`, flow 4, UE-049) | The genuine equals result animates in once. |
| T-171 | Guard the result animation so a state-unchanged repeated `=` does NOT re-fire it (UE-047, UE-048, D-017 no-op) | `3 + 4 = =` does not re-trigger the fade on the second `=`; no flicker. |
| T-172 | Add `@media (prefers-reduced-motion: reduce)` block dropping all transforms/translates (press, hover-glow motion, result rise) → instant (UR-025, UE-044, UE-046) | With reduced-motion emulated, no transform/translate transition fires; value swaps are instant. |

---

### Group 12 — Responsive layout + reserved M3/M4 slots

| # | Task | Done when |
|---|---|---|
| T-173 | Set the body `max-width:360px` centered on desktop (≳640px) (UR-031, UE-041) | At 1280px the body stays 360px wide, centered, not full-stretch. |
| T-174 | Add the phone layout (≲640px): full-width body with `16px` page margin; grid holds 4 cols; buttons stay ≥44px at 320px (UR-031, UE-028, UE-040) | At 360px and 320px all 15 controls are visible, unclipped, ≥44px; no horizontal page scroll. |
| T-175 | Wrap the calculator body in a flex container (row on desktop / column on phone) that leaves a sibling slot for M3's history — do NOT build the panel (UR-032, F3, UE-043) | The body sits in a layout with an empty reserved sibling slot; M2 renders no history markup. |
| T-176 | Reserve the top-right corner inside the body for M4's theme toggle — leave it empty, occupy nothing M2 needs back (F4, `04-ui.md §5`) | The top-right corner is unoccupied by M2 controls. |
| T-177 | Confirm landscape-phone (short height) keeps the centered body reachable (page scrolls to it rather than clipping the display/bottom row) (UE-042) | In a short-height viewport the full keypad is reachable, not clipped. |

---

### Group 13 — Fonts (self-hosted Inter, D-004)

| # | Task | Done when |
|---|---|---|
| T-178 | Add the Inter `.woff2` files (Latin subset, weights 300/400/500) into `src/ui/fonts/` (D-004) | Three `.woff2` files present in the bundle source; no Google Fonts CDN `<link>` in `index.html`. |
| T-179 | Declare `@font-face` for the three Inter weights with `font-display: swap` in `src/ui/styles/fonts.css` (D-004) | Inter resolves locally; `font-display: swap` set. |
| T-180 | Preload the display weight (300) via a `<link rel="preload">` in `index.html` (D-004) | The 300-weight font is preloaded; the big readout paints with Inter. |
| T-181 | Reconcile the v3 display font (mockup used Space Grotesk via CDN): either self-host Space Grotesk for the display per the picked baseline, or apply Inter-300 — record the choice inline as a build note tied to D-004/`_picked.md` | The display font is self-hosted (no CDN call remains); the choice is noted; readout still clears AA on the scrim. |

---

### Group 14 — Verification (tsc + build + manual; REVIEW does browser e2e)

| # | Task | Done when |
|---|---|---|
| T-182 | Run `tsc --noEmit` across `src/` (M1 + M2) | Exit 0; zero type errors at the M1/M2 seam (INT-1..INT-6 compiler-checked). |
| T-183 | Run `npm run build` — produce the static `dist/` for the NGINX target (D-002) | Exit 0; `dist/` contains `index.html` + hashed CSS/JS + fonts; no server runtime. |
| T-184 | Manual smoke in `npm run preview`: a full chain `12 + 3 =` shows `15`; `5 ÷ 0 =` shows "Cannot divide by zero"; AC resets (flows 1–6) | The three checks pass by eye in the preview build. |
| T-185 | Manual a11y spot-check: Tab visits buttons in reading order with a visible focus ring; display announces via `role="status"` (UR-020, UR-021, UR-023) | Focus order is reading-order; ring visible; live region present. |
| T-186 | Confirm no theme hex/rgba literal appears in component CSS outside `tokens.css` (UR-029 grep check) | `grep` for theme hex/rgba in component rules returns none (only `var(--token)`). |
| T-187 | Hand off to REVIEW for browser-based verification (Playwright) of the 55 UE rows + 32 UR rules against the running build | A REVIEW entry is queued; M2 BUILD marked feature-complete and verifiable. |

---

## Decision logged this pass

**D-007 — Task-granularity encoding for M2 BUILD.**
The M2 BUILD list is encoded as **87 atomic tasks (T-101..T-187) across 15 build groups (0–14)**, each ≤ 1
file / 1 logical unit with a concrete **Done when** check, traced to `UR-NNN` / `UE-NNN` / flow numbers.
Two M2-specific granularity rules were applied: **(a)** the v3 mockup port is split per-row / per-button
/ per-effect rather than one "build the UI" task (Groups 1, 3); **(b)** because M2 is a view layer, each
task states the *fittest verifiable check* (tsc / build / DOM assertion / visual) rather than forcing TDD
— full browser e2e is deferred to REVIEW (Playwright), with the surface left verifiable. Logged in
`_decisions.md` as D-007 (this index is the authority for the task list). *(AI-autonomous, CP-7.)*

---

*Total tasks: 87 (T-101 – T-187), 15 build groups (0–14). Every task is atomic (≤ 1 file or 1 logical*
*unit; no "and"-joins; no "build the whole X").*
*Decisions referenced: D-001..D-006 (`_decisions.md`) + D-M2-DM-01..04 (`01-data-model.md`) + D-005*
*(`03-rules.md`); D-007 (this pass) appended to `_decisions.md`.*
*Coverage: the 8 flows, the 32 UR rules, and the 55 UE rows are each reachable from named tasks; v3*
*Wildcard (`mockup-v3.html`) is the locked visual port target; the §6/UR-§6 accessibility floor is*
*wired in Groups 6/8/9/11/12 and verified in Group 14 + REVIEW.*
