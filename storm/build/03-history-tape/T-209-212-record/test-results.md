---
storm-phase: build
storm-module: 03-history-tape
storm-canonical: false
---

# T-209..T-212 Test Results

## Static type check

```
npx tsc --noEmit
```
**Exit: 0** — all imports resolve; no type errors.

## Build

```
npm run build
```
**Exit: 0** — `tsc --noEmit && vite build` completed clean.
16 modules transformed; dist/ emitted. history.ts included in the bundle.

## Predicate reasoning (runtime smoke — jsdom not available in this repo)

Live browser test is orchestrator's responsibility after Group D wires `subscribe(recordOnEquals)`
in `main.ts`. Reasoning below verifies predicate correctness against the three exclusion cases:

| Case | prevState.pendingOperator | next.errorState | next.justEvaluated | Predicate result | Expected |
|---|---|---|---|---|---|
| Genuine resolve (12 + 3 =) | `'add'` (non-null) | `null` | `true` | **TRUE** — fires appendEntry+renderHistory | ✅ Record |
| Repeated = (after first =) | `null` (already cleared) | `null` | `true` | **FALSE** (first clause fails) | ✅ Skip |
| Error result (5 ÷ 0 =) | `'divide'` (non-null) | `'divide-by-zero'` (non-null) | varies | **FALSE** (middle clause fails) | ✅ Skip |
| Bare = (5 = on fresh state) | `null` | `null` | true/false | **FALSE** (first clause fails) | ✅ Skip |

All three INT-M3-1 clauses needed: removing any one would admit a false positive:
- Removing clause 1 → bare `=` would record (no pending operator, nothing to record)
- Removing clause 2 → error results would record error tags as `result`
- Removing clause 3 → non-equals dispatches that happen to have pendingOperator set could record

The `prev.accumulator!` non-null assertion is safe: inside the guard `prev.pendingOperator !== null`
the accumulator was necessarily latched when the operator was pressed (M1 invariant, briefing:78-80).

Full live smoke (click equals, assert tape entry, assert repeated-= no-op, assert error no-op)
deferred to orchestrator + Group H tests (T-232..T-237).
