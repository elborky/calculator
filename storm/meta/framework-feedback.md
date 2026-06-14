---
storm-depends-on: []
storm-phase: meta
storm-canonical: false
---

# Framework Feedback

> AI-maintained. Logs friction with the STORM framework itself (not project ideas — those go to parking-lot.md).
> Entries feed back into STORM evolution.

## Detection Triggers

- Same clarifying question asked 3+ times on same topic
- Same frustration pattern circled back 2+ times in 5 turns
- Explicit "I don't understand the framework here"
- AI detects principle ambiguity during decision-making
- Workflow step with no clear next action

## Entry Format

```
### #NNN — [Short title]
- **Date:** YYYY-MM-DD
- **Phase:** [phase where friction occurred]
- **Category:** principle-ambiguity | missing-step | over-complexity | under-specification | other
- **Severity:** low | medium | high | blocking
- **Description:** [what happened, verbatim if possible]
- **Proposed fix:** [if obvious]
- **Status:** open | acknowledged | resolved
```

---

### #001 — storm-init .gitignore template omits node_modules despite provisioning test-tooling/node_modules
- **Date:** 2026-06-14
- **Phase:** CAPTURE (surfaced at CAPTURE exit commit)
- **Category:** missing-step
- **Severity:** medium
- **Description:** `/storm-init` auto-installs Playwright into `test-tooling/node_modules/` for non-Node projects, but the `.gitignore` it writes does NOT list `node_modules/` or `test-tooling/node_modules/`. At CAPTURE exit the orchestrator ran `git add -A` and swept ~357k lines of node_modules into a commit (f6f1d21). Two contributing causes: (a) **framework gap** — init's gitignore template should include `node_modules/` whenever it provisions Playwright in `test-tooling/`; (b) **orchestrator execution slip** — used `git add -A` for an exit-marker commit that should have been `--allow-empty` with no staging. Cleaned up in commit (untracked + gitignored).
- **Proposed fix:** (1) add `node_modules/` + `test-tooling/node_modules/` to the storm-init `.gitignore` template's Node block. (2) Reinforce in storm-capture/exit guidance: exit-marker commits use `--allow-empty`, never `git add -A`.
- **Status:** open
