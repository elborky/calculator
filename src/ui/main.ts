// M2 Calculator UI — application entry point.
//
// Stylesheet wiring (Groups 2–3). Order matters: tokens first so component
// rules can resolve var(--token) (UR-029, T-123). Vite bundles these into the
// static dist/ CSS.
import './styles/tokens.css'
import './styles/layout.css'
import './styles/keypad.css'

// Group 4: M1 import + held EngineState cell + dispatch() wired.
// Import side-effectfully so the module initialises (state seeded, render stub live).
// dispatch() and getState() are consumed by Groups 6–8 via state.ts.
import './state';

// Group 6: render(state) into the display — pending (T-142..T-146)
// Group 7/8: click + keyboard binding — pending (T-147..T-160)
export {}
