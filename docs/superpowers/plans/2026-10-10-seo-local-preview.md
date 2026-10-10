# Adelaide SEO Local Preview Implementation Plan

**Goal:** Complete the implementable website SEO improvements from the 2026-10-10 audit and present a verified local preview before any GitHub push or Vercel deployment.

**Architecture:** Retain the static HTML/CSS/JS site and existing design. Add focused commercial service destinations, link them through existing hubs, and validate all canonical URLs, entity graphs, assets and redirects. No new framework or production dependency.

**Source:** `E:\Ellis\Adelaidetilingandwqater\work\preview-20261008`, branch `codex/seo-ui-preview`.
**Spec:** This plan plus the user-approved audit at `C:\Users\UFTR\Documents\ChatGPT\Ellis Services Group 2\SEO-audit-20261010\Adelaide-Tiling-Waterproofing-SEO审计与增长方案-2026-10-10.md`; constraints here adapt recommendations to confirmed existing source.
**Execution:** Subagent-driven, sequential implementers, fresh task reviewers, final independent review. Local commits are permitted; no push, PR creation or deployment until user confirmation.

## Global Constraints

- Preserve existing untracked assets and evidence. You are not alone in the codebase; do not revert others' work. Apply edits with apply_patch.
- No push, GitHub writes, Vercel deploy, actual contact submissions, or external account changes.
- Canonical origin is `https://www.adelaidetilingandwaterproofing.com.au`; primary nav remains Home, Services, Areas, FAQ, About, Contact, Call.
- Retain design/CSS, static content, one H1 per page, crawlable descriptive links, phone +61 425 170 688, email handyman.lyric@outlook.com, public company details. Do not invent cases, credentials, prices, standards obligations, warranties, hours, reviews, or address eligibility.
- FAQ answers remain centralized in faq.html and equal to its FAQPage JSON-LD. Service pages link to its sections, without FAQPage or embedded details/summary.
- Keep retired /tiling-adelaide.html, /news.html and /products.html redirects and the complete tiling catalogue in services.html.
- Content must be unique and useful per service intent, plain English, no word-count padding or cloned suburb pages. Images illustrate services and must not be described as verified Ellis cases.
- No product dependencies. Full suite npm test plus focused checks; existing Node module-type warnings should be resolved compatibly rather than hidden.
- Use local-only reporting in docs; user approval of the final preview is required before any publication.

## Task 1: Dedicated commercial service destinations

Ownership: create `shower-leak-repair-adelaide.html`, `balcony-waterproofing-adelaide.html`, `roof-waterproofing-adelaide.html`, `shower-regrouting-resealing-adelaide.html`, `tile-repair-adelaide.html`, and `tests/service-destinations.test.mjs` only. Read baseline existing pages for template patterns, but leave other product files to Task 2.

Requirements:
- Reuse the current bathroom-waterproofing page header/footer, shared styles, service-detail/service-scope/feature-media classes and canonical origin. Use readable line breaks in new HTML rather than a single giant line.
- Five unique service intents: shower leak assessment vs repair/membrane renewal; balcony thresholds/outlets/access and membrane vs tile scope; roof water-entry/accessible inspection/material/access scope without claiming all roof types; grout/flexible joints vs concealed membrane failure; tile replacement/matching/base condition and repair limits.
- Each page needs unique Title, description, OG/Twitter metadata (website type, existing asset), H1, lead, scope, assessment/process, cost/timing factors, return-to-use or care, related-service links, central FAQ links and direct contact/tel route. Use 5–7 meaningful sections, depth suited to decision-making (not an arbitrary word target).
- Use only tracked existing assets, responsive derivatives if available, genuine scene alt text, width/height; no elevated/unsafe photo requests. Photos optional via existing email, no form-upload claim.
- JSON-LD: consistent existing ProfessionalService, WebSite, WebPage.mainEntity -> unique Service @id, provider pointing to organization; valid BreadcrumbList matches visible breadcrumbs. No rating/review/offer invented. Avoid redundant nested @context.
- New pages can link each other and existing pages; all local links must resolve by Task 1 completion. Not yet in sitemap (Task 2 owns it).
- Test canonical, unique metadata/H1, entity linkage, CTA and related paths, local assets and FAQ policy; run full suite before commit. Preserve existing tests, only adapt existing test expectations when new legitimate pages expose a provable assumption.
- Self-review and create local commit for only owned files. Full report at `.superpowers/sdd/2026-10-10-seo-local-preview/task-1-report.md`: files, test command/output, review and concerns. Do not spawn subagents.

## Task 2: Hub integration and existing content quality

