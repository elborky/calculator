---
storm-depends-on:
  - storm/capture/01-braindump.md
storm-phase: capture
storm-canonical: true
---

# Ideation Coverage Map — Calculator

**Entry mode:** Raw Branch Mode A (passive-listen). No interview Q&A occurred. All content derived from owner's direct input in `01-braindump.md`.

---

## Problem Frame

A web-based calculator app intended as a **low-risk vehicle to field-test the STORM framework end-to-end** — exercising every phase (CAPTURE → SHIP) on a deliberately simple product. The calculator itself is secondary; the framework workout is primary.

---

## Users / Roles

| Role | Source |
|---|---|
| General web user (anyone with a browser) | AI-synthesized default — owner did not specify |
| No login / no accounts needed | AI-synthesized default — owner did not contradict |

---

## Scope Heard (In-Scope)

- **Web-based calculator** — runs in a browser, no install [explicit]
- **Simple in function** — owner explicitly said complexity is not the point [explicit]
- **Visually non-boring design** — visual appeal is a first-class requirement ("ga bosenin") [explicit]
- **Feature-level scope** — owner did NOT enumerate specific operations; defaulting to basic 4-function (+ − × ÷) is the AI-synthesized assumption, flagged as open [AI-synthesized, open for STRUCTURE]

---

## Explicit "NOT in Scope"

- None stated verbatim. Owner implied: don't over-engineer the calculator's function set.

---

## Open Questions / Ambiguities (Flag for STRUCTURE)

1. **Which operations?** Basic 4-function only, or scientific / extended? Owner did not specify.
2. **Keyboard input?** Click-only or keyboard shortcuts too?
3. **Calculation history?** Show past calculations or single-result display?
4. **Memory keys?** M+, M−, MR, MC — in or out?
5. **Decimal / negative number support?** Assumed yes, but unconfirmed.
6. **Error handling display?** Division by zero, overflow — what does the UI show?
7. **Mobile responsive?** Web-based implies yes, but not confirmed.
8. **Design direction?** "Non-boring" is the brief — specific aesthetic (dark/minimal, retro, bold color) unspecified; needs a design conversation in STRUCTURE.
9. **Deployment target?** Not discussed — static hosting (GitHub Pages, Vercel) likely but unconfirmed.

---

## Coverage Confidence

- **What / Why:** high — owner was clear on purpose and design constraint.
- **Who:** medium — implicit single-user, no roles needed, but unconfirmed.
- **Feature scope:** low — deliberately open; STRUCTURE must resolve the operation set and design direction before SPECIFY.

---

## M4 — Theme Toggle (re-entry slice, 2026-06-15)

**Provenance:** Theme was part of the original stated scope ("4-func + history + theme + kbd"). It was deferred post-STRUCTURE (M4 slot reserved). This re-entry executes the deferred item — NOT new scope.

### Scope (in-scope now)

| Item | Detail | Source |
|---|---|---|
| Light / Dark toggle | 2-state only | Owner-confirmed, 2026-06-15 |
| OS default on first load | `prefers-color-scheme` media query | Owner-confirmed |
| localStorage persistence | Single key (e.g. `"theme"`); survives reload | Owner-confirmed |
| Placement | `.toggle-slot` reserved in M2 markup | Structural anchor already in prod |

### Explicit DEFERRED (not built in M4)

| Item | Reason |
|---|---|
| 3rd "System" state (re-follow OS after manual override) | Owner explicitly deferred; re-entry welcome later |

### Domain Lens impact

Lens unchanged: "Solo zero-stakes consumer web utility — design-craft-forward, framework-test vehicle." `localStorage` for one tiny preference key is a documented exception to the no-persistence framing; it does NOT shift the domain's stakes, hat profile, or compliance posture. Data-architect and security hats remain suppressed per original anti-inflation guard (§4).
