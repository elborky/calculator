---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-017
storm-canonical: false
---

# T-017 — Test: `inputDigit — fresh start after justEvaluated (E-038)`

## What
Add a Vitest test confirming that when `justEvaluated: true`, calling `inputDigit` starts a fresh
entry buffer (resets to the new digit, not appended to the prior result) and clears the flag.

## Spec reference
`storm/specify/01-calculation-engine/05-edge-cases.md` — E-038

## Acceptance criteria
- State constructed directly: `{ ...initialState(), entryBuffer: '42', justEvaluated: true }`
- `inputDigit(state, '9')` → `entryBuffer === '9'` (fresh start, not `'429'`)
- `justEvaluated === false` (flag cleared)
- Total passing tests: 6

## Status
[IN PROGRESS]
