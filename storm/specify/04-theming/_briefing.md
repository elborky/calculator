---
storm-phase: specify
storm-module: 04-theming
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/03-modules.md
  - storm/structure/04-scope.md
  - storm/structure/08-design-system.md
  - storm/capture/01-braindump.md
  - src/ui/styles/tokens.css
  - index.html
storm-canonical: false
---

# SPECIFY Briefing — M4 Theming (theme toggle)

> Orchestrator-authored (#FF-016 upstream-read gate). Canonical facts + the one open taste
> decision (now resolved). Every M4 sub-agent reads this first.

## Module scope (owner-confirmed this session, re-entry slice)

- **Light/Dark 2-state toggle** in the reserved `.toggle-slot`.
- **First-load default = OS preference** via `prefers-color-scheme` (`matchMedia`).
- **Chosen theme persists** in a single `localStorage` key (the ONE documented persistence
  exception — `00-domain-lens.md §4a`).
- M4 applies design-system tokens across M2 (keypad/display) + M3 (history tape).
- **DEFERRED (not now):** an explicit 3rd "System" toggle option. Build 2-state only.

## Canonical facts (verified against live code, not assumed)

- **CF-1 — App is currently DARK-ONLY.** `src/ui/styles/tokens.css` `:root` defines exactly ONE
  theme: the shipped **"v3 Wildcard"** dark aurora-glass baseline (D-003). There is NO light
  theme in code. Its own header comment states it *"intentionally departs from design-system §3
  (owner pick); M4 SPECIFY reconciles §3 tables to this baseline."*
- **CF-2 — `.toggle-slot` already exists.** `index.html:48` has `<div class="toggle-slot"
  aria-hidden="true"></div>` inside `.calc`; `layout.css:135` keeps it clear. M4 fills it.
- **CF-3 — Token architecture is swap-ready (UR-029).** All themed colours are already
  `var(--token)` referenced from a single `:root` block in `tokens.css`. Structural
  black/white shadows are literals and DO NOT theme-swap (per T-122) — leave them alone.
  The swap surface is the `:root` colour tokens only.
- **CF-4 — Dark baseline ≠ design-system §3.1/§3.2 tables.** The design-system light (§3.1
  pastel) and dark (§3.2) palettes predate the v3 Wildcard pick. The SHIPPED dark is more
  vibrant (indigo `#7c5cff`, coral `#ff5e7a`, deep aurora `#0a0820` base). M4 must derive the
  LIGHT palette to match the SHIPPED v3 baseline — NOT the stale §3.1 pastel.
- **CF-5 — Theme-transition motion already specced.** `08-design-system.md §7`: theme toggle =
  300ms cross-fade of token set; honour `prefers-reduced-motion`. Motion tokens live in
  `tokens.css §11` already.

## Resolved taste decision (owner, this session)

- **TD-1 — Light-mode direction = "Mirror vibrant dark."** Light theme is the bright sibling of
  the v3 aurora: vibrant-but-light gradient (bright blue/violet/pink), white translucent glass,
  indigo/coral accents still pop. NOT the calm/minimal pastel of §3.1. Dark v3 stays the default
  and is unchanged. → drives `04-ui.md` + the 3 light-theme mockups + the §3.1 reconciliation.

## Technical seam (AI-autonomous, CP-7)

- **Swap mechanism:** move the themed `:root` colour tokens to a default + override scheme.
  Recommended: keep dark as the `:root` default (it ships today, unchanged), add a
  `[data-theme="light"]` override block; toggle sets `document.documentElement.dataset.theme`.
  Exact mechanism is a `06-tech-choices` decision — verify no new dependency (vanilla
  `matchMedia` + `localStorage` + CSS attribute selector is expected).
- **Resolution precedence (first load):** stored localStorage value (if valid) → else
  `prefers-color-scheme` → else default dark. `03-rules` owns this.
- **No-FOUC requirement:** the resolved theme must be applied BEFORE first paint (inline head
  script setting `data-theme` before CSS-heavy render), so there's no flash of the wrong theme
  on load. `05-edge-cases` + `03-rules` own this; acceptance must verify it.
- **localStorage key:** single key (e.g. `"calc-theme"`), value `"light" | "dark"`. Corrupt /
  unparseable / blocked-storage cases fall back to OS-default gracefully — `05-edge-cases`.

## Invariants to NOT break

- **M3 history tape stays ephemeral / no-persistence.** The ONLY thing that persists is the
  theme-preference key. Do not introduce any other storage.
- **Dark v3 baseline is frozen as the default theme** — M4 adds light + the swap, it does not
  restyle dark.
- M1 engine untouched. M2/M3 markup untouched except filling `.toggle-slot`.
- Craft floor (C3): light theme must clear WCAG AA contrast (display ≥4.5:1, large labels ≥3:1)
  against its own glass-over-gradient — same discipline as dark (`08-design-system.md §8`).

## Open questions

- None blocking. TD-1 resolves the only taste decision. Everything else is CP-7 technical.
