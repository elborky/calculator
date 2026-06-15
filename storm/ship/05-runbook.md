---
storm-depends-on:
  - storm/structure/07-deployment-target.md
  - storm/ship/04-deployment-config/
storm-phase: ship
storm-canonical: true
---

# Ops Runbook — Calculator

> The day-to-day operations guide for keeping the calculator live. Written for **you, the solo operator** — there is no team, no on-call rotation, no pager. This is a zero-stakes personal utility, and the runbook is sized to match.
>
> **One thing to internalize up front:** the calculator stores *nothing*. No database, no accounts, no saved files, no server-side state. The history tape lives only in the browser tab and disappears when the tab closes. That single fact makes almost everything below short — there is no data to lose, migrate, or back up. The app is just a folder of static files (HTML/CSS/JS) that NGINX hands to the browser.

**Deploy facts (from `storm/structure/07-deployment-target.md`):**

- **Host:** your own self-hosted **Dokploy** instance.
- **Build type:** **Static (NGINX)** — Dokploy wraps the built files in a small standard NGINX container and serves them on port 80.
- **TLS / domain:** **Traefik** fronts the app and auto-provisions a **Let's Encrypt** HTTPS certificate when a real custom domain is pointed at it.
- **Exact container/NGINX/Traefik settings** (Dockerfile, `nginx.conf`, security headers, Dokploy app fields) are the source-of-truth in **`storm/ship/04-deployment-config/`** — its README is authoritative for the precise values. *(Note: at the time this runbook was written, `04-deployment-config/` was not yet populated; once it exists, defer to it for any exact setting referenced below.)*

---

## 1. How to deploy an update

You changed something (a fix, a tweak) and it's committed to git. Here's how it goes live.

**Step-by-step:**

1. **Push your commit to the remote git repo.**
   `git push` — this puts your change where Dokploy can see it. (If you're on a branch, push the branch Dokploy is configured to deploy from — usually `main`.)
2. **Open Dokploy** in your browser and go to the **calculator app/project**.
3. **Trigger the redeploy.** Click the **Deploy** (or **Redeploy**) button on the app's page. If you've set up auto-deploy-on-push, Dokploy may already be building — check the deployments list before clicking again.
4. **Watch the build logs** (see §3). Dokploy will: pull the latest code → run the build → produce the static bundle → put it in the NGINX container → swap the running container.
5. **Wait for the build to finish.** A static calculator build is small and fast. Status goes to **Done / Running / healthy** (see §6) when it's live.
6. **Verify it's actually live.** Open your domain in a fresh browser tab (or hard-refresh: Cmd/Ctrl+Shift+R to dodge the cache). Confirm: the page loads, you can do a calculation (e.g. `7 × 8 =` → `56`), and the **history tape** records a finished equals. If the change you made is visible, confirm you see it.

**That's the whole deploy.** No migration, no data step, no maintenance window — it's a folder of files being replaced.

---

## 2. How to rollback (undo a bad deploy)

A deploy went out and something's wrong. Because the app is **stateless**, rollback is the simplest case there is: **there is no data to un-migrate, nothing to restore — you just redeploy the previous version.** Going backward is exactly as safe as going forward.

**Step-by-step:**

1. **Open Dokploy** → the calculator app → the **Deployments** (deployment history) list.
2. **Find the last good deployment** — the one before the bad one. Dokploy lists past deployments with their commit/timestamp.
3. **Redeploy that previous deployment/commit.** Use Dokploy's **"Redeploy"** action on that earlier entry (or, if your Dokploy redeploys from git, point the app back at the previous good commit — e.g. `git revert <bad-commit>` then push, or reset the deploy branch to the good commit — then redeploy).
4. **Wait for the build + verify** exactly as in §1 step 5–6.

**Why this is risk-free here:** the only state the app ever had was the user's in-tab history, which already dies on tab close. Rolling the code back can't corrupt or lose anything, because there's nothing persisted to corrupt. The worst case is "the old version is live again," which is the goal.

> Fastest path if you're unsure: redeploy the previous deployment from Dokploy's history list. Don't overthink it — there's no data layer to coordinate with.

---

## 3. Where logs live + how to read them

All logs are in **Dokploy**, on the calculator app's page. There are two kinds:

- **Build logs** — the output from the deploy itself (pulling code, running the build, packaging the container). This is where you look when a **deploy fails** (see §5). Open: Dokploy → calculator app → the **deployment** you're interested in → **Logs / Build Logs**. Read top-to-bottom; the failure is usually the last red/error line.
- **Runtime logs (NGINX access + error)** — the web server's own logs once the app is running: which files were requested (access), and any serve-time errors like a missing file (error). Open: Dokploy → calculator app → **Logs** (the running container's log stream). NGINX writes access lines and error lines here.

