---
storm-depends-on: []
storm-phase: meta
storm-canonical: true
---

# STORM Craft Floor

**What this is.** The framework-universal **craft floor** — the iron-law quality bar every STORM build is held to. CRAFT measures *how clean, safe, and correct* the output is. Unlike scope (per-project, dialable), craft is **always-high and identical across every project**: there is **no dial**. Sloppy and gold-plated both fail the same floor.

**How it loads.** This file is read **just-in-time** into BUILD sub-agents: the orchestrator quotes the *Operative core* (end of this file) verbatim into `_briefing.md`, and references the rest by path. Sub-agents read the full floor on demand. Keeping the floor thin is itself a craft requirement — see *Why thin*.

**How it's enforced (reference, not implemented here).** Prose alone does not make code clean — the floor is *backed* by an enforcement stack authored separately:
- **REVIEW Layer 8** — an independent opus reviewer audits the diff against this floor (a second pair of eyes that did not write the code; see *Don't trust your own self-report*).
- **Deterministic machine gate** — STORM's **REVIEW Layer 7** static guards run the wired-today floor: type-check, lint, test, module-load smoke. The floor *mandates extending* this machine with SAST, secret-scan, CVE/advisory scan, and lockfile-integrity (dependency-hallucination defense) — wire them into Layer 7 / project CI; several are not yet auto-run. Depth lives **here, in the machine** — not in this prose.

**This file is a CETAKAN (template).** It has two layers:
1. A **universal spine** (written once, reused by every discipline).
2. **Per-discipline floor** instances that inherit the spine. This file ships the spine **+ the CODE floor**. The UI / SECURITY / DATA floors are authored JIT — the first time a module produces that kind of output — and slot onto the same spine.

**Why thin (the iron-law applies to itself).** Field research (2025–26) is blunt: *higher quality ≠ a longer standard*. More rules → **worse** compliance (lost-in-the-middle, context-dropout — the model silently drops rules buried in a wall of text). A bloated floor violates its own iron-law. So depth lives in the **enforcement stack**, never in prose length. This document stays tight and scannable on purpose; resist the urge to make it comprehensive.

---

## Part A — Universal Spine (inherited by every discipline floor)

### A1. Prime directive

Produce output a competent professional in this discipline would sign their name to: **clear, safe, correct, and no larger than it needs to be.** When unsure, optimize for the next person who reads this — including future-you with no memory of today.

### A2. Right-size — the brakes work both ways (YAGNI)

The iron-law brakes in **both** directions:
- **Build what the task needs** — the simplest thing that fully solves it.
- **Stop there** — extra abstraction, config, flags, or "future-proofing" for needs that do not exist yet is gold-plating, and gold-plating **fails the floor just as hard as sloppiness.** Speculative generality is a defect.

Add structure when a *real, present* need demands it; let the next real need pull the next layer.

### A3. Priority order when rules conflict

When two requirements pull apart, resolve **top-down**:
1. **Correct & safe** — it does the right thing and cannot be abused.
2. **Clear** — the next human understands it without archaeology.
3. **Simple** — it is as small as #1 and #2 allow.
4. **Proxy-pretty** — style/threshold niceties (nesting depth, line length, etc.).

A lower rule **never** overrides a higher one. "Nesting ≤ 3" (a #4 proxy) must never force code that obscures intent (#2) or hides a bug (#1).

### A4. MUST is the GOAL; SHOULD is a tunable PROXY

- **MUST = the goal** — iron-law, universal, the *outcome* the floor guarantees: clear / safe / tested / regressions catchable. Non-negotiable, identical every project.
- **SHOULD = a proxy** — a tunable, context-dependent *measurement* that usually points at the goal, each carrying a one-line rationale (nesting depth, function length, coverage %, test-pyramid shape).

A proxy is **a flashlight, not a judge.** Never hard-code a proxy as iron-law: "nesting ≤ 3" enforced absolutely can force over-extraction that just **moves** complexity elsewhere rather than removing it — which fails the real goal (clarity). When a proxy and its goal disagree, **the goal wins** and you note why.

Record a tuned proxy value + its rationale where the module's decisions live (e.g. `_decisions.md` or the spec), so the independent reviewer (A6) can audit the call. An unrecorded tuning is unauditable — and "tunable" without a home is just drift.

### A5. Self-check before "done"

Before declaring any unit done, confirm against *the actual artifact* (not memory):
1. Does it fully do the task — including the unhappy paths (empty, error, boundary, concurrent) — and release every resource it acquires on all exit paths?
2. Is every input validated and every output safe at the trust boundary?
3. Would the next reader understand it unaided? Names say what; structure says how.
4. Is it right-sized — nothing missing, nothing speculative (A2)?
5. Are there tests that would **catch a regression**, and do they pass?
6. Does it meet the relevant discipline floor below?

### A6. Don't trust your own self-report

A model grading its own output is an unreliable witness — confident prose ≠ working code. The floor therefore treats self-assessment as a *draft verdict only*; the **binding** verdict comes from the machine (gate checks **run**, not imagined) and the **independent** REVIEW-L8 reviewer. "I validated the input" is a claim until a test proves it. Cite the check that ran, not the intention.

---

## Part B — CODE Floor (this discipline instance)

Inherits the spine. AI-authored code has *named, measured failure classes* — the MUSTs below defend the ones research shows agents reliably get wrong (≈45% of AI code fails security checks and does not self-improve; XSS left undefended ≈86%; hallucinated/squatted dependencies ≈20%).

### B1. Security — MUST (iron-law, the goal)

Positively required on every build:

- **Validate and escape at every trust boundary.** Treat all external input as untrusted: validate it on the way in, escape/encode it on the way out. This is the standing defense against injection and XSS — the classes agents most often leave open. Use parameterized queries and context-aware output encoding.
- **Authenticate and authorize every entry point.** Every route, handler, job, and RPC checks *who is calling* and *whether they may do this* — access control is enforced server-side, on each entry, by default (broken access control is OWASP Top 10:2025 #1-class). **A security check that errors fails *closed*** — it denies by default, never grants (OWASP A10:2025, mishandling exceptional conditions — a class AI auth code reliably gets backwards).
- **Keep secrets out of code and logs.** Secrets come from config/secret-store at runtime; source, fixtures, and log output stay clean.
- **Verify dependency integrity.** For every imported package: confirm it **actually exists**, is the **real, maintained** package (not a hallucinated or typo-squatted name — "slopsquatting"), and **pin it via lockfile**. A package the model "remembers" is a claim until the registry confirms it.
- **Cover the OWASP Top 10:2025 floor surface** — the high-signal classes for built products: injection, broken access control, insecure design (threat-model the feature, don't bolt security on after), security misconfiguration / hardening (safe defaults, least privilege), vulnerable & outdated components / supply-chain (SBOM-aware, patched deps), and security logging & monitoring failures (auth and security-relevant events are observable).
- **When the built product itself uses an LLM**, defend the agent-specific surface (OWASP LLM Top 10, 2025) — highest-signal classes here, **including**: prompt-injection (untrusted content does not redirect the agent), sensitive-information disclosure (secrets, PII, and other users' context stay out of completions — LLM02, the #2-ranked class), excessive agency (the agent's tools/permissions are least-privilege and bounded), and improper output handling (LLM output is treated as untrusted input, validated/escaped before use). The deeper LLM surface is owned by the JIT SECURITY floor.

### B2. Correctness & reliability — MUST (the goal)

- **Handle the unhappy paths.** Empty, missing, malformed, boundary, and error inputs each produce a defined, intentional result — handled on purpose, not left to chance.
- **Release every resource you acquire.** Connections, file handles, locks, threads/tasks are freed on *all* exit paths — success, error, and cancellation (defer / try-finally / RAII / context cancellation). AI code reliably writes the happy-path release and skips the error path; a leaked resource is a slow outage.
- **Make distributed/external interactions safe.** Where the code crosses a process or network boundary, apply the relevant safeguards: **idempotency** for retryable operations, **bounded retry with jitter**, **timeouts**, and a **circuit-breaker / fallback** for dependencies that can fail. Where state is shared, make concurrent access **atomic and race-free**.
- **Fail loudly, observably.** Every error surfaces with enough structured context (structured logging; tracing/OTel where the architecture warrants) to diagnose without a repro — caught, logged, and propagated, kept visible rather than silently discarded.

### B3. Maintainability — MUST goal, SHOULD proxies

- **MUST (goal):** the code is clear to the next reader, and modules are **loosely coupled, cohesively scoped** — a change stays local rather than rippling. Watch connascence: the more strongly two units must agree, the closer they should sit.
- **SHOULD (tunable proxies, each a flashlight not a judge):**
  - *Function/unit length & nesting depth* — keep small enough to hold in one head; extract when a unit does two jobs, **not** to chase a number (over-extraction relocates complexity — A4).
  - *Cyclomatic complexity threshold* — a smoke-alarm for "this needs a second look," not a hard gate.
  - *Naming reveals intent* — consistent verbs and boolean prefixes, no style-mixing within a file. The wrong name is the most common AI-introduced unclarity, and it directly undercuts the MUST above.
  - *Duplication — rule of three* — tolerate the first copy, consolidate on the third. AI agents default to copy-paste (measured: duplication rising while refactoring falls), and duplicated logic breaks "a change stays local."
  - *Code-review gate* — every change gets a second set of eyes (REVIEW-L8 is this for STORM).

### B4. Tests — MUST goal, SHOULD proxies

- **MUST (goal):** tests exist that would **catch a regression** in the behavior that matters, and they pass. *Coverage is a proxy, not the target* — chasing a coverage % is Goodhart's law (the number goes green while the meaningful cases stay untested). Test the behavior, then let coverage report on it.
- **SHOULD (tunable, follows architecture — no universal winner):**
  - *Test shape follows the architecture, not a fixed pyramid.* A monolith leans unit-heavy; a microservice's bugs live **at the seams**, so weight toward **contract tests** there. Choose where bugs actually hide.
  - *Mocking vs. contract* and *test-pyramid shape* are genuine "no universal winner" debates — pick per context and note the call; do not hard-code one.
  - *Mutation / property-based testing* — reach for these when correctness is high-stakes and example-based tests feel thin; they measure whether tests *would actually fail* on a real defect.
  - *Flakiness is a defect.* A nondeterministic test is fixed or quarantined, never normalized.

### B5. Supply-chain & operability

No separate MUST — already floored above and enforced by the **machine**, not prose: dependency-pinning/lockfile (B1), observable failure (B2), and SBOM / advisory (CVE) scanning (the gate-machine — see *How it's enforced*). Listed only so the floor's coverage is legible; the binding enforcement lives in the machine.

---

## Per-discipline floors authored JIT

When a module first produces that kind of output, author its floor onto this spine (Part A) and slot it beside Part B:
- **UI floor** — accessibility, semantic structure, responsive/keyboard/focus behavior, perceived-performance, no-AI-slop.
- **SECURITY floor** — the full discipline depth that B1 only floors (deeper threat-modeling, the complete OWASP / OWASP-LLM surface, supply-chain hardening).
- **DATA floor** — schema integrity, migration safety (expand-then-contract), PII handling, retention.

Each inherits A1–A6 unchanged and adds its own MUST goals + SHOULD proxies.

---

## Operative core (quote this inline)

> **Craft floor (iron-law, no dial).** Build the simplest thing that *fully* does the task — including the unhappy paths — and right-size it: extra structure for needs that don't exist yet fails the floor as hard as sloppiness does. Validate every input and escape every output at the trust boundary (injection/XSS); authenticate + authorize every entry point and **fail security checks closed** (an error denies, never grants); keep secrets in config, out of code and logs; verify every dependency exists, is the real maintained package, and is lockfile-pinned. Handle empty/error/boundary/concurrent paths and **release every resource on all exit paths** (success, error, cancellation); make cross-boundary calls idempotent, time-bounded, retry-with-jitter, race-free; **surface every error with structured context** (observable, never silent). Leave tests that would **catch a regression** (coverage is a proxy, not the target). Keep it clear, well-named, and loosely coupled.
>
> **Before "done":** check against the *actual artifact*, not memory — task fully done? inputs validated, outputs safe? clear to the next reader? right-sized? regression-catching tests pass?
>
> **Don't trust your own self-report.** Your verdict is a draft; the binding verdict is the gate-machine (checks that *ran*) plus an independent reviewer. Cite the check that ran, not the intention.
