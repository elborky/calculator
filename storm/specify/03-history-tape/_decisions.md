---
storm-phase: specify
storm-module: 03-history-tape
storm-canonical: false
storm-depends-on:
  - storm/specify/03-history-tape/_briefing.md
---

# M3 History Tape — Decisions Log

> Aggregated autonomous technical decisions (CP-7 scope) made by the M3 SPECIFY sub-agents.
> Format: L2-05. ID scheme: `D-M3-<CONCERN>-NN` (DM = data-model).

---

## D-M3-DM-01 — `tape` is oldest-first; newest-edge is a render concern

- **Decision:** M3's container is a module-scoped `HistoryEntry[]` stored in **append-chronological order
  (oldest-first)** via a plain `push`. "Most-recent at the visible edge" (F-M3-5) is satisfied by the
  **render layer** (e.g. `flex-direction` / reversed read), NOT by inverting the array on every insert.
- **Rationale:** keeps `append` a trivial O(1) `push`; decouples data order from visual edge so `04-ui.md`
  owns "which edge is top" without forcing a data-structure inversion. Simpler, fewer moving parts (CP-13).
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `01-data-model.md §2`.

## D-M3-DM-02 — `HistoryEntry` carries a monotonic `id` render key

- **Decision:** each entry = `{ expression: string; result: string; id: number }`. `id` is a monotonic
  in-session counter (`nextId++`), used as a **stable key** for the keyed slide-in list (F-M3-7).
- **Rationale:** the render layer animates new lines in / older lines down — a keyed list needs stable
  identity. Two entries can be content-identical (`"2 + 2" = "4"` twice), so content is not a safe key. A
  counter is the cheapest stable id. Internal only — **not user-visible, not persisted, not business data**
  (resets with the array each tab load). Justified against anti-ceremony: it earns its place by enabling the
  motion contract, not as decoration.
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `01-data-model.md §1`.

## D-M3-DM-03 — unbounded tape; overflow handled by scroll (resolves OQ-M3-4)

- **Decision:** the tape is **unbounded** — no length cap, no eviction. Growth is absorbed by the
  scroll the design already mandates (F-M3-5: desktop scrollable panel; phone capped-height scrollable).
- **Rationale:** the array grows only on a human pressing equals on a completed calculation (tens, not
  thousands per session) — no machine/network append path a cap would guard against. A cap adds a real
  eviction branch (slice + magic-N + animate-out interaction) for no benefit (CP-13 over-engineering;
  profile-fit *least-bespoke-code*, F-M3-10). Capping would *silently drop* completed calculations — the
  data loss M2's no-truncate readout principle forbids (`02-calculator-ui` D-006). Resolves **OQ-M3-4** at
  the data level. (Per-entry *long-string* overflow is the separate OQ-M3-5, deferred to `05-edge-cases`.)
- **Authority:** CP-7 technical (AI-autonomous). **Source concern:** `01-data-model.md §5`.
