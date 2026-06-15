---
storm-phase: build
storm-module: 03-history-tape
storm-task-group: D
storm-tasks: T-213, T-214, T-215
---

# Group D — Register listener + AC-clear wiring (T-213..T-215)

## What

Wires the M3 history system into the running app by connecting the already-built components:

- **T-213** (`main.ts`): registers `recordOnEquals` as a post-dispatch subscriber + calls `renderHistory()` once at startup so the empty-state placeholder renders immediately on load (before any calculation).
- **T-214/T-215** (`bindings.ts`): adds `clearTape()` + `renderHistory()` after `dispatch(s => inputAllClear(s))` in the shared `handleKeyIntent()` function so that AC clears the tape (HR-016).

## Why

Without these wiring calls the M3 modules exist but are disconnected — `recordOnEquals` is never registered so no history is ever recorded, and the `.history-slot` never receives its initial render or its clear-on-AC trigger.

## Spec refs

- `storm/specify/03-history-tape/02-flows.md` — Flow 5 (AC clears tape), Flow 6 (app-load empty state)
- `storm/specify/03-history-tape/03-rules.md` — HR-016 (AC clears tape), HR-017 (CE does NOT)
- `storm/specify/03-history-tape/06-tech-choices.md` §2 — "Registration happens at startup in main.ts, one line alongside setupClickBinding() / setupKeyboardBinding()"

## AC and Esc handler sharing (T-215 verification)

**AC and Esc share ONE code path.** Both the AC button click and the Escape key press route through
`handleKeyIntent('all-clear')` in `bindings.ts`:

- Click path: `keypad.addEventListener('click', ...)` reads `data-action="all-clear"` → calls `handleKeyIntent('all-clear')`
- Keyboard path: `document.addEventListener('keydown', ...)` on `key === 'Escape'` → calls `handleKeyIntent('all-clear')` (T-159)

Inside `handleKeyIntent`, the `switch` case `'all-clear'` is the single dispatch point. Adding `clearTape()` + `renderHistory()` there covers BOTH AC button and Esc simultaneously. No double-clear risk; no separate Esc path to wire.

**CE does NOT clear the tape** — the `'clear-entry'` case only calls `dispatch(s => inputClearEntry(s))` and this group deliberately does not touch it. HR-017 is preserved.

## Files wired

| File | Change |
|---|---|
| `src/ui/main.ts` | Added imports for `subscribe`, `recordOnEquals`, `renderHistory`; added `subscribe(recordOnEquals)` + `renderHistory()` calls at startup |
| `src/ui/bindings.ts` | Added imports for `clearTape`, `renderHistory`; added `clearTape()` + `renderHistory()` after `dispatch(s => inputAllClear(s))` in `handleKeyIntent` `'all-clear'` case |

## Order of operations (dispatch-first per HR-016)

In the `'all-clear'` case:
1. `dispatch(s => inputAllClear(s))` — M2 engine resets (existing line, untouched)
2. `clearTape()` — M3 tape array empties
3. `renderHistory()` — M3 tape DOM re-renders to empty state

This matches the spec requirement: dispatch-FIRST, then clear the tape, then re-render.
