---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/02-flows.md
  - storm/specify/04-theming/03-rules.md
  - storm/specify/04-theming/04-ui.md
  - storm/specify/04-theming/05-edge-cases.md
---

# M4 Theming — Acceptance Oracle

> Capstone concern. Single anonymous user (no role matrix). Every criterion is
> **observable** — a tester or automation tool can verify it without reading source
> code. Cite-don't-restate: mechanism lives in the owning concerns; AC here states
> *what a tester sees*, not *how the code achieves it*.

**Total AC count: 29**

---

## User Story

> As a calculator user, I can switch between a light and a dark theme at any time,
> have my choice remembered across visits, and always see the app rendered in the
> correct theme from the very first frame — with no flash of the wrong theme, full
> keyboard accessibility, and legible text in both themes.

---

## AC-F1 — First load, no prior choice (→ `02-flows F1`, `03-rules R-M4-01/R-M4-03/R-M4-04`)

**AC-F1-1 — OS-light → app renders light, no flash.**
Clear `localStorage`. Set OS to light mode. Load the page. Observe: the app
renders in light theme on the very first visible frame. No dark frame is visible
at any point during load.

**AC-F1-2 — OS-dark → app renders dark, no flash.**
Clear `localStorage`. Set OS to dark mode. Load the page. Observe: the app
renders in dark theme on the very first visible frame. No light frame is visible
at any point during load.

**AC-F1-3 — No OS preference → app defaults to dark, no flash.**
Clear `localStorage`. Use a browser / context where `prefers-color-scheme`
returns no preference or `matchMedia` yields `matches === false` for both
queries. Load the page. Observe: the app renders in dark theme from the first
frame. No light frame visible.

**AC-F1-4 — No write to storage on first load.**
Clear `localStorage`. Load the page (OS-light or OS-dark). After the page is
fully rendered, inspect `localStorage`: the theme key (`"calc-theme"`) is
**absent** — nothing was written. (Only an explicit toggle writes storage.)

---

## AC-F2 — Returning user with stored choice (→ `02-flows F2`, `03-rules R-M4-01/R-M4-04`)

**AC-F2-1 — Stored `"light"` overrides OS-dark.**
Set `localStorage["calc-theme"] = "light"`. Set OS to dark mode. Load the
page. Observe: the app renders in light theme from the first frame. Dark theme
is never visible.

**AC-F2-2 — Stored `"dark"` overrides OS-light.**
Set `localStorage["calc-theme"] = "dark"`. Set OS to light mode. Load the
page. Observe: the app renders in dark theme from the first frame. Light theme
is never visible.

**AC-F2-3 — Stored choice applied before paint (no-FOUC, returning user).**
Set `localStorage["calc-theme"] = "light"`. Throttle rendering to expose any
pre-paint flash (e.g. DevTools slow-3G + slow CPU 6× throttle, or a
Playwright screenshot captured as early as possible after navigation). Observe:
the first screenshot shows the light theme — no dark frame captured.

---

## AC-F3 — User toggles theme (→ `02-flows F3`, `03-rules R-M4-02/R-M4-05/R-M4-08`, `04-ui`)

**AC-F3-1 — Click toggles light ↔ dark.**
With app in dark theme: click the toggle button. Observe: app flips to light
theme. `document.documentElement.dataset.theme` equals `"light"`. Click again.
Observe: app flips back to dark. `dataset.theme` equals `"dark"` (or absent).

**AC-F3-2 — Keyboard Enter activates the toggle.**
Focus the toggle button (Tab key). Press Enter. Observe: theme flips (same
outcome as AC-F3-1). Press Enter again. Observe: theme flips back.

**AC-F3-3 — Keyboard Space activates the toggle.**
Focus the toggle button. Press Space. Observe: theme flips. Press Space again.
Observe: theme flips back.

**AC-F3-4 — Toggle is persisted immediately on activation.**
Start in dark theme. Click toggle. Immediately (before any reload) inspect
`localStorage["calc-theme"]`. Observe: value is `"light"`. Click toggle again.
Inspect `localStorage["calc-theme"]`. Observe: value is `"dark"`.

