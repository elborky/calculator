---
storm-phase: ship
storm-canonical: true
storm-depends-on:
  - storm/specify/
  - storm/review/
---

# SHIP QA Report — Calculator (M1 + M2 + M3, consolidated pre-ship gate)

> **What this is.** The consolidated pre-ship quality gate across the **whole product**: M1
> (calculation engine), M2 (calculator UI / keypad), M3 (history tape) — all three shipping together
> as **one static NGINX bundle** (`07-deployment-target.md`). This is not a per-module REVIEW (those
> already PASSed); it is the *aggregate* gate that maps the live test suite + the three REVIEW PASSes
> onto the acceptance criteria and issues a single ship verdict.
>
> Method: re-run the full static-gate suite at current HEAD (not trust prior claims), confirm the one
> in-REVIEW P1 defect is resolved in the shipped tree, map evidence → acceptance area, categorize
> residuals by ship-blocking severity, verdict.

---

## 1 — Live gate results (re-run at HEAD `80a2d77`, 2026-06-15)

All three gates were re-executed for this report — these are **actual captured results**, not
restated claims:

| Gate | Command | Result | Exit |
|---|---|---|---|
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | **0 errors**, strict-mode clean | **0** |
| **Tests** | `npm test` (`vitest run`) | **75 passed (75)** across **2 test files**, 0 failed, 0 skipped — duration 985ms | **0** |
| **Build** | `npm run build` (`tsc --noEmit && vite build`) | **GREEN** — 19 modules transformed, built in 99ms | **0** |

**Test breakdown (verified by per-file count, not assumed):**

| File | Count | Coverage |
|---|---|---|
| `src/engine.test.ts` | **61** | M1 arithmetic — four ops, LTR chaining, decimal entry, div-by-zero, overflow, error latch/escape, CE/AC, leading-zero/trailing-decimal normalization, D-009 digit-after-equals |
| `src/history-tape.test.ts` | **14** | M3 recording predicate (INT-M3-1), derivation, dedup, error/bare-= exclusion, AC-clears, chained-final-step, jsdom render |
| **Total** | **75** | — |

**Build artifact (the actual ship payload):** `dist/index.html` 5.06 kB (gzip 1.71 kB) ·
`index-*.css` 11.94 kB (gzip 3.67 kB) · `index-*.js` 39.78 kB (gzip 15.64 kB) ·
`Inter-latin-var-*.woff2` 48.43 kB. Single self-contained static bundle, zero runtime backend, zero
network calls — consistent with the F8 no-persistence / storage-free promise.

---

## 2 — P1 defect resolution confirmed in shipped tree

REVIEW M3 found and fixed a **P1 desktop-scroll defect** (tape panel grew page height instead of
scrolling internally — HE-016 / HE-028 FAIL). This QA independently confirms it is resolved in the
**current HEAD**, not just claimed:

- `git merge-base --is-ancestor a303f3b HEAD` → **a303f3b IS an ancestor of HEAD** — the fix commit
  is in the shipped history.
- `src/ui/history/history.css:85` carries `max-height: calc(100vh - 100px)` on the desktop
  `.history-slot` rule (outside the mobile breakpoint) — the scroll panel is now **height-bounded**.
  Page body no longer grows; the panel absorbs overflow with its own scroll region; the conditional
  `tabindex="0"` keyboard-reachability now fires when the tape overflows.
- The accompanying in-REVIEW fixes also rode `a303f3b` (listener-loop `try/catch` seam guard,
  T-236 chained-calc coverage assertion, dup-import consolidation) and are likewise in HEAD.

**Result: P1 RESOLVED in shipped tree.** 75/75 tests + clean build at HEAD corroborate.

---

## 3 — Acceptance-area pass/fail map (evidence → criteria)

