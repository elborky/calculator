---
storm-phase: review
storm-module: 03-history-tape
storm-canonical: false
storm-depends-on:
  - storm/specify/03-history-tape/_decisions.md
  - storm/specify/03-history-tape/01-data-model.md
  - storm/specify/03-history-tape/03-rules.md
  - storm/specify/03-history-tape/06-tech-choices.md
  - storm/specify/03-history-tape/07-acceptance.md
---

# M3 History Tape — REVIEW Layer 8 Code Audit

> **Reviewer:** independent opus, adversarial-audit hat (CP-2 critical-reviewer). Fresh context — did
> NOT write the code. Mandate: FIND craft-floor violations the BUILD sub-agents missed; do NOT re-attest.
> **Floor:** `docs/craft-floor.md` (local) — spine A1–A6 + CODE floor B1–B5; UI floor authored JIT from
> first principles (semantic markup / a11y / no-AI-slop), enforced not self-attested.
> **Scope:** code touched by BUILD M3 since M2 REVIEW (8 src/spec files + index.html + test suite).
> **Deterministic gate (run, not imagined):** `tsc --noEmit` EXIT 0 · `vitest run` 75/75 pass · no
> `innerHTML`/`eval` in M3 src · no secrets. These are the binding machine verdict (A6); findings below
> are the judgement-call layer a machine can't grade.

---

## Per-checklist verdicts

### 1. Web-security surface (XSS) — **PASS**
The render path is **injection-safe by construction**. `render-history.ts` builds every node with
`document.createElement` and writes user-derived strings via `textContent` only
(`exprSpan.textContent`, `eqSpan.textContent`, `resultSpan.textContent` — lines 129/133/137); list
clears use `listEl.textContent = ''` (lines 90, 146). **Zero** `innerHTML`/`insertAdjacentHTML`/
`outerHTML`/`eval` anywhere in M3 src (grep-confirmed). Even though `expression`/`result` originate
from the engine (digits + frozen `OPERATOR_TO_GLYPH` glyphs, not free user text), the `textContent`
discipline means a hypothetical hostile string could never become markup. Trust-boundary escape (B1)
is met. No secrets-in-logs (no logging on the record path at all).

### 2. Secrets scan — **PASS**
No hardcoded credentials/tokens/keys. Grep hits on `token`/`secret` are CSS comments
("token" = design token; "secret" never appears). Clean.

### 3. Dead code — **PASS (1 P3 note)**
No unreachable branches, no commented-out logic blocks, no half-finished functions, no unused imports
(tsc with `noUnusedLocals`-equivalent strictness passes). `getDisplayValue(next) as string` cast is
justified by the predicate (next is non-error). See **F-5 (P3)** for one belt-and-suspenders CSS
`max-height` duplicate that is defensible, not dead.

### 4. Complexity — **PASS**
Largest function is `renderHistory()` (~70 LOC incl. comments, ~35 LOC code) — within the floor's
"hold in one head" proxy; nesting never exceeds 2; `recordOnEquals` is one guarded `if`. No cyclomatic
outliers. `checkScrollFocus()` cleanly extracted. No over-extraction either (A4 — complexity not just
relocated).

### 5. Fragmentation — **PASS**
All files right-sized: largest src is `render-history.ts` (159 lines), `history.css` (298). The five
history `.ts` files are cohesive single-responsibility units (types / array / listener / render),
correctly NOT merged — splitting along the data/listener/render seam matches the spec's module
boundaries. Nothing <100 lines that should merge (`types.ts` at 14 and `history.ts` at 32 are
deliberately thin single-export modules, the right call).

### 6. Cross-file consistency — **PASS**
- `HistoryEntry {expression, result, id}` matches `01-data-model.md §1` exactly (field names + types).
- **INT-M3-1 predicate is byte-exact** vs spec. `history.ts:23`:
  `prev.pendingOperator !== null && next.errorState === null && next.justEvaluated === true` — matches
  `03-rules.md` HR-001 and `06-tech-choices.md §1` verbatim, and the field names match
  `src/types.ts:7-18` `EngineState` exactly (`pendingOperator`, `errorState`, `justEvaluated`).
