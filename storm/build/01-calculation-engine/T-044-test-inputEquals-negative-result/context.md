---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-044
storm-canonical: false
---

# T-044 — Test: `inputEquals — negative result 3 - 5 = -2 (E-041, R-021)`

## Spec refs
- 05-edge-cases.md E-041
- 03-rules.md R-021

## Sequence
digit '3' → op 'subtract' → digit '5' → equals

## Assertions
- `entryBuffer === '-2'`
- `justEvaluated === true`
- `errorState === null`

## Test count target: 29
