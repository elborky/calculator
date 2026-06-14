---
name: storm-sync-cascade
description: Use when a canonical STORM doc changes (direct user edit OR conversation intent implies doc change), or when `/storm:sync` is invoked. Detects change, walks DAG downstream, composes propagation plan, gets comprehension-check approval, executes atomic cascade with STORM commit convention. Never auto-cascades without approval.
---

# STORM Sync Cascade

Implement the Sync Contract: one canonical source per concern, downstream derives from upstream, cascade is atomic and approved.

## When to invoke

- **Session start:** `git diff` shows change in a `storm-canonical: true` file
- **Mid-session:** user edits a canonical doc directly
- **Conversation intent:** user expresses change intent (e.g., *"change the approval flow,"* *"gw mau tambah role supervisor"*)
- **Explicit:** `/storm:sync` invoked

## Frontmatter contract

Every canonical doc declares:

```yaml
---
storm-depends-on:
  - path/to/upstream.md
storm-phase: [capture|structure|specify|build|review|ship|meta]
storm-canonical: [true|false]
---
```

Only `storm-canonical: true` changes trigger cascades. Derivatives are AI-written from canonical sources — they don't cascade on their own changes.

## Detection

1. Run `git diff HEAD` (or since last STORM commit) on files with `storm-canonical: true`
2. For conversation intents: identify which canonical doc the intent targets (may be multiple)
3. For `/storm:sync`: explicitly list canonical-marked files and show which have diffs

## DAG walk

For each changed canonical doc:

1. Find all docs listing this doc in their `storm-depends-on`
2. Recursively find their downstream dependents
3. Flag code artifacts (`src/**`) downstream of SPECIFY-phase docs — those imply BUILD re-work or loop-back

Build an ordered list of affected docs (topological order — upstream first).

## Propagation plan composition

For each affected doc, draft a diff summary:
- **What changes:** specific field/section
- **Why:** direct link to upstream change
- **TBDs introduced:** flag explicitly for human attention
- **Code impact:** if any `src/` change is implied, flag for BUILD decision

## Announce + approve (counselor pattern CP-1)

```
Change detected in [upstream-doc].
[Brief: what the upstream change is]

Affects downstream:
- [affected-doc-1]: [diff summary]
- [affected-doc-2]: [diff summary]
- [code impact if any]: [flag]

Propagation plan:
1. [Step 1]
2. [Step 2]
...

Confirm? (yes / adjust / discuss more)
```

**Comprehension-check approval** — user validates that AI got intent right, NOT reviewing technical diff. Do not ask user to review code-level changes.

## Execute cascade (on approval)

1. Apply all doc changes in one operation (atomic — all-or-nothing)
2. Verify DAG consistency post-change (no broken deps, no orphan references)
3. Update `CLAUDE.md` if current state shifted
4. Commit with STORM convention:

```
storm:SYNC:[source-doc-or-concern]:cascade - [short description]

Upstream change: [describe]
Affected: [list]
```

Example:
```
storm:SYNC:flows:cascade - add manager approval before invoice generation

Upstream: specs/invoicing/flows.md (user change of mind mid-BUILD)
Affected: data-model.md (approval_status field), ui.md (approval UX interpretation),
         dependency-map.md (+user-roles dep), build/invoicing/task-004 reverted +
         task-004a queued
```

## Rollback

Every cascade = 1 atomic commit → revertible.

- User says *"rollback last change"* or `/storm:rollback` → `git revert HEAD` of last cascade commit; verify DAG; report post-rollback state.
- User says *"rollback to before [description]"* → identify commit by matching message; `git revert [range]`; verify.
- Multi-step rollback allowed backward to **phase-exit anchors** (safe checkpoints where full phase exited cleanly).

After rollback:
> *"Rolled back: [summary]. Current state: [post-rollback phase/sub-context]. Ready?"*

## On rejection

If user rejects the plan:
1. Do NOT execute.
2. Ask: *"What didn't land? Intent misread, affected list wrong, or direction itself needs rethink?"*
3. Refine plan based on answer; re-propose.

## No silent cascades

Do NOT cascade without explicit approval, even for small changes. The Sync Contract is broken the moment AI cascades silently — user loses "I trust what AI does" basis.

**Exception:** AI-derivative doc updates (e.g., regenerating `_index.md` to list new fragments) are AI-internal housekeeping and do not require approval. These never touch canonical content.

## Detection of ambiguous intents

If user intent could affect multiple canonical docs in conflicting ways, pause and ask:

> *"Your request could mean [A] (affects [X]) or [B] (affects [Y]). Which direction? (A / B / different)"*

Don't guess when the blast radius differs.
