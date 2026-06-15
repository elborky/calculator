---
storm-depends-on: []
storm-phase: meta
storm-canonical: false
---

# Parking Lot

> AI-maintained. Out-of-scope ideas get auto-parked here during any phase without interrupting flow.
> Triage fires automatically at phase boundaries OR when ≥10 pending tickets accumulate.
> Run `/storm-park` to review, triage, or resolve manually.

## Ticket Format

```
### #NNN — [Title]
- **Status:** open | in-progress | resolved | deferred
- **Module:** <slug> (if module-specific) | general
- **Phase surfaced:** [CAPTURE|STRUCTURE|SPECIFY|BUILD|REVIEW|SHIP]
- **Description:** [what was said, in context]
- **Resolution:** (filled when closed)
```

---

### #002 — Remove dead reduced-motion CSS selectors in tokens.css (L8 F-1)
- **Status:** open
- **Module:** 04-theming
- **Phase surfaced:** REVIEW
- **Description:** `src/ui/styles/tokens.css:179-184` contains a `@media (prefers-reduced-motion: reduce)` block targeting `[data-theme="light"] .aurora-layer`, `[data-theme="light"] body::before`, and `[data-theme="light"] .bg::before`. Of these, `.aurora-layer` and `.bg` match no element in the app (no such class exists in `index.html` or any module). The real reduced-motion aurora guard is `keypad.css:155-156` (`body::before/after { animation: none }`), which covers both themes globally — AC-F3-8 passes via that guard, NOT via the dead `tokens.css` block. The one selector that does match (`body::before`) is therefore redundant. The misleading comment ("Disable the Iridescent Dawn aurora pulse animation") falsely advertises this block as the canonical guard; a future maintainer editing the light aurora could trust this dead block and silently break reduced-motion. **Proposed fix:** delete the dead `tokens.css:179-184` block; add a one-line comment at `keypad.css:155` noting it is the canonical aurora reduced-motion guard for both themes. No behavior change — purely removes misleading dead code. (L8 F-1, surfaced by opus adversarial audit at commit `0a0558b`.)
- **Resolution:** (open — non-blocking; P2 cosmetic/maintenance risk only)

---

### #001 — Build drops unprefixed `backdrop-filter` → glass broken on Firefox
- **Status:** open
- **Module:** general (CSS build pipeline; affects layout.css / keypad.css / history.css glass panels)
- **Phase surfaced:** SHIP
- **Description:** Source CSS carries both `backdrop-filter` and `-webkit-backdrop-filter`, but Vite/esbuild minification drops the **unprefixed** `backdrop-filter` from the built bundle (confirmed via grep on both local `dist/` and live prod CSS — identical). Chrome/Safari honor `-webkit-backdrop-filter` so glass renders there (owner confirmed glass visible in their Chrome on prod 2026-06-15); **Firefox needs the unprefixed property and would render the panels flat (no glass)**. Functional behaviour unaffected — purely the glassmorphism aesthetic on Firefox. For a design-craft-forward project the glass is the signature, so worth fixing for cross-browser parity. Likely fix: switch Vite CSS minifier to lightningcss (`build.cssMinify: 'lightningcss'`) or add a postcss step so prefixed+unprefixed are both preserved; then rebuild + redeploy + re-verify on Firefox. **Measurement lesson:** Playwright headless cannot confirm backdrop-filter (no GPU compositing) — it false-negatived glass 3× (REVIEW L1, prod smoke), each time really a headless artifact; real-browser/owner eyes remain the backdrop-filter oracle.
- **Resolution:** (open — non-blocking; SHIP proceeded, glass confirmed working in owner's Chrome)
