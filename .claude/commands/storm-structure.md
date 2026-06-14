---
description: Enter or resume the STRUCTURE phase — AI-led drafting of vision, roles, modules, scope, deployment, design-system via forked opus sub-agents
model: opus
---

Enter or resume STORM STRUCTURE phase.

**Tier discipline:** each `.md` structure file is drafted by a forked **opus** sub-agent (via Agent tool). `09-hero-mockup.html` is drafted by a forked **sonnet** sub-agent (render task, not reasoning). Main session handles role-flip ceremony, per-file approval dialogue, and exit.

**DISPATCH RULE (measurement integrity, per #FF-017):** every Agent tool dispatch from this command MUST:
1. Pass an explicit `model:` param on the Agent tool call (`"opus"` or `"sonnet"` or `"haiku"`) matching the declared tier. **NEVER omit** — silent inheritance from parent session corrupts the `Model:` trailer measurement signal.
2. Substitute every `{TIER}` placeholder in the prompt template below with the same value passed to `model:`.
3. Sub-agent's commit trailer MUST be `Model: {TIER}` matching the dispatch. Orchestrator post-check rejects on mismatch.

## Execution (orchestrator)

1. **Invoke `storm-recovery`** to verify state.
2. **Invoke `storm-phase-guard`** to verify CAPTURE exit criteria (`storm/capture/03-ideation-coverage.md` confirmed).
3. **Domain Lens verification (per L3-01, MANDATORY before role-flip):** verify `storm/structure/00-domain-lens.md` exists from CAPTURE exit (W-G22).
   - **If missing** → loop-back to CAPTURE; do NOT proceed. Narrate: *"Domain Lens missing — CAPTURE didn't complete the role-flip seam. Looping back."*
   - **If present** → Read the file, surface to user: *"Domain Lens carried from CAPTURE: [inferred framing]. Evidence: [Y]. AI-synthesized flags: [Z]. Confirm or revise before drafting downstream?"*
   - On revise → dispatch opus sub-agent to redraft `00-domain-lens.md` with user's correction; commit atomically. Then proceed.
4. **Role-flip ceremony** (highest trust moment):
   > *"Switching to STRUCTURE-lead. Your continued authority: review, challenge, approve, trigger loop-back. Domain Lens confirmed: [X]. I'll draft each structure file and surface for your review, one by one. Every sub-agent briefing cites `00-domain-lens.md` as upstream."*
5. **Drafting loop — 8 `.md` files in order** (00-domain-lens.md already exists from CAPTURE):
   `01-vision.md → 02-user-roles.md → 03-modules.md → 04-scope.md → 05-dependency-map.md → 06-build-order.md → 07-deployment-target.md → 08-design-system.md`

   **Then: `09-hero-mockup.html`** (v1.4.3 per #F-010 — visual anchor for ADHD-prone profile, inspirational not baseline). Dispatch ONE sonnet sub-agent (NOT opus — render task, not reasoning) using `/frontend-design` (D4 baseline per Tool Preferences in `.claude/rules/storm-protocol.md` — applies to ad-hoc design exploration too, not just this happy path; per #FF-019) with `00-domain-lens.md` + `08-design-system.md` as upstream. Single hero screen; no variants. Surface to user: *"Hero mockup rendered — visual manifestation of the design-system. Look right, or revise direction?"* Approve / adjust loop.

   **Diagram-as-Canonical (#E4 Item 4a, WORKFLOW §3.2):** `05-dependency-map.md` embeds a Mermaid `graph` module DAG as the canonical relations source; `07-deployment-target.md` embeds a Mermaid topology (`flowchart`; `architecture-beta` only if CP-6-verified stable). Diagram is canonical for structural facts; prose shrinks to "why"/annotation. Mermaid renders natively on GitHub (owner's read surface). Embed in the existing file — no new diagram files.

   For EACH file:
   a. Dispatch opus sub-agent (template below) to draft the file. Sub-agent's `_briefing.md` MUST cite `00-domain-lens.md` as upstream.
   b. Wait for sub-agent; verify commit landed with Model: opus trailer.
   c. Surface draft to user: *"Drafted `storm/structure/<file>`. Review: [1-line gist]. Approve / adjust / discuss?"*
   d. On approve → next file.
   e. On adjust → dispatch another opus sub-agent with user's feedback; repeat.
   f. On discuss → conversational clarification in main session, then re-dispatch.
6. **Hat-switch per file** (narrate to user before surfacing draft):
   - 01-vision/04-scope/06-build-order → *"Product strategist hat."*
   - 02-user-roles → *"Business analyst hat."*
   - 03-modules/05-dependency-map → *"Data architect / product strategist."*
   - 07-deployment-target → *"Devops / SRE."*
   - 08-design-system → *"UX designer."*
   - 09-hero-mockup → *"UX designer (rendering hat)."*
7. **Exit marker** (main session commit): `storm:STRUCTURE:::approved - 9 .md + hero approved` with Model:/Felt: trailers (00-domain-lens + 01–08 + 09-hero-mockup.html).

## Sub-agent dispatch template (Agent tool)

- `subagent_type`: `general-purpose`
- `model`: **MANDATORY** — `"opus"` for 8 `.md` files, `"sonnet"` for `09-hero-mockup.html`. Never omit (#FF-017).
- `description`: `STORM STRUCTURE draft <file>`
- `prompt`: fill template below — substitute every `{TIER}` with the value passed to `model:`.

```
You are a STORM STRUCTURE sub-agent running on {TIER} tier. Draft ONE structure file.

WORKING DIRECTORY: <CWD>
STORM PROTOCOL: ~/.claude/rules/storm-protocol.md (load first)

FILE TO DRAFT: storm/structure/<filename>.md
UPSTREAM CONTEXT (must read before drafting — upstream-read gate per §8.7.4):
- storm/structure/00-domain-lens.md  ← MANDATORY (per L3-01: canonical cross-phase framing)
- storm/capture/01-braindump.md
- storm/capture/03-ideation-coverage.md
- <any prior structure files already approved>

DRAFT REQUIREMENTS:
- Frontmatter: storm-phase: structure, storm-canonical: true, storm-depends-on: [upstream files]
- Content guidance for this specific file: <inline spec of what this file should contain — see storm-structure.md reference for the 8-file schema>
- Mark content as "proposed" until human approves (orchestrator handles approval).
- If this file requires tech/deployment choices (07-deployment-target.md especially), invoke Mandatory Verification Gate (CP-6):
  - Context7 primary: `npx ctx7@latest library "<candidate>" "<question>"` then `npx ctx7@latest docs <id> "<question>"`
  - WebFetch secondary with time-anchored queries if ambiguous
  - Cite source in the file
- Apply pre-approved decisions from orchestrator inline if provided: <pre-approved decisions verbatim>

STEPS:
1. Read upstream files listed above.
2. Draft structure/<filename>.md end-to-end.
3. Commit atomically with STORM convention:
   Subject: storm:STRUCTURE:::draft - <filename> proposed
   Trailer (mandatory):
     Model: {TIER}
     Felt: <ok | snappy | long>

HARD RULES:
- ONE file per sub-agent invocation. ONE commit.
- Trailers mandatory.
- NO user interaction. Orchestrator handles approval dialogue.

RETURN to orchestrator: file path, commit hash, 1-line gist of content, any verification citations used.

Your dispatched tier is {TIER} (substituted by orchestrator from Agent-tool `model:` param). Trailer MUST match {TIER}.
```

## Post-dispatch checks (orchestrator)

After each sub-agent returns:
1. Verify commit: `git log -1` subject matches expected + trailer `Model:` matches the value passed to `model:` Agent-tool param at dispatch (per #FF-017 — reject on mismatch).
2. Read the drafted file to have context for approval dialogue.
3. Surface to user concisely (1-line gist, not full file dump — user reads file if desired).

## Exit

All 9 `storm/structure/` `.md` files exist (00-domain-lens + 01-vision..08-design-system) and human-approved; `09-hero-mockup.html` exists and human-approved (v1.4.3 per #F-010); no TBDs in `03-modules.md`/`04-scope.md`/`07-deployment-target.md`; `08-design-system.md` has ≥3 reference apps noted. Main session fires exit commit.

## Principles in play

- CP-1 counselor (approval gates per file)
- CP-2 hat-switch (narrated per file)
- CP-4 narration (orchestrator announces dispatches + results)
- CP-6 tech discipline (verification gate inside sub-agent)
- CP-7 decision split (user reviews content, AI drafts under opus)
- CP-11 verifiable exit
- CP-12 recovery (atomic commits per file + mandatory trailers)
- Model tiering discipline — **enforced via forked opus dispatch**
