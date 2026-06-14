---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-077
storm-canonical: false
---

# T-077 — Test Results

## Status: DONE

## Test added
`overflow via chained operator auto-resolve sets error, new op not stored (E-008, D-011) (T-077)`

## Pass count after commit: 57
## Previous pass count: 56

## Method
Constructed state with accumulator near maxE, entryBuffer='10' (right operand present).
Pressed `inputOperator(state, 'add')` → chain auto-resolve fires → overflow.
D-011 verified: `pendingOperator === null` (new 'add' not stored on error).
