---
storm-depends-on:
  - storm/capture/01-braindump.md
  - storm/capture/03-ideation-coverage.md
storm-phase: structure
storm-canonical: true
---

# Domain Lens — Calculator

> Drafted at the CAPTURE→STRUCTURE seam (W-G22). Canonical cross-phase artifact: it frames every downstream phase (STRUCTURE → SPECIFY → BUILD → REVIEW → SHIP). The role-flip ceremony (CAPTURE human-led → STRUCTURE AI-led) opens here.

---

## 1. Inferred Domain Lens

**Solo zero-stakes consumer web utility — design-craft-forward, framework-test vehicle.**

In one breath: the *product* is a trivial, no-account, no-data, no-compliance browser calculator; the *one genuine quality axis* is visual design ("ga bosenin"); the *real purpose* is exercising STORM end-to-end. Frame every downstream decision as "lowest-stakes utility that still earns a strong visual-craft bar" — not as a feature-rich calculator and not as a throwaway.

---

## 2. Evidence (cited from upstream artifacts)

| # | Evidence | Source cite |
|---|---|---|
| E1 | Product is a "web-based calculator" — runs in a browser, no install | `01-braindump.md:12`; `03-ideation-coverage.md:31` |
| E2 | "intentionally simple — bukan poin utamanya" — complexity is explicitly *not* the point | `01-braindump.md:12`; `03-ideation-coverage.md:32` |
| E3 | Real goal: "field-test the STORM framework end-to-end — exercise every phase (CAPTURE → SHIP) on a small, low-risk product" | `01-braindump.md:13`; `03-ideation-coverage.md:16` |
| E4 | Design intent verbatim: "calculator app yang simple aja, tapi secara design ga bosenin" — visual must NOT be boring/generic; visual appeal is a first-class requirement | `01-braindump.md:14`; `03-ideation-coverage.md:33` |
| E5 | No login / no accounts needed; single general web user, no roles | `03-ideation-coverage.md:23-26` |
| E6 | No "NOT in scope" stated; owner implied "don't over-engineer the function set" | `03-ideation-coverage.md:40` |
| E7 | Feature set deliberately open (4-function vs scientific, history, memory keys all unresolved) — STRUCTURE must converge before SPECIFY | `03-ideation-coverage.md:34,46-53,62` |

---

## 3. Explicit-from-human vs AI-synthesized

| Evidence | Provenance |
|---|---|
| E1 — web-based calculator | **Explicit-from-human** (`01-braindump.md:12`) |
| E2 — intentionally simple, not the point | **Explicit-from-human** (`01-braindump.md:12`) |
| E3 — real goal is framework field-test | **Explicit-from-human** (`01-braindump.md:13`) |
| E4 — "ga bosenin" / non-boring visual is first-class | **Explicit-from-human** (`01-braindump.md:14`) |
| E5 — no login, single general user, no roles | **AI-synthesized** default — owner did not specify; not contradicted (`03-ideation-coverage.md:24-26`) |
| E6 — "don't over-engineer" intent | **AI-synthesized** inference from E2 — owner did not state it verbatim (`03-ideation-coverage.md:40`) |
| E7 — feature set open, converge in STRUCTURE | **AI-synthesized** framing — owner enumerated no operations (`03-ideation-coverage.md:34`) |

**Lens-level synthesis claim:** the one-line Lens itself (§1) is **AI-synthesized** — it composes the four explicit human anchors (E1–E4) into a single framing. The human said the parts; the *framing* ("design-craft-forward, framework-test vehicle") is AI's. Owner confirms comprehension, not wording.

---

## 4. Hat-switch implications (CP-2)

### Hats this domain WILL call on

- **UX designer** — the primary working hat. "Ga bosenin" (E4) is the one real product axis; layout, interaction feel, button affordance, motion all live here.
- **Frontend craft** — visual polish *is* the deliverable. CSS/animation/typography quality is load-bearing, not decoration (E4).
- **Accessibility specialist** — a public web utility still owes keyboard operability, focus order, contrast, and semantics. The craft floor (C3) holds even at zero stakes; "non-boring" must not trade away usable.
- **Product strategist** — *light* touch only, to keep the open feature set (E7) from creeping past "simple" (E2). The brake, not the engine.
- **QA** — REVIEW-phase correctness of arithmetic + edge cases (div-by-zero, overflow — `03-ideation-coverage.md:51`); modest surface.
- **DevOps** — minimal: static hosting at SHIP (`03-ideation-coverage.md:54`). One small decision, not an architecture.

### Hats this domain will NOT lean on (low-stakes, deliberately)

- **Security expert** — no auth, no accounts, no PII, no server-side data (E5). Beyond baseline web hygiene (no injection in display, safe expression eval), there is **no security-heavy emphasis**. Client-side-only utility.
- **Data architect** — **not relevant.** No persistence, no DB, no schema. Calculation history (if chosen, `03-ideation-coverage.md:48`) is at most ephemeral in-memory state, not a data model.
- **Compliance** — **not relevant.** No regulated data, no consent surface, no audit obligation.

> Anti-inflation guard: do NOT summon security/data/compliance hats out of reflex. Pulling them in here is theater (CP-7 / CP-13 over-engineering dim). The domain's gravity is **design-craft + framework-exercise**, nothing heavier.

---

## 5. Re-validation triggers (L3-01)

Re-check this Domain Lens at each of these points; narrate the re-check per CP-4:

- **(a) Each SPECIFY entry** — before specifying any module, confirm the Lens still holds (still design-craft-forward, still zero-stakes). If the chosen feature set (E7) resolved toward scientific/history/memory, re-confirm that did not silently shift the domain's stakes or hat profile.
- **(b) REVIEW scope drift** — if REVIEW surfaces feedback that pushes beyond "simple non-boring calculator" (e.g. requests for accounts, persistence, sharing), the Lens is drifting — re-validate before absorbing the change; likely a CAPTURE re-entry (revolving door) rather than a quiet scope grab.
- **(c) Post-loop-back from CAPTURE** — any re-entry into CAPTURE (new slice via the lock-on-exit / free-on-entry door) re-runs the role-flip ceremony and **re-validates the Lens against the journal delta**; the lifelong journal can drift the domain framing.

> The Lens is durable but not frozen. These three checkpoints are the only sanctioned re-derivation points — do not re-infer the Lens every turn (context tax, CP-14).
