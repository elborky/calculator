---
storm-phase: build
storm-canonical: false
storm-depends-on:
  - storm/specify/01-calculation-engine/03-rules.md
---

# T-057 — Implement `inputAllClear`

**Status:** [DONE]

## Task

Implement `inputAllClear(state: EngineState): EngineState` in `src/engine.ts`.

## Spec Reference

- R-018: AC = full reset to initial state
- All 5 fields reset: `entryBuffer:'0'`, `accumulator:null`, `pendingOperator:null`, `justEvaluated:false`, `errorState:null`

## Implementation

Simply return `initialState()` — complete reset, no conditions needed. AC always works.

## Commit

`storm:BUILD:calc-engine:m1:task-057 - implement inputAllClear (returns initialState)`
