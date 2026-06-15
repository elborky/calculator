---
storm-phase: review
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_index.md
  - storm/build/03-history-tape/
---

# REVIEW M3 — History Tape

> 8-layer auto-verification (REVIEW belongs to AI per #FF-015). Evidence:
> `storm/review/evidence/03-history-tape/`.

## Tier-purity note (clean baseline — contrast with M2)

The **#FF-037 credits-gate fired at REVIEW start** (forked sub-agent dispatch rejected at 0 tokens
before any work — same gate class as M2's #FF-008). The owner resolved it by **switching off the
1M-context session**, restoring a clean dispatch environment. All four REVIEW dispatches ran
**forked at the declared tier**:

| Dispatch | Tier | Commit |
|---|---|---|
| L1 functional crawl + L2–L6 smoke | sonnet (forked) | `e886832` |
| L8 adversarial code audit | opus (forked) | `f209f43` |
| Refix (P1 scroll + P2 elevations) | sonnet (forked) | `a303f3b` |
| This consolidated log | sonnet (forked) | — |

This is the **clean tier baseline** the M2 inline REVIEW lacked. `Model:` trailers on all commits
are honest and measurement-valid.

---

## Per-layer results

| Layer | Verdict | Evidence |
|---|---|---|
| L1 Functional smoke | **PASS (after fix)** | `L1-findings.md`. 44/45 ACs initially; P1-001 resolved in `a303f3b`. 45/45 ACs pass post-fix. |
| L2 Console | **PASS** | `L2-console.log`. 0 app errors, 0 app warnings (2 eval-script-scope warnings not from app). |
| L3 Network | **PASS** | `L3-network.log`. No 4xx/5xx; no tape persistence requests (storage-free confirmed). |
| L4 Accessibility | **PASS** | `L4-axe.json`. axe: 0 violations, 13 passes, 1 incomplete (contrast/glass — expected, GPU-dependent). |
| L5 Visual regression | **PASS (after fix)** | `L5-visual/`. Structure matches v1 Conservative single-line baseline (`_picked.md`): single-line entries, hairline dividers, tabular-nums, no glow. Backdrop-filter=none in headless dismissed (GPU artifact — glass verified in real Chrome at M3 BUILD live-smoke). |
| L6 Perf smoke | **PASS** | `L6-perf.json`. FCP=372ms, CLS=0, DOMContentLoaded=101ms. LCP=null noted (PerformanceObserver timing on fast static page — no LCP threshold defined in ACs). |
| L7 Static gates | **PASS** | `tsc --noEmit` exit 0; `vitest run` 75/75 green (61 engine + 14 M3 jsdom); build GREEN. tsc strict mode clean. |
| L8 Code audit (adversarial, opus) | **PASS (after elevation+fix)** | `L8-code-review.md`. 0 P0/P1 in code audit. 2 P2 findings elevated and resolved in `a303f3b`. See Findings Log. |

---

## Findings Log

### P1-A — Layout break: tape panel grows page height instead of scrolling (HE-016 / HE-028)

| Field | Value |
|---|---|
| Category | Implementation bug |
| Layer | L1 Functional |
| Priority | P1 |
| Status | ✅ RESOLVED |
| Fix commit | `a303f3b` |
| ACs affected | US-M3-4 T (no layout break — HE-016), US-M3-8 T (scroll region keyboard-focusable — HE-028) |
| Files | `src/ui/history/history.css` |

**Description.** With 30+ tape entries, `.history-tape__scroll` (the `overflow-y: auto` scroll
container) had no `max-height` or height constraint. It expanded to match content (1213px+),
cascading up through `.history-slot`, `.app-layout`, `#app`, and `<body>`. The page body scrolled
(`body.scrollHeight=949 > body.clientHeight=647` — 302px overflow) instead of the panel's internal
scroll region. Consequence chain:
1. HE-016 FAIL — page grew, panel did not absorb overflow.
2. HE-028 FAIL — `isOverflowing` (scrollHeight > clientHeight) was always false since the container
   expanded; conditional `tabindex="0"` never fired; keyboard users could not focus/scroll the tape.
3. US-M3-4 "newest-at-edge while scrolled" had no meaningful scroll region to verify.

**Fix.** Added `max-height: calc(100vh - 100px)` to `.history-slot` (desktop base rule, outside the
mobile `@media (max-width:640px)` block). Refix verification (`L1-refix/verify-note.md`):
- 30-entry case: `scrollEl.clientHeight=509` (bounded), `scrollEl.scrollHeight=1213` (overflows
  internally), `body.scrollHeight=body.clientHeight=647` (page stable).
- Conditional `tabindex="0"` + `aria-label="Calculation history, scroll to see all entries"` now
  fire on scroll container when overflowing.
- 3-entry case (non-overflow): `tabindex=null` — no permanent dead tab-stop.
- Empty state (after AC): `data-empty="true"`, "No calculations yet" visible, itemCount=0.

---

### P2-A — Listener loop unguarded: throw in any listener breaks M2 dispatch (state.ts seam)

| Field | Value |
|---|---|
| Category | Craft-floor safety (C3 "observe, never break M2") |
| Layer | L8 Code audit |
| Priority | P2 (elevated to fix-this-REVIEW) |
| Status | ✅ RESOLVED |
| Fix commit | `a303f3b` |
| Finding ID | F-1 (L8) |
| File | `src/ui/state.ts:62` |

**Description.** The subscriber loop `for (const l of listeners) l(prev, state)` had no defensive
boundary. A throw inside any listener would propagate out of `dispatch()` and break the calculator —
violating the C3 contract that the seam's whole safety rests on ("observe, never break M2"). Safe
with the current sole listener (which is total on all spec'd paths), but the invariant was
load-bearing on that never changing.

**Fix.** Wrapped each per-listener call in a `try/catch`; `console.error` in catch (visible,
non-silent). M2 render path and listener ordering unchanged. Any future listener that throws is
isolated; M2 dispatch continues.

---

### P2-B — Test coverage gap: `justEvaluated===false` branch unasserted (T-236 chained-calc)

| Field | Value |
|---|---|
| Category | Test coverage |
| Layer | L8 Code audit |
| Priority | P2 (elevated to fix-this-REVIEW) |
| Status | ✅ RESOLVED |
| Fix commit | `a303f3b` |
| Finding ID | F-2 (L8) |
| File | `src/history-tape.test.ts:212-250` |

**Description.** T-236 ("chained calc") built `afterChainOp` — the state after an intermediate `+`
press where `justEvaluated===false` — and comments argued the intermediate is NOT recorded. But the
test never called `recordOnEquals(prevBeforeChain, afterChainOp)` to prove it. The
`justEvaluated===false` predicate branch had no asserting test: a regression that recorded on
operator-press would remain green. Gap was omission, not concealment.

**Fix.** Added assertion in T-236: `expect(afterChainOp.justEvaluated).toBe(false)` +
`recordOnEquals(prevBeforeChain, afterChainOp)` + `expect(getTape().length).toBe(0)`. The
must-not-record branch is now covered. vitest 75/75 green post-fix.

---

### P2-C — Backdrop-filter "none" in Playwright headless (glass blur absent on tape panel)

| Field | Value |
|---|---|
| Category | Visual regression risk |
| Layer | L5 Visual |
| Priority | P2 |
| Status | ✅ DISMISSED (headless env artifact — not a code defect) |
| Fix commit | — |

**Description.** `window.getComputedStyle(historySection).backdropFilter === "none"` in the
Playwright headless run. The v1 baseline (`_picked.md`) specifies "recessed tape panel (standard
16px blur)."

**Dismissal rationale.** `backdrop-filter` is GPU-accelerated; Playwright headless software-renderer
does not apply it. Glass blur was verified present in real Chrome during M2 REVIEW live-smoke AND
M3 BUILD live-smoke (the runtime-smoke discipline that caught the startup-crash bug, validating
#E4 axis-2). No code defect; headless-env artifact only. Not actioned.

---

### P3-A — Duplicate `./state` import in `main.ts`

| Field | Value |
|---|---|
| Category | Code style / import fragmentation |
| Layer | L8 Code audit |
| Priority | P3 |
| Status | ✅ RESOLVED |
| Fix commit | `a303f3b` |
| Finding ID | F-4 (L8) |
| File | `src/ui/main.ts:16,32-36` |

**Description.** Two separate `import { … } from './state'` statements (`getState, render` at line
16; `subscribe` at line 32) — minor import fragmentation, cosmetic.

**Fix.** Consolidated into single `import { getState, render, subscribe } from './state'`.

---

### P3-B — AC-via-dispatch non-record only structurally simulated (T-242)

| Field | Value |
|---|---|
| Category | Test coverage (cosmetic gap) |
| Layer | L8 Code audit |
| Priority | P3 |
| Status | ⏭ DEFERRED — non-blocking cosmetic |
| Finding ID | F-3 (L8) |
| File | `src/history-tape.test.ts:317-359` |

**Description.** T-242-extended ("record + AC") simulates AC by calling `clearTape()+renderHistory()`
directly — never drives `recordOnEquals(prev, inputAllClear(prev))` at the listener seam to prove
the predicate doesn't spuriously record when AC produces `initialState()` (`justEvaluated:false`).
The guard holds by construction (INT-M3-1 predicate blocks AC results), and T-235 (bare `=` with
`justEvaluated:false`) already asserts the same predicate clause. Deferred to post-SHIP or M4
harness; no separate park ticket needed (cosmetic test-style item).

---

### P3-C — CSS `max-height` belt-and-suspenders duplication at phone breakpoint

| Field | Value |
|---|---|
| Category | CSS minor duplication |
| Layer | L8 Code audit |
| Priority | P3 |
| Status | ⏭ DEFERRED — defensible, left as-is |
| Finding ID | F-5 (L8) |
| File | `src/ui/history/history.css:279,284` |

**Description.** `max-height:150px` set on both `.history-slot` and `.history-tape` at the
`(max-width:640px)` phone breakpoint — comment labels it "belt-and-suspenders." Mild duplication
(rule-of-three not breached). Defensible as a flex-cap guard on the scroll-owning element. The P1
fix (desktop `max-height` on `.history-slot`) harmonises with this pattern without making the
duplication harmful. Now-reconciled CSS item; intentionally left as-is.

---

## Verdict

**PASS.**

All P0 findings: 0. All P1 findings (1): resolved in `a303f3b`. All P2 findings elevated to
fix-this-REVIEW (2): resolved in `a303f3b`. P3-A resolved in `a303f3b`. P3-B and P3-C deferred as
non-blocking cosmetic items — both guarded by construction, no separate park tickets needed.

Static gates green: `tsc --noEmit` exit 0, `vitest run` 75/75, build clean. Live browser
verification confirms the scroll fix (panel scrolls, body stable, conditional `tabindex` fires at
≥30 entries). Layer 4 axe: 0 violations. Layer 6 FCP=372ms, CLS=0.

**Module M3 History Tape is ready for SHIP** (or next module per owner sequencing — SHIP M2 remains
deferred per owner, "lanjut M3" 2026-06-15).
