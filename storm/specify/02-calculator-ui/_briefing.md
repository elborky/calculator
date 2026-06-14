---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/03-modules.md
  - storm/structure/04-scope.md
  - storm/structure/06-build-order.md
  - storm/structure/08-design-system.md
  - storm/specify/01-calculation-engine/_index.md
  - storm/specify/01-calculation-engine/01-data-model.md
---

# M2 Calculator UI / Keypad — Orchestrator Briefing

> **Entry brief, orchestrator-authored (#FF-016).** Read first by every M2 SPECIFY sub-agent.
> Synthesizes upstream STRUCTURE + the **M1 integration contract verified against M1 source**
> (not just docs). M2 is the **first demo-able surface** (`06-build-order.md:44`,`84`) — the dark
> stretch ends here. The one first-class product axis ("ga bosenin" / glassmorphism) finally
> gets a screen, so the UX-designer + frontend-craft hats lead this module.

---

## Domain Lens (re-validated this entry — gate W-G24)

**Solo zero-stakes consumer web utility — design-craft-forward, framework-test vehicle**
(`00-domain-lens.md:17`). M2 is the *heart* of the lens: the visual-craft axis is the whole point,
and it lands here. Stakes stay zero — no auth, no data, no server, client-side only
(`00-domain-lens.md:31,66`). No drift; lens holds without revision.

Hats M2 leans on: **UX designer (primary)**, **frontend craft (load-bearing — visual polish IS the
deliverable)**, **accessibility specialist (craft floor C3 — keyboard, focus, contrast hold even at
zero stakes)**. Brake hat: **product strategist (light) — keep the keypad from creeping past
"simple")**. NOT summoned: security-heavy, data-architect, compliance (`00-domain-lens.md:64-70`).

---

## Canonical facts (F-series) — what M2 must honor

### Scope boundary (from `03-modules.md:59-76`, `04-scope.md`)

- **F1 — M2 owns:** the keypad (digits 0–9, four operators, decimal, equals, clear/AC), the
  result display, click→engine binding, keyboard→engine binding, responsive layout, baseline
  usability (`03-modules.md:63-69`; `04-scope.md:30-35`).
- **F2 — M2 does NOT compute.** Every operation delegates to M1. M2 never does arithmetic
  (`03-modules.md:72`). It is a pure view+input layer over the engine.
- **F3 — M2 does NOT render history.** That surface is M3 (`03-modules.md:73`). M2 owns keypad +
  display only. *(But: the design-system reserves placement for the history panel — §6 below. M2's
  layout must leave room / not preclude M3, without building it.)*
- **F4 — M2 does NOT own theming.** It *consumes* design tokens; the light/dark toggle + token set
  live in M4 (`03-modules.md:74`). M2 must author its styles **against CSS custom properties /
  tokens** so M4 can swap them later without touching M2 markup. M2 ships in **one** theme
  (default); the toggle is M4's job.
- **F5 — No persistence, no accounts, single anonymous user** (`03-modules.md:75`;
  `04-scope.md:54`). State is in-memory, dies with the tab.

### Design direction (from `08-design-system.md` — owner-LOCKED aesthetic)

- **F6 — Glassmorphism is owner-confirmed and LOCKED** (`08-design-system.md:13,19`). Frosted
  translucent panes over a soft gradient; crisp text on soft glass on rich gradient. The concrete
  tokens (hex, blur, radius, spacing) in `08-design-system.md` are AI-authored craft and BUILD-tunable,
  but the *direction* is not re-openable here.
- **F7 — The readability discipline is non-negotiable** (`08-design-system.md:142-144`; craft floor
  C3). Glass must clear WCAG AA: display number ≥4.5:1, large button labels ≥3:1, at the *worst*
  point of the gradient under the pane. If a spot fails → raise panel alpha before darkening text.
