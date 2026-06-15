# Group F — Test Results

**File:** `src/ui/theme.test.ts`
**Run date:** 2026-06-15
**Runner:** Vitest v4.1.8

## New tests (Group F)

| Task | Test description | Result |
|---|---|---|
| T-425 | stored "light" wins even when OS signals dark | PASS |
| T-425 | stored "dark" wins even when OS signals light | PASS |
| T-425 | readStoredTheme returns stored "light" | PASS |
| T-425 | readStoredTheme returns stored "dark" | PASS |
| T-426 | absent stored value → uses OS dark preference | PASS |
| T-426 | absent stored value → uses OS light preference | PASS |
| T-426 | wrong-case "Light" → readStoredTheme returns null | PASS |
| T-426 | wrong-case "DARK" → readStoredTheme returns null | PASS |
| T-426 | empty string → readStoredTheme returns null | PASS |
| T-426 | JSON blob → readStoredTheme returns null | PASS |
| T-426 | whitespace-wrapped "  light  " → readStoredTheme returns null | PASS |
| T-426 | corrupt value → resolveTheme falls through to OS preference | PASS |
| T-427 | getItem throws → readStoredTheme returns null, does not throw | PASS |
| T-427 | getItem throws → resolveTheme falls back to OS preference | PASS |
| T-428 | writeStoredTheme does not throw even when setItem throws | PASS |
| T-428 | applyTheme sets data-theme="light" on the document root | PASS |
| T-428 | applyTheme sets data-theme="dark" on the document root | PASS |
| T-428 | applyTheme still updates data-theme even when localStorage setItem throws | PASS |
| T-428 | toggleTheme flips data-theme even when localStorage write throws | PASS |
| T-429 | resolveTheme defaults to "dark" when matchMedia is undefined | PASS |
| T-429 | resolveTheme defaults to "dark" when matchMedia is not a function | PASS |

**New tests:** 21 passed / 0 failed

## Full suite

```
Test Files  3 passed (3)
     Tests  96 passed (96)
```

No regressions.
