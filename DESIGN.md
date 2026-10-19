---
version: alpha
name: Ellis Waterline Field System
description: A surface-first visual identity for Adelaide waterproofing and tiling services.
colors:
  primary: "#102c36"
  secondary: "#14685f"
  accent: "#f4b544"
  action: "#b94815"
  background: "#f5f3ed"
  surface: "#ffffff"
  border: "#d2dcd9"
  text-muted: "#415861"
typography:
  sans:
    fontFamily: '"Segoe UI", Arial, sans-serif'
  heading:
    fontFamily: '"Barlow Condensed", "Bahnschrift", "Segoe UI", Arial, sans-serif'
  mono:
    fontFamily: 'Consolas, monospace'
rounded:
  DEFAULT: "18px"
spacing:
  section-gap: "5rem"
  page-max: "1240px"
components:
  button:
    rounded: "10px"
    backgroundColor: "#f4b544"
    textColor: "#102c36"
  card:
    backgroundColor: "#ffffff"
    textColor: "#415861"
    padding: "1.7rem"
---
# Ellis Services Group — Waterline Field System

## Overview
A brand website for Adelaide property owners seeking waterproofing, repairs and tiling. User-authorised scope includes roofs, pools, kitchens and all Adelaide regions. Existing phone, email and office address remain unchanged. Published languages are English (en-AU) and Simplified Chinese (zh-Hans), maintained as corresponding page pairs.

The visual reference is an architectural surface section: sound substrate, waterproof membrane, tiled finish. The 2026-10-14 approved homepage restores a four-photograph carousel beside the core service heading, with separate text and images, native service links and visible previous, next and pause controls. Reduced-motion preferences disable automatic rotation. Imagery is illustrative unless documented as an Ellis project. Avoid invented workmanship evidence, unverified claims and dashboard-like decoration.

Runtime tokens in brand.css are canonical; this document mirrors their roles. styles.css and publish.css remain compatibility layers for the existing static pages. The current inventory is 35 canonical pages, with 8 waterproofing and 12 tiling owners. Administrative pages retain their own intent.

## Colors
Deep blue anchors protection and depth. Teal is the waterproofing layer and the card edge. Warm white represents finished surfaces. Amber is the principal quote/call action; burnt orange is a high-contrast text-link/focus accent. Dark sections use pale green-grey supporting text rather than low-contrast orange. No dark-mode switch is introduced.

## Typography
Self-hosted Barlow Condensed (Latin 700/800 WOFF2, OFL-1.1) creates the engineering-oriented heading silhouette. The canonical --heading-font token in brand.css maps to all shared headings; DESIGN.md mirrors that stack. Weight 800 is preloaded and font-display: swap preserves readable fallback text. System sans keeps paragraphs readable without an external font request. Monospace labels identify stages and service categories. Body line height is 1.7 and text measures are bounded; mixed-script browser translation may fall back to system fonts. Avoid excessive capitals in paragraphs.

## Layout
1240px maximum, 90% fluid width. Desktop hero uses two balanced columns within the 1240px wrapper; mobile stacks copy and photographs. Photographs preserve their complete source composition without a readability overlay: the homepage carousel and supplied tiling details have 4:3 frames, while service hero and editorial photographs retain their natural ratios with object-fit: contain. FAQ and Contact editorial photographs use 3:2 originals and 400w/800w derivatives; their sizes attributes follow the actual split/asides rather than viewport width alone.

Two category entrances follow the homepage hero: Waterproofing and Tiling. They link to their catalogue hubs. Four supplied service scenes use a compact four-column desktop strip, two columns at intermediate widths and one column on phones. Three text-only project cards link straight to the existing case owners, avoiding repeated photographs. One delivery/contact section closes the page with the office map. The homepage does not repeat the catalogue's detailed process or enquiry cards.

