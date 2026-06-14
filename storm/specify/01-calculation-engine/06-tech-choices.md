---
storm-phase: specify
storm-module: 01-calculation-engine
storm-canonical: true
storm-depends-on:
  - storm/specify/01-calculation-engine/_briefing.md
  - storm/structure/07-deployment-target.md
---

# Tech Choices — M1 Calculation Engine

> CP-6 verification-gate file. Every library named below carries a live-tool verification cite
> (Context7 primary, npm-registry / WebFetch cross-check, time-anchored to June 2026). A name
> without a cite is an invalid proposal — none appear here uncited.
>
> Scope reminder (`_briefing.md`): M1 is the **pure, headless arithmetic core** — no DOM, no styling,
> no event listeners (F11 client-side-only, F8 no-persistence). These choices cover the *logic engine*
> only. The app bundler is M2's concern; M1 just needs to be importable and testable (see §4).

---

## Summary of picks

| Concern | Pick | One-line why |
|---|---|---|
| **Language** | **TypeScript 6.0.3** | Type-safety on the operand/operator state machine (F7); AI owns all code forever, types are the cheap guardrail. Compiles to plain JS — no runtime, fits the static target. |
| **Number representation** | **decimal.js 10.6.0** | "Basics are flawless" (`01-vision.md`) forbids `0.1 + 0.2 = 0.30000000000000004`. Native float leaks that artifact; a hand-rolled fix is *more* bespoke code. One mature dep < N lines of fragile rounding heuristics (#FF-004). |
| **Test framework** | **Vitest 4.1.8** | The arithmetic core IS the craft bar (F12) — it must be exhaustively unit-tested. Zero-config TS, fastest modern runner, Vite-native (M2 will use Vite too). |
| **Build tooling (M1)** | **None for the engine itself**; **TypeScript compiler (tsc)** for type-check, **Vitest** runs TS directly. App bundler **deferred to M2** (will be **Vite 8.0.16**). | M1 is headless logic — it needs to compile + be importable + be testable, nothing more. A bundler at M1 would be premature (CP-13 over-engineering). |

---

## 1. Language — TypeScript over plain JavaScript

**Pick: TypeScript 6.0.3** (latest stable per npm registry `registry.npmjs.org/typescript/latest` as of 2026-06).

**Why TS, not plain JS:**
- M1's core internal model is the **operand/operator running state machine** (F7, `03-modules.md:44`). A state
  machine with discriminated states (idle / entering-first / operator-pending / entering-second / result /
  error) is exactly where a static type system earns its keep — the compiler catches an unhandled state
  transition before it ships, which is the kind of bug a zero-coding owner cannot catch by reading code.
- **AI owns all code forever** (profile). The maintainability argument that sometimes cuts against TS
  ("the team has to learn it") does not apply — there is no human team; the cost of types is paid entirely
  by the AI author, and the benefit (regressions catchable, C3 craft floor goal) is exactly what the iron-law
  craft floor demands.
- **Fits the static target with zero runtime cost.** TS compiles to plain JavaScript; nothing TS-specific
  runs in the browser. The Dokploy Static (NGINX) target (`07-deployment-target.md:46-48`) serves only the
  compiled JS — TS is a *build-time* tool, which `07-deployment-target.md:72` explicitly permits ("A build
  step (bundler/transpiler) at build time is fine; what's disallowed is a server process at run time").

**Build-complexity counter-weight (honest):** TS adds a `tsconfig.json` + a compile step vs. plain JS's
zero-config. For a tiny engine that is a real but small cost — and it is a *build-time* cost the AI absorbs,
not a runtime or owner-facing one. Verdict: the type-safety on the state machine outweighs the marginal
build setup. Not over-engineering — TS is the industry-default for new maintainable logic and the craft
floor (C3) treats "regressions catchable" as a universal goal.

*Verification: TypeScript 6.0.3 confirmed latest stable via npm registry (`registry.npmjs.org/typescript/latest`,
2026-06). Vitest runs `.test.ts` with zero extra config — per Context7 `/vitest-dev/vitest` (2026-06):
"Vitest supports TypeScript out of the box; simply use `.test.ts`".*

---

## 2. Number representation — decimal.js over native IEEE-754 (THE key M1 decision)

**Pick: decimal.js 10.6.0.** This decision determines the float-precision behaviour (OQ1) and the overflow
threshold (OQ2) flagged in `_briefing.md`.

### The head-to-head (#FF-004 profile-fit format)

| Axis | Native JS `number` (IEEE-754 double) | decimal.js 10.6.0 |
|---|---|---|
| **Bespoke LOC** | LOW at first glance — but "basics flawless" forces a **hand-rolled decimal-rounding / epsilon layer** on top, which is *more* fragile bespoke code that still leaks edge cases. | LOW + stable — `.plus/.minus/.times/.dividedBy` give correct decimal results directly; near-zero bespoke arithmetic code. |
| **Correctness (the vision bar)** | Leaks visible artifacts: `0.1 + 0.2 → 0.30000000000000004`, `0.3 - 0.2 → 0.09999999999999998`. A user typing those exact basics sees a *wrong* answer. | `new Decimal('0.1').plus('0.2').toString() === '0.3'` — correct, no artifact (Context7 verified). |
| **Adoption / maintenance** | Built-in, zero dep. | Mature, widely adopted, **actively maintained** — latest 10.6.0, registry `modified 2025-07-06`; not deprecated/merged/abandoned. |
| **Overflow control (OQ2)** | Silent `Infinity` past `~1.8e308`; loses integer precision past `2^53`. Overflow detection is itself bespoke. | Configurable precision + explicit large-number handling → a *defined* threshold for the F5 overflow error state, not a silent `Infinity`. |
| **Dependency cost** | None. | One small, single-purpose, zero-transitive-dep library in the bundle. Trivial for a static client app. |

### Decision

**decimal.js wins.** The vision's load-bearing promise is **"basics are flawless"** (`01-vision.md`). For a
*basic* 4-function calculator the single most embarrassing failure is `0.1 + 0.2` showing `0.30000000000000004`.
Native float makes that failure the *default*; avoiding it on native float requires a bespoke
rounding/epsilon layer that is **more** code than adopting decimal.js and still leaks at the margins. Per
#FF-004's "less bespoke code is the tiebreaker for this profile," decimal.js is both the more-correct AND the
less-bespoke option — the rare case where the two pull the same way.

**Not over-engineering (CP-13 check):** the alternative is not "do nothing" — it is "hand-roll float
correction," which is the *more* complex path. decimal.js *removes* complexity here. It also cleanly defines
the F5 overflow threshold (OQ2) instead of leaning on silent `Infinity`.

### What this settles for downstream concern files

- **OQ1 (precision / rounding):** technical, now resolvable — use decimal.js precision config. A sensible
  default display precision (e.g. significant digits with standard half-up rounding) is proposed in
  `03-rules.md`. The *visible* digit count the user sees is the one sub-question that **could** be a mild
  taste call — flagged to orchestrator below, not blocking.
- **OQ2 (overflow threshold):** technical, set against decimal.js's configured precision/magnitude bound;
  exceeding it → the F5 defined error value. `05-edge-cases.md` enumerates the boundary.

*Verification: decimal.js 10.6.0 confirmed latest via npm registry (`registry.npmjs.org/decimal.js/latest`,
`modified 2025-07-06`, 2026-06 check) — actively maintained, not abandoned. Arithmetic API + the 0.1+0.2
correctness fix verified via Context7 `/mikemcl/decimal.js` (benchmark 93.8, High reputation, 2026-06).
Alternative big.js (7.0.1, npm registry 2026-06) considered: big.js is leaner but decimal.js is the
broader-featured, higher-adoption sibling from the same author (Mike Mcl) and handles the overflow/precision
config M1's error states (F5) need — decimal.js preferred on feature-fit, big.js noted as a viable lighter
fallback if bundle size ever became a constraint (it will not at this scale).*

---

## 3. Test framework — Vitest over Jest / node:test

**Pick: Vitest 4.1.8** (latest stable per npm registry `registry.npmjs.org/vitest/latest`, 2026-06;
docs header reports v4.1.7 latest per vitest.dev WebFetch, 2026-06 — same major line).

**Why Vitest:**
- **The arithmetic core IS the testable craft bar** (F12, C3 craft floor — "correctness is the bar for M1").
  M1 has no UI to QA; its entire quality story is exhaustive unit tests over the four operations, decimal
  entry, div-by-zero, overflow, clear-vs-AC, operator chaining (OQ3) and negative results (F6). It needs a
  first-class unit-test runner.
- **Zero-config TypeScript.** Vitest runs `.test.ts` directly with no separate compile/transform step — per
  Context7 `/vitest-dev/vitest` (2026-06): *"Vitest provides out-of-the-box support for TypeScript because it
  runs on Vite, eliminating the need for extra compilers."* This removes the `ts-jest`-style config burden
  Jest would impose.
- **Fast + modern + current** — actively maintained, Jest-compatible API (low-friction if patterns are ever
  ported), and the de-facto modern default for Vite/TS projects (WebFetch vitest.dev/guide/comparisons,
  2026-06: *"If your app is powered by Vite, having two different pipelines to configure and maintain is not
  justifiable"*).
- **Ecosystem alignment:** M2 (the UI module) will use **Vite 8.0.16** as its bundler. Choosing Vitest at M1
  means one shared, Vite-native test+build pipeline across the whole project rather than two toolchains.

**Candidates set aside:**
- **Jest** — viable and Jest-compatible-with-Vitest, but requires `ts-jest`/babel transform config for TS and
  is a *separate* pipeline from M2's Vite. More bespoke config for no gain here (#FF-004).
- **node:test** — zero-dep and built into Node LTS v24 (Krypton, `nodejs.org/dist` 2026-06), genuinely
  attractive for a tiny pure-logic module. Set aside because Vitest's richer assertion/coverage/watch
  ergonomics + Vite-native TS + project-wide consistency with M2 outweigh node:test's zero-dep edge; the
  craft-floor enforcement (REVIEW Layer 7 `test`) is smoother with a full-featured runner.

*Verification: Vitest 4.1.8 latest via npm registry (2026-06); v4.x latest confirmed + Vitest-over-Jest
recommendation for Vite/TS via WebFetch of vitest.dev/guide/comparisons (2026-06, time-anchored); TS
out-of-the-box support via Context7 `/vitest-dev/vitest` (2026-06).*

---

## 4. Build tooling — none for the headless engine; bundler deferred to M2

**Pick: no app bundler at M1.** M1 needs exactly three things, all build-time, none of which require a bundler:

1. **Compile / type-check** — TypeScript compiler (`tsc`), TypeScript 6.0.3 (npm registry, 2026-06).
2. **Be importable** — author the engine as a plain ES module exporting its public functions/state-machine
   API, so M2 can `import` it directly.
3. **Be testable** — Vitest runs the `.test.ts` files against the source with no separate build.

**Why defer the bundler to M2 (not decide it here):**
- The bundler's job is to turn the *app* into the static `index.html` + JS/CSS bundle the Dokploy Static
  (NGINX) target serves (`07-deployment-target.md:67-73`). That output is produced by the UI module, not the
  headless logic core — bundling M1 alone would produce nothing useful and is premature (CP-13
  over-engineering / YAGNI).
- **Stated recommendation for M2 (non-binding here):** **Vite 8.0.16** (latest stable per npm registry
  `registry.npmjs.org/vite/latest`, 2026-06) — it produces a static `dist/` bundle with no server runtime,
  matching the Dokploy Static expectation exactly, and is the natural pair to the Vitest choice above. M2's
  `06-tech-choices.md` owns the final bundler decision; recorded here only so the toolchain is coherent.

**Runtime for tooling:** Node LTS **v24 (Krypton)** — newest active LTS per `nodejs.org/dist/index.json`
(2026-06). Latest-active-LTS per CP-6; conservative version floors are a SHIP concern, not SPECIFY.

---

## Open question genuinely for the human (flagged, non-blocking)

- **Visible result precision (OQ1, taste slice only):** the *technical* precision is settled (decimal.js
  config). The one sub-question that could be **taste** rather than technical is *how many digits the user
  sees before rounding* on a long division like `10 ÷ 3` — e.g. show `3.33333333` (8 digits) vs a longer/
  shorter window. `03-rules.md` proposes a sensible default; if the owner has a felt preference on the
  display window it's a one-line taste pick, otherwise the default stands. **Not blocking** — engine works
  either way.

> No contradictions found with `_briefing.md`, `07-deployment-target.md`, or `03-modules.md`. All four picks
> compile to / run on the static client-side target with no server runtime (F11). Latest-stable throughout;
> no conservative floors at SPECIFY.