**AC-F3-5 — Stored value survives reload.**
Set app to light via toggle (confirm `localStorage["calc-theme"] === "light"`).
Reload the page. Observe: app renders in light theme (AC-F2-1 path fires on
reload).

**AC-F3-6 — Cross-fade is 300ms (standard motion).**
Toggle the theme with OS `prefers-reduced-motion` NOT set. Observe: the theme
transition takes approximately 300ms — neither instant nor noticeably longer.
Intermediate frames show a blend of old and new token values (text, background).

**AC-F3-7 — Cross-fade is instant under reduced-motion.**
Set OS `prefers-reduced-motion: reduce`. Toggle the theme. Observe: the theme
switch is instant — no visible intermediate animation frames; the new theme
appears in a single frame.

**AC-F3-8 — Light-theme aurora pulse is static under reduced-motion.**
Set OS `prefers-reduced-motion: reduce`. Switch to (or load in) the light theme.
Observe: the aurora background is **static** — no pulsing, shifting, or looping
animation is visible. The aurora gradient itself is still rendered (the visual is
present); only the `auroraShift` animation is not running. Verifiable via DevTools
Animations panel (no active animation on the aurora element) or by capturing two
screenshots 6+ seconds apart and confirming they are pixel-identical in the aurora
region. (→ `03-rules R-M4-08`, `05-edge-cases EC-M4-05`)

**AC-F3-9 — Icon reflects the active theme.**
In dark theme: the toggle shows the moon icon. After toggle to light: the
toggle shows the sun icon. After toggle back to dark: moon again.

**AC-F3-10 — `aria-label` names the action (not the current state), updates on toggle.**
In dark theme: inspect `aria-label` on the toggle button. Value is
`"Switch to light theme"`. Toggle to light. Inspect again. Value is
`"Switch to dark theme"`.

**AC-F3-11 — `aria-pressed` reflects current active state, updates on toggle.**
In dark theme: `aria-pressed === "false"`. Toggle to light. `aria-pressed ===
"true"`. Toggle back to dark. `aria-pressed === "false"`.

---

## AC-F4 — OS-change mid-session (→ `02-flows F4`, `03-rules R-M4-07`)

**AC-F4-1 — No stored choice: app follows live OS change.**
Clear `localStorage`. Load page (OS-dark → app renders dark, no stored choice).
While the page is open, switch OS to light mode. Observe: the app re-renders
in light theme without a reload, with a cross-fade (or instant, if reduced-motion
is set). No user interaction needed.

**AC-F4-2 — Explicit stored choice: OS change is ignored.**
Set `localStorage["calc-theme"] = "dark"`. Load page (renders dark). While the
page is open, switch OS to light mode. Observe: the app remains in dark theme.
The stored explicit choice is sticky and is not overridden by the OS change.

---

## AC-EC — Edge Cases (→ `05-edge-cases`)

**AC-EC-01 — `localStorage` blocked on read: OS-default applied, no error visible.**
Open the page in a context where `localStorage` access throws (e.g. browser
incognito with storage blocked, or a JavaScript override that throws on
`window.localStorage`). Observe: the app loads in the OS-default (or dark)
theme with no console error surfaced to the user and no broken UI. The
calculator is fully functional.

**AC-EC-02 — `localStorage` blocked on write: toggle still works in-memory.**
Same blocked-storage context. Click the toggle. Observe: the theme flips
visually (light ↔ dark). No error is shown. Reload the page. Observe: the
choice is not persisted (back to OS-default). The toggle remained functional
for the session.

**AC-EC-03 — Corrupt stored value → OS-default applied.**
Set `localStorage["calc-theme"]` to a non-valid value (e.g. `"LIGHT"`,
`""`, `"system"`, `"true"`, a JSON blob). Load the page. Observe: the app
resolves as if no stored value exists — falls through to `prefers-color-scheme`
then default dark. The corrupt value is silently ignored; no error visible.

**AC-EC-04 — No `matchMedia` support → default dark.**
Load the page in an environment where `window.matchMedia` is undefined (or
mock it as absent). Observe: the app renders in dark theme (the frozen default,
`03-rules R-M4-03`). No throw. Calculator is functional.

