---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/capture/01-braindump.md
  - storm/capture/03-ideation-coverage.md
storm-phase: structure
storm-canonical: true
---

# Vision — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.

---

## One-line vision

A genuinely pleasant, no-fuss web calculator that does the basics flawlessly and never looks boring — built as the vehicle to run STORM end-to-end.

---

## Problem / why this exists

Two honest reasons, held together without inflating either:

1. **Framework field-test (the real driver).** The primary purpose is to exercise STORM through every phase — CAPTURE → STRUCTURE → SPECIFY → BUILD → REVIEW → SHIP — on a small, low-risk product. The calculator is the *workout*, not the destination. A trivial product is the *right* choice here: low stakes mean the framework gets tested without product risk masking process friction (`00-domain-lens.md:17,19`; `03-ideation-coverage.md:16`).

2. **A simple tool that's actually nice to use (the genuine product axis).** Most basic web calculators are functional and forgettable. The one real quality bar here is design: "simple aja, tapi secara design ga bosenin" — simple in function, but the visual design must not be boring or generic (`01-braindump.md:14`). The product earns its keep on *feel*, not feature count.

This is a zero-stakes consumer utility: no account, no login, no stored data, no compliance surface, single general web user (`00-domain-lens.md:31,66`). We do not pretend otherwise.

---

## Success criteria (what "done well" looks like)

Done well is measured on **craft + a clean STORM run**, NOT on feature richness:

- **Design is non-boring and intentional.** The visual identity reads as deliberate, not template default — a real reaction of "oh, that's nice" on first open. This is the single first-class product outcome (`00-domain-lens.md:57`).
- **The basics are flawless.** Add, subtract, multiply, divide, decimal, clear/AC, equals — all correct, including edge cases (divide-by-zero, overflow) handled gracefully in the UI (`03-ideation-coverage.md:51`).
- **The three chosen quality-of-life features land cleanly.** History tape, light/dark theme toggle, and keyboard input each work well and feel native to the design — not bolted on.
- **Usable, not just pretty.** Keyboard operability, focus order, and contrast hold even at zero stakes — non-boring must not trade away usable (`00-domain-lens.md:59`).
- **STORM ran end-to-end, legibly.** Every phase was exercised, artifacts are coherent and traceable, and the run surfaced real signal about the framework. A clean process record is itself a deliverable.

---

## Explicit non-goals

The simplicity **is** the point — guarding it is part of the vision, not a limitation to apologize for:

- **No memory keys** (M+, M−, MR, MC) — explicitly out (`00-domain-lens.md`; owner pre-approved scope).
- **No scientific / extended functions** (trig, powers, roots, parentheses) — out.
- **No percent or ± (sign-toggle)** — out.
- **No accounts, login, persistence, or backend** — client-side only, no data model (`00-domain-lens.md:66,67`).
- **No feature bloat of any kind.** If a feature does not serve "simple + non-boring," it does not belong. Feature creep is the failure mode this product is most exposed to, precisely because it's easy to add "just one more button." The product strategist hat here is the brake, not the engine (`00-domain-lens.md:60`).

> Anti-inflation guard (CP-13 over-engineering dim): resist reflexively summoning security/data/compliance concerns or extra capability. The domain's gravity is design-craft + framework-exercise — nothing heavier (`00-domain-lens.md:70`).
