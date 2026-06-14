---
storm-phase: build
storm-module: 01-calculation-engine
storm-task: T-017
---

# T-017 Test Results

## Run outcome

| Metric | Value |
|---|---|
| Tests passed | 6 |
| Tests failed | 0 |
| Test files | 1 |
| Duration | ~151ms |

## New test added

```
inputDigit — fresh start after justEvaluated — digit replaces prior result, flag cleared (E-038) (T-017)
```

Constructed state directly: `{ ...initialState(), entryBuffer: '42', justEvaluated: true }`.
Called `inputDigit(state, '9')`.
Asserted: `entryBuffer === '9'`, `justEvaluated === false`.

## Status

PASS — 6/6 tests green.
