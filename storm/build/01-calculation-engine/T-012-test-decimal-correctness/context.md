---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-012
storm-canonical: false
---

# T-012 — Test decimal.js 0.1+0.2=0.3 correctness (E-045)

## Task Summary
Add a test to `src/engine.test.ts` verifying that the configured `Decimal` from
`./decimal-config` eliminates the IEEE-754 floating-point artifact.

## Spec Reference
- `storm/specify/01-calculation-engine/05-edge-cases.md` (E-045)
- `storm/specify/01-calculation-engine/_index.md` T-012

## Prior work
T-011 created `src/decimal-config.ts` exporting a configured `Decimal` with
`precision:21, rounding:ROUND_HALF_UP, toExpPos:21, toExpNeg:-7`.

## Acceptance Criteria
- New test in `src/engine.test.ts` (appended to existing file)
- `new Decimal('0.1').plus('0.2').toString() === '0.3'` PASSES
- Import `Decimal` from `'./decimal-config'` (not directly from `'decimal.js'`)
- `npm test` exits 0 — 2 tests total passing (existing + new)
