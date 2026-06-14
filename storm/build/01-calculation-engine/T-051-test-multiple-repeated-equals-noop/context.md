---
storm-phase: build
storm-canonical: false
---

# T-051 — Test: inputEquals — multiple repeated equals remain no-op (D-017)

## Task
Add a test asserting that pressing equals THREE times after a completed evaluation stays a no-op.

## Sequence
digit '3' → op 'add' → digit '4' → equals (result 7) → equals → equals → equals

## Expected
After 3rd repeated equals:
- `entryBuffer` still `'7'`
- `justEvaluated` still `true`
- `errorState` null
- No result mutation across any extra equals press

## Rule references
- D-017: repeated-equals no-op is durable across N presses, not just one

## Status
[DONE]
