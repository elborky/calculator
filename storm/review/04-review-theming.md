---
storm-phase: review
storm-module: 04-theming
storm-depends-on:
  - storm/specify/04-theming/_index.md
  - storm/build/04-theming/
storm-canonical: true
---

# M4 Theming — REVIEW Log

> 8-layer REVIEW pass on the M4 theme-toggle module (BUILD commits `e09a7c3..9e71412`
> plus in-REVIEW fix `50a1c7f`). Driven by orchestrator (L1–L7 real-browser, inline
> via Claude Preview) and an independent opus adversarial reviewer (L8, fresh context).
>
> AC oracle: `storm/specify/04-theming/07-acceptance.md` (29 criteria).
> Evidence: see links below.

---

## Evidence Links

| Evidence file | Contents |
|---|---|
| `storm/review/evidence/04-theming/L1-L7-orchestrator-verify.md` | Real-browser L1–L7 results (Claude Preview / Chrome); all AC rows observed; L7 static guards |
| `storm/review/evidence/04-theming/L8-code-review.md` | Opus adversarial code audit (commit `0a0558b`); per-checklist verdicts; F-1..F-5 findings; CP-13 self-critique |

---

## Per-Layer Summary

### L7 — Static Guards (deterministic floor)

| Guard | Result |
|---|---|
| `tsc --noEmit` | ✅ exit 0 |
| `vitest run` | ✅ 96/96 PASS (pre-fix); 106/106 PASS (post-fix `50a1c7f`) |
| `npm run build` (Vite) | ✅ clean; no-FOUC inline script survives into `dist/index.html` |
| Resource-existence (DB/migrations/routes) | N/A — static SPA |
| Nav-coverage | N/A — single surface |
| Theme module presence | ✅ `src/ui/theme.ts` + `theme.test.ts` + CSS files all present |

**L7 verdict: PASS**

---

### L1 — Functional (AC oracle, real browser)

All AC rows observed and passed in Claude Preview (Chrome, real render engine):

| AC | Criterion | Result |
|---|---|---|
| AC-A11Y-01 | Toggle is real `<button>` | ✅ |
| AC-F3-1 | Click toggles dark↔light (`dataset.theme` flips) | ✅ |
| AC-F3-4 | Persisted immediately on activation | ✅ |
| AC-F3-9 | Icon reflects active theme (moon/sun) | ✅ |
| AC-F3-10 | `aria-label` names action; updates on toggle | ✅ |
| AC-F3-11 | `aria-pressed` false→true→false | ✅ |
| AC-F1-4 | No write to storage on first load (`storedBefore` null) | ✅ |
| AC-F2-1 | Stored `"light"` overrides OS-dark on reload | ✅ |
| AC-EC-03 | Corrupt value `"system"` silently ignored → OS-resolved | ✅ |
| AC-EC-04 | `matchMedia` guarded | ✅ |
| AC-INV-01 | Only `calc-theme` key in `localStorage` (no history leaked) | ✅ |
| AC-INV-02 | Dark v3 Wildcard baseline visually unchanged | ✅ |
| Calculator functional in both themes | 7+5=12 ✅; history tape preserved across toggle ✅ | ✅ |

**L1 verdict: PASS — 13/13 observed rows pass. 0 P0, 0 P1.**

*Note: AC-F4-1 / AC-F4-2 (OS-change mid-session) were NOT scripted in the browser layer — a live OS preference change cannot be triggered programmatically in the Preview environment. This gap is the root of L8 F-2 (see below).*

---

### L2 — Console

No warnings or errors (level=warn → empty output). **PASS**

---

### L3 — Network

Static client-only SPA — no API surface. **N/A / PASS**

---

### L4 — Accessibility

Real `<button>`, Tab-focusable, ARIA attributes verified in L1. Contrast AA already
real-browser-verified in Group-G (artifact: `storm/build/04-theming/group-g-aa-verification.md`,
5 surface pairs ≥5.13:1 worst-case). **PASS**

---

### L5 — Visual Regression

Light "Iridescent Dawn" and dark v3 Wildcard both match the picked variant (screenshots
captured). 300ms cross-fade present. **PASS**

---

