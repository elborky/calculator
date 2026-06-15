// M2 Calculator UI — application entry point.
//
// Stylesheet wiring (Groups 2–3, 13). Order matters: fonts first (T-178..T-179,
// D-004) so @font-face is declared before any rule uses font-family: 'Inter';
// then tokens so component rules can resolve var(--token) (UR-029, T-123).
// Vite bundles these into the static dist/ CSS; woff2 files are fingerprinted.
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/layout.css'
import './styles/keypad.css'
import './history/history.css'     // M3 History Tape — T-230
import './styles/toggle.css'       // M4 Theme Toggle — T-418..420

// Group 4: M1 import + held EngineState cell + dispatch() wired.
// Group 6: render(state) from render.ts, wired into dispatch via state.ts.
// dispatch() and getState() are consumed by Groups 7–8 via state.ts.
import { getState, render, subscribe } from './state';

// T-146 — call render(state) once at app start so the display reflects
// the initial EngineState (entryBuffer="0") immediately on load (UR-005 fresh state).
render(getState());

// Group 7/8: click + keyboard binding (T-147..T-160)
import { setupClickBinding, setupKeyboardBinding } from './bindings';
setupClickBinding();
setupKeyboardBinding();

// Group D: M3 History Tape wiring (T-213)
// Register the post-dispatch listener so completed calculations are recorded.
// subscribe() is the seam added in Group B (T-207); recordOnEquals is Group C (T-209..T-212).
// renderHistory() is called once here so the empty-state placeholder renders immediately on load
// (before any calculation) — parallel to the render(getState()) call above for M2.
import { recordOnEquals } from './history/history';
import { renderHistory } from './history/render-history';
subscribe(recordOnEquals);
renderHistory();

// ---------------------------------------------------------------------------
// M4 Theme wiring (Group E — T-423, T-424)
// ---------------------------------------------------------------------------
import { resolveTheme, applyTheme, attachOsChangeListener, toggleTheme, Theme } from './theme';

// T-423 — Runtime init.
// The no-FOUC head script (T-410) has already set data-theme before first paint.
// Calling resolveTheme() + applyTheme() here keeps module state authoritative and
// idempotent: same value, no double-flash (the attribute write is synchronous; CSS
// sees the same value already set, so no repaint is triggered).
const initialTheme = resolveTheme();
applyTheme(initialTheme);
attachOsChangeListener();

// ---------------------------------------------------------------------------
// T-424 — Toggle button: click → toggleTheme() + sync ARIA state + icon swap.
//
// SVG icons (aria-hidden — label carries meaning per 04-ui §1.2):
//   Moon  → shown when dark is active  (next action = switch to light)
//   Sun   → shown when light is active (next action = switch to dark)
//
// ARIA mapping (04-ui §1.1/1.3):
//   aria-pressed = "true"  when the toggle's "pressed" state represents light active.
//   aria-pressed = "false" when dark is active (button not pressed / default state).
//   aria-label conveys the next action ("Switch to [X] theme").
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Build the moon icon SVG element (dark-active state — next action = switch to light).
 * All construction via DOM APIs — no innerHTML (security: no XSS surface, even for
 * static content; craft floor C3).
 */
function buildMoonSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586z');
  path.setAttribute('fill', 'currentColor');
  svg.appendChild(path);
  return svg;
}

/** Helper: create an SVG line element with the given coords (used by buildSunSvg). */
function svgLine(x1: number, y1: number, x2: number, y2: number): SVGLineElement {
  const line = document.createElementNS(SVG_NS, 'line');
  line.setAttribute('x1', String(x1));
  line.setAttribute('y1', String(y1));
  line.setAttribute('x2', String(x2));
  line.setAttribute('y2', String(y2));
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-linecap', 'round');
  return line;
}

/**
 * Build the sun icon SVG element (light-active state — next action = switch to dark).
 * Centre circle + 8 rays, all via DOM APIs.
 */
function buildSunSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('fill', 'none');
  // Centre circle
  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '10');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '4');
  circle.setAttribute('fill', 'currentColor');
  svg.appendChild(circle);
  // 8 rays (cardinal + diagonal)
  svg.appendChild(svgLine(10, 1, 10, 4));
  svg.appendChild(svgLine(10, 16, 10, 19));
  svg.appendChild(svgLine(1, 10, 4, 10));
  svg.appendChild(svgLine(16, 10, 19, 10));
  svg.appendChild(svgLine(3.222, 3.222, 5.343, 5.343));
  svg.appendChild(svgLine(14.657, 14.657, 16.778, 16.778));
  svg.appendChild(svgLine(16.778, 3.222, 14.657, 5.343));
  svg.appendChild(svgLine(5.343, 14.657, 3.222, 16.778));
  return svg;
}

/**
 * Sync the toggle button's accessible state and icon to the current active theme.
 *
 * Convention:
 *   dark  active → show moon icon, aria-label "Switch to light theme",  aria-pressed="false"
 *   light active → show sun icon,  aria-label "Switch to dark theme",   aria-pressed="true"
 *
 * Icon is swapped by clearing children and appending the new SVG node — no innerHTML.
 */
function syncToggleButton(btn: HTMLButtonElement, theme: Theme): void {
  // Clear existing icon child(ren) safely
  while (btn.firstChild !== null) {
    btn.removeChild(btn.firstChild);
  }
  if (theme === 'light') {
    btn.setAttribute('aria-label', 'Switch to dark theme');
    btn.setAttribute('aria-pressed', 'true');
    btn.appendChild(buildSunSvg());
  } else {
    btn.setAttribute('aria-label', 'Switch to light theme');
    btn.setAttribute('aria-pressed', 'false');
    btn.appendChild(buildMoonSvg());
  }
}

const toggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement | null;

if (toggleBtn !== null) {
  // Sync initial button state to the resolved theme on load (T-424 "initial button state").
  syncToggleButton(toggleBtn, initialTheme);

  // Wire click → toggle + re-sync.
  toggleBtn.addEventListener('click', () => {
    const next = toggleTheme();
    syncToggleButton(toggleBtn, next);
  });
}