- INT-M3-2 derivation (`history.ts:27-28`) matches `01-data-model.md §3` table:
  expression from `prev.accumulator.toString() + glyph + prev.entryBuffer`, result from
  `getDisplayValue(next)`. `getDisplayValue` returns `entryBuffer` on the non-error path
  (`engine.ts:341-346`) — consistent with the spec's "equivalent to reading nextState.entryBuffer".
- Oldest-first array + render-side reverse (D-M3-DM-01) correct: `tape.ts` plain `push`,
  `render-history.ts:102` `[...tape].reverse()` (non-mutating — respects the `readonly` view).
- Unbounded array, zero-new-deps (D-M3-DM-03 / D-M3-TC-02) honored — no cap, no new import.
- AC-clears / CE-no-op (HR-016/017) wired in `bindings.ts:76-80` (AC→clearTape) with CE absent from the
  clear path. Esc routes through the same `all-clear` intent (`bindings.ts` keyboard whitelist).

### 7. Error handling — **PASS (1 P2, see F-1)**
The seam **cannot throw and break M2 dispatch on any spec'd path**: the listener runs after `render()`
(`state.ts:62`), and on the recording path every operation is total (string concat, frozen-map lookup,
`textContent` writes). The `prev.accumulator!` non-null assertion is genuinely guarded by
`prev.pendingOperator !== null` (engine invariant: `inputOperator` always sets `accumulator` before
`pendingOperator`, `engine.ts`). **However** the listener loop has no defensive boundary — see **F-1
(P2)**: a throw inside *any* future listener would propagate out of `dispatch()` and break the
calculator. Not exploitable today (the one listener is total), but the seam is M2's hot path and the
contract "observe, never break M2" (C3) is currently load-bearing on the listener never throwing.

### 8 / 8b. Test coverage (adversarial) — **FINDINGS (1 P2, 1 P3)**
75/75 green, but green ≠ exonerated. The suite tests the **positive** side of the predicate well
(T-232 genuine record; T-237 all four glyphs) and three negative sides directly via `recordOnEquals`
(T-233 repeated-= / `pendingOperator===null`; T-234 error / `errorState!==null`; T-235 bare-= /
`pendingOperator===null`). But two negative branches are **reasoned in comments, never asserted**:
- **F-2 (P2):** the **`justEvaluated===false` intermediate-operator branch** is the headline gap. T-236
  ("chained calc") constructs `afterChainOp` (the state after the intermediate `+`, `justEvaluated:false`)
  and the comments (lines 229-231) *argue* "so the chain intermediate is NOT recorded" — but the test
  **never calls `recordOnEquals(prevBeforeChain, afterChainOp)` to prove it.** It only asserts the FINAL
  `=` records. The `justEvaluated===false` predicate branch thus has **no asserting test** — a regression
  that flipped the third clause (or recorded on operator-press) would stay green. This is the exact
  "FAILING side has no test" gap 8b targets.
- **F-3 (P3):** the **AC-via-dispatch non-record** is asserted only structurally. T-242-extended
  ("record + AC") simulates AC by calling `clearTape()+renderHistory()` directly (line 349) — it never
  drives `recordOnEquals(prev, inputAllClear(prev))` to prove the listener doesn't *spuriously record*
  when AC produces `initialState()` (`justEvaluated:false`). The guard holds (verified by inspection),
  but it's untested at the listener seam.
No comment in the suite signals a *sidestepped* path (no bypass/skip/avoid near a guard) — the gap is
omission, not concealment.

### 9. Craft floor (iron-law) — **PASS (UI floor clean)**
- **Clarity:** names reveal intent (`recordOnEquals`, `appendEntry`, `checkScrollFocus`); comments cite
  spec IDs without restating. Strong.
- **Safety:** `textContent` (no XSS), guarded non-null, throw-if-DOM-missing at module init
  (`render-history.ts:27-33`) — fails loud, observable (B2).
- **No over-engineering (both directions, A2):** spec mandates unbounded array + zero deps; code holds
  exactly that — no speculative cap, no persistence layer, no store lib, no event-bus. The monotonic
  `id` earns its place (keyed slide-in; content not unique — D-M3-DM-02). No gold-plating found.
