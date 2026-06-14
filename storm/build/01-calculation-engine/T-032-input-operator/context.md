---
storm-phase: build
storm-canonical: false
---

# T-032 — Implement `inputOperator`

**Task:** Add `inputOperator(state: EngineState, op: Operator): EngineState` to `src/engine.ts`

**Spec refs:** flows.md Flow 2, rules.md R-004/R-005/R-014, edge-cases.md E-015–E-019, _decisions.md D-010/D-011

**Logic branches:**
1. Error no-op — return unchanged if errorState set
2. accumulator === null — first operator press: commit entryBuffer to accumulator, set pendingOperator, reset entryBuffer to '0'
3. accumulator set, pendingOperator set, entryBuffer === '0' && !justEvaluated — op-swap: change pendingOperator only
4. accumulator set, pendingOperator set, right operand exists — resolve LTR, then set new pendingOperator (or error)
5. accumulator set, pendingOperator === null — just set operator (guard case)
