---
storm-phase: specify
storm-module: 04-theming
storm-canonical: true
storm-depends-on:
  - storm/specify/04-theming/_briefing.md
  - storm/structure/08-design-system.md
---

# M4 Theming — Data Model

> The "data model" for M4 is intentionally trivial: **one** persisted value. This file
> documents that single entity, what does NOT persist, and the runtime source of truth.
> Resolution precedence + corrupt-value handling are owned by `03-rules` / `05-edge-cases`
> (cited, not restated here).

## 1. The one persisted entity — theme preference

| Property | Value |
|---|---|
| **Storage** | Browser `localStorage` (same-device, same-origin, same-browser) |
| **Key** | `calc-theme` |
| **Value domain** | the string literal `"light"` \| `"dark"` — nothing else is valid |
| **Cardinality** | exactly one key, one string value; no nesting, no JSON, no schema |
| **Written** | on theme toggle — the toggle handler writes the newly-resolved theme |
| **Read** | once, on first load, by the no-FOUC head script (briefing seam, `03-rules`) |
| **Scope** | per-browser, per-device — does NOT sync across devices or browsers |

This is the **single documented persistence exception** for the whole product
(`storm/structure/00-domain-lens.md §4a`; briefing scope note). It exists so a returning
visitor sees their chosen theme, not a re-prompt.

## 2. What does NOT persist (invariant)

**Only** `calc-theme` persists. Explicitly out:

- **M3 history tape stays ephemeral** — the in-memory unbounded array is cleared on reload by
  design (briefing "Invariants to NOT break"). M4 introduces no history persistence.
- No calculator state, last result, expression, or UI layout is stored.
- No cookies, no IndexedDB, no sessionStorage — `localStorage` `calc-theme` is the entire
  durable surface.

Any future persistence is a separate module decision, never an M4 side effect.

## 3. Runtime state — the source of truth

At runtime the **resolved theme lives on the DOM**, not in a JS variable:

- **Single source of truth:** the `data-theme` attribute on `document.documentElement`
  (`<html data-theme="light">` / `<html data-theme="dark">`). CSS keys the token override off
  this attribute (`[data-theme="light"]` block overriding the `:root` dark default — see `06-tech-choices`).
- **`localStorage` is the durable mirror**, not the live state: it is written *from* the DOM
  attribute on toggle and read *into* it on load. The DOM attribute is authoritative within a
  session; `localStorage` only carries the choice across sessions.
- No separate in-memory theme object or store is introduced — reading
  `document.documentElement.dataset.theme` is the read path; setting it is the write path. Zero
  new dependency (vanilla DOM + `localStorage`).

### Resolution at first load (3-state note)

The stored value is one input among three; full precedence is owned by `03-rules`:

```
calc-theme present & valid ("light"|"dark")  →  use it
   else  prefers-color-scheme: light/dark    →  follow OS
   else                                      →  default "dark" (shipped v3 baseline)
```

(A single-key store does not warrant an `erDiagram`; the 3-state note above is the whole shape.)

## 4. Validation — corrupt / unexpected stored value

The store is a free-form string slot — a stale build, a manual edit, or a hostile value could
leave something that is **not** in `{"light","dark"}`. Rule:

- **Any read value not strictly equal to `"light"` or `"dark"` is treated as absent** — the
  resolver ignores it and falls through to `prefers-color-scheme`, then to default dark.
- **Blocked / throwing `localStorage`** (private mode, storage disabled) is likewise treated as
  "no stored preference" — read/write wrapped so a thrown access never breaks load; the app runs
  on OS-default with no persistence that session.

Handling detail (the wrapper, the no-FOUC ordering, the throw-safety) is specified in
`05-edge-cases`; this file only fixes the **validation contract**: the value domain is closed to
exactly two literals, and everything outside it degrades silently to OS-default.
