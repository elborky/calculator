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
coupling. **Source:** `01-data-model.md` §1 note, §4, OQ1/OQ2.
