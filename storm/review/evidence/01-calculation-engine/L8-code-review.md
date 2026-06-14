# L8 Code Audit — M1 Calculation Engine

> REVIEW Layer 8 — independent adversarial code review (opus, fresh context). Scope: `src/types.ts`,
> `src/decimal-config.ts`, `src/engine.ts`, `src/engine.test.ts`. Cross-checked against
> `_decisions.md` (D-001–D-017), `01-data-model.md` (5-field state), `03-rules.md` (R-001–R-027),
> `05-edge-cases.md` (E-001–E-060), `06-tech-choices.md`. Static gates already green
> (tsc --noEmit PASS; vitest 59/59 PASS) — this layer targets what those gates cannot:
> spec-conformance, logic correctness, and craft.

## Checklist Results

### 1. OWASP / Security
**PASS.** Pure headless arithmetic library — no DOM, no network, no server, no filesystem, no
persistence (F8/F11). Injection surface assessed:
- **No dynamic execution.** No `eval`, no `new Function`, no `setTimeout(string)`, no template-driven
  code paths. All user-derived strings (`entryBuffer`) reach only `new Decimal(string)`, which is a
  numeric parser, not a code evaluator. `grep` for `eval|Function(|setTimeout` over `src/` → zero hits.
- **No prototype pollution.** No dynamic key assignment from user input (`obj[userKey] = …`), no
  `Object.assign` from untrusted source, no recursive merge. State is built with explicit literal keys
  via object spread only.
- **Numeric edge cases routed to defined error states** (div-by-zero → `'divide-by-zero'`,
  non-finite → `'overflow'`); engine never exposes `Infinity`/`NaN` (R-011) — verified, see §7.
- **Untrusted-input note (informational, not a finding):** `new Decimal(entryBuffer)` assumes the
  buffer is a well-formed numeric string. The engine's own handlers only ever build legal buffers
  (digits, single `.`, leading `0`), so this holds internally. A malformed buffer would throw a
  decimal.js error — there is no try/catch — but no handler can produce one, so it is not reachable in
  M1. Worth a one-line note for M2 integration (M2 must not inject arbitrary strings into the buffer).

### 2. Secrets Scan
**PASS.** N/A for a math library, verified not assumed. No hardcoded credentials, API keys, tokens,
connection strings, or `process.env` reads anywhere in `src/`. `grep` for
`password|secret|token|api[_-]?key|process\.env` → zero hits. No network calls that could exfiltrate.

### 3. Dead Code
**PASS.** No unreachable branches, no unused imports, no commented-out blocks, no half-finished
functions.
- `types.ts` exports `Operator`, `ErrorTag`, `EngineState` — all three consumed by `engine.ts`.
- `decimal-config.ts` re-exports configured `Decimal` — consumed by `engine.ts` + tests.
- All 9 `engine.ts` exports (`resolveOperation`, `initialState`, `inputDigit`, `inputDecimal`,
  `inputOperator`, `inputAllClear`, `inputClearEntry`, `inputEquals`, `getDisplayValue`) are imported
  by `engine.test.ts`. None orphaned.
- The `inputOperator` `pendingOperator === null` guard (engine.ts:179) is labelled a "guard case." It
  is normally unreachable in the happy path BUT becomes reachable post-equals because of finding L8-01
  (see §6). It is defensive, not dead. Once L8-01 is fixed it becomes the intended carry-forward path
  vs. dead — see fix note.

### 4. Complexity
**PASS.** Every function is small and flat.
- Longest function: `inputOperator` ≈ 47 LOC incl. doc comment; logic body ≈ 30 LOC. Under the 50-LOC
  bar. Max nesting depth 2 (`if` → `if`/`return`). No function exceeds nesting depth 2.
- Cyclomatic complexity is modest everywhere; `inputOperator` (the branchiest) has ~5 decision points,
  each an early-return guard — linear, readable, no compound boolean thickets beyond one
  `entryBuffer === '0' && !justEvaluated`.
- Pure functions throughout (no mutation; every handler returns a new object via spread) — the ideal
  shape for the craft floor (C3) and for testability.

### 5. Fragmentation
**PASS.** 4 files, 1137 lines total. `engine.ts` = 342 lines (well under the 800-line CP-5 split
threshold). `engine.test.ts` = 760 lines (test file; not subject to the source split rule, and
splitting would fragment the cohesive describe-block suite). `types.ts` (18) and `decimal-config.ts`
(17) are intentionally tiny single-responsibility modules — the `decimal-config.ts` single-config-point
pattern (all engine code imports `Decimal` from it, never from `decimal.js` directly) is a deliberate
and correct guarantee that the precision config is always applied; merging it away would lose that
guarantee. Do NOT merge. Current fragmentation is correct.

