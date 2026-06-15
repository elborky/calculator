// @vitest-environment jsdom
//
// M4 Theming — Group F tests (T-425..T-429)
// Spec: storm/specify/04-theming/_index.md (Group F), storm/specify/04-theming/05-edge-cases.md
//
// Tests for theme.ts: readStoredTheme, writeStoredTheme, resolveTheme, applyTheme, toggleTheme
//
// Test contracts:
//   T-425 — stored valid theme wins over OS matchMedia (R-M4-01 precedence)
//   T-426 — corrupt/absent stored value → falls back to matchMedia OS preference (EC-M4-02)
//   T-427 — localStorage read that throws → falls back to OS, does NOT throw (EC-M4-01)
//   T-428 — localStorage write that throws → swallowed; applyTheme still changes data-theme (EC-M4-01)
//   T-429 — no stored value AND matchMedia absent → defaults to "dark" (EC-M4-03, terminal fallback)
//
// Setup: vi.stubGlobal for localStorage + matchMedia per test; vi.unstubAllGlobals in afterEach.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readStoredTheme, writeStoredTheme, resolveTheme, applyTheme, toggleTheme } from './theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'calc-theme';

/** Build a simple in-memory localStorage stub. */
function makeLocalStorageStub(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { for (const k in store) delete store[k]; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    _store: store,
  };
}

/** Build a matchMedia stub that reports the given OS dark preference. */
function makeMatchMediaStub(prefersDark: boolean) {
  return vi.fn((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// ---------------------------------------------------------------------------
// T-425 — Stored valid theme wins over OS preference (R-M4-01 precedence)
// ---------------------------------------------------------------------------
describe('T-425 — resolveTheme: stored value wins over OS matchMedia', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('stored "light" wins even when OS signals dark', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'light' }));
    vi.stubGlobal('matchMedia', makeMatchMediaStub(true)); // OS says dark
    expect(resolveTheme()).toBe('light');
  });

  it('stored "dark" wins even when OS signals light', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'dark' }));
    vi.stubGlobal('matchMedia', makeMatchMediaStub(false)); // OS says light
    expect(resolveTheme()).toBe('dark');
  });

  it('readStoredTheme returns stored "light"', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'light' }));
    expect(readStoredTheme()).toBe('light');
  });

  it('readStoredTheme returns stored "dark"', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'dark' }));
    expect(readStoredTheme()).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// T-426 — Corrupt/absent stored value → falls back to OS matchMedia (EC-M4-02)
// ---------------------------------------------------------------------------
describe('T-426 — resolveTheme: corrupt/absent stored value falls back to OS preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('absent stored value → uses OS dark preference', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub()); // empty — no entry
    vi.stubGlobal('matchMedia', makeMatchMediaStub(true)); // OS says dark
    expect(resolveTheme()).toBe('dark');
  });

  it('absent stored value → uses OS light preference', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub()); // empty
    vi.stubGlobal('matchMedia', makeMatchMediaStub(false)); // OS says light
    expect(resolveTheme()).toBe('light');
  });

  it('wrong-case "Light" → readStoredTheme returns null', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'Light' }));
    expect(readStoredTheme()).toBeNull();
  });

  it('wrong-case "DARK" → readStoredTheme returns null', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'DARK' }));
    expect(readStoredTheme()).toBeNull();
  });

  it('empty string → readStoredTheme returns null', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: '' }));
    expect(readStoredTheme()).toBeNull();
  });

  it('JSON blob → readStoredTheme returns null', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: '{"theme":"dark"}' }));
    expect(readStoredTheme()).toBeNull();
  });

  it('whitespace-wrapped "  light  " → readStoredTheme returns null (exact-match only)', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: '  light  ' }));
    expect(readStoredTheme()).toBeNull();
  });

  it('corrupt value → resolveTheme falls through to OS preference', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ [STORAGE_KEY]: 'invalid-value' }));
    vi.stubGlobal('matchMedia', makeMatchMediaStub(true)); // OS says dark
    expect(resolveTheme()).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// T-427 — localStorage read throws → falls back to OS preference, no throw (EC-M4-01)
// ---------------------------------------------------------------------------
describe('T-427 — resolveTheme: localStorage.getItem throws → falls back to OS; does not throw', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('getItem that throws → readStoredTheme returns null, does not throw', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => { throw new DOMException('Storage access blocked', 'SecurityError'); }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    });

    expect(() => readStoredTheme()).not.toThrow();
    expect(readStoredTheme()).toBeNull();
  });

  it('getItem that throws → resolveTheme falls back to OS preference', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => { throw new DOMException('Storage access blocked', 'SecurityError'); }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    });
    vi.stubGlobal('matchMedia', makeMatchMediaStub(false)); // OS says light

    expect(() => resolveTheme()).not.toThrow();
    expect(resolveTheme()).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// T-428 — localStorage write throws → swallowed; applyTheme still flips data-theme (EC-M4-01)
// ---------------------------------------------------------------------------
describe('T-428 — writeStoredTheme: throws swallowed; applyTheme still changes data-theme', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    delete document.documentElement.dataset.theme;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('writeStoredTheme does not throw even when setItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    });

    expect(() => writeStoredTheme('light')).not.toThrow();
    expect(() => writeStoredTheme('dark')).not.toThrow();
  });

  it('applyTheme sets data-theme="light" on the document root', () => {
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('applyTheme sets data-theme="dark" on the document root', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('applyTheme still updates data-theme even when localStorage setItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    });

    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('toggleTheme flips data-theme even when localStorage write throws (session-only mode)', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    });

    document.documentElement.dataset.theme = 'light';
    expect(() => toggleTheme()).not.toThrow();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// T-429 — Terminal fallback: no stored value AND no matchMedia → defaults to "dark" (EC-M4-03)
// ---------------------------------------------------------------------------
describe('T-429 — resolveTheme: terminal fallback — no stored value, no matchMedia → "dark"', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resolveTheme defaults to "dark" when matchMedia is undefined', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub()); // no stored value
    // Remove matchMedia by setting it to undefined
    vi.stubGlobal('matchMedia', undefined);
    expect(resolveTheme()).toBe('dark');
  });

  it('resolveTheme defaults to "dark" when matchMedia is not a function', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub()); // no stored value
    // Some old browsers expose matchMedia as a non-function
    vi.stubGlobal('matchMedia', null);
    expect(resolveTheme()).toBe('dark');
  });
});