**AC-EC-05 — Rapid toggle spam: final state persisted correctly.**
Click the toggle rapidly 10+ times in 1 second. After the rapid session ends,
observe: `document.documentElement.dataset.theme` matches the theme currently
visible on screen. `localStorage["calc-theme"]` matches both. No stale or
mismatched state.

---

## AC-A11Y — Accessibility (→ `04-ui §2`, `03-rules R-M4-06`)

**AC-A11Y-01 — Toggle is a real `<button>` element.**
Inspect the DOM. The toggle in `.toggle-slot` is a `<button>` element (not
`<div>`, `<span>`, or other non-interactive element).

**AC-A11Y-02 — Toggle is keyboard-reachable via Tab.**
Start at the top of the page. Tab through focusable elements. Observe: the
toggle button receives visible focus before or after the keypad (consistent with
DOM order). It is NOT skipped.

**AC-A11Y-03 — Focus ring is visibly distinct in both themes.**
Tab-focus the toggle button in dark theme. Observe: a visible focus ring (at
least 3px solid, using the accent color) is rendered around the button — clearly
distinguishable from the dark glass background. Toggle to light theme. Tab-focus
again. Observe: focus ring remains visibly distinct against the light glass
surface.

**AC-A11Y-04 — Display text contrast ≥ 4.5:1 in both themes.**
In each theme, screenshot the display area (numeral on scrim). Measure the
contrast ratio of the numeral text colour against the scrim/glass surface at the
worst gradient patch (typically the corner with the brightest aurora bleed).
Observe: contrast ≥ 4.5:1 in dark theme AND ≥ 4.5:1 in light theme.

**AC-A11Y-05 — Large label contrast ≥ 3:1 in both themes.**
In each theme, screenshot the operator and equals buttons. Measure the contrast
ratio of button label text against the button fill (accent key surface). Observe:
contrast ≥ 3:1 in dark theme AND ≥ 3:1 in light theme.

---

## AC-INV — Invariants (→ `03-rules R-M4-02`, `_briefing.md Invariants`)

**AC-INV-01 — M3 history tape is NOT persisted.**
Use the calculator normally (enter calculations, build history). Inspect
`localStorage`. Observe: only the theme key (`"calc-theme"`) is present — no
history entries, no expression strings, no other keys introduced by M4.

**AC-INV-02 — Dark v3 baseline unchanged.**
Load the app with no stored choice and OS-dark (or blocked matchMedia → default
dark). Observe: the dark theme visually matches the shipped v3 Wildcard
aurora-glass baseline (deep aurora `#0a0820`-family base, indigo `#7c5cff`
accents, coral `#ff5e7a` operators). No restyle of dark by M4.

---

## AC-FOUC — No-FOUC comprehensive matrix (→ `03-rules R-M4-04`, `05-edge-cases EC-M4-04`)

> No-FOUC is the hardest-to-catch regression; this matrix ensures every
> stored/OS combination is verified, not just the happy path.

**AC-FOUC-01** — Stored `"light"`, OS-dark: first frame is light. ✓ (covered by AC-F2-1)
**AC-FOUC-02** — Stored `"dark"`, OS-light: first frame is dark. ✓ (covered by AC-F2-2)
**AC-FOUC-03** — No stored, OS-light: first frame is light. ✓ (covered by AC-F1-1)
**AC-FOUC-04** — No stored, OS-dark: first frame is dark. ✓ (covered by AC-F1-2)
**AC-FOUC-05** — No stored, no matchMedia: first frame is dark. ✓ (covered by AC-F1-3)
**AC-FOUC-06** — Corrupt stored value: first frame matches OS-default (not corrupt value). ✓ (covered by AC-EC-03)
**AC-FOUC-07** — Blocked localStorage: first frame matches OS-default. ✓ (covered by AC-EC-01)

*Tester note: FOUC verification is best done with Playwright's earliest-screenshot capture
or DevTools Performance trace (First Paint frame). A human eye on a fast machine may miss
sub-100ms flashes; instrumented capture is preferred.*