**What you'll normally see:** for a healthy static app, NGINX access logs are just `200`/`304` lines for `index.html` and the JS/CSS assets. `404` lines mean a requested file isn't there (see §5). There is **no application log** beyond NGINX — the calculator runs entirely in the user's browser, so there's no server-side app code emitting logs.

---

## 4. Backup + restore

**There is no data backup, because there is no data.**

State this plainly to yourself so you're never anxious about it:

- **No database.** Nothing to dump.
- **No accounts / user data.** Single anonymous user, nothing stored about anyone.
- **No persistence.** The history tape and theme live in memory and **die with the browser tab** — no localStorage, no cookies, no server store (`storm/structure/07-deployment-target.md`).

So the **only thing worth backing up is the source code itself — and git already is that backup.** Your git repo (local + remote) *is* the complete, restorable state of this application.

**Restore = redeploy from git.** If your Dokploy instance is wiped, the box dies, or you migrate to a new server:

1. Stand up Dokploy (or point at a fresh instance).
2. Create the calculator app pointing at your git repo, **Static (NGINX)** build type (exact fields per `04-deployment-config/`).
3. Deploy. The app is fully restored — there was never any runtime data to bring back.

> Keep your git remote healthy (e.g. push to GitHub/your remote). That, plus this runbook and `04-deployment-config/`, is your entire disaster-recovery kit.

---

## 5. Common issues + fixes

