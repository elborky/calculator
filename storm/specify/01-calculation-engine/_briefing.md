---
storm-phase: specify
storm-module: 01-calculation-engine
storm-depends-on:
  - storm/capture/01-braindump.md
  - storm/structure/00-domain-lens.md
  - storm/structure/01-vision.md
  - storm/structure/03-modules.md
  - storm/structure/04-scope.md
  - storm/structure/06-build-order.md
storm-canonical: false
---

# SPECIFY Briefing — M1 Calculation Engine

> Orchestrator-authored (no tier). Reconstructed from upstream artifacts (orchestrator-read gate
> per #FF-016). Every fact below carries an upstream cite. Sub-agents read this first.

## What M1 is

The **pure, headless arithmetic core**. Given a sequence of inputs (digits, operators, decimal,
clear, equals) it computes the correct result and flags error states. **No DOM, no styling, no
event listeners** — it does not know how input arrives (`03-modules.md:40,50-51`). The first
demo-able screen is M2, not M1 — M1 is the one-module-deep "dark stretch" (`06-build-order.md:76`).

## Canonical facts (cited — sub-agents treat as ground truth)

| # | Fact | Cite |
|---|---|---|
| F1 | Four operations only: add, subtract, multiply, divide | `04-scope.md:25`; `03-modules.md:43` |
| F2 | Decimal point entry — **one per number** | `04-scope.md:26`; `03-modules.md:44` |
| F3 | Equals resolves the pending operation to a result | `04-scope.md:27`; `03-modules.md:45` |
| F4 | Clear / AC — reset current entry vs. reset ALL state (two distinct behaviours) | `04-scope.md:28`; `03-modules.md:46` |
| F5 | Graceful error states: divide-by-zero AND numeric overflow → a defined error value the UI renders (M1 surfaces, M2 renders) | `03-modules.md:47`; `01-vision.md:39` |
| F6 | Negative results are allowed (arise from subtraction) | `03-modules.md:48` |
| F7 | Operand/operator running state machine is M1's core internal model | `03-modules.md:44`; `06-build-order.md:38` |
| F8 | NO persistence — all state in-memory, dies with the tab | `03-modules.md:55`; `00-domain-lens.md:67` |
| F9 | NO memory keys (M+/M−/MR/MC), NO scientific, NO percent, NO ± | `03-modules.md:52-53`; `04-scope.md:50-52` |
| F10 | NO history storage in M1 — M1 computes; M3 records | `03-modules.md:54` |
| F11 | Client-side only, no backend, no API | `01-vision.md:53`; `04-scope.md:55` |
| F12 | Craft floor holds at zero stakes — correctness is the bar for M1 | `00-domain-lens.md:59`; C3 |

## Domain Lens for M1 (re-validated this entry — CP-9 trigger (a))

Lens unchanged: *zero-stakes, client-side, no auth/data/compliance.* For M1 specifically the
design-craft axis ("ga bosenin") is **not yet active** — that lives in M2/M4. M1's working hats:
**logic correctness + QA**, NOT UX/design. Data-architect hat is explicitly NOT relevant
(`00-domain-lens.md:67`) — M1's "data model" is an in-memory state shape, not a DB schema.

## Concern set for M1 (adapted — headless module)

M1 has zero UI, so `04-ui.md` + the 3 mockup variants are **deliberately omitted** (they are M2's
work). Drafting them here would be theater (CP-13 over-engineering / anti-creep `04-scope.md:79`).
M1 concern set = **5 files**:

- `_index.md` (sonnet) — summary + granular task list
- `01-data-model.md` (opus) — in-memory state shape: operand/operator state machine, NOT a DB
- `02-flows.md` (sonnet) — input → compute → result/error sequences
- `03-rules.md` (sonnet) — arithmetic rules, decimal, div-by-zero, overflow, clear-vs-AC
- `05-edge-cases.md` (sonnet) — enumerated edge cases + handling
- `06-tech-choices.md` (opus) — language + test framework (Context7/WebFetch verified)

## Open questions surfaced (potential business decisions — orchestrator to watch)

None of these block drafting; sub-agents propose a sensible default and flag if it's truly a
business/taste call rather than technical:

- **OQ1 — display/result precision:** how many significant digits before rounding, and rounding
  mode? Likely technical (float handling), but the *visible* precision the user sees could be a
  taste call. Sub-agent proposes default; orchestrator surfaces only if genuinely taste.
- **OQ2 — overflow threshold:** what magnitude counts as "overflow" → error state (F5)? Technical
  (tied to number representation choice in `06-tech-choices.md`).
- **OQ3 — operator chaining semantics:** does pressing an operator after a pending op auto-resolve
  the previous one (e.g. `2 + 3 × 4` on a basic calculator = left-to-right `20`, not `14`)? This is
  a real behaviour decision for a *basic* (non-scientific, no-precedence) calculator. Sub-agent
  documents the chosen convention in `03-rules.md`; flag to orchestrator as it shapes correctness.

> No contradictions found between upstream sources. Scope is converged (`04-scope.md:91`).
