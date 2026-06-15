---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: true
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
  - storm/specify/03-history-tape/02-flows.md
  - storm/specify/03-history-tape/03-rules.md
  - storm/specify/03-history-tape/04-ui.md
  - storm/specify/03-history-tape/05-edge-cases.md
  - storm/structure/02-user-roles.md
---

# M3 Acceptance — History Tape (the AC oracle)

> **What this file is.** The **coverage capstone** for M3: one **User-Story** + an **observable
> acceptance-criteria** block per **role × flow**, written so a REVIEW Playwright browser test (or a
> visual/contrast check) can assert PASS/FAIL **without reading code**. Each criterion is a thing a
> human or a browser can *observe in the running app* — a DOM assertion, a count, a visual check —
> never an implementation detail (no "the predicate evaluates…", no "the listener fires…"; those are
> the *means*, the criteria assert only the *observable outcome*).
>
> **Role coverage.** There is exactly **one** product role — **End-user (anonymous)**
> (`02-user-roles.md`: "one role, four verbs"). The **Builder/owner** is a meta-role with no in-app
> surface, so it contributes **no** acceptance flow. The grid is therefore **1 role × the 6 M3 flows**
> (`02-flows.md`) — every story below is `As an end-user…`.
>
> **Density-at-source.** Stories cite `flow #N` / `HR-NNN` / `HE-NNN` rather than restating the rule;
> the **story + observable criteria are the substance**. The behaviour those IDs define lives in the
> upstream concern files — this file makes it *checkable*.
>
> **Traceability is the gate.** Every M3 flow (`02-flows.md` flows 1–6) has **≥1** acceptance story
> below; the §Coverage matrix proves it (the `_audit.md` opus pass verifies the matrix is complete).

---

## How to read a story

```
US-M3-N — <title>           [covers: flow #N · HR-… · HE-…]
As an end-user, I want <capability> so that <value>.
AC (observable — a REVIEW browser test asserts each):
  G  Given  <starting observable state>
  W  When   <a user/system action a test can drive>
  T  Then   <an observable outcome a test can assert>
```

"Observable" bar (every `Then`): expressible as a Playwright assertion (`expect(locator)…`,
`toHaveCount`, `toBeVisible`, `toHaveText`, `getByRole`), a stored-state read
(`localStorage`/`sessionStorage`/`indexedDB` emptiness), a captured network log, or a **screenshot +
contrast-checker** result. If a `Then` could only be checked by reading source, it is rewritten until
it can be observed.

---

