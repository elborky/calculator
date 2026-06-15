---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/01-vision.md
  - storm/structure/03-modules.md
  - storm/structure/04-scope.md
storm-phase: structure
storm-canonical: true
---

# Design System — Calculator

> Status: **proposed** (STRUCTURE phase). Aesthetic direction (**Glassmorphism**) is **owner-confirmed, locked** — a business/taste decision per CP-7. This file translates that locked direction into concrete, build-ready tokens. Owner confirms comprehension; the hex/blur/spacing numbers are AI-authored craft (CP-7 technical) and may be tuned in BUILD without re-asking.

This is the one genuine quality axis for the whole product — "simple aja, tapi secara design ga bosenin" (`01-vision.md:38`; `00-domain-lens.md:57`). Everything below exists to make a basic 4-function calculator feel deliberate and premium, not template-default. It supports M2 (keypad/display), M3 (history tape), and M4 (theming + light/dark toggle).

---

## 1. Aesthetic direction — Glassmorphism

Frosted-glass translucent panels floating over a soft, colored gradient, with backdrop blur and layered depth so the calculator reads as a real object sitting *above* its background rather than a flat box. The glass is the signature: every surface (the calculator body, the display, the history tape, the buttons) is a semi-transparent pane that lets the gradient bleed through, edged with a faint 1px light border and lifted by a soft shadow. Done right it feels like premium iOS/visionOS control-center glass — calm, modern, tactile — **not** the over-blurred, low-contrast "AI default" glass that sacrifices readability for effect.

Plain-language for the builder: imagine a sheet of slightly foggy glass laid over a colorful blurred photo. You can see the colors through it, but softened. The numbers sit crisply *on* the glass. That contrast — crisp text on soft translucent glass on rich gradient — is the entire look.

---

## 2. Reference apps — borrow the feel (≥3, exit criterion)

Real shipping products that nail the target glassmorphism. Study these for the *feel*, not to copy pixel-for-pixel.

| # | Reference | What to borrow |
|---|---|---|
| **R1** | **Apple visionOS / iOS Control Center** | The gold standard for glass: how a translucent panel reads cleanly over a busy background — restrained blur, a barely-there light edge highlight, real depth without muddiness. This is the *target* premium glass feel. |
| **R2** | **macOS Big Sur+ menu bar & Notification Center widgets** | How frosted panels layer over a colorful desktop wallpaper while keeping text fully legible — the readability discipline (contrast scrim under text) that keeps glass from going mushy. |
| **R3** | **Stripe's marketing site (stripe.com) gradient + card surfaces** | Premium *soft gradient* backgrounds (multi-hue, smooth, never garish) and elevated card surfaces — the gradient-canvas half of the look that the glass floats on. |
| **R4** | **Linear (linear.app) dark UI** | How to do glass/translucency in a **dark** theme without it turning into a flat black void — subtle elevation, low-alpha light fills, crisp accent color. Reference for the dark-theme half specifically. |

(Four provided; the spec needs ≥3. R1–R2 = glass craft, R3 = light-theme gradient, R4 = dark-theme glass.)

---

## 3. Color palette — light + dark

Glassmorphism reads differently per theme: in **light**, glass is a bright white-ish translucent pane over a pastel gradient; in **dark**, glass is a low-alpha light film over a deep, saturated gradient, edged with a brighter highlight so the panes don't vanish. Both specified below with concrete values. M4 swaps the whole token set on toggle.

### 3.1 Light theme

| Token | Value | Use |
|---|---|---|
| `--bg-gradient` | `linear-gradient(135deg, #a8c0ff 0%, #c2a8ff 50%, #ffb3d9 100%)` | Full-page canvas behind the glass. Soft tri-hue (blue→violet→pink). |
| `--glass-fill` | `rgba(255, 255, 255, 0.45)` | Calculator body + button glass fill. |
| `--glass-fill-display` | `rgba(255, 255, 255, 0.30)` | Display panel — slightly more transparent so it reads as a recessed "window". |
| `--glass-border` | `rgba(255, 255, 255, 0.60)` | 1px translucent light edge on every glass pane. |
| `--text-primary` | `#1a1a2e` | The big number readout, digit button labels. High contrast vs glass. |
| `--text-secondary` | `rgba(26, 26, 46, 0.60)` | History tape, secondary labels. |
| `--accent` | `#6c5ce7` (indigo-violet) | Equals button, focus ring, active state. |
| `--operator-accent` | `#ff7675` (warm coral) | The four operator buttons (+ − × ÷) — pops against cool gradient. |
| `--error` | `#d63031` | Divide-by-zero / overflow text in the display. |

