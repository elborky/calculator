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

## Group A — HistoryEntry type + tape module setup  ✅ (19857eb)
- [DONE] T-201 — `src/ui/history/types.ts`: export `interface HistoryEntry {expression,result,id}` (D-M3-DM-02)
- [DONE] T-202 — `src/ui/history/tape.ts`: module-private `tape: HistoryEntry[]=[]`, `nextId=0` (D-M3-DM-01)
- [DONE] T-203 — `tape.ts`: export `appendEntry(Omit<HistoryEntry,'id'>)` push `{...entry,id:nextId++}`
- [DONE] T-204 — `tape.ts`: export `clearTape()` → `tape=[]` (HR-016)
- [DONE] T-205 — `tape.ts`: export `getTape(): readonly HistoryEntry[]` read-only accessor

## Group B — Recording seam in state.ts (INT-M3-3, D-M3-TC-01)  ✅ (4c91434+3391e86)
- [DONE] T-206 — `state.ts`: `type DispatchListener`, module-private `listeners[]`
- [DONE] T-207 — `state.ts`: export `subscribe(fn)` push onto listeners
- [DONE] T-208 — `state.ts`: patch `dispatch()` — `prev=state` before, `listeners` loop AFTER render (C3 render unchanged)

## Group C — recordOnEquals listener (INT-M3-1/2)  ✅ (9af14cf)
- [DONE] T-209 — `src/ui/history/history.ts`: imports (EngineState, OPERATOR_TO_GLYPH, getDisplayValue, appendEntry)
- [DONE] T-210 — `history.ts`: `recordOnEquals(prev,next)` evaluate INT-M3-1 predicate, early-return if false (HR-001)
- [DONE] T-211 — `recordOnEquals`: predicate-true → build expression + result, call `appendEntry` (INT-M3-2)
- [DONE] T-212 — export `recordOnEquals` from `history.ts`

## Group D — Register listener + AC-clear wiring in main.ts  ✅ (7b8457f)
- [DONE] T-213 — `main.ts`: `subscribe(recordOnEquals)` at mount (+ startup `renderHistory()`)
- [DONE] T-214 — AC binding (`bindings.ts` `handleKeyIntent 'all-clear'`): `clearTape()`+`renderHistory()` after `dispatch(inputAllClear)` (HR-016, dispatch-first)
- [DONE] T-215 — Esc shares the `all-clear` handler → covered by T-214, no separate path (HR-016, HE-021)

## Group E — renderHistory() into .history-slot (single-line v1)  ✅ (2a6bab0)
- [DONE] T-216 — `src/ui/history/render-history.ts`: import getTape, cache `.history-slot` ref
- [DONE] T-217 — toggle `aria-hidden` on slot: off when populated; empty via `data-empty` on `.history-tape` (HR-020, F-M3-8)
- [DONE] T-218 — empty-state placeholder `.history-empty` "No calculations yet" (HE-012)
- [DONE] T-219 — populated render: `<ul role="list">` in labelled `.history-tape`, newest at top (JS reverse-read) (HR-019)
- [DONE] T-220 — each `<li>` single-line v1: `.history-expr`/`.history-eq`/`.history-result` spans, textContent XSS-safe (_picked v1)
- [DONE] T-221 — asserted NO `aria-live` on tape (no double-announce, US-M3-8)
- [DONE] T-222 — export `renderHistory()`; called after appendEntry (C) + clearTape (D) + startup

## Group F — Tape CSS (v1 Conservative, token-driven)  ✅ (dd24a6c)
- [DONE] T-223 — `src/ui/history/history.css`: recessed glass panel (blur 16px, border, radius, overflow-y auto)
- [DONE] T-224 — entry typography: Inter 0.875rem/400/lh1.5/tabular-nums (F-M3-6)
- [DONE] T-225 — expression `var(--text-secondary)`, result `var(--text-primary)` (HR-022, HR-023)
- [DONE] T-226 — right-align text + hairline dividers between rows (_picked v1)
- [DONE] T-227 — long-result overflow: wrap/right-anchored scroll, never truncate (D-M3-EC-01, HE-001..004)
- [DONE] T-228 — entries read-only: `cursor:default; pointer-events:none` (HR-012)
- [DONE] T-229 — slide-in `@keyframes` 180ms + reduced-motion cancel (HR-021, HE-022..023)
- [DONE] T-230 — import `history.css` in app stylesheet entry

> **Group F class-name contract (for Group E render):** `.history-slot`(aside) → `.history-tape`(section, `aria-label="Calculation history"`, `data-empty` toggle) → `.history-tape__header`(aria-hidden label) → `.history-tape__scroll`(scroll region, Group E adds `tabindex=0` when overflowing) → `.history-list`(ul role=list) → `.history-entry`(li) [`--new` modifier on newest] → `.history-expr` / `.history-eq` / `.history-result` spans; `.history-empty`(div placeholder).

## Group G — Conditional scroll-region focusability (a11y)  ✅ (2a6bab0, folded into E)
- [DONE] T-231 — `checkScrollFocus()` in renderHistory: conditional `tabindex="0"` on `.history-tape__scroll` iff overflowing (HE-028)

## Group H — Tests (predicate unit + render)  ✅ (35e8530, jsdom env, 14 M3 tests)
- [DONE] T-232 — genuine resolve → records once (US-M3-1)
- [DONE] T-233 — repeated `=` → NOT recorded (HR-003, HE-007)
- [DONE] T-234 — error result → NOT recorded (HR-004, HE-005)
- [DONE] T-235 — bare `=` → NOT recorded (HR-005, HE-008)
- [DONE] T-236 — chained-calc expression `'15 + 4'` (HR-006, INT-M3-4)
- [DONE] T-237 — true-Unicode glyphs − × ÷ in expression (HR-008, HE-017)
- [DONE] T-238 — tape: appendEntry monotonic id, clearTape empties, getTape returns all
- [DONE] T-239 — `npm test` 75 passed (61 engine + 14 M3), zero regressions

## Group I — Verification  ✅
- [DONE] T-240 — `tsc --noEmit` exit 0
- [DONE] T-241 — `npm run build` exit 0 (static dist/)
- [DONE] T-242 — **LIVE browser smoke** (real Chrome @ localhost:4173): record 12+3=15 ✓ / newest-on-top 5×6=30 ✓ / repeated-= dedup ✓ / 5÷0 error+no-record ✓ / AC clears tape ✓ (US-M3-1/2/5). NOTE: live smoke caught a startup-crash bug (missing static skeleton) fixed in 35e8530 — green tsc/build/61-tests had masked it.
- [DONE] T-243 — a11y spot-check: `.history-tape aria-label="Calculation history"` ✓, aria-hidden removed from slot at init ✓, NO aria-live on tape (single live region = M2 display) ✓ (US-M3-8)
- [DONE] T-244 — ready to hand off to REVIEW (full Playwright/axe HE/HR/US coverage is REVIEW M3's job)
