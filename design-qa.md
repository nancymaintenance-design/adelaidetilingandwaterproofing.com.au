# Full-site dossier — selected inner-page option 3

## Latest correction — service media, 2026-10-20

The user's follow-up correctly identified gaps missed by the original visual acceptance: a file-loading check did not ensure every service had a photo, and flex-growing orphan cards enlarged 4:3 thumbnail frames. The earlier QA below is historical, not evidence that those problems were absent.

Resolved: all 20 cards now have explicit existing-photo mappings; nine previously photo-free service owners have supporting imagery with bilingual accurate descriptions. Card images are uniformly 200px high; service/case photographs are bounded at 420px, with full composition retained. A sole card uses a compact desktop image/text layout. Shared layout tests still require filled rows, working links and intact originals.

Evidence: `../reports/dossier-20261020/media-tiling-fixed-1440.png`, `media-waterproofing-fixed-1440.png`, `media-timber-fixed-1440.png`, `media-kitchen-fixed-1440.png`, `media-tiling-fixed-390.png`. Inspected the actual IAB layouts, not only asset HTTP status. Real case photos remain on their existing pages; added supporting photos do not introduce new project provenance.

Verification: full suite 466/466 passed, no skips (`media-verified-tests.log`); media-specific checks cover both languages at 390/768/1440/1920; all 20 owner pages checked in both languages. Content preservation still passes for all 70 pages, with explicitly additional `dossier-context-photo` imagery separately tested. SEO: 70 pages / 6739 references; i18n/feeds and diff checks pass. Strict static audit: zero findings. Local only; no deployment.

Latest correction final result: passed

Latest QA: 2026-10-20. Local-only candidate. The earlier homepage QA below remains historical evidence; this section covers the complete redesign.

## Source and comparison

- Visual truth: `C:/Users/UFTR/.codex/generated_images/01a123b7-bc5b-76c3-b2e5-f397de6a47d9/exec-8b42447c-6e04-435f-b551-3e5155f2426c.png`, 1448×1086 pixels.
- Implementation: `../reports/dossier-20261020/kitchen-en-final.png` and Chinese `kitchen-zh-final.png`, in-app browser, ordinary page-top state, photo loaded, enquiry and telephone actions visible.
- CSS viewport 1448×1086. The browser screenshot payload is JPEG despite its filename suffix, 1433×1075 pixels after browser/scrollbar scaling. It is normalized to the source 1448×1086 comparison frame, without browser chrome/device framing.
- Full-view evidence: `../reports/dossier-20261020/comparison.png`, source left / implementation right, opened together. Focused type/intro evidence: `comparison-focus.png`; both originals were also inspected at readable native size.
- Additional evidence: 390px EN/ZH kitchen and Contact screenshots, desktop screenshots for both catalogues, photo-free service, FAQ, About, Areas, guide, privacy and homepage, in the same report directory.

## Iterations and resolved findings

1. Inherited 480px image-height limit caused letterboxing. Removed through a stronger final-layer selector; full natural composition now retained.
2. A tall checklist beside a short paragraph left an empty-looking half. Scope introductions/checklists now span the chapter surface; ordinary prose remains two columns.
3. Guides had both a new index and their existing index. Removed only the new duplicate and styled the original native index. All original destinations remain.
4. The first same-input comparison showed small intro typography and no telephone shortcut. Increased desktop intro type and added the existing business telephone route; recaptured and compared again.

Final full/focused comparisons show no actionable P0/P1/P2 findings.

## Required fidelity surfaces

- Typography: original condensed display family/body fonts; prominent editable H1; 21.6px-max desktop intro. Chinese independently sized. English mobile headings wrap at whole words, without clipping. Full original chapter labels retained.
- Layout: title above photo/independent enquiry surface; compact native index; full-width teal-accent chapter headings and balanced desktop columns. Mobile places enquiry before photo. 140 route/viewport visits have no horizontal page overflow.
- Tokens: existing ink/cream/teal and orange/amber action palette, with no photo overlay. The live H1 remains wholly ink rather than the reference's final-word teal; a minor retained-brand choice, not a hierarchy or readability blocker.
- Images: original kitchen and other source photographs, full natural proportions. The live hero is taller than the mock's cropped-photo composition, intentionally satisfying the user's full-image/content preservation requirement. No invented work image or decorative CSS image substitute.
- Content: all 70 original pages match their text, heading, link, image, JSON-LD and form-field baseline. Only new duplicated chapter labels, decorative thumbnail copies and the existing-phone shortcut are excluded from the original-content hash and checked separately. No new business claim.

## Verification

- `npm test -- --test-concurrency=1`: 464 passed, 0 failed, 0 skipped, `../reports/dossier-20261020/verified-tests.log`.
- New 140-visit matrix: all 70 pages at 390/1440; HTTP 200, one H1, no skipped heading levels, visible broken images, overflow, duplicate IDs or first-party script errors. JSON-LD parses and chapter anchors resolve.
- IAB interactions: chapter jump, service quotation route/preselection, EN→ZH switch retaining query/fragment, FAQ open state. Error/warning log check on final service state returned none. No real enquiry sent.
- `npm run verify:seo`: 70 pages / 6635 references; bilingual mappings and both feeds pass. Feed bytes/publication dates unchanged.
- `git diff --check`: passed, ordinary Windows line-ending notices only.

## Accepted differences / P3 polish

Complete uncropped photo instead of the mock crop; full chapter labels instead of shortened labels; wholly ink H1 instead of final-word teal. No outstanding core-flow/responsive blocker. Optional future coloured trade-word emphasis is P3 only.

