---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-013
storm-canonical: false
---

# T-013 — Implement `inputDigit`

**Status:** IN PROGRESS

## Spec refs
- `storm/specify/01-calculation-engine/02-flows.md` — Flow 1: digit entry
- `storm/specify/01-calculation-engine/03-rules.md` — R-025 (leading-zero), R-014 (error no-op)
- `storm/specify/01-calculation-engine/05-edge-cases.md` — E-037 (double-zero), E-038 (justEvaluated), E-040 (error state)

## Behaviour rules
1. **Error no-op (R-014, E-040):** `errorState !== null` → return state unchanged
2. **justEvaluated reset (E-038):** `justEvaluated === true` → fresh buffer (`digit === '0' ? '0' : digit`), `justEvaluated = false`; acc + pendingOp preserved for chaining
3. **Leading-zero suppression (R-025, E-037):**
   - `entryBuffer === '0'` AND digit `'0'` → no-op (double-zero stays `'0'`)
   - `entryBuffer === '0'` AND digit not `'0'` → replace with digit
4. **Normal append:** append digit to entryBuffer

## Fields modified
- `entryBuffer` — yes
- `justEvaluated` — only set to false on justEvaluated-reset branch
- `accumulator`, `pendingOperator`, `errorState` — never touched
