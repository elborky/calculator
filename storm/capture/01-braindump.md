---
storm-depends-on: []
storm-phase: capture
storm-canonical: true
---

# Braindump — Calculator

## Owner input (2026-06-14, Raw Branch Mode A passive-listen)

- **Product:** web-based calculator
- **Complexity:** intentionally simple — bukan poin utamanya
- **Real goal:** field-test the STORM framework end-to-end — exercise every phase (CAPTURE → SHIP) on a small, low-risk product
- **Design intent (owner verbatim):** "calculator app yang simple aja, tapi secara design ga bosenin" — simple in function, but the visual design must NOT be boring / generic. Visual appeal matters.

---

## M4 re-entry slice (2026-06-15, CAPTURE revolving door)

Theme toggle masuk sebagai modul terakhir dari scope original (scope awal: "4-func + history + theme + kbd" — theme di-defer waktu itu, sekarang dieksekusi). Bukan scope-creep.

- **Apa:** toggle Light / Dark theme. Dua state aja, cukup.
- **Default pertama buka:** ikutin OS (`prefers-color-scheme`). Kalau OS dark → gelap; OS light → terang.
- **Persisted:** pilihan user disimpen di `localStorage` (satu key kecil, misal `"theme"`). Jadi kalau user ganti ke Light, refresh tetep Light.
- **Tempatnya:** `.toggle-slot` di markup M2 udah disediain — langsung dipakai, ga perlu ubah struktur.
- **Defer explicit:** opsi ketiga "System" (ikutin OS terus walaupun pernah di-toggle manual) — di-defer. Bisa re-entry lagi kalau mau, tapi bukan sekarang.
- **Lens tetap sama:** "Solo zero-stakes consumer web utility — design-craft-forward, framework-test vehicle". Theme toggle adalah ekspresi paling murni dari axis "ga bosenin" — bukan data model, bukan compliance, bukan persistence beneran. `localStorage` untuk satu key preference = documented exception, bukan shift domain.
