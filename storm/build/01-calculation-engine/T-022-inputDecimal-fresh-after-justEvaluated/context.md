---
task: T-022
slug: inputDecimal-fresh-after-justEvaluated
status: DONE
spec-ref: E-013
---

# T-022 — inputDecimal fresh "0." after justEvaluated (E-013)

Tests that when justEvaluated is true and entryBuffer is '42', calling inputDecimal resets to '0.' and clears the justEvaluated flag.

## Test added
- `inputDecimal — fresh "0." after justEvaluated, flag cleared (E-013) (T-022)` in `describe('inputDecimal')`

## Outcome
10 tests pass after this task.
