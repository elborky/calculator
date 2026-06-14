---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: false
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/specify/02-calculator-ui/_index.md
  - storm/specify/02-calculator-ui/01-data-model.md
  - storm/specify/02-calculator-ui/02-flows.md
  - storm/specify/02-calculator-ui/03-rules.md
  - storm/specify/02-calculator-ui/04-ui.md
  - storm/specify/02-calculator-ui/04-ui/_picked.md
  - storm/specify/02-calculator-ui/05-edge-cases.md
  - storm/specify/02-calculator-ui/06-tech-choices.md
  - storm/specify/02-calculator-ui/_decisions.md
---

# M2 Calculator UI — Cross-File Consistency Audit

> Auditor: forked opus sub-agent. Scope: internal consistency ACROSS the 10 M2 concern files +
> fidelity to the M1 integration contract (`01-calculation-engine/_index.md` + `01-data-model.md`)
> and STRUCTURE scope (`03-modules.md`, `04-scope.md`). Verify-before-flag (#FF-001): every
> divergence below was confirmed by reading the cited `file:line` (and the v3 mockup source), not
> inferred.

## VERDICT: **FIX-REQUIRED — 1 finding** → **RESOLVED (orchestrator, 2026-06-15)**

One genuine cross-file divergence (focus-ring px value). All other audit dimensions PASS, including
the known font tension (T-181 reconciles it correctly → RESOLVED, not a finding).

> **Resolution stamp (orchestrator, post-audit fix).** F-01 fixed: all concrete focus-ring
> instructions aligned to the locked v3 baseline **`3px solid var(--accent)` / `3px` offset** (which
> exceeds the `08-design-system.md:145` 2px floor). Updated in SIX locations — the four the auditor
> cited (`03-rules.md` UR-020, `04-ui.md:192`+`:230`, `_index.md` T-169) **plus two more the
> orchestrator's own grep caught** (`02-flows.md:269`, `05-edge-cases.md` UE-027). Grep-verified: zero
> concrete focus-ring instructions still say 2px; remaining "2px" mentions are floor-reference language
> (`_index.md:67` "≥2px" floor) and this audit record. Net verdict after fix: **PASS** — M2 is
> internally consistent and M1-contract-faithful. APPROVED marker cleared to fire.

---

## Findings

### F-01 (FIX-REQUIRED) — Focus-ring px value diverges: `_picked.md` + v3 mockup say **3px/3px**, every binding rule says **2px/2px**

**Files:**
- `03-rules.md:198` — UR-020: focus ring = **`2px solid var(--accent)` with `2px` offset** (the canonical, testable rule).
- `04-ui.md:192` and `04-ui.md:230` — focus ring **`2px solid var(--accent)` + `2px` offset** (matches UR-020).
- `_index.md:265` — T-169: "Add the focus ring: **`2px solid var(--accent)` + `2px` offset**" (the BUILD instruction).
- `_index.md:67` — "visible focus rings (**≥2px** accent, **≥2px** offset)" (a floor, not an exact value).
- `04-ui/_picked.md:37` — v3 keeps "focus rings (**3px accent, 3px offset**)".
- `04-ui/mockup-v3.html:322-325` — the picked BUILD-target markup actually ships `outline: 3px solid var(--accent); outline-offset: 3px;`.

**The divergence:** The locked visual baseline (v3 mockup, the literal port source per `_index.md:106`
"Build target: `04-ui/mockup-v3.html` … is the literal markup/CSS source to port") ships a **3px/3px**
focus ring, and `_picked.md` documents it as 3px/3px. But UR-020, `04-ui.md`, and the actual BUILD task
T-169 all instruct an **exact 2px/2px** ring. BUILD therefore receives two conflicting numbers for the
same property: "port the v3 mockup verbatim" (→ 3px) vs T-169 "add `2px` + `2px`" (→ 2px).

**Severity nuance (not a craft-floor regression):** `3px ≥ 2px`, so the accessibility floor is *not*
weakened either way — `_index.md:67`'s "≥2px" floor is satisfied by both. This is an **ambiguous
instruction**, not a safety hole. But the audit mandate is "ANY genuine divergence = FIX-REQUIRED," and
this is a real value conflict that leaves BUILD without a single instruction (exactly the failure-class
the font/T-181 reconciliation was created to prevent).

**The fix (pick one, make all four sources agree):**
- **Recommended:** Honor the picked baseline — set UR-020, `04-ui.md:192`, `04-ui.md:230`, and T-169 to
  **`3px solid var(--accent)` + `3px` offset** to match `_picked.md:37` + `mockup-v3.html:322-325`. The
  v3 mockup is the owner-picked, locked port target; the spec rules should track it, not the other way.
  (`_index.md:67`'s "≥2px" floor already permits 3px, so it needs no change.)
- **Alternative:** If 2px is intended as the true floor, change `_picked.md:37` and the v3 mockup to
  `2px/2px` so the port source matches the rule. (Less preferred — it edits the owner-locked visual.)

Either way: one number, in all four binding locations + the mockup, tied to a one-line build note like
T-181 does for the font.

---

## PASS dimensions (verified)

### ✅ M1 integration fidelity (check 1)
Every M1 export named in M2 files matches `01-calculation-engine/_index.md` exactly: `initialState`,
`inputDigit`, `inputDecimal`, `inputOperator`, `inputEquals`, `inputClearEntry`, `inputAllClear`,
`getDisplayValue` — signatures `(state, …) → EngineState` and `getDisplayValue → string | ErrorTag`
consistent across `_briefing.md:106-118`, `01-data-model.md`, `02-flows.md`, `03-rules.md` UR-009,
`04-ui.md §3` binding column, `05-edge-cases.md`, and `_index.md` Groups 4/6/7/8. `resolveOperation`
is correctly marked **M2-does-NOT-call** (`_briefing.md:117`). EngineState 5 fields (`entryBuffer`,
`accumulator`, `pendingOperator`, `justEvaluated`, `errorState`) + `Operator` union + `ErrorTag` union
used identically everywhere. **No M2 file invents an M1 API.** `accumulator` correctly typed
`Decimal | null` and rendered via `.toString()` (read, not arithmetic) consistently
(`01-data-model.md:147-149`, `03-rules.md` UR-007, `05-edge-cases.md` UE-039).

### ✅ Derived-value consistency (check 2)
- **Error tag→sentence map** identical in all files: `'divide-by-zero'`→"Cannot divide by zero",
  `'overflow'`→"Number too large" (`_briefing.md:128`, `01-data-model.md:106-112` D-M2-DM-02,
  `02-flows.md:225-226`, `03-rules.md` UR-002, `04-ui.md §2.2`/§4.2, `05-edge-cases.md` UE-008/UE-009,
  `_index.md` T-143). No wording drift.
- **Pending-line derivation** (show only when `accumulator!==null && pendingOperator!==null &&
  errorState===null && justEvaluated===false`) stated identically in `01-data-model.md:125-132`
  (D-M2-DM-03), `02-flows.md`, `03-rules.md` UR-008, `04-ui.md §2.1`, `05-edge-cases.md` UE-036/37/38,
  `_index.md` T-144. No condition drift.
- **Operator↔glyph↔key map** identical: `+/add/U+002B`, `-/subtract/−/U+2212`, `*/multiply/×/U+00D7`,
  `//divide/÷/U+00F7` across `01-data-model.md §3.3`, `03-rules.md` UR-013, `04-ui.md §3`,
  `02-flows.md §8` table, `05-edge-cases.md` UE-034, `_index.md` T-140/T-141. Glyph-codepoint grep
  across all `.md` returns only the four correct codepoints, used consistently.

### ✅ Keypad layout consistency (check 3)
4-col grid `AC CE ÷ × / 7 8 9 − / 4 5 6 + / 1 2 3 = / 0-span2 . =` identical in `_index.md:63-64`,
`04-ui.md §3` (lines 106-118), `04-ui/_picked.md:42-43`, and the v3 mockup. 15 keys consistent
everywhere. Span rules consistent: `=` spans 2 rows, `0` spans 2 cols (`04-ui.md:135-141`, `_index.md`
T-117/T-118/T-131, `_picked.md:43`). No `±`/`%` anywhere (correctly reclaimed for AC/CE per
`04-ui.md:31-36`). Glyph codepoints match check 2.

### ✅ Scope adherence (check 4)
No M2 file specifies arithmetic logic (all delegated to M1 — `03-rules.md §10`, `04-ui.md §8`,
`06-tech-choices.md §6` consistently disclaim it), history rendering (M3 — F3 reserved-slot-only,
`_index.md` T-175, `04-ui.md §5`, UR-032, UE-043), or theme toggle (M4 — F4 reserved-corner-only,
`_index.md` T-176, `04-ui.md §5`). No `±`/`%` keys. Anti-inflation notes consistent with `04-scope.md`
Out-of-scope list. M2 reserves M3/M4 space, builds neither — uniformly stated.

### ✅ Tech-choice consistency (check 5) — including the KNOWN font tension → **RESOLVED**
Vanilla TS + Vite 8.0.16 + plain-CSS custom-property tokens + TS 6.0.3 stated identically in
`_index.md:43-55`, `06-tech-choices.md` summary, `_decisions.md` D-001..D-004.
**Font tension RESOLVED (not a finding):** `06-tech-choices.md §5` / D-004 mandate self-hosted Inter
(300/400/500, no Google Fonts CDN); the picked v3 mockup (`mockup-v3.html:39-41,238,252`) uses
**Space Grotesk + Inter via Google Fonts CDN**. `_index.md` **T-181** explicitly reconciles this:
"Reconcile the v3 display font (mockup used Space Grotesk via CDN): either self-host Space Grotesk per
the picked baseline, or apply Inter-300 — record the choice inline as a build note tied to
D-004/`_picked.md`. Done when: the display font is self-hosted (no CDN call remains)." `_picked.md:47-61`
also flags the v3 token/font departure as within design-system latitude + an M4 reconciliation note.
BUILD has a single, unambiguous instruction (no CDN call may remain; choice recorded inline). **RESOLVED.**

### ✅ Decisions-log integrity (check 6)
`_decisions.md` contains D-001..D-007, **unique, no duplicates** (grep confirmed seven distinct `## D-NNN`
headers, no repeated D-005). Earlier two-sub-agent D-005 collision is gone: D-005 = Backspace no-op
(single owner), referenced consistently in `03-rules.md` UR-012 + `_index.md` T-160 + `05-edge-cases.md`
UE-020/UE-026. D-006 (long-number shrink→scroll) referenced in `05-edge-cases.md` + `_index.md`
Group 10. D-007 (task granularity) self-consistent. Sub-decisions D-M2-DM-01..04 live in
`01-data-model.md` and are correctly cross-cited from `_index.md`/`03-rules.md` without being given
duplicate top-level D-NNN ids. No orphan cites.

### ✅ UR/UE/flow cross-references (check 7)
UR set = UR-001..UR-032 (32 distinct, grep-confirmed) — matches the "32 UR rules" claim in
`_index.md`/`04-ui.md`/`02-flows.md`. UE set = UE-001..UE-055 (55 distinct, grep-confirmed) — matches
"55 UE rows". 8 flows in `02-flows.md` match the "8 flows" cited in `_index.md`/`03-rules.md`. Spot-checked
`_index.md` task cites (T-143→UR-002/UE-008, T-144→UR-007/UR-008/UE-036-038, T-169→UR-020/UE-027/UE-032,
T-160→UR-011/UR-012/UE-020) — all targets exist in the named files. No dangling UR-/UE-/flow reference.

### ✅ Accessibility floor consistency (check 8)
Real `<button>`s, ≥44/≥64px targets, `aria-live`/`role="status"`, true-Unicode glyphs, glyph+fill
(not color alone), error-by-sentence (not color alone), `prefers-reduced-motion`→instant, WCAG AA
(display ≥4.5:1, labels ≥3:1, worst gradient point), raise-alpha-before-darkening-text — all stated
consistently in `03-rules.md §6/§7`, `04-ui.md §6`, `_picked.md`, `05-edge-cases.md §5/§8`, `_index.md`
floor block + Groups 6/8/9/11/12. **No file silently weakens the floor.** (The focus-ring px value F-01
is a value-ambiguity, NOT a weakening — 3px and 2px both clear the "≥2px" floor.)

### ✅ Task granularity (check 9)
Scanned all 87 tasks (T-101..T-187). Each is ≤1 file / 1 logical unit with a concrete Done-when. No
surviving "and"-joined multi-file task, no "build the whole UI" task — the v3 port is correctly split
per-row/per-button/per-effect (Groups 1, 3) per D-007. T-181 is a single reconciliation unit (font). No
granularity breach.

---

## Note for the orchestrator
FIX-REQUIRED is driven solely by F-01 (focus-ring 2px vs 3px). It is a small, mechanical reconciliation
(align four spec locations to the picked v3 mockup's 3px/3px, or vice-versa) — analogous to the T-181
font reconciliation that is already handled correctly. Once F-01 is reconciled to a single value, M2 is
internally consistent and faithful to the M1 contract + STRUCTURE scope; the APPROVED marker can fire.