- **F8 — Keypad layout:** CSS Grid, **4 columns**; buttons `≥64×64px` (above 44px tap floor);
  operators use `--operator-accent`, equals uses `--accent`, digits use `--glass-fill`
  (`08-design-system.md:118-119`). Equals (and optionally 0) may span 2 columns.
- **F9 — Display:** glass sub-panel at top of body, right-aligned, `tabular-nums`, min-height ~96px.
  A **secondary pending-expression line** (smaller, above the big result) is part of the design
  (`08-design-system.md:117`) — see integration note INT-3.
- **F10 — Operator glyphs are true Unicode:** `×` (U+00D7), `÷` (U+00F7), `−` (U+2212) — NOT
  `x / -` (`08-design-system.md:83`). Typeface Inter, weights 300/400/500.
- **F11 — Motion is restrained** (`08-design-system.md:124-136`): button press scale 0.96 (80ms),
  result fade+rise (200ms). Honor `prefers-reduced-motion` (not optional).

### Build-order facts

- **F12 — M2 depends ONLY on M1** (`06-build-order.md:44`). M1 exists, frozen REVIEW-PASS. Nothing
  else needs to exist for M2 to function.
- **F13 — Framework/bundler was deferred to M2.** M1 ran `tsc` type-check only, no app bundler
  (`01-calculation-engine/_index.md:31`). M2's `06-tech-choices.md` owns the build-tool + UI-approach
  decision (vanilla TS vs a framework). This is the module's one significant tech pick.

---

## M1 INTEGRATION CONTRACT — verified against `src/` source (not just docs)

M2 imports M1 as a pure functional library. **Every public export, verified in `src/engine.ts` +
`src/types.ts` this entry:**

### Types (`src/types.ts`)
```ts
type Operator = 'add' | 'subtract' | 'multiply' | 'divide';
type ErrorTag = 'divide-by-zero' | 'overflow';
interface EngineState {
  entryBuffer: string;              // the number currently being typed
  accumulator: Decimal | null;      // stored left-hand value across an operator
  pendingOperator: Operator | null; // op waiting to apply
  justEvaluated: boolean;           // true right after equals
  errorState: ErrorTag | null;      // non-null = latched error
}
```

### Functions (`src/engine.ts`) — all pure: `(state, …) → newState`
| Export | Signature | M2 use |
|---|---|---|
| `initialState()` | `() => EngineState` | seed M2's held state on load + after AC |
| `inputDigit(state, digit)` | `(EngineState, string) => EngineState` | digit buttons 0–9 / number keys |
| `inputDecimal(state)` | `(EngineState) => EngineState` | the `.` button / `.` key |
| `inputOperator(state, op)` | `(EngineState, Operator) => EngineState` | + − × ÷ buttons / `+ - * /` keys |
| `inputEquals(state)` | `(EngineState) => EngineState` | `=` button / Enter or `=` key |
| `inputClearEntry(state)` | `(EngineState) => EngineState` | CE button |
| `inputAllClear(state)` | `(EngineState) => EngineState` | AC button / Esc key |
| `getDisplayValue(state)` | `(EngineState) => string \| ErrorTag` | the value to render in the display |
| `resolveOperation(...)` | internal helper | **M2 does NOT call** — equals/operator already use it |
| `Decimal` (from `decimal-config.ts`) | the configured class | M2 should not need it directly |

### Integration contract — the rules M2 lives by

- **INT-1 — M2 is stateful host, M1 is stateless reducer.** M2 holds ONE `EngineState` value; every
  keypress calls the matching `inputX` and **replaces** the held state with the return value, then
  re-renders. This is a classic reducer pattern (state in → state out). M2 never mutates state in
  place.
- **INT-2 — Display value = `getDisplayValue(state)`.** It returns `entryBuffer` (mid-entry or a
  resolved result) OR an `ErrorTag` string. **M2 owns the error wording**: `'divide-by-zero'` →
  user-facing "Cannot divide by zero", `'overflow'` → e.g. "Number too large". M1 surfaces the *tag*;
  M2 renders the *sentence* (`01-data-model.md:42-46`).
