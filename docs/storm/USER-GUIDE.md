# STORM User Guide

Day-to-day usage of STORM (Structured Thinking Out of Raw Mess) for building software with AI.

**Pair with:** `INSTALLATION.md` (setup) · `MANUAL.md` (reference lookup) · `STORM-FRAMEWORK.md` (philosophy).

---

## What is STORM?

A framework for **non-coders building production software with AI**.

You bring vision. AI brings everything else.

STORM works by:
- Extracting chaotic ideas through structured phases
- Keeping docs and code in sync automatically
- Catching abandonment-prone moments (stuck, confused, pivoting)
- Making progress visible at every step
- Recovering gracefully across sessions

**You never write code.** **You never leave the `.md` layer.** You just talk.

---

## Mental Model

Think of STORM as a **6-act play** for building a product.

```
Act 1: CAPTURE     — "Tell me everything in your head"
Act 2: STRUCTURE   — "Let's organize the shape"
Act 3: SPECIFY     — "Let's detail one module"
Act 4: BUILD       — "Let's make it"
Act 5: REVIEW      — "Try it; tell me what's off"
Act 6: SHIP        — "Deploy to production"
```

The same cycle repeats for each new module, feature, or post-launch addition.

**You play the director.** You direct vision and pick business decisions.
**AI plays the cast.** Domain experts on demand: UX designer, business analyst, data architect, security expert, etc.

---

## Your First Project — Walkthrough

### 1. Global install (one-time)

See `INSTALLATION.md`. Summary: copy STORM files to `~/.claude/` so they work across any project.

### 2. Bootstrap the project

```bash
mkdir ~/my-new-idea
cd ~/my-new-idea
# Start Claude Code here
```

In the session:
```
/storm-init
```

Claude asks *"Apa yang mau lo build?"* → you answer in 1-2 lines → Claude creates scaffolding, `git init`, first commit. Done.

State: **Pre-CAPTURE**.

### 3. Start ideation (CAPTURE)

```
/storm-capture
```

**Just talk.** Dump everything — features, pain points, dreams, constraints, worries. Any language. Any order. Don't structure.

When you're empty:
- Claude asks *"udah ada lagi?"* — if yes, continue; if no, probing starts
- Probe types rotate: completeness, failure modes, stakeholders, constraints, emphasis
- One question per turn, conversational

When coverage feels full:
- Claude produces `storm/capture/03-ideation-coverage.md` for confirmation
- Confirm → CAPTURE exits cleanly

### 4. STRUCTURE (AI-led)

Claude proposes 8 files in `storm/structure/`:
- `01-vision.md`, `02-user-roles.md`, `03-modules.md`, `04-scope.md`, `05-dependency-map.md`, `06-build-order.md`, `07-deployment-target.md`, `08-design-system.md`

You approve each. Claude marks **what came from you** vs **what Claude guessed** — so you always know.

### 5. SPECIFY → BUILD → REVIEW (per module)

Pick first module (usually dictated by `build-order.md`). Claude specifies in depth, builds task-by-task, then shows you the running module.

You test, give feedback. Claude categorizes: implementation bug / spec wrong / new scope / foundation wrong. Responds accordingly.

Small wins narrated: *"Task 3 of 7 complete"*, *"Module invoicing is live"*.

### 6. SHIP

Security audit → QA → staged deploy → production. Step-by-step: Claude generates commands, you execute.

Runbook created for ongoing ops.

---

## Typical Session Rhythm

**Start session:**
- Claude runs `storm-recovery` automatically (5-layer cross-check)
- Reports: phase, current module/task, last decision, next step
- Waits for your go-ahead

**During session:**
- You direct (pick business options, validate UX interpretations)
- Claude executes (code, tests, doc updates)
- Popup ideas get auto-parked (no interruption)
- Each task completion celebrated explicitly

**End session:**
- Run **`/storm-end-session`** — the canonical closer. A sub-agent writes a structured handoff note (Done / Decided / Pending / Next) so the next session resumes clean. State is preserved in git commits + `CLAUDE.md` regardless, but the handoff note is the human-facing thread across sessions.
- **Next session:** run **`/storm-start-session`** — the canonical opener. It runs a 5-layer cross-check, reads the last handoff, and reports continuity status before any work begins.

