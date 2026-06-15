---
storm-phase: build
storm-canonical: false
---

# T-FIX-216c + T-232..T-238 + T-242 — Context

## The Bug

`src/ui/history/render-history.ts` queries five DOM elements at **module init time** (top-level code, not inside a function):

```
.history-slot, .history-tape, .history-tape__scroll, .history-list, .history-empty
```

If any is missing it throws immediately:
```
[render-history] Required DOM elements not found.
```

`index.html` only had the bare slot: `<div class="history-slot" aria-hidden="true"></div>` — the inner tape skeleton was never created. So importing `render-history.ts` (which `history.ts` → `main.ts` triggers) crashed the app on load.

tsc + vite build + the 61 engine tests all passed because none execute the DOM at runtime.

## The Fix (T-216c)

Replaced the empty `<div class="history-slot">` in `index.html` with the full static skeleton that `render-history.ts` queries and `history.css` styles. The skeleton satisfies:
- `slotEl` → `.history-slot` (kept `aria-hidden="true"` per T-217 which removes it at runtime)
- `tapeEl` → `.history-tape` (with `data-empty="true"` initial, `aria-label="Calculation history"`)
- header div → `.history-tape__header` (with `aria-hidden="true"` — section carries the semantic label)
- `scrollEl` → `.history-tape__scroll`
- `listEl` → `.history-list` (empty `<ul>`)
- `emptyEl` → `.history-empty` (text "No calculations yet")

This matches the M2 `render.ts` idiom: static markup exists in index.html, module init caches refs, throws if missing.

## jsdom Decision (Test-Only Dependency)

Added `jsdom` as a devDependency — the de-facto DOM simulation environment for vitest. This is **test-only** (zero runtime footprint). The M1/M2 engine tests run in the default node environment and are unaffected.

Per-file environment is set via `// @vitest-environment jsdom` docblock at the top of `src/history-tape.test.ts` so only M3 DOM tests use jsdom.

Version added: checked via `npm install -D jsdom@latest` — current maintained version.

## Test Coverage Map

| Task | Description |
|------|-------------|
| T-238 | `tape.ts` pure unit — appendEntry assigns monotonic ids, getTape returns in order, clearTape empties |
| T-232 | genuine equals-resolve pair → recordOnEquals records ONE entry with correct expression+result |
| T-233 | repeated `=` (prev.pendingOperator null) → nothing recorded |
| T-234 | error result (next.errorState !== null, division by zero) → nothing recorded |
| T-235 | bare `=` (nothing pending, fresh state) → nothing recorded |
| T-236 | chained calc: 12+3+4= records "15 + 4" = "19" (INT-M3-4 intermediate step) |
| T-237 | subtract/multiply/divide produce Unicode glyphs −/×/÷ (not ASCII hyphen) |
| T-242 | runtime smoke: modules init without throw (proves bug fixed), record → li appears, AC → data-empty="true" + empty list |

## Notes

- Tests drive REAL reducers (inputDigit, inputOperator, inputEquals) + REAL tape/history modules to exercise genuine integration, not mocks.
- T-236 tests the chained-calc case: after 12+3= (result 15), pressing + latches 15 as accumulator, pressing 4 then = records "15 + 4 = 19".
- Dynamic import (`await import(...)`) is used after DOM setup to control module-init ordering for render-history.ts.
