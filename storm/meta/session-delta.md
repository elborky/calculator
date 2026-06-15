# Session Delta — verbal-only outbox (#F-012)

> Written by orchestrator at session EXIT. Overwritten each exit. Sub-agent reads this to fold in
> [conversation-claim] items. Bounded (CP-14) — a delta, not a journal.

## Session: 2026-06-15 (REVIEW M3 → SHIP v1.0.0 — shipped to production)

### Verbal decisions / resolutions this session (ALL already landed in git/CLAUDE.md — listed for confirmation, not re-derivation)

1. **Prior open questions RESOLVED:** REVIEW M3 chosen over SHIP-M2-first (both ended up shipped
   together as one bundle); the carried "re-run REVIEW M2 forked for clean baseline" is now MOOT —
   REVIEW M3 ran fully forked tier-clean, establishing the clean baseline.

2. **#FF-037 credits-gate re-fired at REVIEW M3 start** (forked dispatch rejected at 0 tokens);
   owner switched session OFF 1M context again → all REVIEW + SHIP forked dispatches then ran clean.
   Same resolution as BUILD M3. (Recorded in review log + module-status — durable.)

3. **Deploy decisions (all committed):** install official `@dokploy/mcp` (config `.mcp.json`,
   credentials in gitignored `.claude/settings.local.json`); source = NEW public GitHub repo
   `elborky/calculator`; drive deploy via direct REST API (not MCP-tool path — MCP not connected
   this session, owner chose direct API); custom domain `calc.elborky.my.id` + Let's Encrypt.

4. **Glass confirmed by owner** in their real Chrome on prod (real-browser is the backdrop-filter
   oracle — headless Playwright false-negatived it 3×). In module-status + parking #001 + memory.

### Open follow-ups (durable in CLAUDE.md + parking #001 — NOT verbal-only, listed for next-session visibility)

- parking #001: build drops unprefixed `backdrop-filter` → Firefox glass gap (lightningcss/postcss fix → redeploy).
- Enable HSTS in `security-headers.conf` now HTTPS is confirmed live → redeploy.
- Optional M4 (theme toggle) if owner extends scope.
