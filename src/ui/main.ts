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

// Group 4: M1 import + held EngineState cell + dispatch() wired.
// Group 6: render(state) from render.ts, wired into dispatch via state.ts.
// dispatch() and getState() are consumed by Groups 7–8 via state.ts.
import { getState, render } from './state';

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
import { subscribe } from './state';
import { recordOnEquals } from './history/history';
import { renderHistory } from './history/render-history';
subscribe(recordOnEquals);
renderHistory();
