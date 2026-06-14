---
storm-phase: build
storm-module: 01-calc-engine
storm-task: T-076
storm-canonical: false
---

# T-076 — Context: very large but within bound is not an error (E-007)

## Spec refs
- `05-edge-cases.md` E-007

## Strategy
E-007: "Very large but within bound" — a result that is large but does NOT exceed Decimal.maxE
(9e+9000000000000000) should not set any error.

Use: `1e+15 × 9 = 9e+15` — a very large number but well within the maxE bound.

Assert:
- `errorState === null`
- `entryBuffer` is a non-empty string (the result)
