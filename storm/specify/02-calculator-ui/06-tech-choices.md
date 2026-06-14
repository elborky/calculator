---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: true
storm-depends-on:
  - storm/specify/02-calculator-ui/_briefing.md
  - storm/structure/07-deployment-target.md
  - storm/structure/08-design-system.md
  - storm/specify/01-calculation-engine/06-tech-choices.md
---

# Tech Choices — M2 Calculator UI / Keypad

> CP-6 verification-gate file. Every library/version named below carries a live-tool cite
> (npm registry primary for version+currency, Context7 + WebFetch for capability claims,
> time-anchored to June 2026). A name without a cite is an invalid proposal — none appear
> uncited here.
>
> Scope reminder (`_briefing.md` F1–F2): M2 is the **view + input layer** over the frozen M1
> engine. It owns the keypad, the display, the click→engine and keyboard→engine bindings, the
> responsive glass layout. It does **no arithmetic** (every op delegates to M1) and **no
> theming machinery** (M4 owns the toggle; M2 authors styles against tokens). This file owns
> M2's one significant tech pick (F13): **UI approach + bundler**.

---

## Summary of picks

| Concern | Pick | One-line why |
|---|---|---|
| **UI approach** | **Vanilla TypeScript** (no UI framework) — one small render function over M1's `EngineState` | The whole app is one screen: ~16 buttons + a display + a keyboard handler, driven by a *single* held state value (INT-1). A framework's core value (reactive diffing across many components) has almost nothing to reactively manage here. Vanilla keeps **zero framework runtime** in the bundle and gives **total, unmediated CSS control** for the glassmorphism (F6) — the one load-bearing quality axis. Bespoke-LOC delta vs the runner-up is genuinely small at this surface size (see §1). |
| **Bundler / dev-server** | **Vite 8.0.16** | Vanilla-TS template, instant dev server + HMR, and a `vite build` that emits an optimized **static `dist/`** (HTML+CSS+JS, no server runtime) — exactly the Dokploy Static (NGINX) contract (`07-deployment-target.md:67-73`). Already the project toolchain: M1 chose Vitest (Vite-native). One pipeline, not two. |
| **Language** | **TypeScript 6.0.3** (continuity — locked, not a fresh choice) | M2 imports M1's typed exports (`EngineState`, `Operator`, the `inputX` reducers). Staying TS means the M1 integration contract (INT-1…INT-6) is compiler-checked at the seam. Matches M1 exactly. |
| **CSS approach** | **Plain CSS with custom properties (design tokens)** | The design system is *built* on CSS custom properties that M4 swaps wholesale on theme toggle (F4, `08-design-system.md:44,132`). `backdrop-filter` glass (F6) is plain CSS regardless of framework. No CSS-in-JS — it would fight the token-swap model and add runtime weight for zero gain. |
| **Fonts** | **Inter, self-hosted** (weights 300/400/500) | Design system mandates Inter, 3 weights (`08-design-system.md:82-86`). Self-host the `.woff2` files in the static bundle rather than Google Fonts CDN — see §5 for the perf/privacy tradeoff. |

---

## 1. UI approach — vanilla TypeScript over a framework (THE M2 decision, F13)

