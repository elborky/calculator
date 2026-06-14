---
storm-phase: build
storm-canonical: false
---

# T-062 — Test: `getDisplayValue` returns entryBuffer in normal states

## Task
Add tests for `getDisplayValue` covering normal (non-error) states.

## Scenarios
1. `initialState()` → `getDisplayValue` returns `'0'`
2. After digit '7' pressed → returns `'7'`
3. After `3+4=` → returns `'7'` (result in entryBuffer)

## Status
[DONE]
