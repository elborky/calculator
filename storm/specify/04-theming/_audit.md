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

## VERDICT: **PASS** (re-audit after F-1 fix — F-1 now fully resolved; 1 informational, no fix needed)

This is the **re-audit** following the prior round's `FIX-REQUIRED — 1 finding` verdict.
**F-1 — reduced-motion not covering the v3 aurora pulse — is now FULLY RESOLVED**, verified
across all three target files. No regression introduced: the fix was strictly additive (one
rule clause broadened, one edge-case vector added, one new AC + count bump). The other
invariants verified in depth in the prior round were spot-re-confirmed and still hold.

---

## F-1 RESOLUTION — verified resolved (was: MEDIUM spec gap)

**Prior finding:** the reduced-motion contract covered only the 300ms cross-fade and was silent
on the v3 "Iridescent Dawn" continuous pulsing aurora animation (`auroraShift 12s … infinite
alternate`, `mockup-v3.html:102`). A builder reading the canonical concerns alone would not know
the pulse must stop under `prefers-reduced-motion: reduce`, and no AC could catch the miss.

**Fix applied (3 commits) — verified against the live files:**

| File | Commit | What changed | Verified |
|---|---|---|---|
| `03-rules.md` R-M4-08 | `a65ef37` | Retitled "ALL theme-introduced motion suppressed"; now enumerates **two** vectors — (1) 300ms cross-fade → instant, (2) **v3 aurora pulse → disabled (static aurora)** via `animation: none` inside `@media (prefers-reduced-motion: reduce)`. Canonical owner retained. | ✅ `03-rules.md:123-140` |
| `05-edge-cases.md` EC-M4-05 | `506d8d8` | Risk + handling extended to "two animation vectors, both must be suppressed"; vector 2 = aurora pulse → static gradient, citing R-M4-08 + `_picked` BUILD note. Coverage-note table updated to name both. | ✅ `05-edge-cases.md:80-102`, table `:156` |
| `07-acceptance.md` | `41e67ba` | New observable AC **AC-F3-8** — "Light-theme aurora pulse is static under reduced-motion" (verifiable via DevTools Animations panel OR two screenshots 6+s apart, pixel-identical aurora region). Stated total AC count bumped **28 → 29** (`:20`). | ✅ `07-acceptance.md:112-119`, count `:20` |

**Resolution checks (all PASS):**
- R-M4-08 now covers the aurora pulse disable (not just cross-fade) — **YES**, vector 2 explicit, `animation: none` mechanism named.
- EC-M4-05 includes the pulse — **YES**, vector 2 enumerated with static-gradient fallback.
- 07-acceptance has an **observable** AC verifying pulse is static under reduced-motion — **YES**, AC-F3-8 (instrument-checkable: Animations panel / pixel-diff).
- AC count updated — **YES**, 28 → 29.

**Numbering note (no defect):** the prior audit's suggestion floated the new AC as `AC-F3-11`.
The fix instead renumbered the existing cross-fade-instant AC to **AC-F3-7** and slotted the new
pulse AC as **AC-F3-8** — placing the two reduced-motion ACs adjacently, with AC-F3-9/10/11 (icon,
aria-label, aria-pressed) following. This is a cleaner grouping with no semantic loss; the
referenced `03-rules R-M4-08` / `05-edge-cases EC-M4-05` cites are intact.

---

## NO-REGRESSION CHECK (re-audit)

The fix was **strictly additive**. Verified no prior rule / edge-case / AC was removed or
contradicted:
- `03-rules` R-M4-01..R-M4-07 unchanged; R-M4-08 only **broadened** (cross-fade clause preserved
  as vector 1).
- `05-edge-cases` EC-M4-01..04, 06..08 unchanged; EC-M4-05 cross-fade handling preserved as
  vector 1.
- `07-acceptance` — all prior AC bodies preserved; cross-fade-instant AC retained (now AC-F3-7);
  AC-F3-8 is net-new. Count line consistent with the actual AC enumeration.

---

## INFORMATIONAL (no fix required within module) — unchanged from prior round

### I-1 — Upstream `03-modules` M4 uses illustrative key `e.g. "theme"`

`storm/structure/03-modules.md:103` reads *"under a single small key (e.g. `"theme"`)"*. The
SPECIFY set canonicalizes the key as `calc-theme`. NOT a divergence: the upstream `e.g.` is
explicitly illustrative and SPECIFY is the layer that fixes the literal. Noted only so a future
reader does not flag it as a mismatch.

---

## OTHER INVARIANTS — spot-re-confirmed (verified in depth prior round, `32fc978`)

| Check | Result | Note |
|---|---|---|
| **localStorage key literal `calc-theme`** | PASS | Unchanged by the fix; consistent across all naming files + 07-acceptance. |
| **Value domain `"light"\|"dark"`** | PASS | Closed 2-literal domain unchanged. |
| **Resolution precedence (stored > prefers-color-scheme > default dark)** | PASS | 03-rules R-M4-01 canonical; untouched by fix. |
| **Swap mechanism (`[data-theme="light"]` over frozen `:root` dark)** | PASS | R-M4-05 / 06-tech-choices §1 unchanged. |
| **No-FOUC (inline pre-paint head script)** | PASS | R-M4-04 / EC-M4-04 / AC-FOUC matrix unchanged. |
| **M3 history NO-persistence** | PASS | R-M4-02 / AC-INV-01 unchanged; theme key remains sole persistence. |
| **0 new dependencies** | PASS | 06-tech-choices net-zero; fix added no deps (CSS `@media` only). |
| **Scope alignment vs 03-modules M4 + 04-scope** | PASS | "System" still DEFERRED; history persist still OUT; theme persist still IN. |

---

## CP-13 self-critique — see commit body.
