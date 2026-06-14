---
storm-phase: build
storm-canonical: false
---

# T-015 Context — Test: inputDigit leading-zero replacement (R-025, E-037)

**Task:** Add test asserting that pressing a non-zero digit when buffer is `'0'` replaces (not appends).
**Spec refs:** R-025 (leading-zero replacement), E-037 (leading-zero edge case)
**Acceptance:** `inputDigit(initialState(), '7')` → `entryBuffer === '7'` (not `'07'`)
**Prior state:** 3 tests passing (T-010, T-012, T-014)
