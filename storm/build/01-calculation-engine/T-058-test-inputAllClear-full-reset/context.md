---
storm-phase: build
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/03-rules.md
---

# T-058 — Test: `inputAllClear` full reset from mid-expression (E-033)

**Status:** [DONE]

## Test

Sequence: digit '9' → op 'multiply' → digit '3' → AC.
After AC: ALL 5 fields at initial values:
- `entryBuffer: '0'`
- `accumulator: null`
- `pendingOperator: null`
- `justEvaluated: false`
- `errorState: null`

## Commit

`storm:BUILD:calc-engine:m1:task-058 - test inputAllClear full reset from mid-expression E-033 (39 pass)`