This is the OQ1 head-to-head. Per CP-6 profile-fit (#FF-004), the default thumb on the scale is
**"prefer the higher-level option that minimizes bespoke code the AI must own forever, UNLESS a
documented constraint argues otherwise."** That default is taken seriously below — and then
overridden, with the constraint named.

### The candidates (all CP-6 verified, June 2026)

All five are real, current, actively-maintained, and all bundle to a static no-server output via
Vite — so **static-build fit and zero-runtime-at-the-server are NOT differentiators** (every
candidate clears the Dokploy Static / NGINX bar identically). The differentiators are
**client-side runtime weight**, **bespoke-LOC the owner inherits**, **CSS/glass control**, and
**whether reactivity earns its complexity at this surface size**.

| Candidate | Latest stable (npm, 2026-06) | Client runtime | Reactivity model | Notes |
|---|---|---|---|---|
| **Vanilla TS + Vite** | n/a (Vite 8.0.16) | **~0 KB** (only your code) | manual: re-call one render fn on each state change | Total CSS control; you own the render loop. |
| **Svelte** | 5.56.3 | very small (compiled, ~a few KB) | compile-time runes; no vDOM | Least template boilerplate of the frameworks; compiler does the work. |
| **Solid** | 1.9.13 | small | fine-grained signals | Excellent perf; JSX. |
| **Preact** | 10.29.2 | ~4 KB | vDOM (React-like) | React ergonomics, tiny. |
| **Lit** | 3.3.3 | ~5–6 KB | reactive web components | Web-component standard; template literals. |

*Verification: all five latest-stable + actively-maintained confirmed via npm registry —
`vite` 8.0.16 (`time.modified` 2026-06-01), `svelte` 5.56.3 (2026-06-07), `solid-js` 1.9.13
(2026-05-19), `preact` 10.29.2 (2026-05-17), `lit` 3.3.3 (2026-05-14), checked 2026-06. None
deprecated/merged/abandoned. Vite supports `vanilla-ts`, `svelte-ts`, `preact-ts`, `solid-ts`,
`lit-ts` templates and emits a static `dist/` via Rolldown with no server runtime — per Context7
`/websites/vite_dev` (2026-06) and WebFetch of vite.dev/guide (2026-06, time-anchored:
"build command that bundles your code with Rolldown, pre-configured to output highly optimized
static assets for production").*

### Why a framework's value is muted *at this specific surface*

Frameworks earn their runtime + abstraction cost when an app has **many components, derived UI
state, lists that add/remove/reorder, and cross-component data flow** — the diffing and
fine-grained-reactivity machinery pays for itself. M2 has none of that:

- **One held state value, not a state tree.** INT-1 says M2 holds exactly ONE `EngineState` and
  *replaces* it on every keypress, then re-renders. That is already a reducer — `(state, action)
  → newState`. The "reactivity" a framework would manage is a single value swap. A framework here
  is a large machine asked to react to one variable.
- **The view is almost entirely static.** ~16 buttons whose labels/positions never change, plus
  one display string and one derived pending-expression line (INT-3). The only thing that updates
  per keypress is **two text nodes** (the display + the pending line) and an occasional
  error-state class toggle. That is a 5-line imperative `render(state)` function reading
  `getDisplayValue(state)` and the derived expression — not something needing a diff engine.
- **No lists, no routing, no async, no forms.** F3 (history) and F4 (theming) are explicitly
  OTHER modules. M2 has no dynamic list to reconcile — the one place a vDOM/signal model would
  shine is absent by scope.

### The bespoke-LOC delta — honest accounting (the crux of #FF-004)

#FF-004 says less-bespoke-code is the tiebreaker for this zero-coding, demotivated-when-stuck
owner. So the real question: **does a framework actually reduce the code the owner inherits here?**

- A framework (say Svelte, the leanest) would turn the keypad into a `.svelte` component with a
  small template + a reactive `$state` holding the `EngineState` + event bindings. Real, but
  **not dramatically less** than vanilla, because the surface is so small.
- Vanilla is: one `index.html` with the button grid markup, one `keypad.ts` wiring click + keydown
  handlers to the `inputX` reducers (the handler table M2 owns per INT-5), and one `render.ts`
  (~5–10 lines) writing two text nodes. The reducers themselves are **M1's** — already written,
  frozen, tested. M2 owns only the thin binding layer.
- **Estimated delta: vanilla is roughly +20–40 bespoke LOC vs Svelte** for this surface (a hand-
  written click+keydown dispatch table + a tiny render fn, vs Svelte's event bindings + reactive
  declaration). That is the honest cost. It is **small in absolute terms** because the app is
  small — and it buys two things the framework cannot give as cleanly (next paragraph).
- Critically, the framework's "savings" are **not** in logic (logic is M1's) — they'd be in
  *templating ergonomics*. At ~16 static buttons, templating ergonomics save very little.

### The constraint that overrides the profile-fit default — glass CSS control + zero framework debt

Two documented reasons tip vanilla over "the higher-level option" despite the #FF-004 default:

1. **Total, unmediated CSS control for the one quality axis (F6/F7).** Glassmorphism is THE
   product's single genuine quality bar (`08-design-system.md:15` — "the one genuine quality axis
   for the whole product"). It is `backdrop-filter`, layered box-shadows, a `-webkit-` fallback
   chain (`08-design-system.md:109`), per-theme custom-property swaps, and `prefers-reduced-motion`
   handling — all **plain CSS**. Vanilla means the CSS is authored directly with nothing between
   the author and the cascade: no scoped-style rewriting, no framework class-name mangling, no
   CSS-in-JS layer to reconcile with the M4 token-swap model. For an axis where *precise* control
   is the deliverable, removing the framework's styling abstraction is a feature, not a loss.
2. **Zero framework runtime = zero framework debt the owner can never debug.** #FF-004's spirit is
   "don't make the zero-coding owner own code they can't reason about." A framework's *runtime* is
   exactly such code — opaque, versioned, occasionally breaking on major bumps (Svelte 4→5 runes
   was a real migration). Vanilla TS over a frozen, tested M1 engine means the **only** moving
   parts the owner ever carries are: M1 (done) + a thin DOM binding (trivial) + plain CSS. No
   framework upgrade treadmill, no runtime to learn. At this surface size the ~20–40 LOC vanilla
   costs is *cheaper debt* than a framework dependency's lifetime maintenance surface.

### Decision

**Vanilla TypeScript wins** — the rare case where the #FF-004 "less bespoke code" default is
*outweighed* by a documented constraint (glass CSS control) and where the framework's bespoke-LOC
savings are small enough (~20–40 LOC at this surface) that they don't justify the framework's
runtime weight + lifetime upgrade debt. The app is one reducer-driven screen; vanilla *is* the
right-sized tool.

**Not under-engineering (CP-13 check both ways):** vanilla here is not "skip the framework to be
clever" — it's "the framework has nothing to reactively manage." Equally, this is not a license
for sloppy hand-rolled DOM: the craft floor (C3) still applies — real `<button>` elements
(`08-design-system.md:147`), a live-region display, a whitelisted keyboard handler (INT-4),
visible focus rings (`08-design-system.md:145`). Vanilla means *direct* control, held to the same
craft bar.

> **Tradeoff named (CP-15 / #FF-026).** Chosen: **vanilla TS** — optimised for *bundle leanness +
> total glass-CSS control + zero framework debt*. **Sacrificed axis: reactivity ergonomics.** If
> M2 ever grew a genuinely dynamic, multi-component, list-heavy UI, the manual `render(state)`
> loop would become a liability a framework's reactivity would handle for free — we are betting
> that M2's scope stays "one screen, one state value" (which F1–F5 + the M3/M4 split structurally
> guarantee). The runner-up is **Svelte 5.56.3** (least-boilerplate framework, ~20–40 fewer
> bespoke LOC, small compiled runtime); it is the documented fallback if that scope bet ever
> breaks.

---

## 2. Bundler / dev-server — Vite 8.0.16

**Pick: Vite 8.0.16** (latest stable per npm registry `registry.npmjs.org/vite/latest`,
`time.modified` 2026-06-01, checked 2026-06).

This is the bundler deferred from M1 (`01-calculation-engine/06-tech-choices.md:159` already
*recommended* Vite for M2; this file confirms it as the binding decision).

**Why Vite:**
- **Emits a static `dist/` with no server runtime** — `vite build` bundles via Rolldown into an
  optimized `index.html` + hashed CSS/JS, the exact artifact Dokploy's Static (NGINX) build type
  serves (`07-deployment-target.md:67-73`: "a folder of static files, servable by NGINX with no
  Node/Python/etc. process at runtime"). Build-time tooling, zero run-time server — permitted by
  `07-deployment-target.md:72`. *(per Context7 `/websites/vite_dev` static-deploy docs + WebFetch
  vite.dev/guide, 2026-06: output is "highly optimized static assets for production"; default
  output dir `dist`.)*
- **`vanilla-ts` template** — first-class, scaffolds the exact stack chosen in §1 (per Context7
  `/websites/vite_dev` create-vite docs, 2026-06).
- **Project-toolchain consistency** — M1 chose **Vitest** (Vite-native). Using Vite as M2's
  bundler means **one** Vite-based pipeline for build + test across the whole project, not two
  toolchains (the explicit rationale M1 recorded, `01-...:127-129`).
- **DX during BUILD** — instant dev server + HMR makes the glass-CSS iteration loop fast, which
  matters because F6/F7 readability tuning is screenshot-and-adjust work.

**Candidates set aside (briefly, anti-fatigue):**
- **esbuild / Rollup raw, or a hand-rolled `tsc` + static-copy step** — viable for a tiny app, but
  Vite *is* Rollup/Rolldown with the dev-server, HMR, asset hashing, and `index.html` handling
  pre-wired. Hand-rolling that is *more* bespoke config for less capability (#FF-004). Vite is the
  higher-level, less-bespoke option here — so the profile-fit default points *at* Vite (consistent
  with §1's logic: take the higher-level tool when it genuinely removes bespoke work; a bundler
  does, a UI framework here does not).
- **Parcel / Webpack** — Webpack is heavier-config; Parcel is fine but Vite is the project's
  established, Vitest-aligned choice. No reason to diverge.

*Verification: Vite 8.0.16 latest-stable via npm registry (2026-06); vanilla-ts template + static
`dist/` no-server output via Context7 `/websites/vite_dev` (2026-06) and WebFetch vite.dev/guide
(2026-06, time-anchored). Actively maintained — v8 line current, recent `time.modified`.*

---

## 3. Language — TypeScript 6.0.3 (continuity, locked)

Not a fresh choice — a **continuity confirmation**. M1 is TypeScript 6.0.3
(`01-calculation-engine/06-tech-choices.md:35`). M2 imports M1's typed public API directly
(`EngineState`, `Operator`, `ErrorTag`, the eight `inputX` / `getDisplayValue` exports per the
`_briefing.md` integration contract). Staying on TypeScript means:

- The **M1 integration seam is compiler-checked** — passing the wrong shape into `inputDigit`,
  mishandling the `string | ErrorTag` return of `getDisplayValue` (INT-2), or reading
  `accumulator`/`pendingOperator` for the derived pending line (INT-3) are all type-verified, not
  runtime-discovered. For a zero-coding owner, the compiler catching the integration bug *before*
  it ships is exactly the C3 craft-floor "regressions catchable" goal.
- **Same version, one tsconfig discipline** as M1 — no version skew across the seam.

*Verification: TypeScript 6.0.3 latest-stable via npm registry (`time.modified` 2026-04-16,
checked 2026-06), matching M1's pinned version. Vite compiles/serves TS out of the box via its
`*-ts` templates (Context7 `/websites/vite_dev`, 2026-06).*

---

## 4. CSS approach — plain CSS with custom properties (design tokens)

**Pick: plain CSS, custom properties as the token layer.** No CSS-in-JS, no CSS framework
(Tailwind etc.), no component-style library.

**Why:**
- **The design system is architected on CSS custom properties** (`08-design-system.md:44,132`):
  M4 swaps the *entire* token set (`--bg-gradient`, `--glass-fill`, `--text-primary`, `--accent`,
  …) on the light/dark toggle via a `300ms` transition on `background`/`color`/`border`. That swap
  is **native CSS custom-property cascading** — author tokens on `:root` (or a `[data-theme]`
  attribute), reference them everywhere, let M4 flip them. CSS-in-JS would fight this model
  (runtime style injection vs. a pure-cascade token swap) for zero benefit.
- **Glass is plain CSS regardless** (F6, `08-design-system.md:90-109`): `backdrop-filter:
  blur(16px) saturate(140%)`, the `-webkit-backdrop-filter` Safari fallback, layered
  `box-shadow`, the unsupported-`backdrop-filter` higher-alpha fallback. None of this is made
  easier by any styling library; all of it is made *more direct* by writing CSS straight (the §1
  glass-control argument).
- **F4 boundary respected** — M2 authors styles *against* tokens so M4 can swap them without
  touching M2 markup. Plain CSS custom properties is precisely the mechanism that makes that
  module boundary clean.
- **CP-13 over-engineering check:** a CSS framework for ~16 buttons + one display + one body panel
  is inflation. The design system itself flags this (`08-design-system.md:153`: "No component
  library, no theming engine, no token-pipeline tooling"). Plain CSS honors that guard.

No verification cite needed — this is a native browser-platform capability (CSS custom properties,
`backdrop-filter`), not a third-party library. `backdrop-filter` browser support + the documented
fallback chain are already specified in `08-design-system.md:109`.

---

## 5. Fonts — Inter, self-hosted (weights 300/400/500)

**Pick: Inter, self-hosted `.woff2` in the static bundle**, only the three weights the design
system uses — 300 (display readout), 400 (history/secondary), 500 (buttons)
(`08-design-system.md:82-86`).

**Self-host vs Google Fonts CDN — the tradeoff (brief, per the concern requirement):**
- **Self-host (chosen):** the `.woff2` files ship inside the Vite `dist/` and are served by the
  same NGINX container as everything else. **Pros:** no third-party request (privacy — no Google
  Fonts CDN call leaking the visitor's IP/referer, which since the 2022 EU rulings is a real
  privacy consideration even for a zero-stakes app), no extra DNS/connection round-trip (perf — the
  font loads from the same origin, and Vite fingerprints + long-caches it), works fully offline /
  air-gapped. **Cons:** ~3 small `.woff2` files added to the repo/bundle (trivial — subset to
  Latin, each weight is tens of KB).
- **Google Fonts CDN (not chosen):** one `<link>` tag, zero local files. **Cons:** third-party
  request (privacy), an extra origin connection on first paint (perf), external dependency for a
  self-contained static app. For an app deliberately self-hosted on the owner's own Dokploy box
  (`07-deployment-target.md` — the owner chose to *own the box*), pulling fonts from a Google CDN
  is incongruent; self-hosting matches the "self-contained static bundle" posture.

Verdict: self-host. It's the better perf + privacy + self-containment fit, and the cost (3 small
files) is negligible. Use `font-display: swap` and preload the display-weight (300) so the big
readout paints fast.

*Verification: Inter is an open-source (OFL) typeface, freely self-hostable; no library version
gate applies (it is a font asset, not a runtime dependency). Mandated by `08-design-system.md:82`.*

---

## 6. Explicitly NOT needed (anti-inflation — CP-13)

Stated outright so no downstream drafter or BUILD task reaches for these:

- **No state-management library** (Redux/Zustand/Jotai/nanostores/etc.). M2 holds **one**
  `EngineState` value and replaces it per keypress (INT-1). A single module-scoped variable +
  a render call *is* the state management. A store library for one value is textbook
  over-engineering.
- **No router** (no React Router / SvelteKit routing / etc.). M2 is a **single screen**
  (F1). There are zero routes.
- **No UI-component library** (MUI / shadcn / Radix / Headless UI / etc.). The glass aesthetic is
  **bespoke-by-design** (F6, `08-design-system.md:153` — "No component library"). A generic
  component kit would actively fight the custom glass look. Buttons are hand-authored `<button>`s
  styled with the glass recipe.
- **No backend / API client / data-fetching library** (no axios/fetch-wrapper/tanstack-query).
  M2 is **client-side only** (F5, `00-domain-lens.md:31`); there is no server, no API, nothing to
  fetch. All computation is the in-process M1 import.
- **No CSS framework / CSS-in-JS** (§4) — plain CSS + tokens.
- **No animation library** (no Framer Motion / GSAP). The motion spec (F11,
  `08-design-system.md:124-136`) is short, restrained CSS `transition`s + `transform`s honoring
  `prefers-reduced-motion` — native CSS, no JS animation runtime.

The entire M2 dependency footprint at runtime is therefore: **M1 (decimal.js, already in M1's
tree) + the calculator's own code.** No UI framework, no store, no router, no component kit. That
minimal footprint is the point — it is the least bespoke *and* least third-party surface for a
one-screen reducer-driven app.

---

## Open questions for downstream M2 concern files (non-blocking)

- The **pending-expression line composition** (INT-3 / OQ2) is a UX-craft detail for
  `02-flows.md` + `04-ui.md`, not a tech-choice — flagged in `_briefing.md`, not re-opened here.
- The **exact keypad grid arrangement** (OQ3) is `04-ui.md` + mockups — pure UX, owner picks a
  mockup. No tech dependency.

> No contradictions found with `_briefing.md`, `07-deployment-target.md`, `08-design-system.md`,
> or M1's `06-tech-choices.md`. Every pick bundles to / runs on the static Dokploy (NGINX) target
> with no server runtime, stays on TypeScript at M1's version, and consumes M1 as a frozen typed
> module. Latest-stable throughout; no version floors at SPECIFY (#FF-004 — floors are a SHIP
> concern).