### 3.2 Dark theme

| Token | Value | Use |
|---|---|---|
| `--bg-gradient` | `linear-gradient(135deg, #1a1a3e 0%, #2d1b4e 50%, #3d1f4e 100%)` | Deep saturated indigo→violet→plum canvas. |
| `--glass-fill` | `rgba(255, 255, 255, 0.08)` | Calculator body + button glass — a faint light film over the dark gradient. |
| `--glass-fill-display` | `rgba(255, 255, 255, 0.05)` | Display panel — even fainter, reads as recessed. |
| `--glass-border` | `rgba(255, 255, 255, 0.18)` | 1px highlight edge — brighter relative-to-fill than light theme so panes stay visible. |
| `--text-primary` | `#f5f5fa` | Big number readout, digit labels. |
| `--text-secondary` | `rgba(245, 245, 250, 0.55)` | History tape, secondary labels. |
| `--accent` | `#a29bfe` (lightened indigo) | Equals, focus ring — lifted for dark-bg contrast. |
| `--operator-accent` | `#ff9f9f` (softened coral) | Operator buttons — lightened so it glows on dark glass. |
| `--error` | `#ff7675` | Error text — coral-red reads on dark. |

> Contrast note: `--text-primary` vs its glass-over-gradient backdrop must clear WCAG AA (≥4.5:1 for the display number, ≥3:1 for large button labels). See §8.

---

## 4. Typography

| Role | Font | Size / weight | Notes |
|---|---|---|---|
| **Display readout** (the big number) | `'Inter'` (Google Font), fallback `system-ui, -apple-system, sans-serif` | `clamp(2.5rem, 12vw, 4rem)`, weight **300** (light) | Tabular figures: `font-variant-numeric: tabular-nums` so digits don't jitter as the number changes. Right-aligned. |
| **Buttons** (digits + operators) | `'Inter'`, same stack | `1.5rem`, weight **500** (medium) | Centered. Operator glyphs use true × ÷ − (U+00D7, U+00F7, U+2212), not `x / -`. |
| **History tape** | `'Inter'`, same stack | `0.875rem`, weight **400**, line-height 1.5 | Tabular figures too. Expression in `--text-secondary`, result in `--text-primary`. |

One typeface (Inter) across the whole app — geometric, clean, excellent tabular numerals, free, web-safe via Google Fonts. Hierarchy comes from *weight + size*, not from mixing families. Load only the 3 weights used (300/400/500) to keep it light.

---

## 5. Glass treatment spec

The recipe applied to every glass pane (body, display, buttons, history tape):

```
background: var(--glass-fill);          /* or --glass-fill-display for the display */
backdrop-filter: blur(16px) saturate(140%);
-webkit-backdrop-filter: blur(16px) saturate(140%);   /* Safari */
border: 1px solid var(--glass-border);
border-radius: 20px;                    /* body 24px, buttons 16px, display 20px */
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.18),       /* outer drop — depth/float */
  inset 0 1px 0 rgba(255,255,255,0.25); /* inner top highlight — the "glass edge" sheen */
```

- **Blur amount:** `16px` for the calculator body and display (the main panes). Buttons can use a lighter `8–10px` so they don't over-soften. `saturate(140%)` richens the gradient bleeding through — this is what makes glass look *premium* vs *gray*.
- **Panel alpha:** see §3 (`--glass-fill` ~0.45 light / ~0.08 dark). The display is intentionally *more* transparent than the body so it reads as a recessed window.
- **Border:** always a 1px translucent light line (`--glass-border`) — this single edge is what sells "pane of glass".
- **Elevation layers:** outer soft drop-shadow (float) + inner top-edge highlight (sheen). Two layers, no more — over-stacking shadows muddies it.
- **Fallback:** if `backdrop-filter` is unsupported (older browsers), fall back to a higher-alpha solid-ish fill (e.g. `rgba(255,255,255,0.85)` light / `rgba(30,30,50,0.85)` dark) so text stays readable — never leave transparent-with-no-blur (text becomes illegible over the gradient).

---

## 6. Spacing & layout

