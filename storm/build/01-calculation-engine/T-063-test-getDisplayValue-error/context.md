---
storm-phase: build
storm-canonical: false
---

# T-063 — Test: `getDisplayValue` returns errorState tag when error is set

## Task
Add tests for `getDisplayValue` covering error states.

## Scenarios
1. State with `errorState: 'divide-by-zero'` → returns `'divide-by-zero'`
2. State with `errorState: 'overflow'` → returns `'overflow'`

## Status
[DONE]
