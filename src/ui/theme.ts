// M4 Theming — resolution + persistence module (Group C, T-411..416)
//
// Owns: readStoredTheme, writeStoredTheme, resolveTheme, applyTheme, toggleTheme,
//       attachOsChangeListener.
//
// Convention contract (R-M4-05 / 06-tech-choices §1):
//   - Dark v3 is the :root default; no data-theme attribute needed for dark.
//   - Light is the [data-theme="light"] override; applyTheme sets data-theme="light"
//     for light, and removes the attribute (or sets to "dark") for dark.
//   - The no-FOUC head script (T-410, Group B) sets document.documentElement.dataset.theme
//     synchronously before first paint — this module's runtime calls (T-423) run AFTER
//     that attribute is already present, so applyTheme here is the ongoing toggle path.
//
// applyTheme convention:
//   light  → dataset.theme = "light"    (triggers [data-theme="light"] CSS override)
//   dark   → dataset.theme = "dark"     (explicit; matches what the no-FOUC script sets
//                                        for dark, and what toggleTheme reads back)
//
// Why explicit "dark" rather than delete: keeping the attribute present with the string
// "dark" makes toggleTheme's current-state read unambiguous (no absent→dark assumption)
// and matches the no-FOUC script which also writes "dark" explicitly.
//
// 03-rules R-M4-01  resolution precedence: stored → matchMedia → default dark
// 03-rules R-M4-02  write-on-toggle, theme-only
// 03-rules R-M4-05  token-swap: dark = :root default, light = [data-theme="light"] override
// 03-rules R-M4-07  OS change: follow only when no stored preference
// 05-edge-cases EC-M4-01  try/catch on every localStorage access
// 05-edge-cases EC-M4-02  exact-match validation only
// 05-edge-cases EC-M4-03  matchMedia guard

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/** The two and only two valid theme values (03-rules vocabulary). */
export type Theme = 'light' | 'dark';

// ---------------------------------------------------------------------------
// localStorage key (01-data-model §3; 06-tech-choices §3)
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'calc-theme';

// ---------------------------------------------------------------------------
// T-411 — readStoredTheme
// ---------------------------------------------------------------------------

/**
 * Read and validate the persisted theme preference.
 *
 * Returns "light" | "dark" IFF the stored value is an exact-match valid string.
 * Returns null for all other cases: absent, null, corrupt, wrong-case, blocked storage.
 *
 * (EC-M4-01: try/catch wraps every localStorage access.
 *  EC-M4-02: exact-match validation — anything non-valid is treated as absent.)
 */
export function readStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') {
      return raw;
    }
    return null;
  } catch {
    // Storage blocked, unavailable, or throws — treat as no preference (EC-M4-01).
    return null;
  }
}

// ---------------------------------------------------------------------------
// T-412 — writeStoredTheme
// ---------------------------------------------------------------------------

/**
 * Persist the chosen theme.
 *
 * Silent on failure: a blocked/throwing storage means the toggle still changes the
 * live data-theme attribute (session-only mode), but the preference won't survive
 * reloads. Never throws. (EC-M4-01.)
 */
export function writeStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked or quota exceeded — run session-only, no crash (EC-M4-01).
  }
}

// ---------------------------------------------------------------------------
// T-413 — resolveTheme
// ---------------------------------------------------------------------------

/**
 * Compute the resolved theme using the strict ordered precedence (R-M4-01):
 *
 *   1. Valid stored value (readStoredTheme) → wins outright.
 *   2. OS preference via matchMedia('(prefers-color-scheme: dark)').
 *   3. Default "dark" (R-M4-03) — when neither above resolves.
 *
 * Pure function: reads storage + matchMedia, produces a Theme, no side effects.
 *
 * (EC-M4-03: matchMedia existence guard — old browsers where it's undefined fall
 *  through to the default-dark terminal fallback.)
 */
export function resolveTheme(): Theme {
  // Step 1 — valid stored value wins
  const stored = readStoredTheme();
  if (stored !== null) {
    return stored;
  }

  // Step 2 — OS preference
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      return mq.matches ? 'dark' : 'light';
    } catch {
      // matchMedia threw (extremely unlikely, defensive guard)
    }
  }

  // Step 3 — terminal fallback: default dark (R-M4-03, EC-M4-03)
  return 'dark';
}

// ---------------------------------------------------------------------------
// T-414 — applyTheme
// ---------------------------------------------------------------------------

/**
 * Apply the given theme to the document root by writing dataset.theme.
 *
 *   light → document.documentElement.dataset.theme = "light"
 *   dark  → document.documentElement.dataset.theme = "dark"
 *
 * This is the single write path (R-M4-05).  Keeping "dark" explicit (rather than
 * deleting the attribute) aligns with the no-FOUC inline script (T-410) which also
 * writes "dark" for the dark case, so toggleTheme's current-state read is always
 * unambiguous.
 *
 * CSS selector contract:
 *   [data-theme="light"]  → light override block fires
 *   :root (no attribute / data-theme="dark")  → dark v3 default applies
 *
 * Pure DOM write; no localStorage side effect here.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

// ---------------------------------------------------------------------------
// T-415 — toggleTheme
// ---------------------------------------------------------------------------

/**
 * Flip the current theme, apply it, and persist it.
 *
 * Reads the current state from dataset.theme (the live DOM source of truth).
 * Flips light↔dark, calls applyTheme + writeStoredTheme, returns the new theme.
 *
 * This is the complete toggle action (02-flows F3, R-M4-02/05).
 * Last-write-wins on rapid spam: each call writes the final resolved value
 * synchronously to both DOM and storage (EC-M4-06).
 */
export function toggleTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  // Treat absent or unrecognised value as "dark" (R-M4-03 default).
  const next: Theme = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  writeStoredTheme(next);
  return next;
}

// ---------------------------------------------------------------------------
// T-416 — attachOsChangeListener
// ---------------------------------------------------------------------------

/**
 * Subscribe to live OS prefers-color-scheme changes.
 *
 * Behaviour (R-M4-07 / EC-M4-07):
 *   - If the user has NO valid stored preference → follow the OS change live.
 *   - If the user HAS a stored preference (explicit choice) → ignore the OS change.
 *
 * Uses the MODERN addEventListener API — NOT the deprecated addListener
 * (06-tech-choices §2; verified via WebFetch MDN 2026-06).
 *
 * Call once at startup from main.ts (T-423) AFTER resolveTheme + applyTheme.
 * Safe to call multiple times (adds multiple listeners) — call it once.
 *
 * (EC-M4-03: matchMedia guard — no-op on browsers without matchMedia.)
 */
export function attachOsChangeListener(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return; // EC-M4-03: matchMedia not available
  }

  let mq: MediaQueryList;
  try {
    mq = window.matchMedia('(prefers-color-scheme: dark)');
  } catch {
    return; // matchMedia threw — bail silently
  }

  mq.addEventListener('change', (e: MediaQueryListEvent) => {
    // Stored-wins guard (R-M4-07): only follow OS if user has made no explicit choice.
    if (readStoredTheme() !== null) {
      return;
    }
    const osTheme: Theme = e.matches ? 'dark' : 'light';
    applyTheme(osTheme);
    // Do NOT write to storage — this is an OS-driven change, not a user choice.
    // Writing here would pollute the stored value and prevent future OS-follow (R-M4-07).
  });
}
