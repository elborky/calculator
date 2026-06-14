---
task: T-021
slug: inputDecimal-second-decimal-no-op
status: DONE
spec-ref: E-009, E-010
---

# T-021 — inputDecimal second decimal press is no-op (E-009, E-010)

Tests that when entryBuffer is '3.' (already has decimal), calling inputDecimal returns buffer unchanged (not '3..').

## Test added
- `inputDecimal — second decimal press is no-op (E-009, E-010) (T-021)` in `describe('inputDecimal')`

## Outcome
9 tests pass after this task.
