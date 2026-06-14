---
storm-phase: review
storm-module: 01-calculation-engine
storm-depends-on:
  - storm/specify/01-calculation-engine/_index.md
  - storm/build/01-calculation-engine/
storm-canonical: true
---

# REVIEW — M1 Calculation Engine

## Summary

**Final Verdict: PASS**

M1 is a pure, headless TypeScript arithmetic engine with no DOM, no network surface, and no persistence. REVIEW Layers L1–L6 are N/A for this module type. L7 (static gates) passed with tsc clean and all 61 tests green. L8 (adversarial code review) entered as FIX-REQUIRED with 3 findings; all were fixed in a single atomic commit (660d26b) and the suite re-verified at 61/61. No loop-backs, no scope escalations, no parking items.

- **Total findings:** 3 (1 × P1, 2 × P2)
- **Findings resolved:** 3 / 3
- **Loop-backs to SPECIFY:** 0
- **Parking items:** 0

---

## Layer Results

| Layer | Result | Notes |
|---|---|---|
| L1 — Live URL / route crawl | N/A | Pure headless library — no browser, no HTTP routes, no DOM. |
| L2 — Auth / access control | N/A | No auth surface. No network. |
| L3 — Form / input validation | N/A | No forms, no UI inputs. All entry paths are typed function calls with closed union inputs. |
| L4 — API contract | N/A | No external API. Module exports pure functions only; consumed in-process by M2. |
| L5 — Visual regression | N/A | No rendered surfaces. |
| L6 — Accessibility | N/A | No DOM, no screen readers, no ARIA. |
| L7 — Static gates (tsc + tests) | **PASS** | `tsc --noEmit` exit 0, zero type errors. `vitest run` 61/61 green (post-fix; 59/59 pre-fix). decimal.js 10.6.0, typescript 6.0.3, vitest 4.1.8 verified in `node_modules`. Nav-coverage N/A. All spec-mandated libraries confirmed installed. |
| L8 — Code review (adversarial, opus) | **PASS (post-fix)** | Entered as FIX-REQUIRED. Three findings identified. All resolved in commit 660d26b. See Findings Log below. |

---

## Findings Log

### L8-01 — D-009 violation: `inputDigit` does not null `accumulator` on digit-after-equals

| Field | Value |
|---|---|
| Category | Implementation bug |
| Priority | P1 |
| Status | FIX-IN-REVIEW ✅ RESOLVED |
| File | `src/engine.ts:86-92` |
| Description | D-009 mandates: when `justEvaluated = true` and a digit is pressed, `accumulator` must be set to `null` — the prior result is abandoned and a fresh calculation begins. The `justEvaluated` branch in `inputDigit` reset `entryBuffer` and cleared `justEvaluated` but left `accumulator` intact. This produced wrong results on a common sequence: `3 + 4 = 9 + 5 =` yielded `12` instead of `14`. Mechanism: after `=`, `accumulator = 7`; digit `9` set `entryBuffer = '9'` but accumulator stayed `7`; pressing `+` found `accumulator !== null` / `pendingOperator === null`, kept the stale `7` as left operand; final `=` computed `7 + 5 = 12`. Both a spec-conformance break (D-009) and a user-visible correctness bug (violates "basics are flawless" vision). |
| Fix | In the `justEvaluated` branch of `inputDigit`, added `accumulator: null` and `pendingOperator: null` to the returned state spread, ensuring a digit after `=` genuinely starts a fresh calculation with no left-hand value. |
| Fix commit | `660d26b` |
| Verification | Vitest suite re-run: 61/61 green. E-051 operator-after-equals test still passes (confirm carry-forward path unaffected). New tests L8-03 (below) confirm the fix end-to-end. |

---

### L8-02 — Overflow boundary mismatch: `toExpPos:21` comment/spec overstates the real bound

| Field | Value |
|---|---|
| Category | Decision / doc drift |
| Priority | P2 |
| Status | FIX-IN-REVIEW ✅ RESOLVED |
| File | `src/decimal-config.ts:8`, `storm/specify/01-calculation-engine/_decisions.md` (D-013) |
| Description | R-012 / D-013 and the comment in `decimal-config.ts` described `toExpPos: 21` as the "overflow boundary." It is not: `toExpPos` is a notation threshold — it causes `Decimal.toString()` to render numbers ≥ 10^21 in exponential form but does NOT bound magnitude or make values non-finite. The real overflow guard in `resolveOperation` is `!result.isFinite()`, which fires only at `Decimal.maxE` (~9e+9000000000000000) — effectively unreachable for consumer calculator inputs. A result like `1e25` is a valid, non-error result (displayed in exp notation); overflow would require inputs that exceed `Decimal.maxE`. The code was internally consistent and all tests (E-006/E-007) were written to the `maxE` boundary and passing — this was a documentation/decision-comment drift, not a code bug. |
| Fix | Comment in `decimal-config.ts` corrected. D-013 in `_decisions.md` updated with a clarification note stating the real bound is `Decimal.maxE`, that `toExpPos:21` is notation-only, and that overflow is effectively unreachable for consumer values. No behavior change. |
| Fix commit | `660d26b` |
| Verification | No test changes needed (existing E-006/E-007 correctly test the real boundary). `tsc --noEmit` exit 0. `vitest run` 61/61 green. |

---

### L8-03 — Test coverage gap: no test for digit-after-equals-then-operator (D-009 / E-057)

| Field | Value |
|---|---|
| Category | Test coverage gap |
| Priority | P2 |
| Status | FIX-IN-REVIEW ✅ RESOLVED |
| File | `src/engine.test.ts` |
| Description | No test asserted `accumulator === null` after a digit pressed post-`=`, and no test chained an operator after digit-post-equals to expose a stale accumulator. E-038 / E-050 tested only that the digit replaces the buffer and clears `justEvaluated`. E-057 (`3 + 4 = 9 ×` → prior result gone) was specified in `05-edge-cases.md` but had no corresponding test. This coverage gap allowed L8-01 to pass 59 green tests undetected — the classic "all green but spec-violating" cross-handler interaction gap. |
| Fix | Two tests added: (1) a D-009 state assertion test confirming `accumulator === null` after a digit pressed post-`=`; (2) an end-to-end E-057 test `3 + 4 = 9 + 5 = → 14` that would have caught L8-01 and now confirms the fix. |
| Fix commit | `660d26b` |
| Verification | Both new tests pass. Suite total: 61/61 green (up from 59). |

---

## Final Verdict

**PASS**

The M1 Calculation Engine exits REVIEW clean. All three L8 findings are resolved. Static gates (tsc + vitest) are green at 61/61. The engine is secure (no eval, no prototype pollution, no network surface), architecturally sound (pure functions, 5-field state per D-001, correct error latch per R-014/R-015), and now fully spec-conformant on D-009 with the coverage gap closed. Ready for M2 integration.
