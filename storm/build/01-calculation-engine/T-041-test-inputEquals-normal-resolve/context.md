---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-041
storm-canonical: false
---

# T-041 — Test: `inputEquals — normal resolve 5 × 4 = 20`

## Spec refs
- 02-flows.md Flow 3 (equals main path)
- 03-rules.md R-004, R-006

## Sequence
digit '5' → op 'multiply' → digit '4' → equals

## Assertions
- `entryBuffer === '20'`
- `pendingOperator === null`
- `justEvaluated === true`
- `errorState === null`

## Test count target: 26
