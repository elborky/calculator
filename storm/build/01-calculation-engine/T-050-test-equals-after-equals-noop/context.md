---
storm-phase: build
storm-canonical: false
---

# T-050 — Test: inputEquals — equals after equals is no-op (E-022/E-053, D-017)

## Task
Add a test asserting that pressing equals a second time after a completed evaluation is a no-op.

## Sequence
digit '3' → op 'add' → digit '4' → equals (result 7, justEvaluated=true) → equals AGAIN

## Expected
- `entryBuffer` still `'7'`
- `justEvaluated` still `true`
- State object unchanged (same reference — guard returns `state` directly)

## Rule references
- D-017: repeated-equals dropped; 5-field model has no lastOperator/lastRhs → no re-apply
- E-022: equals-after-equals no-op
- E-053: no repeated-equals re-apply in 5-field model

## Status
[DONE]
