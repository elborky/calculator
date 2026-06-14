---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: false
---

# M1 — Autonomous Technical Decisions

> AI-autonomous technical decisions (CP-7) logged during SPECIFY drafting. Each is a code-pattern /
> data-shape choice the zero-coding owner cannot meaningfully evaluate (theater gate, CP-7 Langkah-1),
> so it is decided and documented, not asked. D-NNN format.

## D-001 — Engine state is a single 5-field object

**Decision:** Model M1's running state as one object with fields `entryBuffer` (string), `accumulator`
(Number\|null), `pendingOperator` (enum\|null), `justEvaluated` (bool), `errorState` (null\|error-value).
**Rationale:** A basic calculator is a small operand/operator state machine (F7); five fields cover all
transitions (digit, decimal, operator, equals, CE/AC) with no redundancy. Fewer would conflate states
(e.g. no way to tell "mid-entry" from "just-evaluated"); more would be over-engineering (CP-13).
**Source:** `01-data-model.md` §1.

## D-002 — `entryBuffer` held as a string during entry

**Decision:** The live operand is a string while typing, parsed to the numeric type only on commit.
**Rationale:** Cleanly enforces "one decimal per number" (F2), leading-zero handling, and a trailing
`.` mid-entry — all awkward to enforce on a float. Standard calculator pattern.
**Source:** `01-data-model.md` §1, §4.

## D-003 — Error state is a discriminable latch with clear-escape

**Decision:** `errorState` is a tagged/discriminable value (distinguishes divide-by-zero vs overflow),
latches the engine (digit/operator/equals become no-ops while set), and is cleared by **both** CE and AC.
**Rationale:** F5 requires a defined value M2 can render; discriminability lets M2 pick wording without
M1 rendering. Latch prevents computing on a poisoned value; clear-escape (including CE, not only AC)
guarantees the user is never stuck — a friction/UX-safety call within technical authority.
**Source:** `01-data-model.md` §3, §2.

## D-004 — Number type / precision / overflow threshold deferred to tech-choices

**Decision:** `01-data-model.md` stays implementation-agnostic on the concrete numeric type, precision,
rounding mode, and overflow threshold; states the *contract* and defers the values to `06-tech-choices.md`
(OQ1, OQ2). **Rationale:** These are tied to the number-representation choice (native vs decimal lib),
which is a verified tech decision belonging in tech-choices, not the data model. Avoids premature
coupling. **Source:** `01-data-model.md` §1 note, §4, OQ1/OQ2. *(Resolved by D-006 below.)*

---

> Tech-choices decisions (CP-6 verified). Each carries a live-tool verification cite (Context7 primary,
> npm-registry / WebFetch cross-check, time-anchored to June 2026). Authoritative rationale lives in
> `06-tech-choices.md`; this is the index.

## D-005 — Language: TypeScript 6.0.3

**Decision:** Author the engine in TypeScript, compiled to plain JS for the static target.
**Rationale:** Type-safety on the operand/operator state machine (F7); AI owns all code forever so type
cost is AI-absorbed; compiles to plain JS → zero runtime, fits Dokploy Static (NGINX) target.
**Source:** `06-tech-choices.md` §1.
**Verification:** TypeScript 6.0.3 latest stable — npm registry `registry.npmjs.org/typescript/latest`
(2026-06). TS out-of-the-box test support — Context7 `/vitest-dev/vitest` (2026-06).

## D-006 — Number representation: decimal.js 10.6.0 (resolves the D-004 deferral)

**Decision:** Use decimal.js for all arithmetic instead of native IEEE-754 `number`. THE key M1 tech
decision; sets OQ1 (precision) + OQ2 (overflow threshold) that D-004 deferred here.
**Rationale:** "Basics are flawless" (`01-vision.md`) forbids `0.1 + 0.2 = 0.30000000000000004`. Native
float leaks that by default; the hand-rolled fix is *more* bespoke code (#FF-004 less-bespoke tiebreaker →
decimal.js wins on both correctness AND simplicity). Gives a defined overflow threshold for the F5 error
state vs silent Infinity.
**Source:** `06-tech-choices.md` §2.
**Verification:** decimal.js 10.6.0 latest, actively maintained — npm registry
`registry.npmjs.org/decimal.js/latest`, `modified 2025-07-06` (2026-06 check). Arithmetic API + 0.1+0.2
correctness — Context7 `/mikemcl/decimal.js` (benchmark 93.8, High, 2026-06). big.js 7.0.1 (npm, 2026-06)
noted as lighter fallback, not chosen.

