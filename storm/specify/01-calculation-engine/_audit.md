---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: false
---

# M1 Calculation Engine — Cross-File Consistency Audit (Re-audit, pass 2)

> Adversarial cross-file consistency re-audit of the M1 SPECIFY concern set (opus tier), after the
> orchestrator fix-pass (commit `7480270`: repeated-equals D-015 dropped, decimal.js exp-knob added,
> T-079 reworded). Files re-read fresh from disk.
> Subjects: `_briefing.md`, `_index.md`, `01-data-model.md`, `02-flows.md`, `03-rules.md`,
> `05-edge-cases.md`, `06-tech-choices.md`, `_decisions.md`.
> Upstream cross-refs: `03-modules.md`, `04-scope.md`, `06-build-order.md`, `00-domain-lens.md`.

---

## VERDICT: **PASS** (after orchestrator F4 metadata fix, commit pending)

> **F4 RESOLVED by orchestrator** (`_index.md:279`, `_decisions.md:226` D-016): task-count split
> corrected to **60 test / 20 non-test of 80 active**. This was the sole residual finding from the
> re-audit below; with it cleared, the M1 concern set is consistent. Module cleared for APPROVED.

---

## (Re-audit pass-2 verdict, pre-F4-fix): FIX-REQUIRED — 1 finding (all 3 prior findings RESOLVED; 1 new minor count drift)

- **F1 (prior, BLOCKING) → RESOLVED.** Repeated-equals fully reversed; state shape is exactly 5 fields everywhere; D-015 annotated REVERSED, D-017 records the no-op; E-022/E-053 rewritten to no-op; AC-reset references exactly 5 fields. No dangling `lastOperator`/`lastRhs`/re-apply reference in any deliverable.
- **F2 (prior, MINOR) → RESOLVED.** `_index.md` T-011 now includes the exponent-bound knob (`toExpPos`/`toExpNeg`, with `Decimal.maxE`/`minE` alternative), presence mandatory in "Done when", concrete value still BUILD-deferred per D-013.
- **F3 (prior, MINOR) → RESOLVED.** `_index.md` T-079 no longer contradicts E-053; now a clean "covered-by T-050/T-051" no-op pointer.
- **F4 (NEW, MINOR — introduced/left by the fix pass):** the task-count metadata in `_index.md` footer + D-016 ("55 of 80 active tasks are test tasks … Non-test tasks: 25") does not match the actual file content (**60** test tasks, **20** non-test active). The two errors offset to 80, masking the drift.

R-NNN existence ✓, E-NNN existence ✓, T-NNN contiguity ✓, D-NNN numbering/supersession ✓, chaining semantics ✓, number-representation contract ✓, div-by-zero/latch contract ✓, library/version pins ✓, scope adherence ✓ — see "Clean axes."

---

## Re-verification of the 3 prior findings

### F1 — RESOLVED (was BLOCKING — state field-set divergence)

Verified against the four required sub-conditions:

1. **No file still references repeated-equals re-application.** Full grep sweep (`repeated.equal|re-appl|reappl|lastOperator|lastRhs|last operator|last right`) across the concern set returns only: (a) properly-annotated REVERSED/DROPPED references in `_decisions.md` D-015/D-017 and `_index.md` (audit-trail — correct, required for traceability); (b) the generic phrase "repeated equals" as an *example of an enumerated edge case* in `01-data-model.md:136` and `03-rules.md:219` — these are pointers to E-022/E-053, which now define it as a **no-op**, so the pointers remain valid; (c) this `_audit.md` itself (not a spec file). **Zero re-apply assertions remain in deliverable content.** ✓
2. **State shape is exactly 5 fields everywhere.** `01-data-model.md §1` (unchanged, 5 fields), `_index.md` T-008 (5 fields), `_index.md` concern table `:40` (5 fields named), `02-flows.md:21` notation tuple (`[EB|ACC|PO|JE|ERR]`, 5-wide). T-040 (`:151`) explicitly states *"No `lastOperator`/`lastRhs` fields (D-017, 5-field model)."* ✓
3. **E-022 / E-053 now describe no-op.** E-022 (`05-edge-cases.md:98`): *"Second `=`: `pendingOperator` is null, `justEvaluated` is true … No-op: result unchanged (`7`) … (D-017)."* E-053 (`:186`): *"Pressing `=` again with no new pending operation is a **no-op** — result unchanged. (D-017)."* `02-flows.md §3.3` (`:158`): *"`=` again | No pending op → no-op (displays `20`)."* Consistent across all three. ✓
4. **AC-reset references exactly 5 fields; D-015 annotated.** T-058 (`:194`) *"all 5 fields at initial values."* E-059 (`:199`) "no residual after AC" now holds trivially — there are no extra retention fields to reset (the gap I flagged in pass 1 is closed by removing the fields, not by adding reset logic). D-015 (`_decisions.md:177`) struck-through + *"REVERSED — see D-017"*; D-017 (`:191`) records the no-op decision, supersession, and cascade. ✓

### F2 — RESOLVED (was MINOR — decimal.js exp-knob)

`_index.md` T-011 (`:87`) now reads: `Decimal.set({ precision: 21, rounding: Decimal.ROUND_HALF_UP, toExpPos: <N>, toExpNeg: <N> })` with the parenthetical *"overflow-bound knob per R-012 / D-013; concrete `<N>` values are BUILD-owned per D-013 — the knob's presence in the config call is mandatory"*, and the "Done when" now requires *"`toExpPos` and `toExpNeg` (or `Decimal.maxE`/`Decimal.minE`) are explicitly set alongside precision."* The overflow tests T-075–T-077 now have a configured bound to trip. Value-deferral to BUILD (D-013) preserved. ✓