Ownership: existing HTML pages, sitemap.xml, related tests only. New Task 1 pages may be corrected only for cross-page metadata/graph consistency defects discovered during integration. No preview server/package configuration (Task 3).

Requirements:
- Make all five new service pages reachable through contextual links from Services and Waterproofing/Bathroom where relevant, plus at least one of homepage/service-areas/FAQ. Maintain existing required card destination routes; add useful supplementary detail links instead of blindly changing approved navigation.
- Add the five canonical URLs to sitemap with accurate 2026-10-10 lastmod; preserve original 11 entries and prior lastmod values. No retired routes, no false lastmod on legal pages.
- Expand renovation page with distinct practical information on preparation/layout, coordination, downtime/cost factors and handover; improve waterproofing and tiling hub copy where needed to support service selection. Do not replicate new pages verbatim or add duplicate FAQ answers.
- Complete catalogue ItemList using ordered ListItem with position, name and item -> Service name/url/provider. Each url should be a real new landing page or an accurate existing fragment. Update tests that assume the old flat Service list while preserving their coverage.
- Ensure consistent page/social metadata, OG website on commercial pages, no stale images or retired URLs; remove redundant nested @context. Fix schema/metadata shortcomings from prior local phase if encountered; keep provider facts unchanged.
- Existing About meta description is already adequate and anchors already statically rendered; do not perform the erroneous original audit fixes. ABR links already use verified full ABN.
- Tests must cover new pages in sitemap, non-orphan inbound links, service catalogue URL resolution, and existing navigation/FAQ invariants. Run npm test, inspect diff, local commit owned files.
- Full report at `.superpowers/sdd/2026-10-10-seo-local-preview/task-2-report.md`. Do not spawn subagents.

## Task 3: Reliable local verification and release handoff

Ownership: preview-server.cjs, package.json, two existing .js ES-module tests (rename to .mjs if appropriate), tools/verify-seo.mjs, tests/preview-server.test.mjs, README.md, docs/SEO-LOCAL-PREVIEW-2026-10-10.md, .vercelignore as needed to exclude internal docs/testing; report only elsewhere. No HTML content edits unless explicit reviewer findings.

Requirements:
- Make preview port configurable via PORT, default 4188 (4173 was occupied); bind only 127.0.0.1. Validate port, provide clear startup/failure messages, retain redirects, allow-list/path traversal protection, GET/HEAD behavior and non-sending contact API. Ensure HEAD has no body and return 405 for unsupported methods before redirect handling.
- Mirror configured non-cache safety headers on local responses; local cache remains no-store. Do not build a general Vercel emulator. Disable production analytics on localhost/127.0.0.1 preview using a narrowly scoped analytics.js change if required (ownership extends analytics.js for this).
- Create `npm run verify:seo` calling a zero-dependency static verifier. Parse sitemap and page metadata/schema; check canonical/indexability, exactly one H1, unique titles/descriptions, all local links/fragments/assets/srcset, image alt/dimensions, entity references and non-orphan commercial URLs. Exclude retired HTML from indexable page set. Fail with actionable errors and nonzero status; do not silently ignore malformed source. This is local verification, no production fetches or indexing submissions.
- Test preview server using temporary unoccupied port/child process; assert canonical redirect, page 200, nosniff/referrer/no-store, HEAD behavior, missing path 404, blocked traversal, POST API responds locally without send. Cleanup only own child process. Test the verifier's important failure behavior with isolated fixture/mutation where useful; avoid copying production logic into tests.
- Resolve preexisting Node warnings by renaming only the two .js ES-module test files to .mjs; do not set package type module globally because preview/contact modules use CommonJS.
- Correct README stale domain/sitemap instructions and document local commands, port, GitHub->Vercel publication gate, verification results and a truthful implemented vs external-data-dependent checklist. Cases, credentials, GBP/GSC, external citations and production CWV remain explicitly pending facts/account access.
- Run npm test and npm run verify:seo, self-review and local commit owned files. Full report `.superpowers/sdd/2026-10-10-seo-local-preview/task-3-report.md`. Do not spawn subagents.

## Final acceptance

- Fresh task review after each task; final whole-change review includes earlier local foundation changes from base `22f114983942b0c9399528b4cf3bee6dfecb8edf`.
- Fix important findings through implementer and scoped re-review.
- Run whole suite and static verifier, then start persistent local preview on an available port and check actual HTTP responses. Inspect desktop/mobile page rendering if browser tooling is available.
- Give user concrete homepage/new-page preview links and the handoff document. No publishing before user confirmation.
