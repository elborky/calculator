---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/04-ui.md
  - storm/structure/08-design-system.md
  - storm/structure/00-domain-lens.md
---

# M2 Visual Baseline — PICKED

> Locks the visual baseline for M2 BUILD. Owner taste decision (CP-7 — aesthetic authority is
> the human's). The other two variants stay on disk (`mockup-v1.html`, `mockup-v2.html`) as
> rejected-but-preserved references; only the pick below is the BUILD target.

## Pick: **v3 — Wildcard (maximalist aurora glass)**

- **File:** `storm/specify/02-calculator-ui/04-ui/mockup-v3.html`
- **Commit:** `a45e580`
- **Picked:** 2026-06-15, owner, after a 3-variant side-by-side screenshot comparison.

## Rationale (owner-driven)

Owner's mockup-vibe steer earlier this session was **"dorong sampai mentok" / push to the limit**
(a locked taste decision recorded in `04-ui.md`'s validated UX interpretation). v3 is the variant
built to that brief, and the owner picked it on sight. It maximizes the product's **one first-class
quality axis** — "simple aja, tapi secara design ga bosenin" (`00-domain-lens.md:17,57`;
`01-vision.md:38`). The animated aurora canvas, sculptural tilted slab, Space Grotesk display, and
vibrant accent system deliver "non-boring" at its ceiling while the glassmorphism DNA (frosted
translucent panes) — the owner-locked aesthetic direction (`08-design-system.md:19`) — is preserved.

## What v3 keeps (non-negotiable, verified in the mockup)

- **Glassmorphism DNA** — frosted translucent panes; honors the locked §1 direction.
- **Accessibility craft floor (C3 / design §8 / `03-rules.md` UR §6)** — real `<button>`s, visible
  focus rings (3px accent, 3px offset), ≥64px targets, `aria-live`/`role="status"` display, true
  Unicode glyphs, operators distinguished by glyph+fill not color alone, `prefers-reduced-motion`
  reduces ALL animation to instant. The display number sits on a near-opaque contrast scrim → WCAG AA
  cleared (~17:1) regardless of the animated backdrop. **This floor is locked and may not regress in
  BUILD.**
- **Functional keypad** — the exact 4-col grid from `04-ui.md` (AC CE ÷ × / 7 8 9 − / 4 5 6 + /
  1 2 3 = / 0-span2 . =), `=` spans 2 rows, `0` spans 2 cols, 15-key surface, no `±`/`%` (out of scope).
- **Token-as-custom-property structure (F4)** — colors expressed as CSS custom properties so M4 can
  swap them on theme toggle.

## ⚠️ Cascade note for M4 (theming) — reconciliation required, NOT a blocker for M2

v3 **departs from the specific `08-design-system.md §3` token values** (it uses an aurora gradient,
Space Grotesk display font, and a more vibrant accent system rather than the §3.1 light-token table).
This is **within the latitude §3 already grants** — `08-design-system.md:13` declares the concrete
hex/blur/font numbers "AI-authored craft … may be tuned in BUILD without re-asking." So picking v3 is
a permitted tuning, **not** a contradiction of a locked decision (the locked item is the *glassmorphism
direction*, which v3 honors).

**Implication for the M4 SPECIFY pass (JIT, later):** M4 owns the light/dark token set + toggle and
applies tokens across M2 + M3. When M4 is specified, it MUST reconcile its token tables against this
v3 baseline (the actual gradient, font, and accent values v3 ships), not against the original §3 table
— otherwise M4's theme would fight M2's chosen look. M4's SPECIFY `_briefing.md` should cite this file.
Recorded here (not parked) so the dependency is content-level and visible (CP-15 no-manufactured-
dependency: this link is real — M4 themes the very surface v3 defines).

## Rejected-but-preserved

| Variant | File | Why not picked (still on disk) |
|---|---|---|
| v1 Conservative | `mockup-v1.html` | Token-faithful, balanced, safe — but the calmest; owner wanted maximal "non-boring". |
| v2 Bold (dark) | `mockup-v2.html` | Most premium glass treatment, but right-shifted (M3 history slot read as empty void in a standalone M2 frame); owner picked v3's energy over v2's restraint. |
