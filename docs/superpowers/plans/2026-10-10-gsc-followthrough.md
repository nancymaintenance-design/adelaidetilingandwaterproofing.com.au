# GSC follow-through: locally complete SEO release

Goal: Finish the approved SEO optimization using the actual GSC evidence and owner-confirmed Adelaide office/team, then retain the local preview for approval. This is a bounded continuation of the approved static-site plan, not a redesign.

Spec: User requests in this task plus the original approved SEO plan and `docs/GOOGLE-API-REPORT-adelaidetilingandwaterproofing.com.au.md`. Baseline commit: `51a1253`. Existing local preview branch and user-selected source directory are retained.

## Global Constraints

- Preserve existing untracked assets/evidence and unrelated changes; use apply_patch. You are not alone in the codebase; do not revert others' work.
- No push, merge, PR, deployment, real contact submission, or external account writes. No new dependencies/framework.
- Keep static HTML, existing visual design, one H1, centralized FAQ, full Services catalogue, and permanent retired-route redirects unchanged.
- Canonical origin: https://www.adelaidetilingandwaterproofing.com.au. Phone +61 425 170 688, email handyman.lyric@outlook.com.
- Legal entity ELLIS SERVICES GROUP PTY LTD; ABN 96 645 821 745; ACN 645 821 745; active ABN and GST from 11 November 2020, verified at https://abr.business.gov.au/ABN/View?id=96645821745. ABR main location VIC 3030 is not evidence of the Adelaide branch address.
- Owner confirms real Adelaide office at 63 Pirie St, Adelaide SA 5000 and independent local team, all within Ellis Services Group. No invented trade licences, insurance, ratings, projects, hours or warranties.
- Keep local contact endpoint non-sending; do not claim Google has reindexed unpublished changes. Canonical consolidation is a signal, not a guarantee.

## Task 1: Contact crawl URL normalization

Ownership: service-areas.html, scripts.js, tools/verify-seo.mjs, tests for these interfaces, and active HTML shared-script version only as required.

- Replace statically rendered suburb/area contact query links with fragment-prefill links: contact.html#enquiry-form?area=...&suburb=...; HTML ampersands escaped. This targets the existing form id. No new crawlable query combinations.
- Read fragment-prefill parameters in contact form, preserving old query links as fallback. Fragment parameters take precedence when a recognized selection fragment exists; ordinary anchors must not hide legacy query selection. Preserve trim/100-character bounds, safe textContent, hidden fields, optional suburb behavior, form submission semantics. Support selected location updates on hash navigation without duplicate fields/listeners or wiping user-typed location on ordinary anchors.
- Retain clean Contact canonical in raw HTML. Do not add query noindex, robots blocking, new middleware or dynamic server redirects. Existing legacy query URLs continue to work and carry the same canonical.
- Static verifier must recognize only valid contact-prefill fragments on contact.html anchored at enquiry-form (area required/nonempty, optional suburb, no duplicate or unknown keys), verify the form id exists; continue rejecting missing ordinary anchors, malformed fragments and prefill fragments on other pages. Validate actual emitted links. Avoid duplicating production logic in tests.
- Regression tests execute actual scripts.js with a minimal controlled DOM harness if no DOM dependency exists. Cover hash/query precedence, ordinary-anchor fallback, safe special characters, bounds, hash updates, no-form pages, and real emitted link URL semantics. Write failing tests first; retain meaningful old coverage while adapting changed contract.
- Cache-bust shared script references consistently if behavior changes. Run focused RED/GREEN, full npm test, npm run verify:seo, git diff --check. Commit only owned files. Report to task-1-report.md in this plan's SDD workspace. No subagents.

## Task 2: Local credibility, discovery and final handoff

Ownership: About, Contact, Home, Areas, Services and other existing HTML only for relevant discovery links; sitemap.xml, regression tests, docs/SEO-LOCAL-PREVIEW-2026-10-10.md, docs/GOOGLE-API-REPORT-adelaidetilingandwaterproofing.com.au.md, README.md, .gitignore/.vercelignore already changed by controller as needed.

- About clearly explains the same group/legal entity, verified registration/GST facts, and Adelaide office with its own local team. Maintain four balanced registration cards and valid ABR link. Distinguish owner-confirmed office from ABR main business location without defensive public copy or implying ABN is a trade licence.
- Contact visibly identifies the Adelaide office and local team near enquiry/office details; phone/address/email stay consistent. Home and Areas get concise contextual local-team/office copy and natural crawlable About/Contact links where useful, not boilerplate padding.
- Strengthen Services as the retained tiling destination: useful Adelaide tiling/waterproofing selection introduction, clear link from relevant homepage content with descriptive tiling anchor, and contextual routes from About/Contact/Areas to services, plus About/Contact discovery from relevant hubs where missing. Preserve current primary nav, required card destinations, full 19-item catalogue, retired tiling 308 destination #room-tiling, and FAQ invariants. Avoid recreating the retired page or thin suburb pages.
- Keep schema facts consistent. Existing shared ProfessionalService legalName/taxID/address is valid; do not introduce an unrelated legal entity or require speculative schema. Add verified ABR sameAs only if appropriate and consistent across existing graphs, otherwise retain current valid shared graph.
- Update sitemap lastmod only for materially changed pages to 2026-10-10; preserve legal dates and all 16 canonical entries.
- Add focused meaningful assertions for visible local identity, registration facts, discovery routes and unchanged canonical/catalogue. Write failing tests before product changes. Run full npm test, npm run verify:seo and diff check; self-review; local commit only owned files.
- Update handoff in Chinese: delivered changes, actual GSC baseline, parameter consolidation mechanism and legacy compatibility, 16 pages, local preview commands/port, user approval publication gate, remaining post-deployment GSC validation. Explain old tiling indexed snapshot vs current 308, Services unknown snapshot, and Google canonical override on Hyde Park parameter. No promise of rankings/indexation or claim account actions occurred. Remove stale claims that GSC access or office confirmation are missing. Cases/licences/insurance/GBP eligibility and field CWV cannot be fabricated.
- Full report in task-2-report.md in this plan's SDD workspace. No subagents.

## Final Acceptance

Fresh task review after each task; broad final whole-branch review against original base 22f114983942b0c9399528b4cf3bee6dfecb8edf. Fresh full suite/static verifier; persistent local 127.0.0.1:4188 preview, actual HTTP and browser desktop/mobile contact-prefill/changed-pages checks without enquiries. Preserve branch for user preview approval; no publishing.