- **UI floor (JIT):** semantic `<ul>/<li>` (HR-019), conditional `tabindex` so never a dead tab-stop or
  focus trap (HR-021/HE-028), `aria-hidden` removed once exposed (HR-020), deliberate no-`aria-live`
  with a documented rationale to avoid double-announce (T-221 comment / US-M3-8), reduced-motion drops
  the slide (history.css:294-298, HR-021), tokens-not-literals for themed colors (HR-023). All met.
  Note: contrast (HR-022) + live reduced-motion + visual-vs-`_picked` are **L1/L5 browser** checks, out
  of L8 static scope — flagged to REVIEW, not gradeable here.

---

## Findings list

| ID | Sev | File:line | Description | Proposed fix (not a diff) |
|---|---|---|---|---|
| **F-1** | **P2** | `src/ui/state.ts:62` | Listener loop `for (const l of listeners) l(prev, state)` has no try/catch. A throw in any listener propagates out of `dispatch()` and breaks the calculator — violating the C3 "observe, never break M2" contract that the seam's whole safety rests on. Safe today (sole listener is total), but the seam is unguarded for its stated invariant. | ✅ **RESOLVED** — wrapped per-listener call in try/catch; `console.error` in catch (visible, non-silent); M2 render path and ordering unchanged. |
| **F-2** | **P2** | `src/history-tape.test.ts:212-250` | The `justEvaluated===false` predicate branch (intermediate-operator press in a chain) is asserted only in comments, never executed: T-236 builds `afterChainOp` but never calls `recordOnEquals(prevBeforeChain, afterChainOp)`. A regression that recorded on operator-press would stay green. | ✅ **RESOLVED** — added assertion in T-236: `expect(afterChainOp.justEvaluated).toBe(false)` + `recordOnEquals(prevBeforeChain, afterChainOp)` + `expect(getTape().length).toBe(0)`. Coverage gap closed. |
| **F-3** | **P3** | `src/history-tape.test.ts:317-359` | AC-via-dispatch non-record is only simulated structurally (`clearTape()+renderHistory()`), never proven at the listener seam: no test drives `recordOnEquals(prev, inputAllClear(prev))` to confirm the predicate rejects the `initialState()` (`justEvaluated:false`) AC result. | ⚠️ **DEFERRED** — the INT-M3-1 predicate blocks AC results by construction (`justEvaluated:false`), guarded by T-235 (bare `=` with `justEvaluated:false` already asserted). Not added this commit to keep the fix atomic to P1/P2 scope. P3 deferred to post-SHIP or M4 harness. |
| **F-4** | **P3** | `src/ui/main.ts:32-36` & `:16` | Two separate `import { … } from './state'` statements (`getState, render` at line 16; `subscribe` at line 32) — minor import fragmentation; cosmetic, intentional for narration grouping. | ✅ **RESOLVED** — consolidated into single `import { getState, render, subscribe } from './state'`. |
| **F-5** | **P3** | `src/ui/history/history.css:279,284` | `max-height:150px` set on both `.history-slot` and `.history-tape` at the phone breakpoint — comment labels it "belt-and-suspenders". Mild duplication (rule-of-three not breached). Defensible as a flex-cap guard, not dead. | Optional: keep on the scroll-owning element only if redundant proves true under L5 visual check; otherwise leave — harmless. |

---

## Verdict summary

| Severity | Count | Status |
|---|---|---|
| **P0** | 0 | — |
| **P1** | 0 | — |
| **P2** | 2 (F-1, F-2) | ✅ Both RESOLVED in refix commit |
| **P3** | 3 (F-3, F-4, F-5) | F-4 RESOLVED; F-3 deferred; F-5 left as-is (defensible) |

**Post-refix verdict: PASS.** All P1 (from L1) and P2 (from L8) findings resolved. F-3 (P3) deferred by scope — the predicate guards it by construction and T-235 covers the same clause. F-5 (P3) CSS belt-and-suspenders duplication intentionally left as-is.

**Refix commit:** storm:REVIEW:history-tape::fix - scroll-bound P1 + seam-guard + test-gap + dup-import
