# Session Delta — verbal-only outbox (#F-012)

> Written by orchestrator at session EXIT. Overwritten each exit. Sub-agent reads this to fold in
> [conversation-claim] items. Bounded (CP-14) — a delta, not a journal.

## Session: 2026-06-15 (BUILD M4 theme toggle — built + verified, NOT deployed)

### Open-questions this session (→ ⏳ Pending, needs owner)

1. **Deploy M4 to prod, or leave it local-only?** M4 theme toggle is BUILT + AA-verified on
   `main` but NOT deployed — prod (`calc.elborky.my.id`) still runs v1.0.0 without the toggle.
   Owner ended the session ("udahan") without deciding whether to (a) REVIEW M4 → redeploy so the
   toggle goes live, or (b) leave M4 parked locally. AI recommended REVIEW M4 first before any
   redeploy. Carry forward until owner picks.

### Verbal items already landed in git/CLAUDE.md (listed for confirmation, not re-derivation)

- **v3 "Iridescent Dawn"** picked as the light theme; Light+Dark 2-state (System 3rd option
  DEFERRED); OS-default first-load + single-key localStorage persist. (Committed across M4 spec
  + build.)
- **#F-003 logged** (framework-feedback `ac84ccd`): #FF-037 credits-gate fires every BUILD/SHIP
  session when orchestrator is in 1M context; turning 1M off always fixes it. Proposed permanent
  pre-dispatch context check. (Durable in `storm/meta/framework-feedback.md`.)
- **2 AA fixes** found in Group-G real-browser verify: light `--tape-scrim` override (3956f08),
  light `--text-secondary` 0.60→0.66 (d000e9e). (Durable in git + group-g-aa-verification.md.)

### Open follow-ups (durable in CLAUDE.md + parking #001 — listed for next-session visibility)

- parking #001: build drops unprefixed `backdrop-filter` → Firefox glass gap (lightningcss/postcss fix → redeploy).
- Enable HSTS in `security-headers.conf` now HTTPS is confirmed live → redeploy.