- **INT-3 — Pending-expression line is M2-DERIVED, not exposed.** `getDisplayValue` returns only the
  primary value. The design's secondary line (F9, `08-design-system.md:117`) — e.g. showing `12 +`
  while the user types the second operand — must be **derived by M2 reading `accumulator` +
  `pendingOperator` directly** off the state object, mapping the operator to its glyph (F10). This is
  a genuine integration gap (no M1 helper for it) and is **CP-7 AI-autonomous**; the `02-flows.md` /
  `04-ui.md` drafters must specify how M2 composes this line. *(Decision candidate for `_decisions.md`.)*
- **INT-4 — Buffer hygiene (L8 carry-forward).** M1's `inputDigit` assumes a well-formed numeric
  buffer; `new Decimal(entryBuffer)` would throw on garbage. **M2 must only ever call `inputDigit`
  with single chars `'0'`–`'9'`**, `inputDecimal` for `.`, and the typed `Operator` union for
  operators — never inject arbitrary strings. Keyboard handler must whitelist keys, not pass raw
  `event.key` through (`session-handoff.md` L8 §1 note).
- **INT-5 — Operator mapping table (M2-owned):** keyboard `+ - * /` and the four operator buttons map
  to `'add' | 'subtract' | 'multiply' | 'divide'`; display glyphs map to `+ − × ÷` (F10). M2 holds
  this bidirectional map (input-key → Operator, Operator → glyph).
- **INT-6 — Error latch UX.** When `errorState` is non-null, M1 no-ops digit/decimal/operator/equals;
  only CE and AC escape (`01-data-model.md:40`). M2's display shows the error sentence; the only
  productive keys are CE/AC/Esc. M2 should make that legible (e.g. error styling on display), not
  leave the user wondering why keys "don't work".

---

## Open questions (surfaced for SPECIFY drafters / orchestrator)

- **OQ1 — UI approach (→ `06-tech-choices.md`, CP-6 head-to-head).** Vanilla TS + Vite vs a
  lightweight framework (Svelte / Solid / Preact / Lit). Profile-fit weighting (#FF-004): prefer the
  higher-level option that minimizes bespoke code AI must own — UNLESS a constraint (bundle weight,
  glass-CSS control, zero-runtime) argues otherwise. **AI-autonomous (CP-7 technical) — do NOT ask the
  zero-coding owner.** Decide via Context7 + WebFetch head-to-head, document bespoke-LOC delta.
  Deployment target is static NGINX (`07-deployment-target.md`) → output must be a static build.
- **OQ2 — Pending-expression line content (INT-3).** Exactly what the secondary line shows and when
  (e.g. `12 +`, then clears on equals, hides in fresh/error states). `02-flows.md` + `04-ui.md` to
  specify. AI-autonomous craft; orchestrator validates the UX *interpretation* with the owner during
  the `04-ui.md` UX protocol.
- **OQ3 — Keypad button arrangement.** Exact 4-col grid placement of CE vs AC, whether `0` spans 2
  cols, operator column position. Pure UX craft (CP-7); `04-ui.md` + mockups resolve it; owner picks a
  mockup, not a grid spec.

> No upstream **contradictions** surfaced — STRUCTURE docs are internally consistent and the M1
> contract is verified against source. Nothing blocks proceeding to the concern drafts.

---

## Concern set for M2 (7 files)

`_index.md` · `01-data-model.md` · `02-flows.md` · `03-rules.md` · `04-ui.md` (+ 3 mockups + `_picked.md`)
· `05-edge-cases.md` · `06-tech-choices.md` — then `_audit.md` (cross-file) before APPROVED.

Note on `01-data-model.md` for M2: like M1, this is **not a DB schema** — it's the small amount of
**view state M2 holds** (the single `EngineState` value + any UI-only flags like active-theme-is-default,
focus state). Keep it honest: most of M2's "data" is just M1's state, held and re-rendered.
