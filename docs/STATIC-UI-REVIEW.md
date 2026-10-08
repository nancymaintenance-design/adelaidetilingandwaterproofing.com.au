# Static UI implementation — 2026-10-08

User-approved direction: remove carousel and layered frames, retain SEO outline, preview locally before release.

- One full-width bathroom hero; clear copy column, amber quote CTA and visible photograph on desktop.
- Four equal rounded service cards, separate non-overlapping quick links, numbered service process, office map and existing contact journey.
- Shared navy / warm-white / amber / teal tokens in brand.css; DESIGN.md mirrors runtime ownership.
- Core H1s, long-tail H2s, scenario and educational text retained. No new unsupported project, licence, insurance or ranking claims.
- Navigation remains Home / Services / Areas / FAQ / About / Contact / Call. Retired Tiling routes still redirect to Services.

Verification: npm test 48 passed, 0 failed; scripts.js syntax passed; official DESIGN.md lint 0 errors (4 token-reference warnings). Browser inspection at 1440px and 390px confirms the homepage has no carousel, no horizontal overflow, no hero/shortcut overlap, and four equal-height 18px-radius cards. All 11 active pages passed mobile overflow/single-H1 checks; five subpages passed desktop overflow checks.

No push, deployment or real enquiry submission performed. Production publication requires user approval and a fresh remote/source check. This is UI and local structural verification, not live GSC or ranking measurement.