Each row maps the live suite + the relevant REVIEW PASS onto a major acceptance area. Evidence column
cites the concrete source (test count, REVIEW layer, or this report's §1/§2).

| # | Acceptance area | Criteria source | Evidence | Verdict |
|---|---|---|---|---|
| A1 | **Engine arithmetic** — four ops, decimal.js exactness (`0.1+0.2=0.3`), LTR no-precedence chaining, negative results | M1 `03-rules.md` R-001..R-027 | 61 engine tests green; REVIEW M1 PASS (L7/L8, fixed D-009 digit-after-equals bug `660d26b`) | **PASS** |
| A2 | **Div-by-zero / overflow / error latch + escape** — defined error state, no `Infinity`/`NaN` leak, CE/AC always escape | M1 R-010..R-019 | engine tests (T-018/023/038/039 no-op-in-error, latch/escape); REVIEW M1 PASS | **PASS** |
| A3 | **Display rendering** — `getDisplayValue` → tag→sentence ("Cannot divide by zero" / "Number too large"), right-align, tabular-nums, pending line derivation | M2 `03-rules.md` UR-001..UR-008 | REVIEW M2 L1/L5 PASS (error sentence, pending line, pixel-identical port); error switch exhaustive (L8) | **PASS** |
| A4 | **Click ≡ keyboard equivalence** — one handler, two input paths; keyboard whitelist; true-Unicode glyphs `− × ÷`; `/` no Firefox quick-find | M2 UR-009..UR-015 | REVIEW M2 L1 PASS (`12+3=15` via click AND keyboard converge; `/` no quick-find; Esc=AC) | **PASS** |
| A5 | **Keyboard support + a11y craft floor** — real `<button>`s, ≥3px focus ring, reading focus order, ≥44px hit, `role=status`/`aria-live`, reduced-motion, no-color-alone | M2 UR-019..UR-026 | REVIEW M2 L4 axe **0 violations** (after 3 P1 a11y fixes); manual a11y checks PASS | **PASS** |
| A6 | **Contrast over glass** (display ≥4.5:1, labels ≥3:1) + token-only theming (no hardcoded theme literals) | M2 UR-027..UR-029 | REVIEW M2 L4/L5 PASS; token-purity CLEAN (F5 rgba→`--accent-rgb` channel tokens fixed) | **PASS** |
| A7 | **Responsive layout** — 4-col grid, phone+desktop reflow, no clip/h-scroll, M3 history slot reserved | M2 UR-030..UR-032 | REVIEW M2 L1/L5 PASS at ~375px & ~1280px | **PASS** |
| A8 | **History recording predicate** — record on genuine `=` only; repeated-`=`/error-`=`/bare-`=` excluded; chained records final binary step; newest-at-edge; faithful glyphs + decimals | M3 `07-acceptance.md` US-M3-1/2/3; HR-001..010 | 14 M3 tests green (INT-M3-1 predicate, dedup, error/bare exclusion, T-236 chained-final-step assertion); REVIEW M3 L1 45/45 ACs PASS | **PASS** |
| A9 | **History scroll / no-eviction / read-only** — all entries reachable, newest in view, panel absorbs overflow (page stable), entries non-interactive, no clear-history button | M3 US-M3-4; HR-010..013/018 | REVIEW M3 L1 PASS **after P1 scroll fix** (§2); 30-entry case: panel `clientHeight=509` bounded, body stable | **PASS** |
| A10 | **AC clears tape / CE does not** — AC (button or Esc) empties tape + resets calc; CE leaves tape; AC-during-error clears both | M3 US-M3-5; HR-016/017 | M3 tests (AC-clears, CE-preserves); REVIEW M3 L1 PASS | **PASS** |
| A11 | **No persistence / session-only** — empty on load, empty on reload/new-tab, zero storage + zero network tape calls | M3 US-M3-6; HR-014/015 | REVIEW M3 L3 PASS (no tape persistence requests, storage-free); build payload has no backend | **PASS** |
| A12 | **History a11y** — semantic list/listitem, labeled non-hidden region, single-announce (no double live-region), long-value wrap/no-truncation, keyboard-reachable scroll, no focus trap | M3 US-M3-8; HR-019..023 | REVIEW M3 L4 axe **0 violations**; HE-028 keyboard-scroll fires post-P1-fix; conditional `tabindex` (no dead tab-stop when fits) | **PASS** |
| A13 | **History reduced-motion** — slide-in default; instant, no-transform under `prefers-reduced-motion` | M3 US-M3-7; HR-021 | REVIEW M3 L1/L4 PASS | **PASS** |

**13 / 13 acceptance areas PASS.**

---

## 4 — Residual issues (categorized by ship-blocking severity)

| Sev | ID | Issue | Status | Blocks ship? |
|---|---|---|---|---|
| **P0** | — | *(none)* | — | — |
| **P1** | — | *(none open — the one P1, M3 scroll, resolved in `a303f3b`, confirmed §2)* | RESOLVED | — |
| **P2/P3** | F-3 (REVIEW M3) | AC-via-dispatch non-record only structurally simulated in T-242 (test-style note). Guard holds **by construction** — INT-M3-1 predicate blocks AC's `justEvaluated:false` result; T-235 (bare-`=`) already asserts the same predicate clause. | ⏭ DEFERRED | **No** |
| **P2/P3** | F-5 (REVIEW M3) | `max-height:150px` duplicated on `.history-slot` + `.history-tape` at the phone breakpoint ("belt-and-suspenders" reconciled-CSS dup). Rule-of-three not breached; defensible flex-cap guard. | ⏭ DEFERRED | **No** |
| P3 | F9 (REVIEW M2) | M2 view layer has no unit tests — **won't-fix** by recorded decision D-007 (M2 verification deferred to browser-e2e in REVIEW). | WON'T-FIX (D-007) | **No** |
| P2 | P2-C (REVIEW M3) | `backdrop-filter: none` in Playwright headless on tape panel — **dismissed** as headless software-renderer artifact; glass blur verified present in **real Chrome** at M2 + M3 live-smoke. | DISMISSED (env artifact) | **No** |

**Tally: P0 = 0, P1-open = 0.** All deferred items are cosmetic test-style / reconciled-CSS notes,
each guarded by construction or by a recorded decision — none affect a shipped acceptance criterion.

---

## 5 — Cross-cutting ship-readiness notes

- **Runtime-smoke discipline validated.** During M3 BUILD a startup-crash bug (missing static tape
  skeleton in `index.html`) slipped past green tsc/tests/build and was caught only by **live Chrome
  smoke** (fixed `35e8530`, #E4 axis-2). The shipped tree carries that fix; the green static gates in
  §1 are necessary but were demonstrably **not sufficient** alone — the SHIP smoke plan (human-led,
  per #FF-015) must include a live-load check, not rely on static gates.
- **Tier-purity provenance (measurement honesty).** REVIEW M3 ran **forked at declared tier** (clean
  baseline — `e886832`/`f209f43`/`a303f3b`). REVIEW M2 ran **inline** under the #FF-008 credits-gate
  (degraded-but-complete; lost blind-verifier independence; `Model:` trailers read orchestrator tier).
  M2 verdict stands as PASS but its measurement signal is degraded — noted, not ship-blocking.
- **SHIP M2 sequencing.** M2 REVIEW-PASS remains un-shipped by owner choice ("lanjut M3", 2026-06-15).
  This QA gate covers all three modules as the single bundle they ship as; the M1+M2+M3 payload is one
  static artifact, so the consolidated gate is the correct unit.

---

## 6 — CP-13 self-critique pass (7-dim)

```
[Self-critique pass — 7-dim]
Strongest concern: New gaps — a green static suite is NOT a full acceptance proof; M2 view + M3
  browser behaviour are verified by REVIEW browser layers, not unit tests (D-007 waiver). Mitigated:
  this report cites REVIEW L1/L4/L5 evidence per area (A3–A7, A9, A12–A13), not just §1 counts, and
  flags that SHIP smoke must include a live-load check (§5 runtime-smoke note). Residual: contrast
  (A6/A12) rests on REVIEW screenshots + the headless backdrop-filter dismissal — re-confirm in the
  SHIP live env.
Other 6 dims: clean —
  YAGNI: report maps existing evidence to existing criteria, invents no new scope.
  Over-engineering: single file, one verdict table per area; no synthetic rows.
  Broken others: read-only QA — fixed/changed nothing (HARD RULE honored); HEAD unmodified but this file.
  Inconsistency: pass/fail map reconciles with all three REVIEW PASS verdicts + live §1 results — no divergence.
  Contradiction: P1-resolved claim independently verified via git ancestry + css grep (§2), not restated.
Cascade: none — new SHIP artifact; no upstream doc edited (no orphan risk).
Tradeoff: none (no ≥2-principle tension — report aggregates, does not arbitrate).
Verdict: PROCEED.
```

---

## 7 — Verdict

# **CLEAR**

**P0 = 0. P1-open = 0.** Static gates re-run green at HEAD `80a2d77`: `tsc --noEmit` **exit 0**,
`vitest run` **75/75 passed** (61 engine + 14 history-tape), `vite build` **clean**. All **13**
acceptance areas across M1 + M2 + M3 map to PASS evidence (live tests + three REVIEW PASSes). The one
in-REVIEW P1 (M3 desktop-scroll) is **confirmed resolved** in the shipped tree (`a303f3b` is an
ancestor of HEAD; scroll panel height-bounded). All residuals are P2/P3 cosmetic, deferred,
non-blocking — each guarded by construction or a recorded decision.

**The consolidated M1 + M2 + M3 bundle is CLEAR for SHIP.** Recommended next step: SHIP-phase
**human-led live smoke** in the deployed NGINX env (live-load + glass/contrast re-confirm in real
Chrome, per the §5 runtime-smoke discipline) before production cutover.
