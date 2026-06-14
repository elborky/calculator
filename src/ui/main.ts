// M2 Calculator UI — application entry point.
//
// Stylesheet wiring (Groups 2–3). Order matters: tokens first so component
// rules can resolve var(--token) (UR-029, T-123). Vite bundles these into the
// static dist/ CSS.
import './styles/tokens.css'
import './styles/layout.css'
import './styles/keypad.css'

// Behaviour wiring lands in later groups:
//   - Group 4: M1 import + held EngineState cell + dispatch()
//   - Group 6: render(state) into the display
//   - Group 7/8: click + keyboard binding
export {}