### L6 — Performance

Trivial static SPA — no perf concern. Smoke PASS. **PASS**

---

### L8 — Code Audit (independent opus, adversarial, fresh context)

> Scope: `src/ui/theme.ts`, `src/ui/theme.test.ts`, `src/ui/main.ts`, `index.html`,
> `src/ui/styles/tokens.css`, `src/ui/styles/toggle.css`, `src/ui/history/history.css`.
> Methods: `tsc --noEmit`, secrets grep, static cross-read, adversarial test-suite read (#FF-034).

Per-checklist verdicts:

| Checklist area | Verdict |
|---|---|
| OWASP / injection surface | PASS — no `innerHTML`, closed-set validation on all stored values, SVGs built via `createElementNS`; inline head script try/catch-wrapped |
| Secrets scan | PASS — no credentials in any M4 file |
| Dead code | ⚠️ F-1 (P2) — dead reduced-motion selectors in `tokens.css` |
| Complexity | PASS — all functions <25 LOC, nesting ≤2 |
| Fragmentation | PASS — all files well under 800-line threshold; clean boundaries |
| Cross-file consistency | PASS — resolution precedence identical between `theme.ts` and `index.html` inline script (same key, same closed-set validation, same media query, same default) |
| Error handling | PASS — all `localStorage` access try/catch-wrapped; graceful OS-fallback; `matchMedia` guarded in two places |
| Test coverage | ⚠️ F-2 (P1) — `attachOsChangeListener` zero coverage; F-4 (P3) — `toggleTheme` absent-state branch untested |
| Adversarial test read (#FF-034) | ⚠️ F-2 (P1) — AC-F4-2 (stored-wins guard) unverified at EVERY layer; F-4 (P3) same |
| Craft floor (iron-law) | ⚠️ F-3 (P3) — OS-listener lifecycle ownership undocumented; otherwise strong |

---

## Finding Log

### F-1 — Dead / phantom reduced-motion selectors — **P2 · Dead code · No behavior change**

- **Category:** Implementation bug (misleading dead code — not a logic defect)
- **Severity:** P2
- **File:** `src/ui/styles/tokens.css:179-184`
- **Summary:** Block targets `.aurora-layer` and `.bg::before` (no such elements in the app).
  Real guard is `keypad.css:155-156` — AC-F3-8 passes via that guard, not this block. The
  misleading comment advertises this dead block as canonical, risking silent reduced-motion
  regression if a future maintainer edits the light aurora based on it.
- **Resolution:** **PARKED** → `storm/meta/parking-lot.md` **#002** (`module: 04-theming`).
  Non-blocking. No behavior change required.

---

### F-2 — `attachOsChangeListener` zero test coverage; AC-F4-2 unverified at every layer — **P1 · Implementation bug · Coverage gap**

- **Category:** Implementation bug (missing regression net on user-visible behavior)
- **Severity:** P1
- **File:** `src/ui/theme.ts:192-214` (guard `:206`); `src/ui/theme.test.ts` (coverage absent at audit time)
- **Summary:** The stored-wins guard (AC-F4-2 — explicit user choice stays sticky against a
  live OS flip) had zero unit-test coverage, and L1-L7 browser verify did not script a live
  OS change. Per #FF-034, the green suite was not exoneration.
- **Resolution:** **FIXED IN REVIEW** — commit `50a1c7f`.
  Added `T-430` describe block in `src/ui/theme.test.ts` — 10 new tests covering:
  AC-F4-1 (OS-follow + no-storage-write invariant), AC-F4-2 (stored-wins sticky for both
  light and dark stored values), matchMedia-absent guards (2), `addEventListener('change')`
  registration assertion, plus F-4 cases (absent/garbage `dataset.theme` default branch).
  Suite: 96 → 106 tests. All 106 green. No production logic changed.

---

### F-3 — OS-listener cleanup undocumented; lifecycle ownership implicit — **P3 · Craft floor · No behavior change**

- **Category:** Implementation bug (craft-floor B2 — resource release)
- **Severity:** P3
- **File:** `src/ui/theme.ts:204-213`
- **Summary:** `mq.addEventListener('change', …)` adds a listener with no teardown handle
  returned. Benign for a single-root SPA (page lifecycle reclaims it), but the "intentionally
  page-lifetime-scoped, called once" assumption is doc-comment-only, not enforced.
- **Resolution:** **NO-ACTION** — right-sized for this profile (never-unmounting SPA, zero
  practical leak risk). Acknowledged by L8 as acceptable; the doc-comment already states
  "call it once." No code change warranted.

---

### F-4 — `toggleTheme` absent/garbage-state default branch untested — **P3 · Test coverage gap**

- **Category:** Implementation bug (missing coverage for documented fallback branch)
- **Severity:** P3
- **File:** `src/ui/theme.ts:165-167`; `src/ui/theme.test.ts`
- **Summary:** The "absent/unrecognised `dataset.theme` → treat as dark → flip to light"
  documented branch (comment `:166`) was unasserted.
- **Resolution:** **FIXED IN REVIEW** (together with F-2) — commit `50a1c7f`.
  3 new tests: absent `dataset.theme` → resolves dark → flips to light; unrecognised value
  `"system"` → same default-dark → flips to light; explicit `"light"` → flips to dark
  (regression guard). All green.

---

### F-5 — `aria-pressed` on theme toggle is a debated ARIA pattern — **P3 · Spec-conformant · No action**

- **Category:** New scope (optional AC revision)
- **Severity:** P3
- **File:** `index.html:73`, `src/ui/main.ts:147,151`
- **Summary:** Using `aria-pressed` (toggle-button semantics) for a theme switch is a known
  a11y grey area — some SR guidance prefers a plain button whose `aria-label` carries the
  next action. However, AC-F3-11 explicitly mandates `aria-pressed`, so this is spec-conformant.
- **Resolution:** **NO-ACTION** — flagged for owner awareness only. No change unless AC-F3-11
  is revisited after SR testing.

---

## Finding Summary Table

| ID | Severity | Category | Description | Resolution |
|---|---|---|---|---|
| F-1 | P2 | Implementation bug (dead code) | Dead reduced-motion CSS selectors in `tokens.css` | PARKED → #002 |
| F-2 | P1 | Implementation bug (coverage gap) | `attachOsChangeListener` zero coverage; AC-F4-2 unverified | FIXED in REVIEW (`50a1c7f`) |
| F-3 | P3 | Craft floor | OS-listener lifecycle undocumented | NO-ACTION (benign for SPA) |
| F-4 | P3 | Implementation bug (coverage gap) | `toggleTheme` absent-state branch untested | FIXED in REVIEW (`50a1c7f`) |
| F-5 | P3 | New scope (AC question) | `aria-pressed` debated ARIA pattern (but spec-conformant) | NO-ACTION |

| Severity | Count | Resolution |
|---|---|---|
| **P0** | 0 | — |
| **P1** | 1 | Fixed in REVIEW (`50a1c7f`) |
| **P2** | 1 | Parked → #002 |
| **P3** | 3 | No-action (F-3, F-5) + Fixed in REVIEW (F-4, covered by `50a1c7f`) |

---

## VERDICT

**M4 Theming — REVIEW PASS**

- **0 P0** — no security defect, no correctness defect, no blocking issue.
- **P1 (F-2) resolved in-REVIEW** — `attachOsChangeListener` + AC-F4-2 now have 10 new
  tests (96→106); suite fully green. The only material unverified behavior now has a
  regression net.
- **P2 (F-1) parked** — dead CSS selectors removed from the critical path; tracked as
  parking-lot #002 for a clean-up pass before or during a future module that touches
  `tokens.css`.
- **P3s no-action or resolved** — F-3 and F-5 are spec-conformant/right-sized; F-4 covered
  by the F-2 fix commit.

**Deployment status:** Prod currently runs **v1.0.0** (SHA `e0ee19b`). M4 is built and
reviewed locally on `main` — it is **NOT yet deployed**. The SHIP decision (redeploy to
`https://calc.elborky.my.id` via Dokploy) belongs to the owner. REVIEW exit marker and
`module-status.md` update are owned by the orchestrator (per #FF-009b — not this sub-agent).

> Ready for owner SHIP decision.
