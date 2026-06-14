---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-018
storm-canonical: false
---

# T-018 — Test: inputDigit no-op in error state (E-040)

## Spec Reference
- `storm/specify/01-calculation-engine/05-edge-cases.md` E-040
- `storm/specify/01-calculation-engine/03-rules.md` R-014

## Acceptance Criteria
- Construct state with `errorState: 'divide-by-zero'`, `entryBuffer: 'Error'`
- Call `inputDigit(state, '5')` → state UNCHANGED
- All 7 tests pass

## Status
[DONE]
