---
storm-depends-on:
  - storm/capture/01-braindump.md
storm-phase: capture
storm-canonical: true
---

# Capture Projection — Calculator

> Regenerated at M4 re-entry (2026-06-15). Source of truth: `01-braindump.md`. Never edit the journal — edit the projection instead.

---

## Part 1 — Line-Anchor Map

| Anchor | Line(s) | Content |
|---|---|---|
| A-01 | 11 | Product: web-based calculator |
| A-02 | 12 | Complexity intentionally simple ("bukan poin utamanya") |
| A-03 | 13 | Real goal: field-test STORM end-to-end on low-risk product |
| A-04 | 14 | Design intent verbatim: "ga bosenin" — non-boring visual is first-class |
| A-05 | 20 | M4 scope provenance: deferred original scope ("4-func + history + theme + kbd"), not scope-creep |
| A-06 | 22 | M4 feature: Light / Dark 2-state toggle |
| A-07 | 23 | M4 default: follow OS via `prefers-color-scheme` on first load |
| A-08 | 24 | M4 persistence: user choice in `localStorage` (single key) |
| A-09 | 25 | M4 placement: `.toggle-slot` reserved in M2 markup |
| A-10 | 26 | M4 deferred: 3rd "System" state explicitly deferred |
| A-11 | 27 | Domain Lens confirmed unchanged; localStorage = documented exception, not domain shift |

---

## Part 2 — Themes

| # | Theme | Anchors |
|---|---|---|
| T1 | **Framework-test vehicle** — the product is a low-risk exercise for STORM end-to-end; product simplicity is deliberate | A-03 |
| T2 | **Design-craft as the one real quality axis** — "ga bosenin" means visual non-boring is load-bearing, not decoration | A-04 |
| T3 | **Intentional simplicity** — don't over-engineer the function set; complexity is explicitly not the point | A-02 |
| T4 | **Original scope, staged execution** — 4-func + history + theme + keyboard; delivered across M1–M4, each deferred item re-entering cleanly | A-05 |
| T5 | **Thin preference persistence** — localStorage for a single theme key; surface-level user experience continuity, not a data model | A-08, A-11 |

---

## Part 3 — Roadmap Ledger

| Idea / Item | Status | Module | Anchors |
|---|---|---|---|
| Web-based calculator (4-function: + − × ÷) | **PROD** | M1 (bundled in M2 BUILD) | A-01, A-02 |
| Non-boring visual design ("ga bosenin") | **PROD** | M2 (glass UI) | A-04 |
| Keyboard input support | **PROD** | M2 | A-05 (original scope "kbd") |
| Calculation history tape | **PROD** | M3 | A-05 (original scope "history") |
| Theme toggle — Light / Dark | **IN SCOPE NOW** | M4 (this re-entry) | A-06, A-07, A-08, A-09 |
| localStorage persistence (theme key) | **IN SCOPE NOW** | M4 | A-08 |
| OS-default first load (`prefers-color-scheme`) | **IN SCOPE NOW** | M4 | A-07 |
| 3rd "System" state for theme toggle | **DEFERRED** | M4+ (re-entry if wanted) | A-10 |

---

## Part 4 — Mechanical Gap-Check

Walking every blank-line/heading-bounded chunk of `01-braindump.md` against Parts 1–3:

| Journal chunk | Anchored? |
|---|---|
| `## Owner input (2026-06-14, …)` — lines 9–14 (A-01..A-04) | Yes — A-01, A-02, A-03, A-04 |
| `## M4 re-entry slice (2026-06-15, …)` — lines 18–27 (A-05..A-11) | Yes — A-05 through A-11 |

**Gap-check result: No gaps.** All heading-bounded journal chunks are fully anchored in Part 1, represented in Part 2 themes, and reflected in Part 3 ledger.
