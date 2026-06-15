---
storm-phase: build
storm-module: 03-history-tape
storm-canonical: false
---

# T-209..T-212 — `recordOnEquals` listener (Group C)

## What
Creates `src/ui/history/history.ts` — the INT-M3-3 dispatch listener that evaluates the
INT-M3-1 predicate and, on match, calls `appendEntry` + `renderHistory`.

## Why
This is the recording heart of M3. The listener is registered once at startup (Group D,
`main.ts`) via the `subscribe()` seam added to `dispatch()` in Group B. It observes
`(prevState, nextState)` without touching M1 or altering M2 behaviour (C1–C5, C3).

## Spec refs
- `storm/specify/03-history-tape/06-tech-choices.md` §1-2 — listener code block, C1-C5,
  guarded-`!` note, the INT-M3-1 predicate (verbatim).
- `storm/specify/03-history-tape/01-data-model.md` §3 — derivation contract table
  (expression from prevState, result from nextState via getDisplayValue).
- `storm/specify/03-history-tape/03-rules.md` — HR-001..HR-006 recording rules.

## Field-name / type verification (live src/ reads)

| Field | Actual type (src/types.ts) | Used in listener | Notes |
|---|---|---|---|
| `accumulator` | `Decimal \| null` | `prev.accumulator!.toString()` | Non-null guarded by predicate (prev.pendingOperator !== null ⇒ accumulator latched). `!` is safe. |
| `pendingOperator` | `Operator \| null` | `prev.pendingOperator` (predicate + OPERATOR_TO_GLYPH key) | Predicate ensures non-null inside the if-block. No `!` needed on the OPERATOR_TO_GLYPH lookup because TypeScript accepts `Operator` (already narrowed). |
| `entryBuffer` | `string` | `prev.entryBuffer` | Correct field name per types.ts and data-model §3. |
| `errorState` | `ErrorTag \| null` | `next.errorState === null` in predicate | Correct. |
| `justEvaluated` | `boolean` | `next.justEvaluated === true` in predicate | Correct. |

`getDisplayValue` returns `string | ErrorTag` (src/engine.ts:341). The `as string` cast is
sound because the predicate gates `next.errorState === null`, making the `ErrorTag` branch
structurally unreachable at this call site.

## Adaptations from spec verbatim
None. All field names match exactly. The listener is written verbatim per tech-choices §2.
`prev.pendingOperator` is used directly as `OPERATOR_TO_GLYPH[prev.pendingOperator]` — TypeScript
infers `Operator` from the narrowing inside the predicate guard (pendingOperator !== null ⇒ Operator).

## Files touched
- `src/ui/history/history.ts` (CREATED)
- This context.md
- `storm/build/03-history-tape/T-209-212-record/test-results.md`
