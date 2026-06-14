---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-046
storm-canonical: false
---

# T-046 — Test: `inputEquals — no-op in error state (E-023)`

## Spec refs
- 05-edge-cases.md E-023
- 03-rules.md R-014

## Setup
Construct state with `errorState: 'divide-by-zero'` directly

## Assertions
- State returned is the same object reference (no-op guard returns unchanged)
- `errorState` still `'divide-by-zero'`

## Test count target: 31
