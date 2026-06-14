---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-080
storm-canonical: false
---

# T-080 — Test Results

## Status: DONE

## Test added
`AC after equals gives full reset of all 5 fields (E-055, E-035) (T-080)`

## Pass count after commit: 59
## Previous pass count: 58

## Method
Sequenced: 3 + 4 = → justEvaluated=true; then inputAllClear().
Verified all 5 fields reset: entryBuffer='0', accumulator=null, pendingOperator=null,
justEvaluated=false, errorState=null.
