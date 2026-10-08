# Ellis SEO + UI local preview — 2026-10-08

Source: nancymaintenance-design/adelaidetilingandwaterproofing.com.au, cloned from main commit fa60ec2e9db7a23ccdfdf2f9fbda9e24a7bde79c.
Local branch: codex/seo-ui-preview.
Preview: http://127.0.0.1:4173
Restart: npm run preview from this repository.
No GitHub push or Vercel deployment has been performed.

## Implemented
- Consolidated useful standalone tiling guidance into Services: preparation, tile selection, repairs, supply, costs and return-to-use questions.
- Retired tiling-adelaide.html, with a configured permanent 308 redirect to services.html#room-tiling, a static fallback and sitemap/internal-link cleanup.
- Unified static primary navigation and logo; removed client-side navigation mutations.
- Expanded all eight district groups without inventing regional case studies; preserved 40 suburb enquiry links and all-Adelaide coverage.
- Changed renovation page Article schema to Service and added visible breadcrumbs with matching BreadcrumbList schema.
- Added factual privacy notice and website terms, linked throughout footers and from Contact.
- Created the Waterline Field System brand layer: service-led typography and one full-width static bathroom hero, deep blue, teal and amber, balanced cards, native links and consistent CTAs.
- Applied 18px rounded cards across customer pages and core-keyword H1s, long-tail H2s, scenario/educational modules using the supplied keyword map. See docs/SEO-KEYWORD-UI-REPORT.md for mapping and reproducible analysis.
- Kept Instagram below Call Ellis, text-height glyph and large homepage map.
- Generated WebP service-image derivatives and updated HTML/CSS references. Removed the house-photo carousel from markup, scripts and the canonical brand stylesheet. Unused downloaded photos remain local, not displayed or claimed as company projects.
- Added local-only preview server: binds 127.0.0.1, applies configured redirects, blocks dotfiles and never sends form email.

## Verification
- 48 automated tests passed; 0 failures, including static hero, no-overlap and keyword checks.
- New checks cover static navigation, one H1, canonicals, local links and anchors, parseable schema, legacy redirects, sitemap and merged content.
- Browser checks: all 11 active pages at 390px had no horizontal overflow; five representative routes also checked at 1440px.
- Browser-verified homepage bathroom tiling link reaches Services detail, enquiry CTA reaches Contact, and North Adelaide selection pre-fills Contact.
- HTTP checks: active pages 200, products and tiling routes 308 to expected destinations, dotfiles 404, preview contact GET/POST 503 with explicit non-sending message.
- JavaScript syntax checks: api/contact.js, scripts.js and preview-server.cjs.
- DESIGN.md lint: zero errors. Token-usage warnings do not indicate failed runtime checks.
- Verified static homepage at 1440px and 390px: zero horizontal overflow, four equal-height 18px-radius service cards, service shortcuts begin exactly after the hero. Shared heading, button, card, process and footer styles now follow the approved single-image direction.
- Shared brand stylesheet and script version markers updated on all active pages.
- New screenshots: evidence/homepage-static-desktop.png and evidence/homepage-static-mobile.png.
- Earlier carousel/design research in docs is historical and superseded by DESIGN.md and docs/STATIC-UI-REVIEW.md.

## Limits and approval gate
This verifies the local website, not Google indexing or ranking. No live GSC data or measured Core Web Vitals are available in this run. Existing service images remain illustrative, not claimed as Ellis projects. Production email delivery has not been tested by sending an enquiry. Existing licence/insurance claims are not expanded without documentary evidence.

User must review the preview before any production publication. Recheck remote main and Vercel source linkage before releasing; do not redeploy an old commit merely because it is Ready.