## US-M3-1 — A completed calculation appears on the tape
*[covers: flow #1 record-on-equals · HR-001, HR-002, HR-007, HR-008, HR-009, HR-010 · HE-011, HE-017, HE-018b]*

**As an end-user, I want each calculation I finish to appear as a new entry at the visible edge of the
tape, so that I can glance back at what I just computed without redoing it.**

AC (observable):
- **G** the tape is empty (fresh load, `04-ui §3.1` empty state showing).
- **W** I compute `12 + 3 =` (by **button click** *or* by **keyboard** `1 2 + 3 Enter` — both paths must
  satisfy this story identically, mirroring M2's click≡keyboard equivalence).
- **T1** exactly **one** new tape entry exists — the entry list has `toHaveCount(1)` items (HR-002).
- **T2** the entry's **expression** reads `12 + 3` and its **result** reads `15`; the operator glyph is
  the true Unicode `+` (U+002B), not a substitute (HR-008, HE-017).
- **T3** the new entry sits at the **visible edge** of the panel (newest-at-edge) — it is the entry
  rendered at the top of the visible list, above any prior entry (HR-010).
- **T4** the calculator readout (M2) shows `15` **unchanged** — recording added nothing to and removed
  nothing from M2's display (flow #1 "observe, not intercept"; assert the `.display`/`role="status"`
  text is exactly what M2 alone produces).
- **T5** glyph faithfulness across operators: `7 − 2 =` records expression containing `−` (U+2212, a
  real minus, not hyphen `-`); `6 × 2 =` contains `×` (U+00D7); `8 ÷ 2 =` contains `÷` (U+00F7) (HR-008,
  HE-017).
- **T6** a decimal result renders faithfully: `7 ÷ 2 =` records result `3.5` exactly as the readout
  shows — no reformat (HE-018b).

---

## US-M3-2 — Non-recording equals leave the tape untouched
*[covers: flow #2 non-recording equals · HR-003, HR-004, HR-005 · HE-005, HE-006, HE-007, HE-008, HE-010, HE-020]*

**As an end-user, I want repeated equals, errors, and bare equals to NOT create phantom history, so
that the tape only ever holds calculations I actually completed.**

AC (observable):
- **Repeated `=` (HR-003, HE-007):**
  - **G** the tape is empty.
  - **W** I press `12 + 3 = = =`.
  - **T** the tape has **exactly one** entry (`toHaveCount(1)`), reading `12 + 3` / `15` — not three,
    not two. The second and third `=` add nothing.
- **Error `=` (HR-004, HE-005/HE-006):**
  - **G** the tape is empty.
  - **W** I press `5 ÷ 0 =` (divide-by-zero) — and separately a value that overflows.
  - **T** the tape has **zero** entries (`toHaveCount(0)`); the calculator shows its error sentence
    (M2's "Cannot divide by zero" / "Number too large"), but **no** tape line ever contains an error
    string (assert no entry text matches the error sentence).
- **Bare `=` (HR-005, HE-008):**
  - **G** the tape is empty (fresh load).
  - **W** I press `5 =` (no operator pending), or `=` on first load.
  - **T** the tape has **zero** entries.
- **Typing / digit-after-equals (HE-010, HE-020):**
  - **G** the tape has one entry from `3 + 4 = `.
  - **W** I then type digits `5` (no new equals), or type any number with no equals.
  - **T** the tape **still has one** entry — typing alone never records (`toHaveCount` unchanged).

---

## US-M3-3 — A chained calculation records its final step
*[covers: flow #3 chained calc · HR-006 · HE-009]*

**As an end-user, I want a chained calculation to record the step that actually produced the shown
result, so that the history matches what my immediate-execution calculator computed.**

AC (observable):
- **G** the tape is empty.
- **W** I press `12 + 3 + 4 =`.
- **T1** the tape has **exactly one** entry (`toHaveCount(1)`).
- **T2** that entry's expression reads **`15 + 4`** and its result reads **`19`** — the **final binary
  step**, not the full `12 + 3 + 4` (HR-006, HE-009: standard basic-calculator behaviour; REVIEW treats
  `15 + 4 = 19` as **PASS**, not a defect).
- **T3** the calculator readout shows `19` (consistency between readout and the recorded result).

---

## US-M3-4 — I can scroll a long tape and reach every entry
*[covers: flow #4 view/scroll · HR-010, HR-011, HR-012, HR-013, HR-018, HR-019, HR-020 (a11y in US-M3-8) · HE-014, HE-015, HE-016, HE-028]*

**As an end-user, I want a long history to scroll with nothing lost and the newest always in view, so
that a long session never silently drops a calculation.**

AC (observable):
- **No data loss / no eviction (HR-018, HE-014):**
  - **G** I have recorded **more entries than fit** the panel height (e.g. 30 completed calculations).
  - **W** I look at the panel.
  - **T** the panel is a **scroll region** containing **all 30** entries (`toHaveCount(30)`); the
    **oldest** entry is reachable by scrolling to the far end — none evicted.
- **Newest at the visible edge (HR-010, HE-015):**
  - **G** a populated, scrolled tape.
  - **W** a new equals appends while scrolled.
  - **T** the **new** entry is shown at the visible edge (visible without manual scroll); the view does
    not strand the user on a stale position that hides the latest entry.
- **No layout break (HE-016):**
  - **G** a very tall tape (many entries).
  - **W** rendered.
  - **T** overflow is absorbed by the **panel's own scroll** — the page does not grow, the calculator is
    not pushed off-centre, the `app-layout` does not break (assert calculator slab position stable
    before/after via bounding box).
- **Read-only — no interactivity (HR-011, HR-012, HR-013):**
  - **G** a populated tape.
  - **W** I click / tap a tape entry.
  - **T** **nothing happens** — the calculator readout (`EngineState`-derived display) is **unchanged**
    (no click-to-reuse, HR-012); no entry exposes an editable field (HR-011); **no** export/share/copy
    button exists in the panel (HR-013); entries have **no pointer cursor / no hover-lift** suggesting
    interactivity (`04-ui §5`).

---

## US-M3-5 — AC clears the tape; CE does not
*[covers: flow #5 clear · HR-016, HR-017 · HE-013, HE-018, HE-019, HE-021]*

**As an end-user, I want the All-Clear I already press to also clear my history, while Clear-Entry
leaves history alone, so that I learn no new clear gesture and never lose history to a light escape.**

AC (observable):
- **AC clears (HR-016, HE-018):**
  - **G** a tape with ≥1 entry.
  - **W** I press **AC** (the All-Clear button **or** `Esc`).
  - **T** the tape has **zero** entries (`toHaveCount(0)`) and the **empty state** placeholder
    (`04-ui §3.1`) is shown again; the calculator simultaneously resets to its load state (`0`).
- **CE does NOT clear (HR-017, HE-019):**
  - **G** a tape with (say) 2 entries.
  - **W** I press **CE** (clear-entry).
  - **T** the tape **still has 2** entries (`toHaveCount(2)`, unchanged) — CE touches only M2's current
    entry buffer, never history.
- **AC during an error clears both (HE-021):**
  - **G** the calculator is in a latched error state **and** the tape has entries.
  - **W** I press AC.
  - **T** the readout is a clean `0` (error cleared) **and** the tape is empty — both reset together.
- **Empty re-renders cleanly (HE-013):**
  - **T** after AC, the empty-state panel renders with no stale last entry, no half-cleared row, no
    collapsed/broken box.

> **Clear boundary (OQ-M3-1, `04-ui §5`):** there is **no dedicated "clear history" button** — the only
> clear gesture is the existing AC. A REVIEW check confirms the panel exposes no clear control of its
> own.

---

## US-M3-6 — A reload or new tab starts with an empty tape
*[covers: flow #6 app-load/empty + persistence boundary · HR-014, HR-015 · HE-012]*

**As an end-user, I want history to live only in this tab session, so that the zero-stakes promise — no
data stored, nothing follows me — is literally true.**

AC (observable):
- **Fresh load = empty (HE-012):**
  - **G** I open the app (page mount).
  - **T** the tape is empty (`toHaveCount(0)`); the empty-state panel renders cleanly (no broken box, no
    zero-height collapse).
- **No persistence (HR-014):**
  - **G** I record several entries.
  - **T** browser storage holds **zero** tape data — `localStorage`, `sessionStorage`, `indexedDB`, and
    cookies contain no history entries (assert each store is empty of tape keys); the network log shows
    **no** tape-related request (no save/sync call).
- **Lost on reload / new tab (HR-015):**
  - **G** I record entries, then **reload** the page (or open the app in a **new tab**).
  - **T** the tape is **empty** again (`toHaveCount(0)`) — no prior entry survives the session.

---

## US-M3-7 — Reduced-motion users get an instant, calm tape
*[covers: motion craft floor · F-M3-7 · HR-021 · HE-022, HE-023]*

**As an end-user who has reduced-motion enabled, I want new entries to appear instantly without a
sliding animation, so that the interface respects my motion preference.**

AC (observable):
- **Default motion present (HE-022):**
  - **G** reduced-motion **off**.
  - **W** an entry is recorded.
  - **T** the new line **slides in from the top edge** (`~180ms ease-out` transform observable as a
    transition on the new node); older entries shift down.
- **Reduced-motion drops the slide (HR-021, HE-023):**
  - **G** the browser is emulating `prefers-reduced-motion: reduce`.
  - **W** an entry is recorded.
  - **T** the entry appears **instantly at the visible edge** with **no transform/translate transition**
    on the tape (assert no slide-in transition fires — e.g. computed `transition`/`animation` is none on
    the entry, parallel to M2 UE-044).

---

## US-M3-8 — The tape is accessible: semantic, single-announce, readable, no truncation
*[covers: a11y + long-value craft floor · HR-019, HR-020, HR-022, HR-023 · HE-001..HE-004, HE-026, HE-027, HE-028 · `04-ui §6` (aria-live NOT on tape)]*

**As an end-user relying on a screen reader or low-vision settings, I want the history exposed as a
clean semantic list that doesn't double-announce and never hides digits, so that I can read my history
the same as a sighted user.**

AC (observable):
- **Semantic list (HR-019):**
  - **T** the tape container exposes a **list** role (`getByRole('list')`) and each entry an
    **listitem** role (`getByRole('listitem')` count == entry count) — not a pile of `<div>`s.
- **Exposed, labeled region (HR-020, HE-027):**
  - **G** the tape has content.
  - **T** the tape region is **not** `aria-hidden` (M2's reserved `aria-hidden="true"` is removed once
    populated); the region carries an accessible name ("Calculation history" via `aria-label` or an
    `sr-only` heading) so SR users hear what it is.
- **No double-announce (`04-ui §6`):**
  - **T** the tape is **not** itself a live region — only M2's display carries
    `role="status"`/`aria-live="polite"`. Assert the tape container has **no** `aria-live` attribute, so
    a completed result is announced **once** (by the display), not twice.
- **Contrast over glass (HR-022, HE-026):**
  - **T** in a screenshot of a populated tape, the **result** text (`--text-primary`) and the
    **expression** text (`--text-secondary`) both clear **WCAG AA ≥ 4.5:1** against the glass-over-aurora
    backdrop at its worst point — verified by a contrast checker; the dimmer **expression** is the
    at-risk row to confirm. (Repeat for both token sets once M4 ships; M3 authors token-agnostic.)
- **Long values wrap, never truncate (HR-018 no-data-loss · HE-001..HE-004, `04-ui §4`):**
  - **G** a recorded long value — full-precision `1 ÷ 3 =`, an exponential `…e+30`, a 21-digit operand,
    a long **negative** result.
  - **T** the value is **fully readable** — the expression **wraps**; an unbreakable long number gets a
    per-line right-anchored horizontal scroll (D-M3-EC-01); **no `…`/ellipsis/clip**, the leading `−`
    sign and the `e+NN` exponent stay visible. Assert no entry text is truncated (full string present in
    the DOM and reachable in view).
- **Scroll region keyboard-reachable, no focus trap (HE-028, `04-ui §6`):**
  - **G** the tape overflows.
  - **T** the scroll container is **keyboard-focusable** (conditional `tabindex="0"` when overflowing,
    mirroring M2's REVIEW scroll-region fix) so a keyboard-only user can scroll the whole tape;
    **and** it is **never a focus trap** — Tab moves on past it. When the list fits without scroll, **no**
    permanent tab-stop is added (assert the container is not focusable when it does not overflow).

---

## Coverage matrix — every flow has ≥1 acceptance story (the gate)

| Flow (`02-flows.md`) | Kind | Acceptance story | Key rules / edges asserted |
|---|---|---|---|
| **#1** Record-on-equals | system | **US-M3-1** | HR-001/002/007/008/010, HE-011/017/018b |
| **#2** Non-recording equals | system | **US-M3-2** | HR-003/004/005, HE-005/006/007/008/010/020 |
| **#3** Chained calc | system | **US-M3-3** | HR-006, HE-009 |
| **#4** View / scroll the tape | user | **US-M3-4** | HR-010/011/012/013/018, HE-014/015/016 |
| **#5** Clear the tape (AC; CE not) | user | **US-M3-5** | HR-016/017, HE-013/018/019/021 |
| **#6** App-load / empty | system | **US-M3-6** | HR-014/015, HE-012 |

**Cross-cutting craft-floor stories** (not a single flow — apply across the surface):

| Concern | Acceptance story | Asserts |
|---|---|---|
| Motion / reduced-motion | **US-M3-7** | HR-021, HE-022/023, F-M3-7 |
| Accessibility + long-value no-truncation | **US-M3-8** | HR-019/020/022/023/018, HE-001..004/026/027/028, `04-ui §6` |

**Coverage statement:** all **6** M3 flows have **≥1** acceptance story (US-M3-1..6, one per flow);
US-M3-7 and US-M3-8 cover the cross-cutting motion + a11y + no-data-loss craft floor that the flows
ride on. The single product role (End-user) is fully covered; the Builder/owner meta-role contributes
no in-app flow (`02-user-roles.md`), so the 1-role × 6-flow grid is complete with **no gap**.

---

## What this file does NOT own (ownership map)

| Topic | Owner |
|---|---|
| The recording predicate / derivation **mechanism** | `_briefing.md` (INT-M3-1..4), `06-tech-choices.md` |
| Numbered behaviour **rules** these stories make observable | `03-rules.md` (HR-001..023) |
| The discrete **edge scenarios** | `05-edge-cases.md` (HE-001..028) |
| Step-by-step **flows** | `02-flows.md` (#1..6) |
| Panel pixels / entry layout / empty-state visual / a11y detail | `04-ui.md` |
| `HistoryEntry` shape, append/clear lifecycle, length decision | `01-data-model.md` |
| All arithmetic | M1 (frozen); keypad/readout | M2 (REVIEW-PASS) |

> **Anti-inflation (CP-13 / YAGNI).** Eight stories: six are the flow oracle (one per flow), two are the
> craft-floor oracle (motion, a11y+no-truncation). Every criterion is observable by a browser test or a
> screenshot/contrast check — no story asserts an implementation detail. The single-role model means no
> synthetic role×flow rows were manufactured to look thorough (`02-user-roles.md` anti-inflation guard
> upheld).