final result: passed

---

# Earlier homepage signboard QA

Date: 2026-10-20. Scope: existing English and Chinese homepages, local preview only.

## Visual truth and rendered evidence

- English source: `C:/Users/UFTR/.codex/generated_images/01a123b7-bc5b-76c3-b2e5-f397de6a47d9/exec-72b07dea-d8f4-4859-84bf-374e3dc702eb.png`.
- Chinese source: `C:/Users/UFTR/.codex/generated_images/01a123b7-bc5b-76c3-b2e5-f397de6a47d9/exec-aedcc0b4-6e45-46b3-8ab0-141cefca2c4e.png`.
- Implementation: `http://127.0.0.1:4202/` and `/zh/`, captured with the in-app browser.
- Screenshots: `../reports/signboard-20261020/en-1440.png`, `zh-1440.png`, `en-390.png`, `zh-390.png`.
- CSS viewport: desktop 1440×1000; captured PNG 1425×990 (browser capture scaling), not a device frame. Source EN 1505×1045; source ZH has the same desktop composition. Full comparisons normalize each complete image into a 720×500 box without cropping. No pixel-perfect claims across raster density differences.
- State: page top, kitchen photograph / first slide, complete loaded membrane photograph. Carousel controls retain previous, pause/start and next.
- Full-view comparison: `../reports/signboard-20261020/en-comparison.png` and `zh-comparison.png`; source left, implementation right, opened together for review.
- Focused typography comparison: `en-title-comparison.png` and `zh-title-comparison.png` in the same report directory. Crops cover the trade title, city and signature; each pair was opened together. Phone captures were inspected at full size.

## Findings and iteration history

1. [P2, resolved] The earlier first-child copy-card selector overrode the selected open copy layout. Removed its effect through a correctly scoped later selector. Post-fix full comparisons show no white card or teal copy-column edge.
2. [P2, resolved] Initial heading scale underused the signboard width. Increased English condensed type to a 134.4px cap, with an independent Chinese 120px cap. Final focused comparisons preserve large white/amber trade names; desktop names remain on one line, with no clipping or internal English word breaks.
3. [Capture issue, resolved] A rapid viewport/reload capture preceded the membrane image paint. Final desktop captures were taken after load and confirmed `naturalWidth=800`; both photographs are present in the final comparisons. This was not treated as evidence of missing production content.

No remaining actionable P0/P1/P2 issues in this bounded homepage change.

## Required fidelity surfaces

- Fonts / typography: existing self-hosted Barlow Condensed 800 for English, explicit Chinese-capable sans fallback. One semantic H1 includes both trades and the city; no duplicated H1. Whitespace separates Tiling and Adelaide for assistive reading. Mobile line breaks occur between whole trade labels. The raster mock's exact glyph shapes are not reproduced as an image.
- Spacing / layout: full-width dark title band followed by open copy/photograph columns. The reference's wider cropped photograph is intentionally replaced with the existing complete 4:3 photo, per the site's image-preservation contract. This gives a slightly taller lower row; no fixed viewport-height shell or empty copy card. At narrow widths copy precedes the main carousel; the secondary membrane image remains available in the existing service-scene section rather than repeating above it.
- Colors / tokens: signboard consumes `--ink`, trade accent `--sun`, actions existing brand/amber tokens. Body uses the existing warm surface and material grid. No dark photograph overlay. Existing palette remains canonical in `brand.css`.
- Image quality / fidelity: actual supplied kitchen, balcony, courtyard and pool photographs are retained, with original responsive derivatives. Existing membrane photograph fills the secondary desktop slot. No generated replacement, fake project provenance or illustration substitute was introduced.
- Copy / content: direct first-person service statement, short quotation invitation, original telephone, service links and case links retained. The two locales are reviewed and generated from one structure. No invented claims, reviews or guarantees.

## Responsive and interaction checks

- In-app browser: EN/ZH at 320, 390, 768, 1024, 1440, 1920 CSS px; final measurements in `../reports/signboard-20261020/responsive.json`. No horizontal overflow; one H1. Desktop trade labels share a row; phone labels stack without breaking the English words.
- Carousel: pause/start and next/previous exercised; status moves 1→2→1. Keyboard Tab reaches next with a visible solid focus outline. Both language links exercised. Error-level browser log query returned no entries during the checked interaction pass.
- Full project suite: 460 passed, 0 failed, 0 skipped, including existing reduced-motion, carousel and bilingual/browser tests. New structural and responsive regressions cover signboard position, trade labels and retained photographs.
- `npm run verify:seo`: 35 bilingual pairs, four feeds, 70 indexable pages, 6323 references passed. `git diff --check` passed.
- Premium strict static audit: no findings. DESIGN lint: zero errors; four existing unreferenced-token warnings remain. No independent build/typecheck/formatter scripts exist in this static project.
- No real enquiry was sent, no remote indexing requested and no deployment/push performed. Existing prior local conversion edits were preserved.

## Follow-up polish

- P3: the mock's ampersand/divider and small signature details differ slightly; the real page prioritizes editable, accessible bilingual text and unchanged source photographs. These do not affect the selected visual hierarchy or lead path.

## Implementation checklist

- [x] Selected option 3 in both languages.
- [x] Full-width trade H1; desktop and phone break rules.
- [x] Existing carousel, photographs, service destinations and contact entry retained.
- [x] Generated Chinese source and review fingerprints current.
- [x] Browser comparison and full test suite passed.
- [x] Local preview retained; not deployed.

final result: passed
