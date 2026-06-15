---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/_briefing.md
---

# M4 Theming — 02 Flows

User flows for the light/dark theme toggle. Single anonymous user, no roles, no
auth. Every flow operates on the **one persisted key** (`localStorage`
`"calc-theme"`, value `"light" | "dark"` — `_briefing.md` Technical seam) and the
swap mechanism (`document.documentElement.dataset.theme`, dark = `:root` default).

The full **resolution precedence algorithm** (stored → `prefers-color-scheme` →
default dark) is canonically owned by **`03-rules.md`** — flows below reference it,
they do not restate it. Failure / corrupt-storage / blocked-storage handling is
owned by **`05-edge-cases.md`**.

---

## F1 — First load, no prior choice

The visitor has never toggled (no valid stored value).

1. Page opens.
2. **Before first paint**, the inline head script resolves the theme via the
   `03-rules` precedence: no valid stored value → fall to `prefers-color-scheme`
   (via `matchMedia`) → if neither, default **dark**.
3. Resolved theme is applied (`data-theme` set on `<html>`) **before the CSS-heavy
   render** — no flash of the wrong theme (no-FOUC, `_briefing.md` Technical seam;
   acceptance owned by `05-edge-cases`).
4. App renders in the resolved theme.

- **No write on F1.** A resolved-from-OS (or defaulted) theme is NOT persisted —
  only an explicit user toggle writes (see F3). This keeps "follow my OS" the live
  behaviour until the user expresses a choice (precedence detail → `03-rules`;
  interacts with F4).

## F2 — First load, returning user with stored choice

The visitor has a valid stored value from a prior session.

1. Page opens.
2. Before first paint, the head script reads the stored value; it is present and
   valid → **apply it, overriding the OS preference** (stored wins over
   `prefers-color-scheme` per `03-rules` precedence).
3. `data-theme` set before render → no-FOUC.
4. App renders in the stored theme.

- Distinguished from F1 only by the presence of a valid stored value. An invalid /
  corrupt / unparseable stored value does NOT take this path — it falls back to the
  F1 OS-then-dark resolution (`05-edge-cases` owns the corrupt-value handling).

## F3 — User toggles theme

The active flow that creates / changes the persisted preference.

1. User activates the toggle in `.toggle-slot` (`_briefing.md` CF-2) — **by click
   OR by keyboard** (see Toggle parity below).
2. Theme flips **light ↔ dark** (`data-theme` swapped on `<html>`).
3. The token-set change cross-fades over **300ms** (`08-design-system.md §7`,
   `_briefing.md` CF-5). **Honour `prefers-reduced-motion`**: when the user has
   reduced-motion set, the swap is instant (no cross-fade) — same discipline as the
   rest of the app.
4. The new value (`"light"` or `"dark"`) is **written to `localStorage`
   immediately** on toggle — the choice survives reload (feeds F2 next session) and
   from this point overrides the OS preference.

- After F3, the user has an **explicit stored choice**; this is what F4 keys off to
  decide whether to keep following the OS.
- Blocked / failing storage at write time → `05-edge-cases` (toggle must still flip
  the visual theme for the session even if the write fails; it just won't persist).

## F4 — OS theme changes while the app is open (optional / nice-to-have)

Whether a live `matchMedia` change listener re-themes the open app.

- **Recommended behaviour (precedence detail — `03-rules` owns the final call):**
  - If the user has an **explicit stored choice** (set via F3) → **ignore** live OS
    changes. The user's choice is authoritative; do not yank it out from under them.
  - If the user has **no explicit choice** (the F1 "following OS" state) → you **MAY**
    follow live OS changes: attach a `matchMedia('(prefers-color-scheme: dark)')`
    `change` listener that updates `data-theme` (respecting reduced-motion as in F3).
- **Keep it simple.** This is the only flow tagged optional. If `03-rules` decides
  to skip the live listener entirely, F1/F2/F3 still fully satisfy the module scope;
  F4 only affects the app *while already open*, not on next load (which F1/F2 cover).
- Flagged as a `03-rules` precedence detail: the "explicit choice vs following-OS"
  distinction is the same state that governs the F1 no-write rule.

---

## Toggle interaction parity (a11y)

The toggle in `.toggle-slot` MUST be operable with **full click + keyboard parity**
— the calculator's established a11y discipline (`04-ui.md` owns the toggle's control
type, focus ring, label, and `aria` state; this flow only asserts the parity
requirement):

- **Click** and **keyboard activation** (Enter / Space on a focusable control, or
  the native behaviour of whatever control type `04-ui` specs) produce the identical
  F3 flip-and-persist.
- The control is keyboard-focusable and exposes its current state to assistive tech
  (exact roles / `aria` → `04-ui`).
- Reduced-motion is honoured on toggle regardless of input modality (F3 step 3).

---

## Cross-references

- **`03-rules.md`** — canonical resolution precedence (stored → OS → dark);
  explicit-choice-vs-following-OS state; F4 final call.
- **`05-edge-cases.md`** — no-FOUC verification; corrupt / unparseable / blocked
  `localStorage`; write-failure fallback.
- **`04-ui.md`** — toggle control type, label, focus, `aria` state (a11y source).
- **`_briefing.md`** — CF-2 (`.toggle-slot`), CF-5 (300ms cross-fade + reduced-motion),
  TD-1 (light direction), Technical seam (key name, swap mechanism, no-FOUC).