Static navigation is identical across live pages: Home, Waterproofing, Tiling, Areas, FAQ, About, Contact, Call. Sticky navigation becomes a non-sticky wrapping header at 800px. All eight links retain at least 44×44px targets; the compact two-row phone navigation has a roughly 127px header at 360/390px. Desktop uses an 86px inner row and 87px header including the border. Scroll padding and focus margins keep keyboard focus below the sticky header; native anchors and comparison table scrolling remain available. Contact begins with the enquiry form, with the first field well within 850px at 390px. Maps are 480px tall on desktop and 380px on mobile.

## Elevation & Depth
Homepage photographs sit on a white surface, separate from readable dark text. No directional gradient covers the photographs. Cards are independent white surfaces with quiet borders and restrained hover feedback. No layered photo frame or floating content overlaps the hero. Photography is illustrative unless explicitly documented as an Ellis project.

## Shapes
Cards and framed content surfaces use an 18px shared radius; controls use 10px. The hero uses a separate photograph carousel, not a background image. This replaces the earlier square-corner direction at the user's request. SVG Instagram glyph is one text-height unit, underneath Call Ellis, not a separate footer area. Waterproofing and Tiling are separate primary navigation entries, approved on 2026-10-14.

## Components
Buttons: amber quote/call, orange secondary primary actions, outlined secondary navigation. All links remain native anchors. Hover changes the surface or underline; focus-visible has a 3px outline. Navigation indicates current page in static HTML.

Forms retain native validation and existing sending, success and error feedback. Local preview never sends enquiries. Existing external maps/Instagram open safely in a new tab. Details/summary provide keyboard-operable FAQ disclosure.

Homepage category cards explain installation and repair choices without repeated process or contact grids. The supplied images carry descriptive service/stage labels and related service links, not invented locations or case histories. The three project cards state only the recorded location, date and work. Source attachments and verification limits are recorded in docs/SUPPLIED-MEDIA-REPORT.md.

The photograph carousel rotates every 6.5 seconds; previous, next and pause controls remain native buttons. Reduced motion disables automatic rotation, and keyboard focus pauses it. Without JavaScript all four linked photographs remain in a horizontally scrollable strip. The service journey is visible without JavaScript.

The homepage H1 retains the core Adelaide service phrase. Following the user's 2026-10-14 revision, inner-page visible H1s name their service without the repeated city suffix; accurate local search titles, canonical URLs, office identity and genuine project geography remain. Local/nearby intent and confirmed suburbs belong in useful service copy, not a mechanical replacement of every heading with “near me”. H2s answer long-tail service needs. Scenario keywords describe the jobs Ellis handles, not standalone teaching modules. Customer pages prioritise our services, work process, benefits and a direct enquiry path. Standards history, regulatory primers and referrals to other institutions do not form sales-page sections. Retain necessary safety, curing and project requirements within the service explanation. Administrative pages retain privacy/terms intent. Content is direct and service-led: assess, prepare, protect, install, complete. A written scope explains project-specific details without outsourcing responsibility or making unverified licence, insurance, timing, review or warranty claims.

Text-only service and guide sections use a centered 1040px maximum / 90% reading surface, with paragraphs filling that surface. Guide introductions use the same service-reading variant as their scrolled content. Do not left-anchor a 70ch paragraph in an otherwise empty 1240px section. Paired media/scope sections and service catalogues keep the shared 1240px desktop layout. At 1366/1440/1920px the 1040px reading surface has equal 163/200/440px side margins; paired content remains 90% fluid until the 1240px maximum. Measure actual paragraph width and balanced margins, and inspect scrolled desktop screenshots as well as page-top captures.

Token ownership follows the existing-runtime model; there is no generated theme adapter. `brand.css :root` maps primary to `--ink`, secondary to `--teal`, accent to `--sun`, action to `--brand`, background to `--cream`, border to `--line`, muted text to `--slate`, heading typography to `--heading-font`, monospace to `--mono`, and radii to `--card-radius` / `--control-radius`. The white surface is the shared white compatibility token/fallback. Shared headings, buttons, cards and reading/layout rules consume these roles; page styles extend their geometry. No separate token source is introduced. Section spacing is 5rem by default, 3.5rem for the compact homepage, and 2.5rem for its phone sections.

