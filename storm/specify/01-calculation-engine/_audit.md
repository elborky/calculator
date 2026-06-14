---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: false
---

# M1 Calculation Engine — Cross-File Consistency Audit

> Adversarial cross-file consistency audit of the M1 SPECIFY concern set (opus tier).
> Subjects: `_briefing.md`, `_index.md`, `01-data-model.md`, `02-flows.md`, `03-rules.md`,
> `05-edge-cases.md`, `06-tech-choices.md`, `_decisions.md`.
> Upstream cross-refs: `03-modules.md`, `04-scope.md`, `06-build-order.md`, `00-domain-lens.md`.
>
> Headless-by-design: no `04-ui.md`, no mockups (deferred to M2 per `_briefing.md:50-54`). NOT flagged.

---

## VERDICT: **FIX-REQUIRED** — 3 findings

- **F1 (BLOCKING):** State-machine field-set divergence — `lastOperator` / `lastRhs` (repeated-equals, D-015) are required by `_index.md` T-040/T-048 but absent from the canonical 5-field state object in `01-data-model.md §1` and D-001, which both lock the set at exactly 5 fields. The data-model is the canonical source and does not include them.
- **F2 (MINOR):** Decimal.js config divergence — `_index.md` T-011 hard-codes `precision: 21` + `ROUND_HALF_UP` only, omitting the overflow-bound config (`toExpPos`/`toExpNeg`) that `03-rules.md R-012` and the overflow edge-cases (E-006/E-008, tasks T-075–T-077) depend on to fire `errorState = 'overflow'`.
- **F3 (MINOR):** `_index.md` T-079 references "E-053 without D-015" and a duplicate-of-T-050 escape ("or skip as duplicate"), creating an ambiguous / contradictory task instruction against E-053's actual D-015-dependent definition in `05-edge-cases.md`.

R-NNN existence ✓, E-NNN existence ✓, D-NNN collisions ✓, chaining semantics ✓, number-representation contract ✓, div-by-zero/latch contract ✓, library/version pins ✓, scope adherence ✓ — see "Clean axes" below.

---

## Findings (numbered)

### F1 — BLOCKING — State field-set divergence: `lastOperator` / `lastRhs` not in canonical state object

**Files:** `01-data-model.md:34-40` (§1) + `_decisions.md:13-20` (D-001) **vs** `_index.md:151` (T-040), `_index.md:166` (T-048), `_index.md:77` (T-008).

**The divergence:**
- `01-data-model.md §1` (`:34-40`) defines the state object as **exactly 5 fields**: `entryBuffer`, `accumulator`, `pendingOperator`, `justEvaluated`, `errorState`. D-001 (`_decisions.md:13-20`) reinforces this hard: *"five fields cover all transitions… more would be over-engineering (CP-13)."* T-008 (`_index.md:77`) codes the `EngineState` interface as those same 5 fields.
- But repeated-equals (D-015, `_decisions.md:177-187`; E-022/E-053, `05-edge-cases.md:98,186`) requires the engine to retain the **last operator** and **last right-hand operand** after a resolve. `_index.md` T-040 (`:151`) states the equals handler *"stores `lastOperator` and `lastRhs` for repeated-equals (D-015)"*, and T-048 (`:166`) says *"Extend `EngineState` (or use a sibling store) to carry `lastOperator: Operator \| null` and `lastRhs: Decimal \| null` fields."*
- These two fields are **not** in the data-model's canonical set and are **not** reconciled there. D-015 itself punts (`:186`: *"exact encoding is a BUILD implementation detail"*) and T-048 hedges (*"or use a sibling store"*) — so the canonical state shape is left genuinely ambiguous: is the engine state 5 fields or 7? `01-data-model.md` (the authoritative source for the field set) answers "5" and is silent on the other two; `_index.md` answers "7 (or a sibling store)". This is exactly the suspect flagged in the audit brief.

