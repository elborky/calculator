---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-078
storm-canonical: false
---

# T-078 — Test Results

## Status: DONE

## Test added
`operator after equals carries result forward as left operand (E-051) (T-078)`

## Pass count after commit: 58
## Previous pass count: 57

## Method
Sequenced: 3 + 4 = → justEvaluated=true; then inputOperator('add').
Verified: accumulator='7', pendingOperator='add', entryBuffer='0', justEvaluated=false.
