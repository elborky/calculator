---
storm-phase: specify
storm-module: 04-theming
storm-depends-on:
  - storm/specify/04-theming/04-ui.md
  - storm/specify/04-theming/04-ui/mockup-v3.html
storm-canonical: true
---

# Visual baseline — M4 Theming (light mode)

## Pick: **v3 Wildcard — "Iridescent Dawn"**

Owner picked v3 (2026-06-15, "v3"). The light theme is the bright sibling of the shipped
v3 dark aurora (TD-1 "mirror vibrant dark"), rendered as a warm dawn treatment:

- **Iridescent holographic glass edge** — a ~2px chromatic gradient ring (periwinkle → rose →
  lilac → periwinkle) wrapping the calculator body, with a faint 1px blur for shimmer.
- **Warm dawn aurora background** — radial blobs of violet / rose-pink / peach / periwinkle /
  lilac over a lavender base.
- **Subtle iridescent surface tint** over the glass; lilac-tinted utility keys (AC/CE/%) to
  differentiate from a plain light-mode port.
- White translucent glass, dark text (`#1a1040`-family) for WCAG AA, indigo/coral accents pop.

## Rationale (owner intent)

Owner wanted the most distinctive, craft-forward light treatment — pushes the "ga bosenin"
axis (`00-domain-lens.md §1`) furthest while staying a recognizable glassmorphism calculator
with AA-readable dark-on-light contrast.

## Scope guard — dark v3 is UNCHANGED

The shipped v3 dark baseline (`src/ui/styles/tokens.css :root`) stays the default theme,
frozen. v3 light is the `[data-theme="light"]` override only. Picking v3-light does NOT
restyle dark.

## BUILD notes (carry into BUILD)

- **Reduced-motion (HARD):** the v3 mockup includes an animated pulsing aurora. Under
  `prefers-reduced-motion: reduce` the pulse animation MUST be disabled (consistency with
  `03-rules` R-M4 reduced-motion + the 300ms cross-fade rule). Static aurora is the reduced
  fallback.
- **AA verification:** verify the dawn-palette light glass clears AA at the worst gradient
  spot (display ≥4.5:1, large labels ≥3:1) per `08-design-system §8`; raise glass-fill alpha
  before darkening text if a spot fails (`05-edge-cases` EC-M4 contrast rule).
- The mockup token values are a STARTING POINT — tunable in BUILD per craft-floor, no re-ask.

## Variants retained as record

- `mockup-v1.html` — Conservative (calm bright aurora). Not picked.
- `mockup-v2.html` — Bold (saturated bright aurora). Not picked.
- `mockup-v3.html` — Wildcard (Iridescent Dawn). **PICKED.**
