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

## D-005 — `Backspace` key is a no-op (not in the keyboard whitelist)

**Decision:** The `Backspace` key does **nothing** — it is omitted from M2's keyboard whitelist
(`03-rules.md` UR-011, UR-012). M2 dispatches no M1 call on `Backspace`.
**Rationale:** M1 exposes no single-character delete; its only buffer reset is `inputClearEntry`
(whole `entryBuffer` → `"0"`, R-017). Two candidate mappings both fail: (a) mapping `Backspace` → CE
would surprise the user, since "delete one digit" ≠ "clear the whole entry"; (b) a *true* per-char
delete would require M2 to mutate `entryBuffer` and re-inject the trimmed string into M1 — **forbidden
by INT-4** (M2 must only ever feed whitelisted single-char digits / typed operators, never a hand-built
buffer string, or M1's `new Decimal(entryBuffer)` could throw). With both mappings ruled out, the safe
and least-surprising choice is no-op. The productive correction path remains **CE** (clear current
entry) and **AC** (full reset), both already bound (button + `Escape`).
**Tradeoff (CP-15):** chose buffer-hygiene safety + no-surprise over a per-digit-delete convenience;
**sacrificed** the small ergonomic nicety of backspacing a mistyped digit. Reversible later only if M1
ever ships a `deleteLastChar` reducer (out of M1's frozen scope — F9).
**Verification:** native browser key behaviour; no third-party library, no version gate. INT-4
buffer-hygiene constraint verified against `_briefing.md` INT-4 + `01-data-model.md §4`.
**Source:** `03-rules.md` UR-011/UR-012; `_briefing.md` INT-4; `01-calculation-engine/03-rules.md`
R-017.

## D-006 — Long-number display is auto-shrink → horizontal-scroll (never truncate)

**Decision:** When a result/entry is wider than the display panel, M2 **auto-shrinks the display
font** (measure rendered text width against the panel, step the size down from the
`clamp(2.5rem, 12vw, 4rem)` default toward a `~1.25rem` floor); if it still overflows at the floor,
the display line becomes **horizontally scrollable** (`overflow-x`, **right-anchored** so the
least-significant digits, exponent suffix, and sign stay in view). `font-variant-numeric: tabular-nums`
is preserved throughout. M2 **never truncates or ellipsizes a numeric result.** Error *sentences*
(text, no precision to lose) may wrap to a 2nd line or shrink, but do not scroll.
**Rationale:** decimal.js can emit up to ~21 significant digits plus exponent notation (E-007, E-036,
E-048); the fixed glass display panel cannot always fit that. Truncation/ellipsis would silently hide
digits — a correctness/trust failure on the product's single quality axis (a readable, premium,
*accurate* calculator). Shrink-then-scroll keeps every digit reachable while respecting the display
panel's fixed footprint (`08-design-system.md §6`) and the `tabular-nums` discipline (`§4`). M2 renders
the engine string faithfully and does not re-round (F2).
**Tradeoff (CP-15):** chose full-precision visibility (shrink+scroll) over a single fixed glance-size
display; **sacrificed** the always-same-font-size aesthetic for very long values — accepted because
accuracy/legibility outranks a fixed type-size for this product (§8 readability discipline, craft
floor C3).
**Verification:** native CSS/DOM capability (`overflow-x`, text measurement) — no third-party library,
no version gate. Display sizing + `tabular-nums` mandated by `08-design-system.md §4, §6`.
**Source:** `05-edge-cases.md` §"Long-number display approach" + UE-001..UE-007; `08-design-system.md
§4, §6, §8`.

## D-007 — Task-granularity encoding for M2 BUILD

**Decision:** The M2 BUILD list (`_index.md`) is encoded as **87 atomic tasks (T-101..T-187) across 15
build groups (0–14)**, each ≤ 1 file / 1 logical unit with a concrete **Done when** check, traced to
`UR-NNN` / `UE-NNN` / flow numbers where natural.
**Rationale:** Two M2-specific granularity rules were applied: (a) the v3 mockup port is split
per-row / per-button / per-effect rather than one "build the UI" task (Groups 1, 3) — defeating the
#1 granularity-breach risk for a UI module; (b) because M2 is a view layer (not pure logic), each task
states the *fittest verifiable check* (tsc / `vite build` / DOM assertion / visual focus-ring) rather
than forcing TDD that doesn't fit a view surface — full browser e2e is deferred to REVIEW (Playwright),
with the surface left verifiable. M2 extends the existing root M1 package with Vite + `index.html`
(D-002 one-pipeline rationale), it does not create a second package.
**Verification:** process decision, no third-party library or version gate. Granularity discipline per
`~/.claude/rules/storm-protocol.md`; baseline mirror = M1 `_index.md` BUILD list (D-016).
**Source:** `_index.md` "BUILD task list" + "Decision logged this pass".
