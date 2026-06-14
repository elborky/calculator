---
storm-phase: build
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/03-rules.md
---

# T-059 — Test: `inputAllClear` escapes error latch (E-034, R-015)

**Status:** [DONE]

## Test

Construct state with `errorState: 'overflow'` + some dirty fields.
Call `inputAllClear(state)` → all fields at initial values, `errorState === null`.

## Commit

`storm:BUILD:calc-engine:m1:task-059 - test inputAllClear escapes error latch E-034 R-015 (40 pass)`
