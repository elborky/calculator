import { defineConfig } from 'vite'

// M2 static-build config (D-002). Repo root is the Vite root: index.html lives here and
// pulls in /src/ui/main.ts. `vite build` emits a static dist/ (HTML+CSS+JS, no server
// runtime) for the Dokploy Static / NGINX target. Vanilla TS — no framework plugins.
export default defineConfig({
  // Defaults are intentional: root = process.cwd() (repo root), build.outDir = 'dist'.
})