### F3 — RESOLVED (was MINOR — T-079 contradiction)

`_index.md` T-079 (`:257`) now reads: *"Write test `equals after equals is no-op — result unchanged (E-053, D-017)` — covered by T-050/T-051; this task is a named pointer … do not add a duplicate test."* The contradictory *"identity / no-op (E-053 without D-015)"* phrasing is gone; the task now agrees with E-053's actual no-op definition and the dup-avoidance is explicit. ✓

---

## New finding

### F4 — MINOR — task-count metadata in `_index.md` footer + D-016 is wrong (offsetting errors mask it)

**Files:** `_index.md:226` (D-016 body) + `_index.md:278-281` (footer) + `_decisions.md:215-224` (D-016).

**The divergence:** Both the `_index.md` footer (`:279`) and D-016 state *"Test tasks: **55** of 80 active. Non-test tasks: **25**."* A precise per-row count of the live file disagrees:

- Total task IDs: **82** (T-001–T-082, contiguous, verified). ✓
- Removed stubs: T-048, T-049 = **2** → active = **80**. ✓ (this number is correct)
- Test tasks (Task-cell begins "Write test/Write unit test"): **60** (machine-counted, deduped).
- Non-test active tasks (scaffold/type-def/Implement/Run): **20**.
- Check: 60 + 20 = 80 ✓ (active total is right); but 55 + 25 = 80 only because the **−5 test error and +5 non-test error offset**.

The fix pass updated the headline active-task number correctly (82 → 80) but mis-recomputed the test/non-test split: it appears to have subtracted the 2 removed tasks from the *test* bucket (57 → 55) when in fact the 2 removed tasks (old T-048 "Extend EngineState", old T-049 "Update inputEquals") were **non-test implementation** tasks, and old T-050/T-051 (tests) were *retained* (repurposed to no-op assertions, still tests). So the correct post-fix split is **60 test / 20 non-test**, not 55 / 25. (The pre-fix "57 / 25" was itself imprecise; the fix neither caused nor corrected that, but it restated the wrong numbers.)

**Why it matters (low severity, but real):** D-016 is the authoritative task-list decision; a wrong test/non-test tally is a small but durable inaccuracy a BUILD agent or progress tracker could trust ("how many tests should exist when done?"). It is metadata-only — no task content, numbering, or coverage is affected — hence MINOR, not blocking.

**The fix:** Update both occurrences to the verified counts — *"Test tasks: 60 of 80 active. Non-test tasks: 20."* — in `_index.md:279` (footer) and `_index.md:226` / `_decisions.md` D-016 body. No task rows change; only the two summary numbers. (Optional re-verify: `grep -E '^\| T-[0-9]{3} \| Write ' _index.md | wc -l` → 60.)

---

## Clean axes (re-verified, not rubber-stamped)

- **R-NNN existence:** R-001–R-027 defined contiguously in `03-rules.md` (machine-verified); every R-ref in `_index.md`/`05-edge-cases.md` resolves. No dangling R-ref. ✓
- **E-NNN existence:** E-001–E-060 defined contiguously in `05-edge-cases.md` (machine count = 60); index header "60 edge cases" matches; all E-refs in `_index.md` resolve. E-022/E-053 rewritten in place — same IDs, no renumber, no dangling row. ✓
- **T-NNN contiguity:** T-001–T-082, no gaps, no duplicates (machine-verified). T-048/T-049 retained as labelled removed-stubs (audit-trail preserved) rather than deleted-and-renumbered — this is the *correct* choice (renumbering would break every downstream T-ref). No task references T-048/T-049 as a dependency. ✓
- **D-NNN numbering / supersession:** D-001–D-017 unique. D-015 REVERSED, cleanly superseded by D-017 (bidirectional cross-ref: D-015→"see D-017", D-017→"Supersedes D-015"). D-004→D-006 deferral hand-off still clean. `_index.md` concern table updated to "17 decisions (D-001–D-017)". No collision, no orphan. ✓
- **Operator-chaining semantics:** left-to-right / no-precedence identical across `02-flows.md §2.2`, `03-rules.md R-004`, `05-edge-cases.md E-025`, `_decisions.md D-012`. Untouched by the fix. ✓
- **Number representation:** decimal.js 10.6.0 + `0.1+0.2=0.3` contract consistent across `06-tech-choices.md §2`, `03-rules.md R-003`, `05-edge-cases.md §10`, `_index.md:29`, `_decisions.md D-006`. ✓
- **Div-by-zero + latch contract:** tagged-value latch / no-op-while-set / CE-and-AC-escape identical across `01-data-model.md §3`, `03-rules.md R-010/R-014/R-015`, `02-flows.md §5`, `05-edge-cases.md §1/§12`, `_decisions.md D-003`. The added equals-after-equals no-op slots cleanly into the existing "no pending operator → no-op" path (R-006) — no contradiction with the latch contract. ✓
- **Library/version pins:** TypeScript 6.0.3 / decimal.js 10.6.0 / Vitest 4.1.8 / Vite 8.0.16 (M2) / Node v24 consistent across `06-tech-choices.md`, `_index.md`, `_decisions.md D-005–D-008`. T-011 config change touched no version pin. ✓
- **Scope adherence:** no scope leak. Dropping repeated-equals *tightened* scope toward `04-scope.md` F3 ("equals resolves the pending operation to a result" — singular). Headless throughout; no DOM/memory-keys/persistence/history. The equals-after-equals no-op is within the F3 equals contract, not an addition. ✓
- **Headless omission of `04-ui.md` + mockups:** by design (`_briefing.md:50-54`), correctly NOT flagged. ✓
