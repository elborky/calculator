# Session Delta — verbal-only outbox

> Written by orchestrator at session EXIT per #F-012.
> Overwritten each exit. Sub-agent reads this to fold in [conversation-claim] items.
> Empty this session = all owner decisions landed in committed structure files.

## Decisions (→ 🔒 Decided)

- **BUILD M2 runs inline on opus, not forked sonnet** — forked sub-agent dispatch
  blocked by #FF-008 (1M-context usage-credits gate; same recurring issue that tagged
  the last 2 handoffs `[unverified-fallback]`). Owner explicitly chose, via
  AskUserQuestion, "Gw jalanin langsung (opus)" over enabling usage credits. Tradeoff
  owner accepted: each task commit honestly tagged `Model: opus` (not sonnet) →
  measurement-tier baseline for BUILD is skewed (#FF-028 no-overclaim honored). Also
  captured in CLAUDE.md "Last decision" + every M2 task commit body — durable, but
  flagged so next session re-confirms whether to keep running inline-opus or enable
  credits to restore tier-purity for the remaining 11 groups.

- **Granularity adaptation for mockup-port groups (1–3)** — committed per-FILE (2
  commits for Groups 1–3: markup, then visual) instead of per-button/per-task (would
  have been 28 commits). Rationale: porting ONE mockup file has near-zero per-button
  recovery value; owner said "gas". Group 0 (genuinely distinct units) stayed per-task.
  Plan markers remain per-task (T-101..T-136 all [DONE]). AI-autonomous granularity
  call (CP-7, consistent with D-007 encoding), surfaced for transparency.

## Open questions (→ ⏳ Pending)

- none. (The inline-opus-vs-credits choice is a re-confirm prompt next session, not an
  unresolved blocker — owner already picked inline-opus for now.)
