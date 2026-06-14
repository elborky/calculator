---
storm-phase: build
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/03-rules.md
---

# T-060 — Test: `inputAllClear` no residual after AC (E-059)

**Status:** [DONE]

## Test

After AC, perform a fresh calculation: digit '2' → op 'add' → digit '3' → equals → result '5'.
Assert: `entryBuffer === '5'`, no error, clean chain — confirms AC left no residual state.

## Commit

`storm:BUILD:calc-engine:m1:task-060 - test inputAllClear no residual after AC E-059 (41 pass)`
