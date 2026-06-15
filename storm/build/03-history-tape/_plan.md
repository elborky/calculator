---
storm-phase: build
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_index.md
---

# M3 History Tape — BUILD Plan

> Source of truth: `storm/specify/03-history-tape/_index.md` (44 tasks, T-201..T-244, groups A–I).
> Visual baseline: **v1 Conservative single-line** (`04-ui/_picked.md`). Each task = forked sonnet sub-agent, one atomic commit.
> Status legend: `[PENDING]` · `[IN PROGRESS]` · `[DONE]`

## Group A — HistoryEntry type + tape module setup
- [PENDING] T-201 — `src/ui/history/types.ts`: export `interface HistoryEntry {expression,result,id}` (D-M3-DM-02)
- [PENDING] T-202 — `src/ui/history/tape.ts`: module-private `tape: HistoryEntry[]=[]`, `nextId=0` (D-M3-DM-01)
- [PENDING] T-203 — `tape.ts`: export `appendEntry(Omit<HistoryEntry,'id'>)` push `{...entry,id:nextId++}`
- [PENDING] T-204 — `tape.ts`: export `clearTape()` → `tape=[]` (HR-016)
- [PENDING] T-205 — `tape.ts`: export `getTape(): readonly HistoryEntry[]` read-only accessor

## Group B — Recording seam in state.ts (INT-M3-3, D-M3-TC-01)
- [PENDING] T-206 — `state.ts`: `type DispatchListener`, module-private `listeners[]`
- [PENDING] T-207 — `state.ts`: export `subscribe(fn)` push onto listeners
- [PENDING] T-208 — `state.ts`: patch `dispatch()` — `prev=state` before, `listeners` loop AFTER render (C3 render unchanged)

## Group C — recordOnEquals listener (INT-M3-1/2)
- [PENDING] T-209 — `src/ui/history/history.ts`: imports (EngineState, OPERATOR_TO_GLYPH, getDisplayValue, appendEntry)
- [PENDING] T-210 — `history.ts`: `recordOnEquals(prev,next)` evaluate INT-M3-1 predicate, early-return if false (HR-001)
- [PENDING] T-211 — `recordOnEquals`: predicate-true → build expression + result, call `appendEntry` (INT-M3-2)
- [PENDING] T-212 — export `recordOnEquals` from `history.ts`

## Group D — Register listener + AC-clear wiring in main.ts
- [PENDING] T-213 — `main.ts`: `subscribe(recordOnEquals)` at mount
- [PENDING] T-214 — AC button binding: call `clearTape()` alongside `dispatch(inputAllClear)` (HR-016, dispatch-first)
- [PENDING] T-215 — verify Esc keyboard binding also triggers `clearTape()` (HR-016, HE-021)

## Group E — renderHistory() into .history-slot (single-line v1)
- [PENDING] T-216 — `src/ui/history/render-history.ts`: import getTape, cache `.history-slot` ref
- [PENDING] T-217 — toggle `aria-hidden` on slot: off when populated, on when empty (HR-020, F-M3-8)
- [PENDING] T-218 — empty-state placeholder `<p class="history-empty">No calculations yet</p>` (HE-012)
- [PENDING] T-219 — populated render: `<ul role="list" aria-label="Calculation history">`, newest at top edge (HR-019)
- [PENDING] T-220 — each `<li>` single-line v1: `<span expr>=<span eq>=<span res>`; true-Unicode glyphs (_picked v1)
- [PENDING] T-221 — assert NO `aria-live` on tape container/children (no double-announce, US-M3-8)
- [PENDING] T-222 — export `renderHistory()`; call after every appendEntry + clearTape

## Group F — Tape CSS (v1 Conservative, token-driven)
- [PENDING] T-223 — `src/ui/history/history.css`: recessed glass panel (blur 16px, border, radius, overflow-y auto)
- [PENDING] T-224 — entry typography: Inter 0.875rem/400/lh1.5/tabular-nums (F-M3-6)
- [PENDING] T-225 — expression `var(--text-secondary)`, result `var(--text-primary)` (HR-022, HR-023)
- [PENDING] T-226 — right-align text + hairline dividers between rows (_picked v1)
- [PENDING] T-227 — long-result overflow: wrap/right-anchored scroll, never truncate (D-M3-EC-01, HE-001..004)
- [PENDING] T-228 — entries read-only: `cursor:default; pointer-events:none` (HR-012)
- [PENDING] T-229 — slide-in `@keyframes` 180ms + reduced-motion cancel (HR-021, HE-022..023)
- [PENDING] T-230 — import `history.css` in app stylesheet entry

## Group G — Conditional scroll-region focusability (a11y)
- [PENDING] T-231 — `checkScrollFocus()` in renderHistory: `tabindex="0"` on `<ul>` iff overflowing (HE-028)

## Group H — Tests (predicate unit + render)
- [PENDING] T-232 — `__tests__/record-on-equals.test.ts`: genuine resolve → appendEntry once (US-M3-1)
- [PENDING] T-233 — repeated `=` → appendEntry NOT called (HR-003, HE-007)
- [PENDING] T-234 — error result → appendEntry NOT called (HR-004, HE-005)
- [PENDING] T-235 — bare `=` → appendEntry NOT called (HR-005, HE-008)
- [PENDING] T-236 — chained-calc expression `'15 + 4'` (HR-006, INT-M3-4)
- [PENDING] T-237 — true-Unicode glyphs − × ÷ in expression (HR-008, HE-017)
- [PENDING] T-238 — `__tests__/tape.test.ts`: appendEntry monotonic id, clearTape empties, getTape returns all
- [PENDING] T-239 — run `npm test` across M1+M2+M3 (zero regressions)

## Group I — Verification
- [PENDING] T-240 — `tsc --noEmit` across src/ (exit 0)
- [PENDING] T-241 — `npm run build` → static dist/ (exit 0)
- [PENDING] T-242 — preview smoke: record / repeated-= / div-zero / AC-clears (US-M3-1/2/5)
- [PENDING] T-243 — a11y spot-check: aria-label, no aria-hidden when populated, single live region (US-M3-8)
- [PENDING] T-244 — hand off to REVIEW (Playwright coverage of HE/HR/US)