---

## The 6 Phases In Practice

### CAPTURE — "Dump everything"

**Entry:** Claude asks you which mode:
- **(A) Passive Listen** — Claude stays silent while you dump. You signal done (*"udah / selesai / done / lanjut"*), then Claude summarizes and interviews from the summary.
- **(B) Interview** — conversational Q&A from the start, one open question per turn.

You pick. Both modes extract what's in your head; Claude never skips ahead without your explicit signal.

**Rhythm:** whichever mode you pick, Claude waits for your done-signal before transitioning to summary, probes, or phase-exit. The dump-done gate is always yours.

**Feels like:** a patient journalist interviewing you. Open questions, one at a time, conversational (no multi-question forms, no multiple-choice menus).

**Exit:** Claude produces `storm/capture/03-ideation-coverage.md`; you confirm it reflects what you said.

### STRUCTURE — "Shape the project"

**Mode:** Claude leads. Role-flip ceremony announced explicitly.

**Rhythm:** Claude proposes 8 files in draft form → you review each → approve or request specific changes.

**Feels like:** a product strategist walking you through a structured breakdown, with you as the final business authority.

**Exit:** all 8 files approved, no TBDs, design-system has 3+ reference apps.

### SPECIFY — "Detail one module"

**Mode:** Claude leads per-module detail.

**Rhythm:** Claude drafts `storm/specify/<NN>-<module-slug>/*` files → you review and approve each concern → module ready to build.

**Special for UI:** Claude interprets your intent (stated in business language) into a UX pattern + mockup. You validate **the interpretation**, not the design choice.

**Feels like:** a senior engineer writing the tech spec while you review from the user's perspective.

**Exit:** all concern files exist, rules/flows clear, tech choices live-verified.

### BUILD — "Make it"

**Mode:** Claude codes task-by-task.

**Rhythm:** Claude creates task context → writes code → self-tests → shows UI-checkpoints for visual tasks → commits with small-wins narration.

**You do NOT review code.** You review running results.

**Exit:** module runs end-to-end, tests pass, ready for review.

### REVIEW — "Try it"

**Mode:** you lead the testing.

**Rhythm:** Claude surfaces demo → you poke around → feedback (text / screenshots / voice). Claude categorizes and responds.

**Feedback routing:**
- Implementation bug → fix in BUILD
- Spec wrong → loop-back to SPECIFY
- Foundation wrong → loop-back to STRUCTURE
- New scope → parking lot

**Exit:** all non-trivial feedback addressed or deferred; you say *"this module is done"*.

### SHIP — "Deploy"

**Mode:** Claude leads, you execute deploy commands step-by-step.

**Rhythm:** security audit → QA report → staging deploy → smoke test → production deploy → monitoring setup → runbook.

**Exit:** live in production, smoke test passing, runbook written.

---

## Common Scenarios

### Mid-BUILD, you change your mind

Say what you want. Claude:
1. Reflects the tradeoffs aloud (from relevant hat)
2. Proposes 2-3 options with pros/cons
3. Waits for your pick
4. Once picked: updates affected docs atomically → commits → continues BUILD from new state

No chaos. No orphaned code.

### You have a new idea while specifying another module

Claude auto-parks it to `storm/meta/parking-lot.md`. You hear: *"Parked as #007: [title]. Continuing [current task]."*

When the current task is done, or at next phase boundary, Claude runs triage — you pick integrate / schedule / reject / someday per ticket.

### Post-SHIP, you want a new feature

New scope → parking lot → triage → if *"integrate now"* → mini-cycle: CAPTURE for just this scope → STRUCTURE tweak → SPECIFY new module → BUILD → REVIEW → incremental SHIP.

Same 6-phase cycle, just scoped to the addition.

### You get stuck or confused

Say *"gw bingung"* or *"I don't understand"*. Claude's friction detector will offer:
> *"Looks like framework friction — log to `storm/meta/framework-feedback.md`?"*

This captures what went wrong so v1.x iterations can fix the root cause.

### You want to pause or kill the project

Say **"stop"**. Claude stops. No challenge. No resistance. You decide when/if to come back.

