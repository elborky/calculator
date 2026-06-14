---
storm-phase: build
storm-task: T-014
storm-module: 01-calculation-engine
storm-canonical: false
---

# T-014 — Test: inputDigit appends digit normally

## Spec reference
`storm/specify/01-calculation-engine/_index.md` T-014

## Acceptance
- New test in `src/engine.test.ts`: `inputDigit — appends digit normally`
- Scenario: start from initialState (entryBuffer='0'), call inputDigit(state, '5') → entryBuffer = '5' (leading-zero replacement)
- Then call inputDigit again with '3' → entryBuffer = '53'
- `npm test` exits 0, total 3 tests passing

## Dependencies
- T-013 done: `inputDigit` implemented in `src/engine.ts`
- `src/engine.test.ts` has 2 passing tests (T-010, T-012)

## Status
[IN PROGRESS]