## Do's and Don'ts
- Do preserve the service-to-detail-to-contact journey and accessible contrast.
- Do keep waterproofing and tiling coordinated through relevant cross-links, with separate category entry pages: waterproofing-adelaide.html for waterproofing and services.html for tiling.
- Don't create thin suburb landing pages or restore the retired tiling-adelaide.html route. The 2026-10-14 approved hierarchy supersedes the earlier omnibus-fragment routing: waterproofing-adelaide.html and services.html share one service-catalogue component with 8 and 12 service-item cards respectively. Each card heading and View service details link opens the same fragment-free independent service owner. The final inventory is 35 canonical pages with 20 primary service owners. tiling-services-adelaide.html now explains tile preparation and installation planning; it is not a third catalogue. Each owner exposes its category breadcrumb, explicit Back to waterproofing/tiling services link and Contact enquiry route. Catalogue cards are grouped by task, with displayed order and ItemList order updated together: waterproofing has wet-area work then exposed surfaces/pools; tiling has installation, repairs/joints, outdoor surfaces, then timber installation. Waterproofing cards use two desktop columns; tiling cards use up to three. Flexible rows fill the available width, including incomplete rows and the single timber card. Both catalogues become one column on phones. Historical data-legacy-service bookmarks keep native fallback links and same-origin known-fragment enhancement; ordinary cards are never intercepted. A fragment cannot be server-redirected. Use existing service-detail/service-scope components: paired content uses the 1240px/90% wrapper and two desktop columns; text-only sections use the centered 1040px/90% reading surface. Supplied detail photographs retain a complete 4:3 frame with object-fit: contain and no mask. Non-FAQ H2–H6 use direct service statements without mechanical city repetition; preserve genuine geographic group headings, distinct service intent, local search titles, addresses and project records.
- Don't imply illustrative images are real projects or promise search rankings.

## Local content editor

2026-10-19 approved replacement: the default admin now directly reuses Perth Handymate's preview-left / editor-right interface, page filter and native selects. Its canonical isolated tokens are in `local-admin/studio/field-design.css` and `editor.css`: blue #075873, navy #102b3a, light #edf5f7, yellow #f3b63f, text #172f3d and white editor panels; 14px panels, 6px controls, system sans with Microsoft YaHei fallback. This is an explicit user-requested admin variant, not a public-site palette change. Preview owns its scroll region; editing keeps natural document height. Below 980px the editing panel stacks before the preview. Existing list UI and tokens below remain only for /admin/legacy/ compatibility. The same state file and bilingual synchronization gate remain canonical.

The 2026-10-17 local-only admin reuses the Canberra Woodwork editor layout and interaction vocabulary: desktop page sidebar, searchable field rows, paired-language previews and native edit/history dialogs. The signature is a persistent bilingual synchronization status; task familiarity wins over a new visual concept. No public-site redesign is part of this feature.

`local-admin/ui/admin.css` owns the isolated application's runtime tokens (existing-runtime model): --ink #102c36, --muted #415861, --line #d2dcd9, --paper #ffffff, --ground #eef3f2, --brand #14685f, --focus #b94815, --thumb #809c96, --track #e5edeb. Microsoft YaHei / Segoe UI supports Chinese editing; 15px body, 30px page headings, 270px desktop sidebar, fluid main panel up to 1400px. The reused 7px buttons and 12px dialogs belong to the admin variant, not the public-site 18px cards. Shared controls consume the app tokens; no runtime token generator or external font is introduced. Dark mode and animation are not required. Keyboard focus, muted/error/success text, responsive stacking, scrollbars and unsaved-change recovery remain visible. See UX-CONTRACT.md for the canonical behavior owners.
