---
storm-phase: specify
storm-module: 04-theming
storm-canonical: false
storm-depends-on:
  - storm/specify/04-theming/_index.md
  - storm/specify/04-theming/01-data-model.md
  - storm/specify/04-theming/02-flows.md
  - storm/specify/04-theming/03-rules.md
  - storm/specify/04-theming/04-ui.md
  - storm/specify/04-theming/04-ui/_picked.md
  - storm/specify/04-theming/05-edge-cases.md
  - storm/specify/04-theming/06-tech-choices.md
  - storm/specify/04-theming/07-acceptance.md
  - storm/specify/04-theming/_decisions.md
---

# M4 Theming — SPECIFY Cross-File Consistency Audit

> Cross-file consistency auditor (opus). Checks the 04-theming concern set against itself
> and against upstream (`03-modules` M4, `04-scope`, `08-design-system`, `tokens.css`,
> `index.html`). Does NOT fire the module APPROVED/exit marker (#FF-009b) — audit-only.

## VERDICT: **FIX-REQUIRED — 1 finding** (+ 1 informational, no fix needed)

One real divergence: the owner-picked v3 "Iridescent Dawn" baseline ships a **continuous
pulsing aurora animation** (`auroraShift`, verified in `mockup-v3.html:102`), and the
reduced-motion treatment in `03-rules`, `05-edge-cases`, and `07-acceptance` covers **only**
the 300ms toggle cross-fade — it does NOT extend to disabling that pulse. The `_picked.md`
BUILD note flags the pulse as a HARD reduced-motion requirement and `_index.md` T-422 carries
it into BUILD, but the three canonical concerns that own reduced-motion are silent on it.
Builder reading `03-rules`/`05-edge-cases`/`07-acceptance` alone would not know the pulse must
stop, and no AC verifies it.

Everything else is **clean**: localStorage key (`calc-theme`), value domain (`"light"|"dark"`),
resolution precedence, swap mechanism, no-FOUC approach, light-palette source (TD-1 shipped v3
baseline, NOT §3.1), zero-dependency invariant, history-no-persistence invariant, dark-frozen
invariant, flow→AC coverage gate, task granularity, and scope alignment all verified consistent.

---

## FINDINGS

### F-1 — Reduced-motion does NOT cover the v3 aurora pulse (SEVERITY: MEDIUM — real spec gap)

**Files:** `03-rules.md` (R-M4-08), `05-edge-cases.md` (EC-M4-05), `07-acceptance.md` (AC-F3-7) —
divergence from `04-ui/_picked.md` (BUILD note, HARD) and `_index.md` (T-422).

**What diverges:**
- `04-ui/_picked.md` BUILD note (HARD): *"the v3 mockup includes an animated pulsing aurora.
  Under `prefers-reduced-motion: reduce` the pulse animation MUST be disabled… Static aurora is
  the reduced fallback."* Confirmed real: `mockup-v3.html:102` = `animation: auroraShift 12s …
  infinite alternate;`, and `mockup-v3.html:112-113` already disables it under reduced-motion.
- `_index.md` T-422 correctly carries it: *"Also disable any aurora pulse animation in the light
  block here."*
- **BUT** the three canonical concerns that OWN reduced-motion only address the 300ms cross-fade:
  - `03-rules.md` R-M4-08: *"only the transition timing is suppressed"* — scopes reduced-motion
    to the cross-fade exclusively; silent on the continuous pulse.
  - `05-edge-cases.md` EC-M4-05: *"the 300ms `transition` … is dropped"* — cross-fade only.
  - `07-acceptance.md` AC-F3-7: verifies only that the **cross-fade** is instant; no AC asserts
    the aurora pulse is halted under `prefers-reduced-motion: reduce`.

Result: the reduced-motion contract is split — the picked-visual's continuous motion is a
HARD requirement in `_picked`/`_index` but absent from the rule, the edge-case, and the oracle.
A builder working from the canonical concerns (the correct primary source) under-implements; the
acceptance oracle cannot catch the miss.

**Suggested fix (additive, no contradiction):**
1. `03-rules.md` R-M4-08 — broaden scope from "cross-fade only" to **all theme-introduced
   motion**: add a sentence that any continuous decorative animation introduced by the light
   theme (the v3 "Iridescent Dawn" aurora pulse) is ALSO suppressed to a static state under
   `prefers-reduced-motion: reduce`. Keep R-M4-08 the canonical owner.
2. `05-edge-cases.md` EC-M4-05 — add the aurora pulse to the enumerated reduced-motion handling
   (static aurora fallback), citing R-M4-08 + `_picked` BUILD note.
3. `07-acceptance.md` — add one AC (e.g. **AC-F3-11**) under AC-F3 or AC-A11Y: *"With
   `prefers-reduced-motion: reduce` and light theme active, observe the aurora background is
   static — no continuous pulse/shift animation."* Bump the stated total AC count (28 → 29).

---

## INFORMATIONAL (no fix required within module)

### I-1 — Upstream `03-modules` M4 uses illustrative key `e.g. "theme"`

`storm/structure/03-modules.md:103` reads *"under a single small key (e.g. `"theme"`)"*. The
SPECIFY set canonicalizes the key as `calc-theme` (consistent across all 7 files that name it).
This is NOT a divergence: the upstream `e.g.` is explicitly illustrative ("a single small key"),
and SPECIFY is the layer that fixes the literal. No change needed — the `e.g.` correctly defers
the concrete name to SPECIFY. Noted only so a future reader does not flag it as a mismatch.

---

## CHECKS THAT PASSED (verified, not assumed)

| Check | Result | Evidence |
|---|---|---|
| **localStorage key literal** | PASS — `calc-theme` everywhere | 01-data-model §1, 02-flows §intro, 06-tech-choices §3/§5, _decisions D-M4-TC-03, _index, _briefing seam, 07-acceptance (9×). 03-rules/05-edge-cases reference by description ("the single key"), not contradicting. |
| **Value domain `"light"\|"dark"`** | PASS | Identical closed-2-literal domain in 01-data-model §1/§4, 03-rules Vocabulary, 02-flows, 06-tech-choices, 07-acceptance AC-EC-03. |
| **Resolution precedence (stored > prefers-color-scheme > default dark)** | PASS — 03-rules canonical, others cite | 03-rules R-M4-01 (canonical owner). 02-flows, 05-edge-cases, 06-tech-choices, 01-data-model §3, 07-acceptance all cite/mirror it; none contradicts. |
| **Swap mechanism (`[data-theme="light"]` over frozen `:root` dark)** | PASS | 06-tech-choices §1 + 03-rules R-M4-05 + 04-ui §1.6 + _index task list (T-401/402, T-414) consistent. `dataset.theme` write path identical everywhere. |
| **No-FOUC (inline non-module head script before paint)** | PASS | 03-rules R-M4-04, 05-edge-cases EC-M4-04, 06-tech-choices §4 + D-M4-TC-04, 07-acceptance AC-F2-3/AC-FOUC matrix, _index T-410 — synchronous non-module inline placement consistent; AC-FOUC matrix verifies all combos. |
| **Light palette source = SHIPPED v3 tokens.css baseline (TD-1), NOT §3.1** | PASS | 04-ui §3 header explicitly supersedes §3.1; 03-rules R-M4-06, _briefing CF-4/TD-1, _picked, _index all derive from shipped v3 dark. No file points to §3.1 as authoritative. |
| **INV (a): M3 history NO-persistence** | PASS | 01-data-model §2, 03-rules R-M4-02, _briefing Invariants, 07-acceptance AC-INV-01 all assert theme key is the sole persistence; history stays ephemeral. |
| **INV (b): dark v3 default frozen** | PASS | 03-rules R-M4-03/R-M4-05, _picked scope guard, _briefing, 07-acceptance AC-INV-02. tokens.css `:root` baseline (`#7c5cff`/`#ff5e7a`/`#0a0820`) confirmed unchanged; no `[data-theme]` block present yet (correct — M4 adds it). |
| **INV (c): 0 new dependencies** | PASS | 06-tech-choices §0/§5 + D-M4-TC-05 claim net-zero. Verified against `package.json`: `dependencies = {decimal.js}`, devDeps = {jsdom, typescript, vite, vitest} — M4 adds none. |
| **Acceptance coverage gate (#E4 4b): every flow has ≥1 observable AC** | PASS | F1→AC-F1-1..4; F2→AC-F2-1..3; F3→AC-F3-1..10; F4→AC-F4-1..2. Single anonymous user, no role matrix; no flow missing an AC. |
| **_index task granularity (no "and"-joins, full coverage)** | PASS | 30 tasks (T-401..430), each ≤1 unit. Covers token swap (T-402..408), glass-edge (T-409), no-FOUC script (T-410), resolution/persist module (T-411..416), toggle markup+CSS (T-417..420), cross-fade+reduced-motion (T-421/422), OS listener (T-416), tests (T-425..429), AA verify (T-430). No multi-unit "and"-joined tasks. |
| **Scope alignment vs 03-modules M4 + 04-scope** | PASS | theme localStorage persist IN (04-scope:39); explicit "System" option DEFERRED (04-scope:72, 03-modules:107, _briefing scope, 03-rules Vocabulary); history persistence OUT (04-scope:54, 03-modules:89). All match the SPECIFY set. |

---

## CP-13 self-critique — see commit body.
