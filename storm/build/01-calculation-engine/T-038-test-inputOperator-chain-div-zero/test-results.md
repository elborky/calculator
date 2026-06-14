---
storm-phase: build
storm-canonical: false
---

# T-038 — test-results

Status: DONE
Tests passing: 24
New test: `inputOperator > chaining div-by-zero sets error, new op NOT registered — D-011, E-002 (T-038)`
Result: PASS

Note: right operand uses inputDecimal→inputDigit('0') to produce '0.0' in the buffer, bypassing the
operator-swap guard (which checks `entryBuffer === '0'` exactly). '0.0' is numerically zero so
`resolveOperation` fires the divide-by-zero guard. Pure engine behaviour — no spec divergence.