## D-007 — Test framework: Vitest 4.1.8

**Decision:** Unit-test the engine with Vitest.
**Rationale:** The arithmetic core IS the craft bar (F12, C3) → needs a first-class unit runner; zero-config
TS (no ts-jest); Vite-native → one toolchain shared with M2's Vite bundler. node:test + Jest set aside
(config burden / pipeline split).
**Source:** `06-tech-choices.md` §3.
**Verification:** Vitest 4.1.8 latest — npm registry `registry.npmjs.org/vitest/latest` (2026-06); v4.x +
Vitest-over-Jest-for-Vite recommendation — WebFetch vitest.dev/guide/comparisons (time-anchored 2026-06);
TS out-of-the-box — Context7 `/vitest-dev/vitest` (2026-06).

## D-008 — Build tooling: none at M1; app bundler deferred to M2 (Vite 8.0.16 recommended)

**Decision:** No app bundler for the headless engine. M1 needs only `tsc` compile/type-check, an ES-module
export for import, and Vitest for tests. The static-bundle bundler is M2's decision; Vite 8.0.16 recommended
(non-binding).
**Rationale:** Bundling produces the app's static `index.html`+JS for the Dokploy Static target — that's the
UI module's output, not the logic core's. Bundling M1 alone = premature (CP-13 YAGNI). Tooling runtime:
Node LTS v24 (Krypton).
**Source:** `06-tech-choices.md` §4.
**Verification:** Vite 8.0.16 latest — npm registry `registry.npmjs.org/vite/latest` (2026-06). Node LTS v24
Krypton newest active LTS — `nodejs.org/dist/index.json` (2026-06).

---

> Flows decisions (CP-7 autonomous — logic/sequencing choices). Authoritative rationale lives in
> `02-flows.md`; this is the index.

## D-009 — Post-equals digit clears accumulator (fresh-start semantics)

**Decision:** When `justEvaluated = true` and the next input is a digit, `accumulator` is set to `null`
(not just `entryBuffer` replaced). This means a digit after `=` unconditionally starts a brand-new
calculation with no left-hand value — the prior result is abandoned.
**Rationale:** Standard basic-calculator behaviour: after a result the user either (a) presses an operator
to continue from the result (§3.3 — accumulator survives, pending operator chains) or (b) types a digit
to start over (accumulator cleared). Preserving accumulator on digit entry after `=` would silently poison
the next operator-set step with a stale left-hand value. Clearing it is the safe, conventional default.
**Source:** `02-flows.md` §1.3, §3.3.

## D-010 — Operator-first (no prior digit) uses implicit `0` as left-hand operand

**Decision:** If an operator is pressed when `accumulator` is `null` and `pendingOperator` is `null` (fresh
state), treat `entryBuffer` value (typically `"0"`) as the implicit left-hand operand: store it in
`accumulator`, register the operator, and reset `entryBuffer`. This makes `+ 5 =` yield `5` (not an error).
**Rationale:** Prevents an undefined-accumulator error on a common misfire (pressing `+` before any digit).
Treating the displayed `0` as the left-hand is the only sensible non-error interpretation. Not a taste
call — the only alternative is a no-op or an error, both worse UX.
**Source:** `02-flows.md` §2.3.

## D-011 — Chaining operator on error path: error can also arise from auto-resolve step

**Decision:** The operator-chaining auto-resolve (§2.2) can itself trigger the error flow — if the
auto-resolved intermediate result is a divide-by-zero or overflow, `errorState` is set at the operator
press, not only at `=`. The new operator is NOT registered in this case (latch wins).
**Rationale:** The chaining step performs a real arithmetic resolution; it must honour the same error
contract as `=`. Allowing the engine to register a new operator on top of a poisoned intermediate value
would produce a compounded invalid state.
**Source:** `02-flows.md` §5.4 ("via chain" path).