- **App canvas:** full-viewport `--bg-gradient`, calculator centered (flexbox, `min-height: 100vh`, centered both axes). Generous breathing room around the glass — the gradient *is* part of the design, don't crowd it.
- **Calculator body:** a single glass panel, `max-width: 360px` (desktop), full-width with `16px` page margin on phone. Internal padding `20–24px`. `border-radius: 24px`.
- **Display area:** glass sub-panel at the top of the body. Min-height ~`96px`, right-aligned number, `16–20px` internal padding. Above it (smaller, secondary) the pending expression; below/in it the big result.
- **Keypad grid:** CSS Grid, **4 columns**. Standard layout — digits 0–9, decimal, the four operators, equals, clear/AC. Gap `10–12px` between buttons. Equals (and optionally 0) can span 2 columns.
- **Button sizing:** square-ish, `min 64×64px` each (comfortably above the 44px tap-target floor — see §8). Digit buttons use `--glass-fill`; operators use `--operator-accent` fill; equals uses `--accent` fill.
- **History tape placement:** a separate glass panel. **Desktop:** to the *side* of the calculator (flex row, tape on the left or right, ~240px wide, scrollable). **Phone/narrow:** *above or below* the calculator body (stacked, capped height ~140px, scrollable, most-recent at the visible edge). Responsive: switch from side-by-side to stacked under ~640px viewport. M3 owns content; this owns placement.

---

## 7. Motion — subtle, premium

Restrained and smooth. Nothing bouncy or playful — the target feel is calm iOS-glass, not a toy.

| Interaction | Motion |
|---|---|
| **Button press** | On `:active`, scale to `0.96` + brief fill-brightness lift, `transition: transform 80ms ease-out, background 120ms`. Quick, tactile, springs back. No bounce. |
| **Button hover** (desktop) | Subtle fill-alpha increase + faint glow, `150ms ease`. |
| **Theme toggle** | Cross-fade the whole token set: `transition` on `background`/`color`/`border` over `300ms ease`. The gradient and glass morph smoothly between light and dark — a premium beat, not an instant flip. |
| **Result (equals)** | The new result fades+rises in: `opacity 0→1` + `translateY(6px→0)` over `200ms ease-out`. Just enough to register "this updated," not a flourish. |
| **History entry added** | New line slides in from the top edge, `180ms ease-out`, gently pushing older entries. |

Respect `prefers-reduced-motion: reduce` — drop transforms/translates, keep instant state changes (accessibility, not optional).

---

## 8. Accessibility

The known glassmorphism risk is **readability**: text over translucent glass over a colorful gradient can fail contrast. This is the one place the look must not win over usability (`00-domain-lens.md:59`; `01-vision.md:41`; craft floor C3).

- **Contrast (the glass risk):** the display number and button labels must clear **WCAG AA** against the *actual* glass-over-gradient backdrop — not against an assumed solid color. Because the gradient varies, the panel alpha (§3) is tuned so `--text-primary` holds ≥4.5:1 (normal text / the display) and ≥3:1 (large button labels) at the *worst* point of the gradient under the pane. If a spot fails in BUILD, raise the panel alpha (less transparent) before darkening text — readability wins over maximum transparency. Verify with a contrast checker against screenshots, both themes.
- **Focus states (keyboard input is in scope, M2):** every interactive button shows a clearly visible focus ring — **at least** `2px solid var(--accent)` with `2px` offset (the a11y floor; the M2 build ships the locked v3 baseline **`3px` / `3px`**, which exceeds this floor) — never `outline: none` without a replacement. Focus order follows reading order across the keypad. The accent ring is chosen to be visible on both glass themes.
- **Min tap target:** buttons are `≥44×44px` (spec uses 64px, comfortably above the WCAG 2.5.5 floor) so touch and low-precision input land reliably.
- **Semantics:** buttons are real `<button>` elements (keyboard-operable, screen-reader-announced), not styled `<div>`s. The display has an appropriate live-region role so screen readers announce results.
- **Reduced motion:** honor `prefers-reduced-motion` (§7).
- **Don't rely on color alone:** operators are distinguished by glyph + fill, not color only; the error state shows error *text* in the display, not just a red tint.

---

> Anti-inflation guard (CP-13): this is a design *token + treatment* spec for one small calculator — not a multi-brand design system. No component library, no theming engine, no token-pipeline tooling. One typeface, two themes, the glass recipe, done. The gravity is design-craft, and the craft here is *restraint executed precisely* (`00-domain-lens.md:70`).