### 6. Cross-file Consistency
**FINDINGS (1 × P1, 1 × P2).**
- **State shape PASS.** `EngineState` has exactly the 5 fields per D-001 / `01-data-model.md §1`:
  `entryBuffer`, `accumulator`, `pendingOperator`, `justEvaluated`, `errorState`. No
  `lastOperator`/`lastRhs` — D-017 (repeated-equals no-op) honored; types + initialState + equals
  handler all consistent with the 5-field model. Verified equals-after-equals is a true no-op
  (engine.ts:289-296; tests T-050/T-051).
- **L8-01 (P1) — D-009 violated: `accumulator` is NOT nulled on digit-after-equals.** D-009 mandates:
  "When `justEvaluated = true` and the next input is a digit, `accumulator` is set to `null` … a digit
  after `=` unconditionally starts a brand-new calculation with no left-hand value — the prior result
  is abandoned." `inputDigit`'s `justEvaluated` branch (engine.ts:86-92) resets `entryBuffer` and
  clears `justEvaluated` but LEAVES `accumulator` intact. This produces a wrong arithmetic result on a
  common real sequence. **Reproduced** (state-trace mirroring engine logic): `3 + 4 = 9 + 5 =` →
  **`12`**, expected **`14`**. Mechanism: after `=`, `accumulator = 7`, `pendingOperator = null`.
  Typing `9` sets `entryBuffer = '9'` but `accumulator` stays `7`. Pressing `+` finds
  `accumulator !== null` and `pendingOperator === null` → takes the guard branch (engine.ts:179) which
  keeps `accumulator = 7` and sets PO. The fresh `9` is discarded as the left operand; final `=`
  computes `7 + 5 = 12`. This is both a spec-conformance break (D-009) AND a user-visible correctness
  bug (the vision's "basics are flawless" promise). Note `05-edge-cases.md` E-057 implicitly assumes
  the fresh-start works (`3 + 4 = 9 ×` → "Prior result (7) is gone"), but no test exercises the
  digit-after-equals-THEN-operator path, so the gap slipped past the 59 green tests (see §8, L8-03).
- **L8-02 (P2) — overflow boundary inconsistent with `toExpPos` config intent.** R-012 / D-013 +
  `decimal-config.ts:8` comment state `toExpPos: 21` is the "overflow boundary (R-012)." It is not:
  `toExpPos` only controls when `.toString()` switches to exponential *notation* — it does NOT bound
  magnitude or make values non-finite. `resolveOperation` detects overflow via `!result.isFinite()`
  (engine.ts:44), which only fires at decimal.js's `Decimal.maxE` (9e15 exponent), i.e.
  ~`9e+9000000000000000`. **Verified:** `new Decimal('1e25').isFinite() === true` under the configured
  set; only `9e+9000000000000000 × 10` goes non-finite. So a result like `1e25` is NOT an overflow
  error — it is returned and displayed in exp notation. This is internally *consistent code* (tests
  E-006/E-007 are written to the `maxE` boundary and pass), but the **spec/comment claim that
  `toExpPos:21` is the overflow bound is false** — a documentation/decision drift. Functionally the
  engine never returns `Infinity`/`NaN` (R-011 holds), so this is not a P1; but the stated overflow
  threshold (R-012/D-013) does not match the implemented one, and M2 will display astronomically large
  numbers rather than an overflow error. Recommend reconciling: either (a) correct the comment + D-013
  to state the real bound is `Decimal.maxE` and overflow is effectively unreachable for consumer use
  (likely fine — YAGNI), or (b) if a display-meaningful overflow ceiling is actually wanted, implement
  an explicit magnitude check (`result.e >= N`) rather than relying on `isFinite()`. (b) is arguably
  scope creep for a basic calculator; (a) is the honest minimal fix.

### 7. Error Handling
**PASS.** `resolveOperation` covers both `ErrorTag` branches and both are propagated correctly through
all callers:
- `'divide-by-zero'` — guarded BEFORE compute (engine.ts:23, R-010/R-011), correct.
- `'overflow'` — `!result.isFinite()` post-compute (engine.ts:44). Returns the tag; never leaks
  `Infinity`/`NaN` (R-011 verified by probe — only non-finite path returns the tag).
- Both error tags propagated identically by `inputOperator` (chain auto-resolve, D-011: new operator
  NOT set, engine.ts:205-213) and `inputEquals` (engine.ts:304-312). D-011 contract honored in both.
- No silent catches, no swallowed exceptions, no empty `catch`. There is no `try/catch` at all — and
  none is needed, because decimal.js does not throw on valid `Decimal` arithmetic and the engine only
  ever feeds it well-formed buffers (see §1 note). The error latch (R-014) is enforced as the first
  guard in every input handler (`if (state.errorState !== null) return state`), and the escape (R-015)
  is provided by both CE (clears errorState, engine.ts:256-263) and AC (full reset). Latch + dual
  escape both verified by tests (T-046, T-054, T-059). The `switch (op)` in `resolveOperation` has no
  `default`, but `Operator` is a closed union of exactly 4 values and `result` is provably assigned on
  every reachable branch (tsc confirms — no "used before assigned" error), so the missing `default` is
  type-safe, not a hole.

### 8. Test Coverage
**FINDINGS (1 × P2, advisory).** 59 tests; the four operations, decimal entry, div-by-zero (incl. `0.0`
divisor E-003), overflow (E-006/E-007/E-008 via direct state construction), CE/AC, LTR chaining
(E-025–E-027), negatives (E-041–E-043), the decimal.js correctness suite (E-045–E-049), and the D-017
repeated-equals no-op (T-050/T-051) are all meaningfully covered. No *critical safety* rule (div-by-zero
R-010, error latch R-014, escape R-015, overflow R-012) has zero coverage — all are tested. So no P1
coverage hole.
- **L8-03 (P2, advisory) — coverage gap that hides L8-01.** There is no test for "digit after equals,
  then continue the calculation with an operator" — i.e. the D-009 fresh-start path
  (`3 + 4 = 9 + 5 =`). E-038/E-050 test only that the digit replaces the buffer + clears the flag; they
  do NOT assert `accumulator` is nulled, and no test chains an operator afterward to expose the stale
  accumulator. E-057 (`3 + 4 = 9 ×`) is in the spec but has no corresponding test. Adding a test for
  D-009 (assert `accumulator === null` after digit-post-equals) and an end-to-end
  `3 + 4 = 9 + 5 = → 14` test would have caught L8-01 and should be added alongside the fix. This is the
  classic "all green but spec-violating" gap — the test suite is strong on enumerated cases but missed
  the cross-handler interaction.

## Findings Summary
| # | Severity | File:Line | Description | Proposed fix (1-2 lines) |
|---|---|---|---|---|
| L8-01 | P1 | src/engine.ts:86-92 | D-009 violated — `inputDigit` does not null `accumulator` on digit-after-equals; `3 + 4 = 9 + 5 =` yields `12` not `14` (stale left operand). | In the `justEvaluated` branch of `inputDigit`, also set `accumulator: null` and `pendingOperator: null` so a digit after `=` starts a genuinely fresh calculation (per D-009). Add tests per L8-03. |
| L8-02 | P2 | src/decimal-config.ts:8, src/engine.ts:44 | Overflow boundary mismatch — `toExpPos:21` is notation-only, NOT a magnitude bound; real overflow fires only at `Decimal.maxE`. Spec/comment (R-012/D-013) overstate the threshold. | Correct the comment + D-013 to state the real bound is `Decimal.maxE` (overflow effectively unreachable for consumer values), OR add an explicit `result.e >= N` magnitude check if a display ceiling is truly wanted (likely YAGNI). |
| L8-03 | P2 | src/engine.test.ts | No test for digit-after-equals-then-operator (D-009 / E-057); the gap let L8-01 pass 59 green tests. | Add: (1) assert `accumulator === null` after digit post-`=`; (2) e2e `3 + 4 = 9 + 5 =` → `14`. Land with the L8-01 fix. |

## Verdict
P0: 0 | P1: 1 | P2: 2 | P3: 0
**FIX-REQUIRED**

The engine is clean, well-structured, secure, and correctly architected — pure functions, sound error
latching, honest dependency choices, no security or secrets surface. One genuine functional bug (L8-01,
a D-009 spec violation that produces a wrong answer on a common sequence and undercuts the "basics are
flawless" vision) gates a clean PASS; it is small and localized. L8-02 is a decision/comment-accuracy
drift, L8-03 is the coverage gap that masked L8-01 — both should land with the L8-01 fix. Orchestrator
to dispatch fixes.

---

> **CP-13 7-dim self-critique** (this audit's findings) is recorded in the commit body per the §8.7.2
> rule 6 contract (audit metadata lives in the commit message, NOT in this deliverable — #FF-027).
