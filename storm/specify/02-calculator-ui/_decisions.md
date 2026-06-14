---
storm-phase: specify
storm-module: 02-calculator-ui
storm-canonical: false
---

# M2 — Autonomous Technical Decisions

> AI-autonomous technical decisions (CP-7) logged during SPECIFY drafting. Each is a code-pattern /
> tooling / data-shape choice the zero-coding owner cannot meaningfully evaluate (theater gate,
> CP-7 Langkah-1), so it is decided and documented, not asked. D-NNN format. Tech-choice
> decisions carry CP-6 live-tool verification cites.

## D-001 — UI approach is vanilla TypeScript (no UI framework)

**Decision:** Build M2 as **vanilla TypeScript** — a thin DOM binding layer (click + keydown
dispatch → M1's `inputX` reducers) plus a small imperative `render(state)` function over M1's single
`EngineState`. No UI framework (Svelte/Solid/Preact/Lit rejected).
**Rationale:** The app is one screen — ~16 static buttons + one display + one keyboard handler driven
by a *single* held state value (INT-1). A framework's core value (reactive diffing across many
components, dynamic lists, routing) has almost nothing to manage here; the bespoke-LOC saving vs the
leanest framework (Svelte) is only ~20–40 LOC at this surface size. Two documented constraints
override the #FF-004 "prefer higher-level" default: (1) glassmorphism (F6/F7) is THE quality axis and
is all plain CSS — vanilla gives unmediated CSS control with no framework style-rewriting between
author and cascade; (2) zero framework runtime = zero framework upgrade-debt the zero-coding owner can
never debug. The only moving parts become M1 (frozen, tested) + a trivial DOM binding + plain CSS.
**Tradeoff (CP-15):** chose bundle-leanness + glass-CSS control + zero framework debt; **sacrificed
reactivity ergonomics.** Runner-up = Svelte 5.56.3 (documented fallback if M2's scope ever grows
list-heavy/multi-component — structurally prevented by the M3/M4 module split, F3/F4).
**Verification (CP-6):** vanilla-ts is a first-class Vite template; all five candidates latest-stable
+ actively-maintained per npm registry 2026-06 (svelte 5.56.3, solid-js 1.9.13, preact 10.29.2, lit
3.3.3); all bundle to static no-server output via Vite (Context7 `/websites/vite_dev` + WebFetch
vite.dev/guide, 2026-06) — so static-build fit is not a differentiator, runtime-weight + CSS-control
are.
**Source:** `06-tech-choices.md` §1; `_briefing.md` OQ1, INT-1.

## D-002 — Bundler / dev-server is Vite 8.0.16

**Decision:** Use **Vite 8.0.16** as M2's bundler + dev-server. `vite build` emits the static `dist/`
(HTML+CSS+JS, no server runtime) handed to Dokploy's Static (NGINX) build type.
**Rationale:** Emits exactly the static-bundle artifact the deployment target requires
(`07-deployment-target.md:67-73`); build-time tooling only, no run-time server (permitted by
`:72`). Project-toolchain consistency — M1 chose Vitest (Vite-native), so one Vite pipeline covers
build + test across the whole project rather than two toolchains. Instant HMR speeds the glass-CSS
screenshot-and-tune loop. Higher-level than hand-rolling esbuild/Rollup + a static-copy step, so here
the #FF-004 "prefer higher-level, less-bespoke" default points *at* Vite (a bundler genuinely removes
bespoke config; consistent with D-001 where a UI framework did not).
**Verification (CP-6):** Vite 8.0.16 latest-stable per npm registry `registry.npmjs.org/vite/latest`
(`time.modified` 2026-06-01, checked 2026-06); vanilla-ts template + static `dist/` Rolldown output +
no server runtime confirmed via Context7 `/websites/vite_dev` (static-deploy docs) and WebFetch
vite.dev/guide (2026-06, time-anchored: "highly optimized static assets for production").
**Cross-cite:** confirms the non-binding Vite recommendation M1 recorded
(`01-calculation-engine/06-tech-choices.md:159`).
**Source:** `06-tech-choices.md` §2; `_briefing.md` F13.

## D-003 — CSS approach is plain CSS with custom-property tokens

**Decision:** Author M2 styles as **plain CSS using CSS custom properties** as the design-token layer.
No CSS-in-JS, no CSS framework (Tailwind etc.), no component-style library.
**Rationale:** The design system is architected on custom properties that M4 swaps wholesale on the
light/dark toggle (`08-design-system.md:44,132`) — that swap is native CSS cascade, which CSS-in-JS
would fight for zero benefit. Glass (F6) — `backdrop-filter`, layered `box-shadow`, the `-webkit-`
+ unsupported-fallback chain (`08-design-system.md:109`) — is plain CSS regardless of any library, and
authoring it directly is the same unmediated-control argument as D-001. Honors the F4 module boundary
(M2 styles *against* tokens so M4 swaps without touching M2 markup) and the design system's own
anti-inflation guard (`08-design-system.md:153` — "no component library, no theming engine"). A CSS
framework for ~16 buttons + one display would be CP-13 over-engineering.
**Verification:** native browser-platform capability (CSS custom properties, `backdrop-filter`) — no
third-party library, so no version gate; `backdrop-filter` support + fallback already specified in
`08-design-system.md:109`.
**Source:** `06-tech-choices.md` §4; `08-design-system.md:44,132,153`.

## D-004 — Inter font is self-hosted (3 weights), not Google Fonts CDN

**Decision:** Self-host **Inter** (`.woff2`, weights 300/400/500 — the three the design system uses)
inside the Vite `dist/`, served by the same NGINX container. Reject the Google Fonts CDN `<link>`.
**Rationale:** Self-hosting wins on perf (same-origin, Vite-fingerprinted + long-cached, no extra
DNS/connection round-trip), privacy (no third-party Google CDN request leaking visitor IP/referer),
and self-containment (works offline; matches the owner's deliberate "own the box" self-hosted-Dokploy
posture, `07-deployment-target.md`). Cost is ~3 small Latin-subset `.woff2` files (tens of KB each) —
negligible. Use `font-display: swap` + preload the display weight (300). This is a routine
craft/asset-handling call within CP-7 technical authority.
**Verification:** Inter is OFL-licensed, freely self-hostable; a font asset, not a runtime dependency,
so no version gate applies. Typeface + weights mandated by `08-design-system.md:82-86`.
**Source:** `06-tech-choices.md` §5; `08-design-system.md:82-86`.
