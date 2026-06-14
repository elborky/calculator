---
description: Enter REVIEW phase — demo + feedback collection in orchestrator; categorization/log/fix work dispatched to forked sonnet sub-agents
model: sonnet
---

Enter STORM REVIEW phase.

**Tier discipline:** demo presentation and feedback collection run in orchestrator (conversational). Synthesis (categorization, log write, fix work) dispatched to **sonnet** sub-agents; Layer 8 code audit dispatched to **opus** sub-agent.

**DISPATCH RULE (measurement integrity, per #FF-017):** every Agent tool dispatch from this command MUST:
1. Pass an explicit `model:` param matching the declared tier (`"sonnet"` for log/fix work; `"opus"` for Layer 8 code auditor). **NEVER omit** — silent inheritance from parent session corrupts the `Model:` trailer measurement signal.
2. Substitute every `{TIER}` placeholder in each prompt template with the same value passed to `model:`.
3. Sub-agent's commit trailer MUST be `Model: {TIER}` matching the dispatch. Orchestrator post-check rejects on mismatch.

## Execution (orchestrator)

1. **Invoke `storm-recovery`** to identify module under review.
2. **Invoke `storm-phase-guard`** to verify BUILD exit criteria met.
3. **AI runs 8-layer auto-verification (v1.4 L3-02 / W-G31, per #FF-015 — REVIEW belongs to AI, not human):**

   Read `storm/specify/<NN>-<slug>/_index.md` for `review-layers-skip: [...]` array (W-G33). Layers 7 + 8 ALWAYS run regardless. Then dispatch each applicable layer:

   | # | Layer | Mechanism |
   |---|---|---|
   | L1 | Functional smoke — **User-Reality Crawl** | **Dispatch the independent blind-crawler sub-agent (Template D below)**. Verifier has NO build context; explores as a brand-new user. Two-tier scope: (a) **cheap whole-app reachability sweep** — open home, follow every nav link, diff reachable-set vs the code's route list, flag any route that exists but is unreachable from the UI (catches nav gaps + prior-module regressions); (b) **deep exercise of the current module only** — load+render, happy-path action, edge/error path per surface. Driver: **Playwright** (via MCP or spec files); fallback Chrome MCP / browser-use. Evidence written to disk → `storm/review/evidence/<slug>/L1-crawl/` (screenshots + `reachability.json` + `L1-findings.md`); sub-agent returns **manifest only**, never raw bytes/DOM. |
   | L2 | Console errors | Browser console capture during the L1 crawl → `L2-console.log` |
   | L3 | Network failures | Network panel during the L1 crawl → `L3-network.log` (no 4xx/5xx on critical paths) |
   | L4 | Accessibility | axe-core per flow resting state → `L4-axe-<flow>.json` |
   | L5 | Visual regression | Diff vs `04-ui/<picked-variant>.html` baseline (W-G30) → `L5-visual-<screen>.png` + diff JSON |
   | L6 | Perf smoke | Core Web Vitals (LCP/INP/CLS) → `L6-perf.json` |
   | L7 | Pre-checks + static guards | tsc + lint + unit/integration tests + module-load + **nav-coverage check** (#FF-022) + **resource-existence check** (#FF-021) → `L7-pre.log` (NEVER opt-out) |
   | L8 | Code review | **Dispatch opus auditor sub-agent (Template C below)** + optional parallel `/codex review` if user has gstack → `L8-code-review.md` + optional `L8-codex.md` (NEVER opt-out) |

   **L7 static guards (deterministic floor — run even if the crawl budget is exhausted; stack-agnostic principles, Next.js paths shown as example — adapt to the project's router/nav convention):**

   1. **Nav-coverage (#FF-022):** every routable page must be reachable from the nav, or explicitly waived.
      Principle: each top-level routable page → a matching `href` in the nav component, OR listed in `_index.md` `nav-skip:` (`nav-skip:` = an array in the module's `storm/specify/<NN>-<slug>/_index.md` listing routes intentionally absent from nav — e.g. auth callbacks, error pages — the documented waiver; lives alongside the existing `review-layers-skip:` array).
      Example (Next.js):
      ```bash
      # list top-level route pages
      find src/app -maxdepth 2 -name page.tsx
      # for each, confirm its route segment appears as an href in the nav, else it must be in nav-skip
      # note: matches static absolute hrefs only — also check dynamic href={...} JSX patterns
      grep -o 'href="/[^"]*"' src/components/layout/sidebar.tsx
      ```
      Confirm its route segment is referenced in the nav — the example grep matches static hrefs; adapt for JSX dynamic values.
      Any page with neither an href nor a `nav-skip:` waiver → **P0, blocks PASS**.

   2. **Resource-existence (#FF-021):** every resource the spec mandates must actually exist in code.
      Principle: read `storm/specify/<NN>-<slug>/06-tech-choices.md`, extract every named table / migration /
      library-required resource, and verify each exists under the project's data layer.
      Example (Drizzle/Next.js):
      ```bash
      # extract backtick-wrapped tokens as CANDIDATE resource names (pattern is broad — filter to actual tables/migrations)
      grep -oE '`[a-z_]+`' storm/specify/*/06-tech-choices.md
      # confirm each appears in the schema + has a migration
      ls src/db/schema/ ; ls src/db/migrations/
      ```
      Any spec-mandated resource missing from schema/migrations → **P0, blocks PASS** (this is the #FF-021
      prod-500 class: a resource the spec required but BUILD never authored).

   **HARD GATE:** no PASS without evidence for each applicable layer. Severity per finding: P0 (blocks PASS) / P1 (fix-in-REVIEW) / P2 (auto-park) / P3 (framework-feedback or park).

4. **Surface 8-layer report to user (W-G35 schema)** — per-layer pass/fail, severity-graded findings, evidence links, AI-proposed fix per P0/P1. Accept human ack/reject/discuss per finding. Auto-park P2 findings to `storm/meta/parking-lot.md` (no ask). Log P3 framework-friction to `storm/meta/framework-feedback.md` if applicable.
5. **Collect additional human feedback** (conversational, orchestrator):
   - User reviews 8-layer report + evidence — does NOT manually exercise the app at this stage.
   - Open ask: *"AI 8-layer results above — anything wrong with the report? Any flow we missed?"*
   - Accept text feedback. If user wants additional flows tested → AI runs them via browser automation, not human.
   - Collect items into buffer (main session).
   - If endless-dissatisfaction pattern detected (CP-3): *"Noticed we've circled — would explicit accept criteria help?"*
6. **Dispatch sonnet sub-agent to write consolidated review log** (Template A below) covering auto-graded findings + human-surfaced items. Wait, verify commit.
7. **For each P0/P1 fix identified in log:** dispatch sonnet sub-agent to implement fix (Template B below). Wait, verify commit. **Re-run affected layers** to confirm fix held. Surface result: *"Fixed: [gist]. Re-verified L<N>: PASS. Try again?"*
8. **For loop-back items (spec wrong, foundation wrong):** narrate CP-1 option: *"This needs SPECIFY / STRUCTURE loop-back. [options]."* Handle outside REVIEW (dispatch `storm-phase-guard`).
9. **Exit marker (main session commit):** `storm:REVIEW:<module>::exit - <verdict>` with Model:/Felt: trailers.

## Sub-agent dispatch templates

### Template A: Categorize + log

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM REVIEW categorize feedback <module>`

```
You are a STORM REVIEW sub-agent running on {TIER} tier. Process feedback and write log.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

MODULE: <module name> (folder: storm/specify/<NN>-<module-slug>/)
REVIEW CONTEXT (must read):
- storm/specify/<NN>-<module-slug>/_index.md + concern files
- storm/build/<NN>-<module-slug>/ artifacts (code in src/)

FEEDBACK ITEMS (from orchestrator buffer):
<paste list of feedback items verbatim>

TASK:
1. For each feedback item AND each auto-graded layer finding, categorize:
   | Category | Action |
   |---|---|
   | Implementation bug | Stays in REVIEW — fix required |
   | Spec wrong | Loop-back to SPECIFY |
   | Foundation wrong | Loop-back to STRUCTURE |
   | New scope | Park to storm/meta/parking-lot.md |
2. Apply v1.4 W-G32 severity taxonomy: P0 (blocks PASS) / P1 (fix-in-REVIEW) / P2 (auto-park) / P3 (framework-feedback or park).
3. Write storm/review/<NN>-review-<module-slug>.md with frontmatter: storm-phase: review, storm-module: <NN>-<module-slug>, storm-depends-on: [storm/specify/<NN>-<module-slug>/_index.md, storm/build/<NN>-<module-slug>/].
4. Body: per-item log — category, priority, response plan, commit refs (empty until fix).
5. Final section: verdict — PASS / FIX-REQUIRED / LOOP-BACK.
6. Commit atomically:
   Subject: storm:REVIEW:<module-slug>::log - <verdict summary>
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.
- **FORBIDDEN from firing the REVIEW exit/PASS marker (per #FF-009b).** Only this log commit. Orchestrator owns the exit marker after human approval.

RETURN: log file path, commit hash, verdict, P0/P1 count with 1-line descriptions.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template B: Fix implementation

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM REVIEW fix <issue> in <module>`

```
You are a STORM REVIEW sub-agent running on {TIER} tier. Fix ONE issue.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

MODULE: <module name>
ISSUE: <1-line description from review log>
PRIORITY: <P0 | P1>
REPRO / DESCRIPTION (from feedback): <full text>
RELEVANT FILES: <list from review log — code files likely involved>

STEPS:
1. Reproduce the issue (if not self-evident from description).
2. Implement fix. ≤ 1 logical unit. If fix spans multiple files, they go in one commit.
3. Run self-test; confirm issue resolved.
4. Update storm/review/<NN>-review-<module-slug>.md: mark the item Resolved with commit ref.
5. Commit atomically:
   Subject: storm:REVIEW:<module>::fix - <short desc>
   Trailers (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE issue per sub-agent invocation. ONE commit. Trailers mandatory.
- NO user interaction. Orchestrator handles demo / approval dialogue.
- **FORBIDDEN from firing the REVIEW exit/PASS marker (per #FF-009b).** Only this fix commit.

RETURN: commit hash, 1-line summary, verification result (issue reproduces no longer / still reproduces).

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template D — User-Reality Crawl (independent blind verifier)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"sonnet"`. Never omit (#FF-017).
- `description`: `STORM REVIEW L1 user-reality crawl <module>`

```
You are a STORM REVIEW Layer 1 user-reality verifier running on {TIER} tier.
You are a brand-new user who has never seen this codebase. Find what is broken or unreachable.
You receive NO build context — only this briefing.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md

MODULE: <module name> (slug: <NN>-<module-slug>)
APP BASE URL: <running app base URL>
MODULE ROUTE NAMESPACE: <e.g. /opportunities — bounds the deep tier>
AUTHORED AC ORACLE: storm/specify/<NN>-<module-slug>/07-acceptance.md — read this FIRST. Each `[ ]` checkbox is a browser-observable pass-criterion. Verify the running app satisfies every observable AC; any unmet AC = P0 fail (Layer 1 verifies the app against the **authored oracle**, not an on-the-fly judgement).

ROUTE-LIST SOURCE (do this first):
- Derive the authoritative route list by SCANNING the project's router structure
  (e.g. Next.js src/app/**/page.tsx, or the project's router config).
- NOT a builder-supplied page list. The scanned list is ground truth.

TASK (two tiers):
1. Reachability sweep (whole app, load-only):
   Start at home, follow every nav link, record the reachable set, diff against the
   scanned route list, flag routes that EXIST in the router but are UNREACHABLE from the UI.
2. Deep exercise (current module only, bounded by MODULE ROUTE NAMESPACE):
   Per surface — load+render check, perform the main happy-path action, then one edge/error path.

DRIVER: Playwright (MCP or .spec.ts files); fallback Chrome MCP / browser-use.

PAYLOAD HYGIENE (MANDATORY, #FF-020):
- Write ALL screenshots/logs to storm/review/evidence/<slug>/L1-crawl/.
- NEVER return raw page text / DOM / screenshot bytes into context. Manifest + findings file only.

OUTPUTS (written to disk):
- storm/review/evidence/<slug>/L1-crawl/reachability.json — schema:
  { "scanned_routes": [string], "reachable_from_ui": [string], "unreachable": [string], "checked_at": "ISO-8601" }
  (unreachable = scanned_routes minus reachable_from_ui; any non-empty unreachable for the
   current module → P0.)
- per-surface screenshots under storm/review/evidence/<slug>/L1-crawl/.
- storm/review/evidence/<slug>/L1-findings.md — severity-graded P0/P1/P2/P3 findings.

CP-13 audit (MANDATORY before commit): run the 7-dim self-critique on findings; verdict
DO-NOT-PROCEED-AS-IS → do not commit, return failed-dim + alternative to orchestrator.

COMMIT atomically:
  Subject: storm:REVIEW:<module-slug>::L1-crawl - <P0:N P1:N P2:N P3:N>
  Trailers (mandatory):
    Model: {TIER}
    Felt: <ok | snappy | long>

HARD RULES:
- Write evidence to disk; return manifest only. Trailers mandatory. NO user interaction.
- Budget cap: bound the deep-exercise tier to the current module's surfaces ONLY; do not crawl the whole app deeply.
- **FORBIDDEN from firing the REVIEW exit/PASS marker (per #FF-009b).** Only this L1-crawl commit. Orchestrator owns the exit marker after human approval.

RETURN: manifest only — evidence dir path, reachability.json path, L1-findings.md path, route counts (scanned / reachable / unreachable), P0/P1/P2/P3 counts, verdict, commit hash.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

### Template C: Layer 8 Code-Review Auditor (v1.4 W-G34)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"`. Never omit (#FF-017).
- `description`: `STORM REVIEW L8 code-audit <module>`

```
You are a STORM REVIEW Layer 8 code auditor running on {TIER} tier.
Adversarial-audit hat (per CP-2 critical-reviewer lexicon).

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md
CRAFT FLOOR (C3 — the standard you enforce, sieve 4): ~/.claude/docs/storm/craft-floor.md (dev-time fallback: docs/craft-floor.md). Read the spine (Part A) + the floor(s) matching this module's output discipline (code/UI/security/data — JIT, not all). You are the INDEPENDENT adversarial tier ("don't-trust-self-report"): the sub-agent self-attested; your job is to FIND craft-floor violations it missed, not re-attest.

MODULE: <module name>
SCOPE: code in src/ touched by storm/build/<NN>-<slug>/ commits since module's last REVIEW

AUDIT CHECKLIST (cover all; each finding graded P0/P1/P2/P3):
1. OWASP Top-10 surface for this module (auth, injection, XSS, IDOR, SSRF, deserialization, secrets-in-logs, etc.)
2. Secrets scan: hardcoded credentials, tokens, env-var-misuse
3. Dead code: unreachable branches, unused imports, commented-out blocks, half-finished functions
4. Complexity: functions >50 LOC, nesting >4 levels, cyclomatic complexity outliers
5. Fragmentation discipline: files >800 lines (per CP-5 L5-01 threshold) — must split; files <100 lines that should be merged
6. Cross-file consistency: code references match _decisions.md autonomous-decisions log; FK column names match data-model.md
7. Error handling: silent catches, swallowed exceptions, missing user-facing error states
8. Test coverage: critical paths covered by integration tests; pre-checks (L7) green
9. Craft floor (craft-floor.md): grade the output against the iron-law craft bar — flag every violation of clarity / safety (validate+escape at boundaries, fail-closed, resource cleanup on all exit paths, dependency integrity) / tested (regression-catching tests, not coverage-as-target) / no over-engineering (speculative generality is a defect — the brakes work both ways).

OUTPUT: storm/review/evidence/<slug>/L8-code-review.md with:
- Per-checklist-item: PASS / FINDINGS-LIST
- Per-finding: severity (P0/P1/P2/P3), file:line, description, proposed-fix (1-2 lines, NOT diff)
- Verdict summary: P0 count, P1 count, P2 count, P3 count

COMMIT atomically:
  Subject: storm:REVIEW:<module>::L8-audit - <P0:N P1:N P2:N P3:N>
  Trailers: Model: opus, Felt: <ok | long>

HARD RULES:
- ONE file. ONE commit. Trailers mandatory. NO user interaction.
- FORBIDDEN from firing REVIEW exit marker (per #FF-009b). Only this L8 commit.
- DO NOT write fixes — only audit. Orchestrator dispatches sonnet sub-agents (Template B) for fixes.

RETURN: file path, commit hash, severity counts, top-3 P0/P1 1-liners.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

**Optional parallel `/codex review` (W-G34):** if user has gstack and codex CLI configured, orchestrator dispatches `/codex review` in parallel with Template C. Both audits land independently; orchestrator merges findings in the consolidated review log.

### Layer 5 screenshot-loop boilerplate (payload-safe, per #FF-020)

Layer 5 (visual regression) and any multi-surface visual sweep MUST follow the screenshot-loop pattern below: navigate → screenshot to disk → record manifest → **never pull page-text/DOM/bytes into context**. This is the L5 sibling of Template D's L1 crawl. Stack-agnostic; Playwright shown as the driver (fallback Chrome MCP / browser-use). Run it inside a forked sub-agent for large surface counts so the orchestrator context stays clean.

```
# PATTERN (pseudo-code — adapt to project's Playwright/MCP setup; do NOT hardcode a stack)
surfaces = [ {slug, url, baseline: "storm/specify/<NN>-<slug>/04-ui/<picked>.html"}, ... ]
outdir   = "storm/review/evidence/<slug>/L5-visual/"
manifest = []

# sample-then-expand (per #FF-020): cap the FIRST pass to 5-7 high-signal surfaces
for s in surfaces[:7]:
    page.goto(s.url)
    page.wait_for_load_state("networkidle")
    shot = outdir + s.slug + ".png"
    page.screenshot(path=shot, full_page=True)        # image to DISK, not context
    diff = compare(shot, render(s.baseline))           # structural/pixel diff → JSON
    manifest.append({surface: s.slug, shot, diff_path, verdict, axes_flagged})
    # DO NOT read page text / DOM / screenshot bytes back into context

write_json(outdir + "L5-manifest.json", manifest)      # manifest is the only payload
# expand to the remaining surfaces ONLY if the sampled pass reveals a systematic divergence
```

**HARD rules (mirror storm-protocol.md Browser audit payload hygiene):**
- Screenshots + diff JSON to disk under `storm/review/evidence/<slug>/L5-visual/`; return the manifest path + per-surface verdict + counts only.
- NEVER return raw page-text / DOM / screenshot bytes into the orchestrator context.
- Diff axes per W-G55: color / spacing / typography / layout / components / motion / a11y. Material divergence = P1; minor = P2.
- Sample 5-7 first; bulk-expand only on confirmed systematic divergence — prevents autocompact thrash at scale.

## UI Dissatisfaction sub-flow (orchestrator)

If UI dissat signaled:
1. UX hat (orchestrator, narrate): *"What's off — layout, colors, density, or something else?"*
2. Human describes.
3. If **cosmetic** → dispatch sonnet Template B for quick fix.
4. If **fundamental** → loop-back to SPECIFY `ui.md`, re-interpret (orchestrator hands to `/storm-specify <module>`).

## Post-dispatch checks (orchestrator)

1. Verify commit + Model: sonnet trailer.
2. Read review log / diff for context.
3. Narrate result to user for approval before moving to next item.

## Exit

- All P0/P1 feedback resolved (commits land) OR explicitly loop-backed/parked.
- Human says *"this module is done"* or equivalent.
- **Module-status tracker updated (#FF-023):** set this module's `Phase` → `REVIEW-PASS` (or `STAGING` if it deploys to staging on review) and `Staging SHA` = the REVIEW-exit commit in `storm/meta/module-status.md` (create from the §6 grid schema if absent). Atomic — fold into the exit commit. On-demand artifact, NOT CLAUDE.md.
- Main session fires exit marker.

## Principles in play

- CP-1 counselor (response plan per item)
- CP-2 hat-switch (per feedback type)
- CP-3 anti-abandonment guard
- CP-4 narration
- CP-8 auto-park (new scope)
- CP-10 small wins
- CP-11 exit
- CP-12 recovery (atomic commits per log + per fix)
- Model tiering — **enforced via sonnet dispatch**
