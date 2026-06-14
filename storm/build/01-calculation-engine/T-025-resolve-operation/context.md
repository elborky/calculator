---
storm-phase: build
storm-canonical: false
---

# T-025 — resolveOperation context

## Task
Implement `resolveOperation(left, op, right): Decimal | ErrorTag` in `src/engine.ts`.

## Spec refs
- R-010, R-011 (div-by-zero guard)
- R-012 (overflow detection)
- E-001, E-002, E-003, E-006

## Approach
- Pure internal helper; no state touched.
- Guard div-by-zero BEFORE computing (check right.isZero() when op === 'divide').
- Compute via decimal.js .plus/.minus/.times/.dividedBy.
- Post-compute: check result.isFinite() — decimal.js returns Infinity Decimal on extreme overflow.
- Return 'overflow' if !isFinite(); else return result Decimal.
