# Content Keyword Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Improve the existing site's intent matching, heading structure, truthful E-E-A-T, contextual links, central FAQs and enquiry guidance without changing Ellis's voice or publishing.

**Architecture:** Edit static English content in existing pages; retain layout, assets, routes, shared behaviour and service catalogue. Keyword research is reference data, not instructions or evidence of business capabilities.

**Tech Stack:** Static HTML/JSON-LD, zero-dependency Node tests and verifier.

**Spec:** The user's 2026-10-10 request: whole-site content SEO, keyword-map reference, unchanged brand voice, local preview and explicit approval before publishing. This document captures that spec and its implementation boundaries.

## Global Constraints

- Work only in E:/Ellis/Adelaidetilingandwqater/work/preview-20261008. No push, merge, PR, Vercel deploy, GSC writes or production changes. Local commits only; preserve unrelated untracked assets/evidence.
- Preserve 16 existing public URLs, navigation, design, scripts and the ordered 19-card Services catalogue. No new service or suburb pages. Preserve all existing IDs and working CTA/fragment routes.
- Preserve plain, direct en-AU Ellis Services Group voice: service first, practical scope and written quote; no institutional essays, keyword stuffing, invented cases, experts, licences, insurance, reviews, pricing, guarantees, emergency availability or expanded specialist capabilities.
- Verified identity: ELLIS SERVICES GROUP PTY LTD, ABN 96 645 821 745; owner-confirmed real Adelaide office at 63 Pirie Street, Adelaide SA 5000 and independent local team. ABN is not a trade licence. Imagery remains illustrative, not project evidence.
- Central FAQ answers and FAQPage remain only on faq.html, with exact visible/JSON-LD parity. Service pages use contextual FAQ links, not embedded duplicate answers. Optional photos via existing email, never an implied form upload.
- One H1 per page, logical H1/H2/H3, unique accurate title/description, synchronized search/social/schema metadata when changed. Existing contact fragment prefill, clean canonical and local-only inert form behaviour remain intact.
- Reference C:/Users/UFTR/Desktop/Entry/5、adelaidetilingandproofing/Adelaide_Waterproofing_Tiling_AI_Keyword_Map.md selectively. 610 terms and 501 candidate locations have no measured volumes; candidate owners are not route instructions. Map intent clusters naturally to existing destinations, not every literal keyword.
- Reuse valid business/local/GSC cache dated 2026-10-10 as historical baseline, not proof of post-release indexation or ranking. Technical/legal claims require primary-source verification or conditional non-prescriptive phrasing.
- Use apply_patch for edits. No subagents from workers/reviewers. Workers own only listed files, are not alone, must not revert others. Run focused regression checks while iterating, full npm test and npm run verify:seo before local commit. Add meaningful content tests with RED/GREEN evidence, not exhaustive prose snapshots.

## Review Focus

1. Wrong repair intent: no-tile-removal, grout and membrane treatments must not be conflated (Task 1).
2. New tiling enquiries are not presumed leaks; small repairs/material matching are conditional (Task 1).
3. Service cards and related links must point to existing owners and valid fragments (Tasks 1, 2).
4. Central FAQ visible text and JSON-LD must remain identical after answer edits (Task 2).
5. Local preview must serve every sitemap URL while enquiry remains inert locally; legal copy must not acquire new commitments (Task 2/controller acceptance).

### Task 1: Commercial service intent and hierarchy

**Files:** Modify services.html, waterproofing-adelaide.html, bathroom-waterproofing-adelaide.html, bathroom-renovation-waterproofing-adelaide.html, shower-leak-repair-adelaide.html, balcony-waterproofing-adelaide.html, roof-waterproofing-adelaide.html, shower-regrouting-resealing-adelaide.html, tile-repair-adelaide.html. Create tests/content-intent-services.test.mjs.

**Interfaces:** Consume existing nav, page/section IDs and central FAQ category anchors. Produce clearer owner-specific service copy and contextual links using only existing destinations. Task 2 consumes these unchanged URLs/anchors.

