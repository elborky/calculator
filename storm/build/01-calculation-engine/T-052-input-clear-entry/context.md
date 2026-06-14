# T-052 — implement inputClearEntry

Spec refs: R-017 (CE resets buffer, not accumulator), R-015 (escapes error latch)

## Behaviour
- Resets `entryBuffer = '0'`
- Resets `errorState = null`
- Resets `justEvaluated = false`
- Leaves `accumulator` and `pendingOperator` INTACT

Pure function, immutable state, new EngineState object returned.
