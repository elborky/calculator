---
storm-phase: build
storm-canonical: false
---

# Test Results — T-FIX-216c + Group H (T-232..T-238) + T-242

## T-239 — npm test (all tests green, zero regressions)

```
Tests  75 passed (75)
Test Files  2 passed (2)
Duration  783ms
```

- Existing engine tests (src/engine.test.ts): 61 passed ✅
- New M3 DOM tests (src/history-tape.test.ts): 14 passed ✅
- Zero regressions ✅

### Test breakdown (new file)

| Test | Result |
|------|--------|
| T-238: appendEntry assigns monotonic ids | PASS |
| T-238: getTape returns entries in insertion order | PASS |
| T-238: clearTape empties the tape | PASS |
| T-238: nextId keeps advancing after clearTape | PASS |
| T-242 smoke: render-history.ts initialises cleanly | PASS |
| T-232: genuine equals-resolve records one entry | PASS |
| T-233: repeated equals records nothing | PASS |
| T-234: error result records nothing | PASS |
| T-235: bare equals (nothing pending) records nothing | PASS |
| T-236: chained calc records final binary step | PASS |
| T-237: subtract produces U+2212 in expression | PASS |
| T-237: multiply produces U+00D7 | PASS |
| T-237: divide produces U+00F7 | PASS |
| T-242 extended: record + clear cycle | PASS |

## T-240 — npx tsc --noEmit

Exit code: 0 ✅

## T-241 — npm run build

Exit code: 0 ✅

```
dist/index.html                              5.06 kB │ gzip:  1.71 kB
dist/assets/Inter-latin-var-8kRkwJBP.woff2  48.43 kB
dist/assets/index-Dt0mcAmS.css              11.90 kB │ gzip:  3.65 kB
dist/assets/index-DRmTcZXt.js               39.69 kB │ gzip: 15.60 kB
✓ built in 86ms
```

## jsdom Version

jsdom@29.1.1 (devDependency, test-only)

## Bug Fix Confirmed

The runtime smoke (T-242) importing `render-history.ts` with skeleton present resolves without throwing — the startup crash is fixed.
