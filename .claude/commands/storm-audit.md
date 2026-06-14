---
description: User-summoned CP-13 Pre-Action Self-Critique Pass — run 7-dim audit on last proposal, named artifact, or specified decision
argument-hint: [target — "last" | filename | "decision: <description>"]
model: sonnet
---

Run a CP-13 Pre-Action Self-Critique Pass on demand.

User input: $ARGUMENTS

## What this does

Invokes the 7-dimension audit defined in CP-13 (STORM-FRAMEWORK.md §4) and §1.2 (STORM-WORKFLOW.md). Auto-fire triggers usually handle this automatically — this command exists for user-driven cases:

- *"Audit dulu sebelum lanjut"* — verify a recommendation that was already surfaced
- *"Push back diri lo"* — adversarial audit on AI's own prior reasoning
- *"Self-critique scope.md"* — audit a specific artifact for friction/contradiction/gaps
- Mid-discussion sanity check before locking a decision

## Target resolution

Parse `$ARGUMENTS`:

| Pattern | Action |
|---|---|
| empty or `last` | Audit the AI's most recent proposal/recommendation in this session |
| filename (e.g., `storm/specify/01-foo/01-data-model.md`) | Audit the named artifact for internal coherence + cross-doc consistency |
| `decision: <text>` | Audit a stated decision (e.g., `decision: pick Postgres over MySQL`) |
| `cascade` | Audit the most recent cascade plan before sync executes |

## The 7-dimension audit (per CP-13)

For each dimension, produce 1-line concrete reasoning (not abstract pass/fail):

1. **YAGNI** — Apakah proposal scope-creep? Versi lebih kecil ada?
2. **Over-engineering** — Lebih simpel ada? Abstraksi untuk kasus hipotetis?
3. **Broken others** — Regress fitur/decision/CP lain yang sudah ditetapkan?
4. **New gaps** — Bikin downstream issue (cascade, ambiguity, undefined edge) gak ditangani?
5. **Inconsistency** — Berbeda dengan doc lain (artifacts, CLAUDE.md, prior decisions)?
6. **Contradiction** — Lawan decision sebelumnya atau CP lain?
7. **Friction** — Cost di user profile (zero-coding, ADHD, motivation-fragile)?

## Output format (mandatory, compact, anti-sugarcoat)

```
[Self-critique pass — 7-dim, on: <target>]
Strongest concern: [DIM] — [concrete reasoning, ≤2 lines, cite known anomaly if relevant]
Other 6 dims: clean (rationale: [1-line covering remaining]) 
   | ⚠️ [DIM] — [1-line] if any other concern
Cascade impact: [files affected if proposal accepted/changed, ≤3 lines]
Verdict: PROCEED | PROCEED-WITH-CAVEAT | DO-NOT-PROCEED-AS-IS
Recommendation: [if not PROCEED — concrete alternative OR escalation to user]
```

## Hard rules (per CP-13)

- **NEVER** output 7 × ✅ without reasoning — ritual = theater = CP-13 violation.
- **ALWAYS** name strongest concern even on pass (most-likely-to-fail dimension + why it still passes).
- **Concrete examples preferred** over abstract assertions.
- If `DO-NOT-PROCEED-AS-IS` → do NOT execute the audited action. Surface failed dim + alternative.

## Cascade discipline

If audit changes the proposal (verdict ≠ PROCEED), the cascade plan in the output fires in the same turn (per §4.3 multi-author cascade if multi-file). No orphan references allowed — *"apa yang kita hapus di diskusi ini, hapus juga dari document lain"* (dealflow msg 77 verbatim).

## When to invoke explicitly (vs let auto-trigger fire)

Auto-trigger handles: artifact completion, recommendation surfaced, cascade composed, phase transition, tech choice, scope change, decision authority shift, anti-stuck activation.

Use this command when:
- Mid-discussion before AI surfaces — *"pause, audit dulu sebelum lo bikin proposal"*
- On a past decision that wasn't audited at the time (audit retroactively)
- On a specific artifact for spot-check (e.g., before sharing with stakeholders)
- After user spots a known anomaly and wants AI to verify audit honesty (dealflow msg 66 precedent)

## Commit (if audit triggers changes)

Atomic commit per artifact changed:

```
storm:META::audit - <target> verdict <PROCEED|PROCEED-WITH-CAVEAT|DO-NOT-PROCEED-AS-IS>

<short summary of strongest concern + any cascade actions taken>

Model: <orchestrator-tier at audit time, typically sonnet or opus>
Felt: <ok|long>
```

If verdict = PROCEED with no changes → no commit needed (audit was a no-op safety check).
