# M4 Theming — REVIEW Layer 8 Code Audit (independent opus, adversarial)

> Independent fresh-context reviewer (C3 "don't-trust-self-report"). The build sub-agent
> self-attested; this tier hunts for craft-floor violations it missed. Browser layers
> (L1–L7) already PASS — this audit targets CODE craft a browser cannot grade.
>
> Scope: M4 BUILD commits `e09a7c3..9e71412`. Files: `src/ui/theme.ts`,
> `src/ui/theme.test.ts`, `src/ui/main.ts`, `index.html`,
> `src/ui/styles/tokens.css`, `src/ui/styles/toggle.css`, `src/ui/history/history.css`.
>
> Methods run (cited, not imagined): `tsc --noEmit` → exit 0; grep secrets scan → clean;
> static read of both resolution implementations cross-checked; adversarial test-suite read (#FF-034).

---

## Per-checklist verdicts

### 1. OWASP / injection surface — PASS
- No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, or template-string DOM
  injection anywhere in M4. Icon SVGs in `main.ts` are built entirely via
  `createElementNS` + `setAttribute` (`buildMoonSvg`/`buildSunSvg`/`svgLine`,
  `main.ts:72-129`) — zero string-to-DOM surface. This is the correct, defensive choice and
  exceeds the floor for static content.
- The stored theme value is **never** interpolated into DOM or CSS as a raw string. The only
  consumer paths write it through `dataset.theme` (`theme.ts:147`), and the value is
  exact-match-validated to the closed set `'light'|'dark'` before it can flow anywhere
  (`readStoredTheme`, `theme.ts:59`). A corrupt/hostile `localStorage` value cannot reach the
  DOM as a theme — it is rejected to `null` and falls through to OS/default. No CSS-selector
  injection (the value only ever matches `[data-theme="light"]` / `[data-theme="dark"]`).
- Inline head script (`index.html:23-37`) uses the same closed-set check
  (`t !== 'light' && t !== 'dark'`) before writing `dataset.theme`, and is wrapped in
  try/catch with a hardcoded `'dark'` fallback. No user-controlled value reaches `eval`,
  `Function`, or attribute beyond the validated set. Safe.

### 2. Secrets scan — PASS
- grep over all M4 files for `password|secret|token|api_key|bearer|private_key|credential`
  → no hits (only false positives on `token-swap` comment and `tokens.css` import). Clean.

### 3. Dead code — FINDINGS (1× P2)
- See **F-1** (dead/phantom reduced-motion selectors in `tokens.css`).
- No unused imports (`Theme` is consumed as a type annotation in `main.ts:140`; `tsc` exit 0
  confirms no unused-symbol error under the project config). No commented-out logic blocks,
  no half-finished functions.

### 4. Complexity — PASS
- Largest M4 function is `buildSunSvg` (`main.ts:104-129`, ~26 LOC, flat, zero branching —
  it is a linear DOM-construction list, not complex). All `theme.ts` functions are < 25 LOC
  with nesting ≤ 2. No function > 50 LOC; no nesting > 4. Right-sized.

### 5. Fragmentation — PASS
- All M4 files well under the 800-line split threshold (`theme.ts` 214, `main.ts` 167,
  `toggle.css` 68, `tokens.css` 185, `history.css` 316). No tiny-file-that-should-merge:
  `theme.ts` is a cohesive single-responsibility module; `toggle.css` correctly co-locates the
  control's presentation. Boundaries are clean.

### 6. Cross-file consistency — PASS (with note)
- **Resolution precedence MATCHES exactly** between the two implementations — this is the
  no-FOUC correctness invariant and it holds:
  - `theme.ts:resolveTheme` (104-123): stored (`'light'|'dark'` exact) → `matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'` → default `'dark'`.
  - `index.html` inline (24-36): `localStorage 'calc-theme'` if `'light'|'dark'` → else `matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'` → catch → `'dark'`.
  - Same storage key (`'calc-theme'`), same closed-set validation, same media query, same
    default. The runtime re-apply in `main.ts:48-49` is idempotent against the inline script's
    pre-paint write (same resolved value → no second flash). Correct.
- `dataset.theme` writes (`'light'`/`'dark'`, `theme.ts:147`) match the CSS selectors
  `[data-theme="light"]` (tokens.css:101, history.css:26) and the `:root`/`"dark"` default.
  Explicit-`"dark"` convention is consistent across inline script, `applyTheme`, and
  `toggleTheme`'s read-back — no absent-vs-dark ambiguity. Correct.
- ARIA/icon mapping (`main.ts:140-154`) matches AC-F3-9/10/11 exactly: dark→moon /
  "Switch to light theme" / `aria-pressed="false"`; light→sun / "Switch to dark theme" /
  `aria-pressed="true"`. Initial HTML state (`index.html:73-74`, moon + label + pressed=false)
  matches the dark default. Consistent.

### 7. Error handling — PASS
- Every `localStorage` access is try/catch-wrapped: `readStoredTheme` (57-66),
  `writeStoredTheme` (81-85), and the inline script (25-35). Read-throw → `null` (graceful
  OS-fallback); write-throw → swallowed (session-only mode). These are **intentional graceful
  degradation**, not error-hiding — the live `dataset.theme` write still succeeds, so the UI
  stays correct (EC-M4-01/02). Defensible silent catches.
- `matchMedia` guarded in both `resolveTheme` (112) and `attachOsChangeListener` (193) via
  `typeof window.matchMedia === 'function'`, plus a defensive inner try/catch around the
  `matchMedia()` call itself (113-118, 198-202). AC-EC-04 covered. Fail-closed to default dark.
- Corrupt-value rejection: exact-match only (`raw === 'light' || raw === 'dark'`), everything
  else → `null` (AC-EC-03). Correct.

### 8. Test coverage — FINDINGS (1× P1, 1× P3)
- Covered well: resolution precedence (T-425), corrupt/wrong-case/empty/JSON/whitespace
  rejection (T-426, 7 cases), read-throw fallback (T-427), write-throw swallow (T-428),
  matchMedia-absent terminal default (T-429), `applyTheme` DOM write. 96/96 green.
- See **F-2** (P1): `attachOsChangeListener` — the module's most logic-dense function — has
  **zero** test coverage.
- See **F-4** (P3): `toggleTheme`'s absent/unrecognised → `'dark'` default branch untested.

### 8b. Adversarial test-suite read (#FF-034 — distrust the green) — FINDINGS
- No bypass/skip/work-around comments found near guards. But two guards have an untested
  FAILING side (the #FF-034 signal — green ≠ exoneration):
  - **F-2 (P1):** `attachOsChangeListener` stored-wins guard (`theme.ts:206`,
    `if (readStoredTheme() !== null) return;`) — neither side asserted. Its matchMedia-absent
    early-return (193) and the matchMedia-throws return (200) are also unasserted. This guard
    *is* AC-F4-2 (explicit choice stays sticky against a live OS flip) — a real, user-visible
    behavior with no regression net. L1 browser verify did not exercise a live OS change
    either (L1-L7 doc lists no AC-F4-1/AC-F4-2 row), so this behavior is currently
    **unverified at every layer**.
  - **F-4 (P3):** `toggleTheme` (165-167) ternary `current === 'light' ? 'dark' : 'light'` —
    only the `light` and `dark` starting states are tested (T-428's `toggleTheme` case starts
    from `'light'`). The "absent/garbage dataset → treat as dark → flip to light" branch the
    comment promises (166) is unasserted.

### 9. Craft floor (iron-law) — FINDINGS (1× P3)
- Security/clarity/right-size: strong. No-innerHTML SVG construction and closed-set validation
  exceed the floor. No over-engineering — no speculative flags/abstraction.
- **Resource cleanup (B2 "release every resource on all exit paths"):** see **F-3 (P3)** —
  `attachOsChangeListener` adds a `change` listener that is never removed and returns no
  teardown handle. Acceptable for a single never-unmounting SPA root (page lifecycle reclaims
  it), but it is an *undocumented* lifecycle assumption; the floor wants the listener's
  ownership made explicit. Low severity by design, not by omission.

---

## Findings

### F-1 — Dead / phantom reduced-motion selectors (mislead future maintainers) — **P2**
**File:** `src/ui/styles/tokens.css:180-183`
**Description:** The light-aurora reduced-motion block targets
`[data-theme="light"] .aurora-layer`, `[data-theme="light"] body::before`, and
`[data-theme="light"] .bg::before`. Of these, `.aurora-layer` and `.bg` **match no element
in the app** (no such class/element exists in `index.html` or any module). The aurora
animation (`auroraDrift` on `body::before`, `blobOrbit` on `body::after`,
`layout.css:48,62`) is theme-agnostic and is *already* fully disabled under reduced-motion by
the global guard at `keypad.css:155-156` (`body::before/after { animation: none }`). So
AC-F3-8 passes — but it passes via `keypad.css`, **not** via this block. This block is dead
CSS whose comment ("Disable the Iridescent Dawn aurora pulse animation") falsely advertises
itself as the guarantor; the one selector that does match (`body::before`) is redundant. A
future maintainer editing the light aurora could trust this dead block and silently break
reduced-motion.
**Proposed fix:** Delete the dead `tokens.css:179-184` block; instead add a one-line comment
at `keypad.css:155` noting it is the canonical aurora reduced-motion guard for both themes.
(No behavior change — purely removes the misleading dead code.)

### F-2 — `attachOsChangeListener` has zero test coverage; AC-F4-2 unverified at every layer — **P1**
**File:** `src/ui/theme.ts:192-214` (guard `:206`); `src/ui/theme.test.ts` (absent)
**Description:** The OS-change listener is the most logic-dense unit in the module and the
only one with branching that matters: (a) the stored-wins guard that makes an explicit user
choice sticky against a live OS flip (R-M4-07 / **AC-F4-2**), (b) the "do NOT write storage on
OS-driven change" invariant, (c) matchMedia-absent and matchMedia-throws early returns. None
are asserted by any unit test, and the L1-L7 browser verify did not script a live
`prefers-color-scheme` change (no AC-F4-1/AC-F4-2 row in the evidence doc). Per craft-floor B4
this is a missing regression net on real user-visible behavior; per #FF-034 the green suite is
not exoneration here.
**Proposed fix:** Add jsdom tests using a matchMedia stub that captures the `change` handler
and dispatches a synthetic `{matches}` event — assert: (1) no stored value → `applyTheme`
called + storage NOT written; (2) stored value present → handler is a no-op (sticky); (3)
matchMedia absent → `attachOsChangeListener` returns without throwing.

**REVIEW resolution:** Fixed. T-430 describe block added in `src/ui/theme.test.ts` — 7 new
tests covering AC-F4-1 (OS-follow + no-storage-write invariant), AC-F4-2 (stored-wins sticky
for both light and dark stored values), matchMedia absent (two guards), and addEventListener
'change' registration assertion. All 7 pass. Commit: see storm:REVIEW:theming::fix commit.

### F-3 — OS-change listener never removed; lifecycle ownership undocumented — **P3**
**File:** `src/ui/theme.ts:204-213`
**Description:** `mq.addEventListener('change', …)` is added with no corresponding
`removeEventListener` and the function returns `void` (no unsubscribe handle). Craft-floor B2
mandates releasing every acquired resource on all exit paths. Here the leak is benign — the
listener lives for the page's whole lifetime on a single-root SPA that never unmounts — but the
"this is intentionally page-lifetime-scoped, called exactly once" assumption is only in a
doc-comment ("call it once"), not enforced or asserted.
**Proposed fix:** Either (a) add a one-line code comment at the `addEventListener` site stating
the listener is intentionally page-lifetime-scoped (no teardown needed), or (b) return an
unsubscribe function for symmetry. (a) is sufficient and right-sized for this profile.

### F-4 — `toggleTheme` absent/garbage-state default branch untested — **P3**
**File:** `src/ui/theme.ts:165-167`; `src/ui/theme.test.ts:230-243`
**Description:** `toggleTheme` reads `dataset.theme` and treats absent/unrecognised as `dark`
(flips to light). Tests only cover starting from a known `'light'` (and dark via `applyTheme`)
state; the documented "absent → dark" fallback branch (comment `:166`) is unasserted.
**Proposed fix:** Add one test: `delete dataset.theme; expect(toggleTheme()).toBe('light')`.

**REVIEW resolution:** Fixed. T-430b describe block added in `src/ui/theme.test.ts` — 3 new
tests: absent `dataset.theme` → resolves dark → flips to light; unrecognised value `'system'`
→ same default-dark branch → flips to light; explicit `'light'` → flips to dark (regression
guard). All 3 pass. Commit: see storm:REVIEW:theming::fix commit.

### F-5 — `aria-pressed` on a whole-page theme toggle is a debated ARIA pattern — **P3**
**File:** `index.html:73`, `src/ui/main.ts:147,151`
**Description:** Using `aria-pressed` (toggle-button semantics) for a theme switch is a known
a11y grey area — some screen-reader guidance prefers a plain button whose `aria-label` carries
the next action (which this code *also* does). It is **conformant to the spec** (AC-F3-11
mandates `aria-pressed` explicitly), so this is not a violation — flagged only so the owner
knows the pattern is debated, not a clear best-practice. No change required unless the owner
wants to revisit the AC.
**Proposed fix:** None required (spec-conformant). Optional: revisit AC-F3-11 if SR testing
later shows the doubled signaling (pressed-state + action-label) is confusing.

---

## CP-13 self-critique (7-dim, on these findings)

```
[Self-critique pass — 7-dim]
Strongest concern: New gaps — F-2 recommends new tests; risk is over-prescribing test shape
  for a zero-stakes utility. Mitigated: F-2 is P1 because the behavior (AC-F4-2 sticky choice)
  is genuinely unverified at ALL layers (confirmed: theme.test.ts has no 'change'/listener
  assertion via grep; L1-L7 doc lists no AC-F4 row) — a real regression net gap, not coverage-%
  theater. The other 3 dims of test prescription kept to P3.
Other 6 dims: clean —
  YAGNI: findings remove code (F-1 deletes dead CSS) or add minimal tests, none gold-plate.
  Over-engineering: F-3 explicitly prefers the 1-line-comment fix over returning an unsub
    handle (right-sized for never-unmounting SPA) — actively resists over-build.
  Broken others: audit-only, writes no fix, cannot regress.
  Inconsistency: findings cite the same precedence contract the spec/code already agree on.
  Contradiction: F-5 explicitly defers to AC-F3-11 rather than contradicting the approved spec.
  Friction: zero owner-facing technical asks; fixes are AI-autonomous (CP-7) for the fix sub-agent.
Cascade: none — this is an evidence artifact; no canonical doc changes. Fixes (if owner wants)
  are dispatched to sonnet sub-agents, not written here.
Tradeoff: none (no ≥2-principle tension; F-3 names cleanup-vs-right-size but resolves cleanly
  toward right-size per the floor's own A2/B2 priority order).
Verdict: PROCEED
```

---

## Verdict summary

| Severity | Count | IDs |
|---|---|---|
| **P0** | 0 | — |
| **P1** | 1 | F-2 |
| **P2** | 1 | F-1 |
| **P3** | 3 | F-3, F-4, F-5 |

**No P0.** The module is secure (no injection surface, closed-set validation, secrets-clean),
correct on its resolution invariant (both implementations agree exactly — no-FOUC holds), and
right-sized. The one P1 is a **verification gap, not a code defect**: `attachOsChangeListener` /
AC-F4-2 (explicit-choice-sticky against live OS change) is unverified at every layer — the code
reads correct on inspection but has no regression net and was never exercised in-browser. The P2
is misleading dead CSS that could trap a future maintainer. P3s are right-sizing/coverage polish.

**Recommendation to orchestrator:** fixable cleanly before SHIP. Dispatch a sonnet fix sub-agent
for F-2 (add the OS-listener tests — closes the only material gap) and F-1 (delete dead CSS).
F-3/F-4 are optional polish; F-5 is spec-conformant (no action). None block REVIEW exit on their
own, but closing F-2 is strongly advised since AC-F4-2 currently has no verification anywhere.