Inferred from the stack (Dokploy + Static/NGINX + Traefik/Let's Encrypt + Vite build). Each has a concrete fix.

### a) HTTPS / certificate not provisioning (Let's Encrypt)
**Symptom:** site loads over `http://` but `https://` fails, shows a cert warning, or "not secure."
**Cause:** Let's Encrypt issues a cert only when your **custom domain's DNS actually points at the Dokploy server's IP**, and the domain is configured on the app. The free `traefik.me` subdomain is **HTTP-only by default** and needs a manual cert step.
**Fix:**
1. Confirm the domain's **DNS A record points to your Dokploy server's public IP** (check at your DNS provider; allow time for propagation).
2. In Dokploy, confirm the **custom domain is added to the app** and **Let's Encrypt / `certResolver: letsencrypt`** is enabled (Traefik).
3. Make sure ports **80 and 443** are open to the server (Let's Encrypt validates over port 80).
4. Re-trigger and watch Traefik issue the cert. **Use a real custom domain** for clean auto-HTTPS — don't ship the calculator over plain HTTP (`storm/ship/01-security-audit.md` F-6).

### b) Page works but refresh on a sub-path gives 404
**Symptom:** the app loads at `/`, but a refresh elsewhere 404s.
**Cause:** NGINX serves files literally; a path with no matching file returns 404. (Note: **this calculator is a single page with one route** — `/` — so in practice you should rarely hit this. It matters only if a deep path is ever requested.)
**Fix:** ensure NGINX has the SPA fallback (`try_files $uri $uri/ /index.html;`) so unknown paths serve `index.html`. The exact `nginx.conf` is in **`04-deployment-config/`** — that's the source of truth. For this one-route app, simply verify `/` loads.

### c) Assets blocked / blank page with console errors about CSP
**Symptom:** page is blank or unstyled; browser console shows **Content-Security-Policy** violations refusing to load a script/style/font.
**Cause:** the CSP security header is stricter than what the app actually needs. The app's **verified, working CSP** is documented in `storm/ship/01-security-audit.md` (F-7) and should be reflected in `04-deployment-config/`:
`default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`
**Fix:** set the CSP to **exactly the verified value** (it allows `'unsafe-inline'` on `style-src` only, because the scroll-fit logic sets inline `style.fontSize`; scripts stay `'self'` with no inline/eval). Don't hand-tighten it past the verified baseline — apply what's in `04-deployment-config/` and you're done. If you only just added headers and it broke, the CSP is the usual culprit.

### d) Build fails on deploy
**Symptom:** Dokploy deploy goes red; app doesn't update.
**Cause (most common):** Node version mismatch, or a dependency install failure.
**Fix:**
1. Open the **build logs** (§3) and read the last error.
2. If it's a **Node version** error: the build uses Vite 8 + TypeScript 6 (`package.json`). Ensure the build environment uses a current LTS Node (Vite 8 needs a modern Node). Set the Node version in the Dokploy build config if needed (per `04-deployment-config/`).
3. If it's a **dependency / install** error: the build runs a clean install + `npm run build` (`tsc --noEmit && vite build`). Make sure `package.json` **and `package-lock.json` are committed and pushed** so the install is reproducible. A `tsc` type error will also fail the build — fix the reported type error and re-push.
4. Re-deploy after the fix (§1).

> Quick triage rule: **deploy failed → build logs. App live but wrong → runtime/NGINX logs + browser console.**

---

## 6. Health check + monitoring

**Health check:** Dokploy/Traefik checks the app by requesting **`/`**. **Healthy = `/` returns HTTP `200` with the calculator's `index.html`.** That's it — if the homepage loads, the app is up.

**What "healthy" looks like to you:**
- Dokploy shows the app **Running / healthy** (green).
- Opening your domain loads the calculator instantly.
- A calculation works end-to-end (`7 × 8 =` → `56`) and the **history tape** records a completed equals.
- NGINX access logs (§3) show `200`/`304` for `index.html` and the JS/CSS bundle.

**Failure surface is tiny — on purpose.** A stateless static app has almost nothing that can break at runtime: no database to go down, no API to time out, no auth to expire, no background jobs, no memory leaks from stored state. The realistic failure modes are: (a) the **Dokploy box/container is down** (the whole server is the single point), or (b) the **TLS cert lapsed** (Let's Encrypt auto-renews; only a problem if DNS/ports changed). Both are visible immediately by just opening the page.

**Monitoring, sized to stakes:** for a zero-stakes personal utility, **manual spot-checks are enough** — open the page now and then. If you ever want a free heads-up, point a free uptime pinger (e.g. an external HTTP monitor) at your domain checking for `200` on `/`; that would email you if the box goes down. Optional, not required.

---

## 7. On-call / escalation

**You are the entire org.** There is no on-call rotation, no pager, no SLA, no second-line support — and that's correct for this app.

- **Severity:** the worst realistic outcome is "my personal calculator is briefly offline." No user data is at risk (there is none), no money, no compliance exposure. **Stakes are effectively zero** (`storm/structure/00-domain-lens.md`).
- **"Escalation" = you, when you next have time.** If the site is down, fix it when convenient — nothing is burning. Walk §5 (common issues) → §2 (rollback if a recent deploy caused it).
- **No urgency contract.** Don't build a paging/alerting apparatus for a zero-stakes static page; that would be the over-engineering the deployment-target doc explicitly guards against. A bookmark to your Dokploy dashboard is the whole "incident response toolkit."

---

> **Summary for future-you:** push → Dokploy redeploy → verify the page. To undo: redeploy the previous deployment. Logs live in Dokploy (build logs for failed deploys, NGINX logs for runtime). No backups exist because no data exists — git *is* the backup, restore = redeploy. Exact serve-layer settings (NGINX, CSP, Traefik) live in `storm/ship/04-deployment-config/`. It's a stateless static page; keep it simple.