**Why it matters (not cosmetic):** `01-data-model.md` is the canonical state-shape source; every other file (flows notation `[EB|ACC|PO|JE|ERR]` at `02-flows.md:21`, the latch/no-op contract, T-058's "all 5 fields at initial values" assertion at `_index.md:190`) is written against a **5-field** model. A BUILD agent reading T-048 will add fields the data-model never sanctioned, and tests like T-058 (`inputAllClear — all 5 fields at initial values`) become under-specified — must `lastOperator`/`lastRhs` also reset on AC? (They must, for E-059 "no residual after AC" at `05-edge-cases.md:199` to hold — but no file says so.)

**The fix (pick one, then cascade):**
- **Preferred — reconcile into the data-model.** Update `01-data-model.md §1` to include `lastOperator` (`Operator \| null`, initial `null`) and `lastRhs` (`Decimal \| null`, initial `null`) as fields 6 & 7, with a one-line purpose ("retained post-`=` to support repeated-equals, D-015") and an explicit note in §2 that **both reset on AC** and are **set on each successful `=`**. Amend D-001 (currently "5-field") → "7-field" with the repeated-equals rationale so it no longer contradicts (`_decisions.md:13-20`). Update the §1 initial-value column + the flows notation header (`02-flows.md:21`) if the team wants the canonical tuple to show all fields (optional — notation MAY stay 5-wide if a footnote names the 2 hidden retention fields).
- **Alternative — sibling store.** If the owner prefers the state object stay at 5, then `01-data-model.md` must **explicitly** document the repeated-equals retention as a separate internal store (named, typed, reset-on-AC stated), and T-048 must drop the "Extend `EngineState`" wording in favour of the sibling-store path only. Either way the ambiguity ("or") must be removed and the chosen shape stated in the canonical file.
- **Cascade on fix:** `01-data-model.md §1/§2`, `_decisions.md` D-001 (and a cross-note in D-015), `_index.md` T-008/T-040/T-048/T-058, and confirm E-059 (`05-edge-cases.md:199`) AC-reset coverage names the new fields.

---

### F2 — MINOR — Decimal.js config in T-011 omits the overflow-bound config the overflow contract depends on

**Files:** `_index.md:87` (T-011) **vs** `03-rules.md:99-109` (R-012) + `05-edge-cases.md:50-57` (E-006–E-008) + `_index.md:242-244` (T-075–T-077).

**The divergence:** T-011 (`:87`) specifies the decimal.js config as exactly `Decimal.set({ precision: 21, rounding: Decimal.ROUND_HALF_UP })`. But R-012 (`03-rules.md:99-109`) defines the overflow error state as firing when a result *"exceeds the configured precision and **exponent range**"* and names `toExpPos`/`toExpNeg` as the controlling config; E-006/E-008 (`05-edge-cases.md:55,57`) and the overflow test tasks T-075–T-077 (`_index.md:242-244`) require a configured **magnitude/exponent bound** to fire `errorState = 'overflow'`. With only `precision` + `rounding` set (T-011), decimal.js does **not** raise an overflow on large exponents by default — `toExpPos`/`maxE` govern that, and they are unset. The overflow tests would have no configured ceiling to trip.

**Note:** D-013 (`_decisions.md:149-159`) legitimately defers the *concrete value* of the overflow threshold to BUILD — that deferral is fine and is NOT the divergence. The divergence is that T-011, the one task that *applies* the decimal.js config, enumerates a closed config object (`precision` + `rounding` only) that silently drops the exponent-bound knob R-012's contract is built on. A BUILD agent following T-011 verbatim ships a config under which T-075–T-077 cannot pass.

**The fix:** Amend T-011 (`_index.md:87`) so the config object is not closed at `precision` + `rounding` — either (a) add the overflow-bound config to the `Decimal.set({...})` call (e.g. include `toExpPos`/`toExpNeg` or document reliance on `Decimal.maxE`/`minE`), or (b) reword T-011 to "configure precision + rounding **and** the overflow exponent bound per R-012; concrete bound value is BUILD-owned (D-013)" so the task explicitly carries the third knob. Keep the value BUILD-deferred per D-013, but the *presence* of the knob must be in the config task, not only in the rules prose.

---

### F3 — MINOR — T-079 task instruction is ambiguous / self-contradictory against E-053's D-015 definition

**Files:** `_index.md:253` (T-079) **vs** `05-edge-cases.md:186` (E-053) + `05-edge-cases.md:98` (E-022) + `_decisions.md:177-187` (D-015).

**The divergence:** T-079 (`:253`) reads: *"Write test `equals after equals is identity / no-op (E-053 without D-015)` — covered by T-050/T-051; confirm no double-action … (or skip as duplicate of T-050)."* But E-053 (`05-edge-cases.md:186`) is **defined** as the repeated-equals re-apply pattern (*"See E-022. Repeated-equals pattern — re-applies last op + last rhs"*), which is the **opposite** of "identity / no-op." E-022 (`:98`) and D-015 (`_decisions.md:177-187`) both make `= =` re-apply `(lastOp, lastRhs)` → `3 + 4 = =` yields `11`, explicitly **not** a no-op / identity. T-079's parenthetical "(E-053 without D-015)" describes a behaviour the spec does not have, and its "identity / no-op" framing directly contradicts E-053's actual expected result. The "(or skip as duplicate of T-050)" escape compounds the ambiguity — leaving a BUILD agent unsure whether E-053 is a real second test or a no-op stub.

**The fix:** Rewrite T-079 to match E-053's real definition — either fold it cleanly into the repeated-equals coverage (it is already exercised by T-050/T-051, so make T-079 an explicit *"covered-by"* pointer with **no** "identity/no-op" wording), or delete T-079 and renumber, noting in `_index.md` that E-053 is covered by T-050/T-051. Remove the contradictory "(E-053 without D-015)" / "identity / no-op" phrasing so no task asserts a behaviour the spec contradicts.

---

## Clean axes (verified, not rubber-stamped)

- **R-NNN existence:** every R-reference in `_index.md` / `05-edge-cases.md` (R-004, R-005, R-006, R-007, R-010, R-011, R-012, R-014, R-015, R-016, R-017, R-018, R-021, R-024, R-025) resolves to a real rule in `03-rules.md` (R-001–R-027, contiguous). No dangling R-ref. ✓
- **E-NNN existence:** `_index.md` references E-001…E-060; `05-edge-cases.md` defines E-001–E-060 contiguously across 12 categories. The index header count ("60 edge cases") matches. No dangling E-ref. ✓
- **D-NNN collisions / contradictions:** D-001…D-016 are unique, no number reused. The D-004→D-006 hand-off is a **clean** deferral-then-resolution (D-004 `:38-44` explicitly says *"Resolved by D-006 below"*; D-006 `:61-69` says *"resolves the D-004 deferral"*) — not a contradiction. ✓
- **Operator-chaining semantics:** left-to-right / no-precedence stated identically in `02-flows.md §2.2` (`:89-107`), `03-rules.md R-004` (`:43-50`), `05-edge-cases.md E-025` (`:111`), `_decisions.md D-012` (`:139-147`). `2 + 3 × 4 = 20` consistent everywhere. ✓
- **Number representation:** decimal.js 10.6.0 + the `0.1 + 0.2 = 0.3` correctness contract consistent across `06-tech-choices.md §2`, `03-rules.md R-003` (`:30-37`), `05-edge-cases.md §10` (E-045–E-049), `_index.md:29`, `_decisions.md D-006`. Native-float prohibition (`03-rules.md R-011`) consistent with the decimal.js pick. ✓
- **Div-by-zero + latch contract:** `errorState` tagged-value latch, no-op-while-set, CE-and-AC-both-escape stated identically across `01-data-model.md §3` (`:74-95`), `03-rules.md R-010/R-014/R-015` (`:82-133`), `02-flows.md §5` (`:206-262`), `05-edge-cases.md §1/§12`, `_decisions.md D-003`. ✓
- **Library/version pins:** TypeScript 6.0.3 / decimal.js 10.6.0 / Vitest 4.1.8 / Vite 8.0.16 (M2-deferred) / Node v24 pinned identically in `06-tech-choices.md`, `_index.md:28-32,53,63-66`, `_decisions.md D-005–D-008`. No version contradiction. (Note: `06-tech-choices.md:112-114` candidly records npm `4.1.8` vs vitest.dev-header `4.1.7` — same major line, disclosed, not a contradiction.) ✓
- **Scope adherence:** no scope leak. All concern files stay headless — no DOM/rendering/button-wiring (every file disclaims it and routes to M2), no memory keys / scientific / percent / ± (R-001 + R-022 + F9 honour `04-scope.md:50-52` / `03-modules.md:52-53`), no persistence (`01-data-model.md §5` + F8), no history (routed to M3 per F10). Repeated-equals (D-015), operator-first implicit-0 (D-010), and CE-clears-error are all *within* the F3/F4 "equals + clear" pre-approved scope, not additions. ✓
- **Headless omission of `04-ui.md` + mockups:** by design (`_briefing.md:50-54`), correctly NOT flagged. ✓
