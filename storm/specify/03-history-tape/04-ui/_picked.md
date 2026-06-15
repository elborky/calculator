---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/04-ui.md
  - storm/specify/03-history-tape/04-ui/mockup-v1.html
  - storm/structure/08-design-system.md
  - storm/structure/00-domain-lens.md
---

# M3 History Tape — Visual Baseline (PICKED)

## Pick: **v1 Conservative** — `mockup-v1.html`

Owner picked **v1** on 2026-06-15 (verbatim: *"gw pilih v1"*).

## Rationale (owner + design coherence)

- **Owner intent:** tape should exist without competing with the keypad — the calculator stays
  the hero, history is a quiet secondary surface. Matches the Domain Lens (`00-domain-lens.md`):
  *simple aja, tapi ga bosenin* — the "ga bosenin" energy already lives in the v3 aurora-glass
  calculator body (carried unchanged into every variant); the tape itself stays restrained so the
  surface doesn't get visually noisy.
- **Layout chosen:** **single-line entry** (`12 + 3 = 15`) — resolves the OQ-M3-2 alternative in
  favor of the compact one-line form over the two-line primary that `04-ui.md` had defaulted to.
  → **Cascade note:** `04-ui.md` two-line-primary entry anatomy is now superseded by single-line
  for BUILD; `_index.md` task list must spec the single-line render. (Flagged for `_audit` to confirm
  no downstream concern still assumes two-line.)
- **Treatment:** recessed tape panel (standard 16px blur vs the slab's deeper blur), hairline
  dividers between rows, no per-entry glow/sheen/settle motion — the restrained, token-faithful floor.
- **Craft floor held (per mockup-v1 verification):** semantic `<ul role="list">`/`<li>`, region label
  + sr-only heading, tabular-nums, true-Unicode glyphs (− × ÷), no `aria-live` on the tape (M2 display
  owns the announce — `04-ui.md §6`), conditional non-trap `tabindex` on the scroll region,
  `prefers-reduced-motion` drops the slide-in, long results wrap-never-truncate.

## Locked downstream contract

The BUILD render (`_index.md` task list) implements the v1 single-line tape into the pre-existing
`.history-slot` (F-M3-8), driven by the INT-M3 recording seam (D-M3-TC-01 subscriber list). No new
dependency (D-M3-TC-02). The two unpicked variants (`mockup-v2.html` Bold, `mockup-v3.html` Wildcard)
are retained as the 3-variant record but are NOT the build baseline.
