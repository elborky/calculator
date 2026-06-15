---
storm-phase: ship
storm-canonical: true
storm-depends-on:
  - storm/structure/07-deployment-target.md
  - storm/ship/01-security-audit.md
  - storm/ship/02-qa-report.md
---

# Smoke-Test Plan — Calculator @ `https://<CALCULATOR-DOMAIN>`

> **Human-led** post-deploy verification of the live production build (M1 engine + M2 UI + M3 history
> tape — one static NGINX bundle on self-hosted Dokploy, HTTPS via Traefik + Let's Encrypt).
>
> **You drive. The AI assists on request** (screenshot, curl probe, log tail) but does NOT run the test
> for you (Verification Boundary — SHIP smoke is human-led). Work each flow against the live URL, mark
> `PASS` / `FAIL` inline per flow.
>
> **`<CALCULATOR-DOMAIN>`** is the custom domain you point at the Dokploy app at deploy time
> (`07-deployment-target.md` — owner picked custom-domain for auto-HTTPS). Substitute it everywhere
> below before you start.
>
> **Why this plan is not just "the tests passed."** The static gates (`tsc` / `vitest` / `vite build`)
> are all green — but the QA report (`02-qa-report.md §5`) records that those gates were demonstrably
> **NOT sufficient alone**: during M3 BUILD a startup-crash (missing history-tape skeleton in
> `index.html`) slipped past green tsc/tests/build and was caught **only** by a live Chrome smoke. This
> plan is that live Chrome smoke, now run against the **real deployed NGINX env on a real GPU** — the
> first and only place the glass `backdrop-filter` blur and over-glass contrast are confirmed for real
> (the headless-Playwright `backdrop-filter: none` was dismissed as a software-renderer artifact in
> REVIEW M3 / QA P2-C — **production smoke is where it actually gets confirmed**).

---

## Pre-checks

Do these first. If any pre-check fails, stop — the deploy is not healthy enough to smoke-test.

- [ ] **App reachable over HTTPS:** open `https://<CALCULATOR-DOMAIN>` in a desktop browser (real Chrome
      preferred — real GPU for the glass check below). The page loads, does not time out, does not show
      an NGINX/Traefik error page.
- [ ] **Valid TLS certificate:** the address bar shows the **padlock** (not "Not secure", no cert
      warning). Click the padlock → certificate is valid, issued by **Let's Encrypt**, for
      `<CALCULATOR-DOMAIN>`, not expired. *(Red flag: served over plain `http://` or a cert warning →
      the Let's Encrypt / Traefik TLS step is not live; do NOT proceed — see `01-security-audit.md F-6`.)*
- [ ] **No console errors on load:** open DevTools → Console (F12). On a fresh page load there are
      **zero red errors** (the startup-crash class of bug — `02-qa-report.md §5` — surfaces here). A
      missing-asset 404 or an uncaught exception is a hard stop.
- [ ] **The app actually rendered (live-load check):** you can see the **calculator keypad** (15 keys:
      `AC CE ÷ ×` / `7 8 9 −` / `4 5 6 +` / `1 2 3 =` / `0 .`) **and** the **history panel** showing the
      empty-state text **"No calculations yet"**. *(Both surfaces must paint — the M3 skeleton crash
      manifested as the tape area missing, which green gates did not catch.)*

---

## Critical Flow 1: App loads with glass blur on real GPU

**Why this matters:** This is the load-correctness + visual-craft check that the static gates cannot
make. The product's single first-class quality is "simple but not visually boring" — the glassmorphism
blur is the core of that, and it is **only verifiable on a real GPU in the real browser** (headless
Playwright reported `backdrop-filter: none`, dismissed as an artifact — this flow is where the dismissal
is either confirmed or overturned). If the page renders but the blur is absent or contrast is unreadable,
the ship is visually broken even though every test passed.

**Steps:**
1. With `https://<CALCULATOR-DOMAIN>` open (from Pre-checks), look at the calculator body and the history
   panel.
2. Confirm the **frosted-glass blur** is visibly present — the panels are translucent and the
   background/aurora behind them is **softened/blurred**, not sharp-through and not a flat opaque block.
3. Read the big display readout (`0`) and the keypad labels — text is **crisply legible** against the
   glass at the worst point of the background gradient.
4. *(Optional, AI can assist)* In DevTools → Elements, inspect the calculator body element's computed
   style → `backdrop-filter` shows a real `blur(...)` value (not `none`).

**Expected:** Glass panels show a real blur of the backdrop; the readout and all key labels are sharply
readable (display contrast is built to clear WCAG AA, ~17:1 on the scrim). The UI matches the picked
glass look, not a flat fallback.

**Red flags:** Panels look flat/opaque with no blur (and no aurora softening) on a GPU browser → the
glass effect is not rendering in prod. Display or labels washed out / hard to read against the gradient →
contrast regression. Page renders but a panel is missing → a load/asset failure.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Critical Flow 2: Core arithmetic (click AND keyboard)

**Why this matters:** This is the product's entire reason to exist — it must compute correctly, and it
must do so identically whether the user clicks or types (click ≡ keyboard is a core M2 guarantee). If
arithmetic is wrong or one input path is dead in prod, nothing else matters.

**Steps:**
1. **By click:** click `1`, `2`, `+`, `3`, `=`.
2. Read the display.
3. Clear: click `AC`.
4. **By keyboard:** with the page focused, press `1` `2` `+` `3` `Enter` on the physical keyboard.
5. Read the display.

**Expected:** Both paths show **`15`** in the readout. While entering `12 + 3` the secondary pending line
shows `12 +` (true `+` glyph) above the big number; after `=` the pending line clears and `15` is shown.

**Red flags:** Result is anything other than `15`; the keyboard path does nothing (dead listener); the
subtract/operator glyphs render as ASCII `- x /` instead of `− × ÷`; pressing `/` triggers the browser's
quick-find bar.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Critical Flow 3: History records a completed calculation (newest on top, no dup)

**Why this matters:** The history tape is the second full feature module (M3). It must record **only**
genuine completed calculations, put the **newest at the top**, and **not duplicate** on a repeated `=`.
This is the live confirmation of the in-memory recording seam working end-to-end in prod.

**Steps:**
1. Start fresh: click `AC` (history panel shows "No calculations yet").
2. Click `1` `2` `+` `3` `=`.
3. Look at the history panel.
4. Press `=` **again** (repeat equals) and look at the history panel again.
5. Do a second calculation: click `5` `×` `4` `=`.
6. Look at the history panel ordering.

**Expected:**
- After step 2: **one** entry appears — `12 + 3 = 15` as a single-line row.
- After step 4 (repeat `=`): **still only one** entry — no duplicate `12 + 3 = 15` row added.
- After step 5: **two** entries, with the newest (`5 × 4 = 20`) at the **top edge** and `12 + 3 = 15`
  below it. Glyphs are true Unicode (`×`, not `x`).

**Red flags:** No entry recorded after a genuine `=`; a duplicate row appears on the repeated `=`; newest
entry appears at the bottom instead of the top; ASCII glyphs in the tape.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Critical Flow 4: Error handling — divide by zero (no tape entry)

**Why this matters:** Graceful error handling is an explicit promise (no `Infinity`/`NaN` leaking to the
user), and an **errored calculation must NOT be recorded** in the history. This confirms both the engine
error latch and the recording predicate's error-exclusion in the live build.

**Steps:**
1. Click `AC` to start clean.
2. Click `5` `÷` `0` `=`.
3. Read the display.
4. Look at the history panel.
5. Click `CE` (or `AC`) to confirm you can escape the error and keep using the calculator.

**Expected:** Display shows the sentence **"Cannot divide by zero"** (full words, not a raw code, not
`Infinity`/`NaN`). The **history panel does NOT add an entry** for this — no `5 ÷ 0 = …` row appears. CE
or AC clears the error and the calculator is usable again.

**Red flags:** Display shows `Infinity`, `NaN`, blank, or a raw tag instead of the sentence; an error row
gets added to the history; the calculator is stuck in the error state and CE/AC don't escape it.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Critical Flow 5: Clear semantics — AC clears tape, CE does not

**Why this matters:** AC (all-clear) and CE (clear-entry) are intentionally different: AC is a full reset
**including emptying the history tape**, while CE only clears the current entry and **leaves the tape
intact**. Getting this wrong (e.g. CE wiping history, or AC leaving stale entries) is a real
data-visibility bug for the user.

**Steps:**
1. Click `AC`, then do `7` `+` `1` `=` so the tape has one entry (`7 + 1 = 8`).
2. Start typing a new number: click `9` `9`.
3. Click **`CE`**. Observe the readout **and** the history panel.
4. Now click **`AC`**. Observe the readout **and** the history panel.
5. *(Keyboard parity)* Do `2` `+` `2` `=` again (tape has one entry), then press **`Escape`**.

**Expected:**
- After `CE` (step 3): the readout resets to `0`, but the history panel **still shows** `7 + 1 = 8` — the
  tape is preserved.
- After `AC` (step 4): the readout is `0` **and** the history panel is **empty** again ("No calculations
  yet").
- After `Escape` (step 5): same as AC — readout `0` and tape **empty** (Esc ≡ AC).

**Red flags:** CE empties the history tape; AC leaves stale history entries; Escape does not behave like
AC.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Critical Flow 6: History overflow — panel scrolls (not the page) + keyboard reach

**Why this matters:** This is the **in-REVIEW P1 fix** (`02-qa-report.md §2`) — before the fix, a long
history grew the whole page height instead of scrolling inside its own panel, and the overflowing tape
was not keyboard-reachable. This flow confirms the height-bounded scroll panel and the conditional
keyboard focusability hold **in the real deployed build**, not just in the test env.

**Steps:**
1. Click `AC`. Then record **~30 calculations** quickly — e.g. repeat `1` `+` `1` `=` `AC`-not-needed:
   simplest is press `1` `+` `1` `=`, then `+` `1` `=`, `+` `1` `=` … keep pressing `+` `1` `=` ~30 times
   (each genuine `=` adds a row). Aim for clearly more entries than fit in the panel.
2. Observe the **page** — does the whole page get taller and scroll, or does only the history panel
   scroll?
3. Look at the top of the history panel — is the **newest** entry visible at the top edge without
   scrolling?
4. Click into / focus the history panel, then use the keyboard (`Tab` to it if needed, then arrow
   keys / `Page Down`) to scroll **within the panel**.

**Expected:** The **history panel scrolls internally** (its own scrollbar); the overall **page does not
grow tall / does not page-scroll** to accommodate the tape. The newest entry sits at the top edge. When
the tape overflows, the panel is **keyboard-focusable and scrollable** (it becomes a tab stop only while
overflowing).

**Red flags:** The whole page grows and you have to scroll the page to see all history; the panel has no
internal scroll; the overflowing tape cannot be scrolled by keyboard.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Critical Flow 7: No persistence — reload empties the tape

**Why this matters:** The zero-stakes promise is that **nothing is stored** — history is in-memory only
and dies with the tab (no localStorage, no backend, no cookies). A reload must come back to a clean,
empty calculator. This also independently confirms the no-storage / no-network posture from
`01-security-audit.md` (F-5).

**Steps:**
1. Do at least one calculation so the history has entries (e.g. `8` `+` `8` `=`).
2. Confirm the entry shows in the history panel.
3. **Reload the page** (browser refresh / `F5` / `Cmd-R`).
4. Look at the history panel after reload.

**Expected:** After reload the calculator is back to fresh state — readout `0` and history panel showing
**"No calculations yet"** (the prior entries are **gone**, as intended).

**Red flags:** History entries survive a reload (would mean something is persisting that should not be);
the page errors on reload.

**Result:** [ ] PASS   [ ] FAIL — notes:

---

## Edge cases to spot-check

Quick, optional checks once the 7 flows pass — not blocking on their own, but worth a glance:

- **Security headers present (owner-config, `01-security-audit.md F-7`):** in DevTools → Network → click
  the document request for `<CALCULATOR-DOMAIN>` → Response Headers. Confirm the headers the owner added
  on the NGINX/Traefik serve are present: **`Content-Security-Policy`**, **`X-Content-Type-Options:
  nosniff`**, **`X-Frame-Options: DENY`**. *(P2 hardening — if not yet added, this is a known watch-item,
  not a ship-blocker; the app is XSS-safe by construction. Add HSTS only after HTTPS is confirmed.)*
- **Long number doesn't truncate:** compute `1` `÷` `3` `=` — the long decimal result shrinks-to-fit /
  scrolls in the readout and is **not clipped with `…`**; the same value, once it lands in history,
  wraps/scrolls rather than being cut off.
- **Reduced-motion respected:** if your OS has "reduce motion" on, new history entries appear **instantly**
  (no slide-in animation) and the equals result doesn't animate — but the app is fully functional.
- **Mobile width:** open `https://<CALCULATOR-DOMAIN>` on a phone (or DevTools device mode ~360px). All
  15 keys are visible and tappable, no horizontal page scroll, the history panel reflows sensibly.
- **Theme look:** if a theme/appearance affordance is visible, the readout and labels stay readable in
  both light and dark over the glass.

---

## Failure handling

- **On any FAIL:** capture a **screenshot** of the screen and note **which step** failed and what you saw
  vs. what was expected. Also grab the **DevTools Console** output (any red errors) and, for load/asset
  failures, the **Network** tab.
- **Paste it back to the AI.** The AI investigates from the evidence (it can take a screenshot, run a
  `curl -I https://<CALCULATOR-DOMAIN>` header probe, or tail the Dokploy/NGINX logs on request) — but it
  does **not** drive the test session; you do.
- **Rollback decision is held with you.** If a critical flow fails in prod, the AI proposes the rollback
  vs. fix-forward options (with tradeoffs) and **you pick** — no automatic rollback.
- **Acceptance:** **all 7 critical flows PASS** = production deploy verified. The AI re-reads this file to
  confirm your inline marks before firing the SHIP-exit commit.
