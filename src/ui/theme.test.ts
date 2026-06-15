// @vitest-environment jsdom
//
// M4 Theming — Group F tests (T-425..T-430)
// Spec: storm/specify/04-theming/_index.md (Group F), storm/specify/04-theming/05-edge-cases.md
//
// Tests for theme.ts: readStoredTheme, writeStoredTheme, resolveTheme, applyTheme, toggleTheme,
//                     attachOsChangeListener
//
// Test contracts:
//   T-425 — stored valid theme wins over OS matchMedia (R-M4-01 precedence)
//   T-426 — corrupt/absent stored value → falls back to matchMedia OS preference (EC-M4-02)
//   T-427 — localStorage read that throws → falls back to OS, does NOT throw (EC-M4-01)
//   T-428 — localStorage write that throws → swallowed; applyTheme still changes data-theme (EC-M4-01)
//   T-429 — no stored value AND matchMedia absent → defaults to "dark" (EC-M4-03, terminal fallback)
//   T-430 — attachOsChangeListener: stored-wins guard + OS-follow + absent-default toggleTheme branch
//            (AC-F4-1, AC-F4-2, F-2/F-4 coverage gap — REVIEW fix)
//
// Setup: vi.stubGlobal for localStorage + matchMedia per test; vi.unstubAllGlobals in afterEach.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readStoredTheme, writeStoredTheme, resolveTheme, applyTheme, toggleTheme, attachOsChangeListener } from './theme';

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

// ---------------------------------------------------------------------------
// T-430 — attachOsChangeListener + toggleTheme absent-default branch
//         Covers: AC-F4-1, AC-F4-2, F-2 (P1), F-4 (P3) — REVIEW fix
// ---------------------------------------------------------------------------

/**
 * Build a matchMedia stub that CAPTURES the 'change' event handler so tests
 * can fire it synthetically. Returns the stub function and a `fireChange`
 * helper that invokes the captured handler with a mock MediaQueryListEvent.
 */
function makeCapturingMatchMediaStub(initialPrefersDark: boolean) {
  let capturedHandler: ((e: MediaQueryListEvent) => void) | null = null;
  const addEventListenerMock = vi.fn(
    (type: string, handler: (e: MediaQueryListEvent) => void) => {
      if (type === 'change') {
        capturedHandler = handler;
      }
    }
  );
  const removeEventListenerMock = vi.fn();

  const stub = vi.fn((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' ? initialPrefersDark : false,
    media: query,
    addEventListener: addEventListenerMock,
    removeEventListener: removeEventListenerMock,
    dispatchEvent: vi.fn(),
  }));

  function fireChange(prefersDark: boolean) {
    if (!capturedHandler) {
      throw new Error('No change handler was registered — attachOsChangeListener may not have called addEventListener');
    }
    capturedHandler({ matches: prefersDark } as MediaQueryListEvent);
  }

  return { stub, fireChange, addEventListenerMock, removeEventListenerMock };
}

describe('T-430 — attachOsChangeListener: AC-F4-1 (OS-follow) + AC-F4-2 (stored-wins sticky)', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    delete document.documentElement.dataset.theme;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // AC-F4-1: no stored preference → live OS change IS applied to the DOM
  it('AC-F4-1: no stored choice — OS change event applies the new theme to data-theme', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub()); // empty — no stored preference
    const { stub, fireChange } = makeCapturingMatchMediaStub(false); // OS starts light
    vi.stubGlobal('matchMedia', stub);

    attachOsChangeListener();

    // Set an initial known state
    document.documentElement.dataset.theme = 'light';

    // OS flips to dark — no stored preference, so handler should apply dark
    fireChange(true);
    expect(document.documentElement.dataset.theme).toBe('dark');

    // OS flips back to light
    fireChange(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  // AC-F4-1 (storage write invariant): OS-driven change must NOT write to localStorage
  it('AC-F4-1: OS change does NOT write to localStorage (no stored choice path)', () => {
    const lsStub = makeLocalStorageStub(); // empty
    vi.stubGlobal('localStorage', lsStub);
    const { stub, fireChange } = makeCapturingMatchMediaStub(false);
    vi.stubGlobal('matchMedia', stub);

    attachOsChangeListener();
    fireChange(true); // OS says dark

    expect(lsStub.setItem).not.toHaveBeenCalled();
  });

  // AC-F4-2: stored explicit preference → OS change event is IGNORED (sticky)
  it('AC-F4-2: stored "light" — OS change to dark is ignored; data-theme stays light', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ 'calc-theme': 'light' }));
    const { stub, fireChange } = makeCapturingMatchMediaStub(false); // OS starts light
    vi.stubGlobal('matchMedia', stub);

    attachOsChangeListener();
    document.documentElement.dataset.theme = 'light';

    // OS flips to dark — but user has an explicit stored choice, so handler is a no-op
    fireChange(true);
    expect(document.documentElement.dataset.theme).toBe('light'); // unchanged
  });

  it('AC-F4-2: stored "dark" — OS change to light is ignored; data-theme stays dark', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub({ 'calc-theme': 'dark' }));
    const { stub, fireChange } = makeCapturingMatchMediaStub(true); // OS starts dark
    vi.stubGlobal('matchMedia', stub);

    attachOsChangeListener();
    document.documentElement.dataset.theme = 'dark';

    // OS flips to light — but stored choice is dark, so handler is a no-op
    fireChange(false);
    expect(document.documentElement.dataset.theme).toBe('dark'); // unchanged
  });

  // matchMedia absent → attachOsChangeListener returns without throwing (EC-M4-03)
  it('matchMedia absent — attachOsChangeListener is a no-op, does not throw', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(() => attachOsChangeListener()).not.toThrow();
  });

  it('matchMedia not a function — attachOsChangeListener is a no-op, does not throw', () => {
    vi.stubGlobal('matchMedia', null);
    expect(() => attachOsChangeListener()).not.toThrow();
  });

  // addEventListener is called with 'change' as the event type
  it('attachOsChangeListener registers a "change" listener on the matchMedia object', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub());
    const { stub, addEventListenerMock } = makeCapturingMatchMediaStub(false);
    vi.stubGlobal('matchMedia', stub);

    attachOsChangeListener();

    expect(addEventListenerMock).toHaveBeenCalledOnce();
    expect(addEventListenerMock.mock.calls[0][0]).toBe('change');
  });
});

describe('T-430b — toggleTheme: absent/garbage dataset.theme → default-dark branch (F-4)', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    delete document.documentElement.dataset.theme;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // F-4: absent dataset.theme → treated as "dark" → toggles to "light"
  it('absent dataset.theme — toggleTheme treats current as dark, flips to light', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub());
    // Confirm attribute is absent
    expect(document.documentElement.dataset.theme).toBeUndefined();

    const result = toggleTheme();
    expect(result).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  // Garbage/unrecognised dataset.theme → also treated as "dark" → toggles to "light"
  it('unrecognised dataset.theme value — toggleTheme treats current as dark, flips to light', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub());
    document.documentElement.dataset.theme = 'system'; // not 'light' or 'dark'

    const result = toggleTheme();
    expect(result).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  // Confirm the explicit light→dark path still works (sanity regression)
  it('dataset.theme = "light" — toggleTheme flips to dark', () => {
    vi.stubGlobal('localStorage', makeLocalStorageStub());
    document.documentElement.dataset.theme = 'light';

    const result = toggleTheme();
    expect(result).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
