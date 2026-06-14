---
storm-depends-on:
  - storm/structure/00-domain-lens.md
  - storm/structure/01-vision.md
  - storm/capture/03-ideation-coverage.md
storm-phase: structure
storm-canonical: true
---

# User Roles — Calculator

> Status: **proposed** (STRUCTURE phase, AI-led draft). Owner confirms comprehension, not wording.

---

## The honest headline

Role-modeling here is **near-trivial**. There is essentially **one role**: an anonymous person who opens the page and does arithmetic. No accounts, no auth, no admin, no multi-tenancy. The Domain Lens already settled this — "single general web user, no roles" (`00-domain-lens.md:31`, E5), and the Vision restates it as "single general web user… no account, no login" (`01-vision.md:30`).

This file is short on purpose. Inflating it with synthetic roles ("power user," "guest vs. registered," "moderator") would be theater against the anti-inflation guard (`00-domain-lens.md:70`; CP-13 over-engineering dim). We do not.

---

## Roles

| Role | Real product role? | Description |
|---|---|---|
| **End-user (anonymous)** | **Yes — the only one** | Anyone with a browser. Opens the page, does arithmetic, leaves. No identity, no session, no stored profile. Every visitor is identical and stateless across visits. |
| **Builder / owner** | **No — meta-role only** | The person running STORM and field-testing the framework. They are *not* a product persona — the calculator exposes no owner-facing surface (no admin panel, no settings backend, no dashboard). The owner exists only in the framing of "this product is a STORM workout" (`00-domain-lens.md:17,19`; `01-vision.md:26`), not inside the running app. Listed here solely so the field-test framing is explicit, then set aside. |

There is no second product role. The table is complete.

---

## What the end-user can do

The full capability surface of the only real role:

- **Input numbers and operators** — via on-screen button click *or* physical keyboard (keyboard input is a chosen quality-of-life feature, `01-vision.md:40`).
- **See results** — the live display and the equals result, including graceful handling of edge cases like divide-by-zero and overflow shown in the UI (`01-vision.md:39`).
- **View calculation history** — the history tape, a chosen feature (`01-vision.md:40`). Ephemeral, in-memory only — not persisted (`00-domain-lens.md:67`).
- **Toggle theme** — light/dark switch, a chosen feature (`01-vision.md:40`).

That is the entire interaction model. One role, four verbs.

---

## What is NOT modeled (and why) — anti-inflation

Explicitly out of the role/permission model. Each omission is a deliberate Domain-Lens-grounded decision, not an oversight:

| Not modeled | Why |
|---|---|
| **Authentication / accounts / login** | Zero-stakes client-side utility; no identity to establish (`00-domain-lens.md:66`, E5; `01-vision.md:53`). No sign-up, sign-in, password, or session. |
| **Authorization / permissions / roles tiers** | With exactly one role, there is nothing to gate. Permissions only exist when ≥2 roles see different surfaces — not the case here. |
| **Admin / owner-facing surface** | No admin panel, no config UI, no content management. The owner is a meta-role (above), not an in-app actor. |
| **Persistence across devices / sessions** | No backend, no DB, no user data model (`00-domain-lens.md:67`; `01-vision.md:53`). History is in-memory and dies with the tab. Nothing follows a user across devices because there is no "user" to follow. |
| **Multi-user / collaboration / sharing** | Single anonymous user per browser tab. No shared state, no real-time, no sharing surface. |
| **Audit / compliance / consent** | No regulated data, no consent surface (`00-domain-lens.md:68`). Nothing to audit. |

> Anti-inflation guard (CP-13): the gravity here is design-craft + framework-exercise. Do not reflexively manufacture roles or permission layers to look thorough — at zero stakes, a one-role model is the *correct* model, not a gap (`00-domain-lens.md:70`).
