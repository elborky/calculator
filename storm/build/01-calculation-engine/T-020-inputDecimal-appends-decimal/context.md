---
task: T-020
slug: inputDecimal-appends-decimal
status: DONE
spec-ref: E-011
---

# T-020 — inputDecimal appends decimal (E-011 happy path)

Tests that from fresh state (entryBuffer: '0'), calling inputDecimal produces entryBuffer === '0.'.

## Test added
- `inputDecimal — appends decimal to buffer (E-011 happy path)` in `describe('inputDecimal')`

## Outcome
8 tests pass after this task.
