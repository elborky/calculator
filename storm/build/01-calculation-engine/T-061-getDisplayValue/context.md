---
storm-phase: build
storm-canonical: false
---

# T-061 — Implement `getDisplayValue`

## Source
SPEC: `storm/specify/01-calculation-engine/01-data-model.md` §1 (display-value note)

## Task
Implement `getDisplayValue(state: EngineState): string | ErrorTag` in `src/engine.ts`.

## Behaviour
- If `state.errorState !== null` → return `state.errorState` (the ErrorTag string: 'divide-by-zero' or 'overflow')
- Otherwise → return `state.entryBuffer`

Simple 2-branch function. Covers mid-entry state, post-equals result, and error state.
Return type: `string | ErrorTag` (but since ErrorTag is a string union, effectively `string`)

## Status
[DONE]
