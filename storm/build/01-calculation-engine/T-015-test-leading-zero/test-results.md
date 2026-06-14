---
storm-phase: build
storm-canonical: false
---

# T-015 Test Results

**Run:** 2026-06-14
**Command:** `npm test`
**Result:** 4 passed, 0 failed
**Duration:** 156ms

## Test added

```
inputDigit › leading-zero replacement — non-zero digit replaces "0", not appends (R-025, E-037) (T-015)
```

**Assertion:** `inputDigit(initialState(), '7').entryBuffer === '7'` (not `'07'`)
**Status:** PASS