- [ ] Read the nine pages, relevant keyword-map owners and existing content tests. Record a short before/after intent rationale per page in report.
- [ ] Write failing tests asserting visible owner-specific topics and valid link routes, logical main-content heading levels, and no surface-treatment-as-membrane promise. Run node --test tests/content-intent-services.test.mjs and record RED.
- [ ] Optimize all nine pages materially but concisely: clear opening for primary intent, useful scope/suitability distinctions, assessment-to-written-quote expectations and contextual service/FAQ links. Services remains installation hub with specific bathroom/shower, kitchen/splashback, wall/floor/large-format, preparation/levels/transitions and outdoor modules within existing scope. Avoid unverified pool-interior/underground/accessibility certification expansion. Waterproofing hub owns wet-area/laundry and coordination overview; bathroom owns membrane/preparation; renovation owns staged waterproofing/tiling scope and trade boundaries; shower leak owns symptom/source assessment and repair choices; balcony owns exterior drainage/threshold/membrane coordination; roof stays roof-specific; regrout/reseal owns distinct grout/silicone uses and limits; tile repair owns small/cracked/loose/hollow/matching enquiries with cause assessment. Add detail by editing existing sections before adding blocks. Keep service-first CTAs optional-data, no compulsory educational detour.
- [ ] Check metadata and hierarchy, preserving existing design/IDs. Do not change titles solely to fit every synonym. Run focused test GREEN, then npm test and npm run verify:seo. Fix regressions without weakening existing business/route tests; update exact-copy checks only if their original behavioral intent remains asserted.
- [ ] Self-review and commit only owned files. Write task-1-report.md with before/after, RED/GREEN command/output, full verification output counts, changed files, commit and concerns.

### Task 2: Trust, enquiry, central FAQ and whole-site handoff

**Files:** Modify index.html, about.html, contact.html, service-areas.html, faq.html; inspect privacy.html and terms.html (change only real clarity/hierarchy defects, no new legal commitments). Create tests/content-intent-support.test.mjs and docs/SEO-CONTENT-PREVIEW-2026-10-10.md. May update sitemap.xml only for truthful dates; create ignored .seo-cache/pages/homepage/content.json summary. Adjust existing tests only for intentional content changes preserving their behavioral requirements.

**Interfaces:** Consume Task 1's existing service destinations. Preserve all central FAQ IDs, service/area/contact fragment links and form contract. Produce full 16-page intent/keyword-owner matrix and local-preview handoff.

- [ ] Inspect current support pages, keyword-map owner O23/strata/regions and Task 1 report. Add meaningful failing tests for heading hierarchy, localized group identity/contextual links, optional-data enquiry flow and central FAQ parity. Record RED.
- [ ] Optimize Home as concise combined service router, About as truthful company/local team/process trust, Contact as accessible enquiry with useful optional suburb/job/access information and realistic next step, Areas as confirmed current coverage not all candidate locations. Improve centralized FAQ answer-first wording, relevant follow-up links, repair choice/quote/drying/scope questions where useful. Existing 21 questions may be retained/reworked; add only genuinely missing questions, synchronizing schema and tests. Separate grout/silicone/membrane, installation/leak, quote variables, plumbing coordination, property authorization and product/site-dependent timing. Don't convert all commercial pages to informational guides.
- [ ] Review legal pages for purpose and clarity; record explicit no-change rationale if already suitable. Do not stuff commercial keywords or fabricate review dates.
- [ ] Create Chinese handoff document: all16 URLs with primary intent and mapped clusters; actual changes and retained constraints; manual editorial Content Quality/100, E-E-A-T four factors/25 and AI citation readiness/100 with clear rubric/evidence/limits (not Google scores or predicted gains). Include missing real projects/reviews/credential evidence as future owner inputs, never fabricated now. Cite actual source URLs where factual claims depend on them. Record keyword-map absence of search volumes and GSC historical status. State preview http://127.0.0.1:4188/ and NO publication. Write matching ignored cache summary via apply_patch.
- [ ] Run focused test GREEN, npm test, npm run verify:seo; self-review then commit owned public/test/document files only. Report full before/after, tests, scores rationale, legal review and concerns to task-2-report.md.