Pausing long-term is fine — state is preserved. Come back weeks/months later, recovery picks up.

---

## Tips for Chaotic Minds

- **Pop-up ideas: just say them.** Auto-park catches them; no need to remember.
- **Feel stuck? Ask for a status snapshot:** `/storm-status` shows phase, module, tasks, parking lot.
- **Lost in details? Ask for a summary.** Claude tailors to your abstraction level.
- **Restless during BUILD?** Tasks are winnable (1-3 sessions max per module). If a task drags >2 sessions, Claude surfaces it as a blocker.
- **Mood dips?** CP-10 small wins are designed for this. Every completion = dopamine hit. If they feel hollow, log as feedback — framework should adjust.
- **Don't code-review.** Never. Your brain's pattern-matching is for product; Claude's is for code.
- **Mix Bahasa and English freely.** Framework respects your native voice.

---

## Do's and Don'ts

**DO:**
- Talk in your native voice
- Say ideas as they surface (auto-park handles)
- Trust the 6-phase structure; resist skipping
- Log framework friction when it happens (`/storm-feedback`)
- Close sessions freely — state is preserved
- Use `/storm-status` liberally when unsure where you are

**DON'T:**
- Edit `CLAUDE.md` by hand (Claude maintains it — you'd break recovery)
- Try to pick technical decisions (ask for results, not code)
- Force a phase transition (*"go to BUILD"* — let Claude navigate based on exit criteria)
- Skip REVIEW to ship faster (bugs compound; 10 minutes in REVIEW saves 10 hours later)
- Mix project ideas with framework friction (parking lot vs feedback log are separate)
- Blame yourself when stuck — friction is framework data, not personal failure

---

## When STORM Works Best

- Solo non-coder + AI
- Multi-week to multi-month projects
- Real stakes (production software, not toys)
- Non-English primary language
- Chaotic / ADHD-like cognitive style
- Long-term maintenance planned

## When STORM Is Overkill

- Simple scripts or one-off tools
- Quick prototypes you won't maintain
- Team of experienced developers (you have your own process)
- Anyone who resists planning before building

---

## Friction You Might Hit

STORM v1.5.0 has been field-validated against two real multi-session projects. It is a living baseline — iteration continues from real usage. Expected friction points:

- Some commands may behave unexpectedly in edge cases
- Skills may over-trigger or under-trigger
- Phase transitions may feel rigid where flexibility is warranted
- Terminology may be unclear for your domain

**What to do when this happens:**
```
/storm-feedback "descriptive description of the friction"
```

Your entry goes into `storm/meta/framework-feedback.md` with category + severity + context. At end of your project (or at checkpoints), run `/storm-feedback review` — clusters become v1.x priorities.

---

## Quick Command Cheatsheet

Full reference in `MANUAL.md`. Most-used:

| Command | Purpose |
|---------|---------|
| `/storm-init` | Bootstrap new project |
| `/storm-start-session` | **Session opener** — 5-layer cross-check + handoff continuity report |
| `/storm-end-session` | **Session closer** — writes structured handoff, commit |
| `/storm-status` | Lightweight mid-session peek ("Where are we?") |
| `/storm-capture` | Enter/resume CAPTURE |
| `/storm-structure` | Enter STRUCTURE after CAPTURE |
| `/storm-specify [module]` | Enter SPECIFY for a module |
| `/storm-build` | Enter BUILD for current module |
| `/storm-review` | Enter REVIEW for current module |
| `/storm-ship` | Enter SHIP |
| `/storm-park "desc"` | Manual park (rarely needed; auto-park is default) |
| `/storm-feedback "desc"` | Log STORM friction |
| `/storm-recover` | Force state cross-check + repair |

---

## Getting Help

- **Framework philosophy:** `STORM-FRAMEWORK.md`
- **Implementation depth:** `STORM-WORKFLOW.md`
- **Command / skill / file reference:** `MANUAL.md`
- **Installation:** `INSTALLATION.md`
- **This file:** practical walkthrough
- **Friction you hit:** `/storm-feedback` — it feeds v1.x

---

*STORM v1.5.0 — field-validated, living baseline. Log friction via `/storm-feedback`; the framework gets better.*
