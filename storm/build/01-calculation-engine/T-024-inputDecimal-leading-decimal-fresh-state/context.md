---
task: T-024
slug: inputDecimal-leading-decimal-fresh-state
status: DONE
spec-ref: E-011
---

# T-024 — inputDecimal leading decimal from fresh state → "0." (E-011)

Tests that calling inputDecimal on initialState() produces entryBuffer === '0.'.

Note: T-020 also tests this scenario (fresh state, entryBuffer '0' → '0.'). T-024 adds a distinct test
explicitly naming the "leading decimal from fresh state" entry-point scenario per spec E-011,
with a distinct description referencing the entry-point framing.

## Test added
- `inputDecimal — leading decimal entry-point from initialState produces "0." (E-011) (T-024)` in `describe('inputDecimal')`

## Outcome
12 tests pass after this task.
