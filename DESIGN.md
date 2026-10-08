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
A brand website for Adelaide property owners seeking waterproofing, repairs and tiling. User-authorised scope includes roofs, pools, kitchens and all Adelaide regions. Existing phone, email and office address remain unchanged. English (en-AU) is the published language.

The visual reference is an architectural surface section: sound substrate, waterproof membrane, tiled finish. The approved homepage uses one full-width supplied waterproofing scene with clear service-led copy. No carousel, floating photo panel or translucent nested frame remains. Imagery is illustrative unless documented as an Ellis project. Avoid invented workmanship evidence, unverified claims and dashboard-like decoration.

Runtime tokens in brand.css are canonical; this document mirrors their roles. styles.css and publish.css remain compatibility layers for the existing static pages.

## Colors
Deep blue anchors protection and depth. Teal is the waterproofing layer and the card edge. Warm white represents finished surfaces. Amber is the principal quote/call action; burnt orange is a high-contrast text-link/focus accent. Dark sections use pale green-grey supporting text rather than low-contrast orange. No dark-mode switch is introduced.

## Typography
Self-hosted Barlow Condensed (Latin 700/800 WOFF2, OFL-1.1) creates the engineering-oriented heading silhouette. The canonical --heading-font token in brand.css maps to all shared headings; DESIGN.md mirrors that stack. Weight 800 is preloaded and font-display: swap preserves readable fallback text. System sans keeps paragraphs readable without an external font request. Monospace labels identify stages and service categories. Body line height is 1.7 and text measures are bounded; mixed-script browser translation may fall back to system fonts. Avoid excessive capitals in paragraphs.

## Layout
1240px maximum, 90% fluid width. Desktop hero places a 620px maximum core-keyword copy column over the left side of one bathroom background, leaving the right-side image unobstructed. Mobile uses a shorter heading and a readability overlay. The four native service shortcuts sit below the hero without overlap. Service selectors use four balanced cards in a two-column layout, then one column on small phones. Static navigation is identical across live pages: Home, Services, Areas, FAQ, About, Contact, Call. Sticky navigation becomes a non-sticky wrapping header on mobile. Maps are 480px tall on desktop and 380px on mobile.

## Elevation & Depth
The supplied membrane-application image provides hero depth; a directional navy gradient protects the copy while revealing the right-side image. Cards are independent white surfaces with quiet borders and restrained hover feedback. No layered photo frame or floating content overlaps the hero. Photography is illustrative unless explicitly documented as an Ellis project.

## Shapes
Cards and framed content surfaces use an 18px shared radius; controls use 10px. The hero is a full-width background, not a framed card. This replaces the earlier square-corner direction at the user's request. SVG Instagram glyph is one text-height unit, underneath Call Ellis, not a separate footer area. No standalone Tiling nav tab.

## Components
Buttons: amber quote/call, orange secondary primary actions, outlined secondary navigation. All links remain native anchors. Hover changes the surface or underline; focus-visible has a 3px outline. Navigation indicates current page in static HTML.

Forms retain native validation and existing sending, success and error feedback. Local preview never sends enquiries. Existing external maps/Instagram open safely in a new tab. Details/summary provide keyboard-operable FAQ disclosure.

Each homepage service card ends with Assessment → Scope → Delivery after its complete 2×2 native navigation grid. Supplied images carry descriptive service/stage labels and related service links, not invented locations or case histories. Source attachments and verification limits are recorded in docs/SUPPLIED-MEDIA-REPORT.md.

No automatic slideshow or interval remains. Motion is limited to short hover/focus transitions, which reduced-motion disables. The service journey is visible without JavaScript.

All customer-facing H1s identify an Adelaide service or service intent; H2s answer long-tail service needs. Scenario keywords describe the jobs Ellis handles, not standalone teaching modules. Customer pages prioritise our services, work process, benefits and a direct enquiry path. Standards history, regulatory primers and referrals to other institutions do not form sales-page sections. Retain necessary safety, curing and project requirements within the service explanation. Administrative pages retain privacy/terms intent. Content is direct and service-led: assess, prepare, protect, install, complete. A written scope explains project-specific details without outsourcing responsibility or making unverified licence, insurance, timing, review or warranty claims.

## Do's and Don'ts
- Do preserve the service-to-detail-to-contact journey and accessible contrast.
- Do keep waterproofing and tiling coordinated in Services, with specific bathroom and waterproofing detail pages.
- Don't create thin suburb landing pages or restore an overlapping standalone Tiling page.
- Don't imply illustrative images are real projects or promise search rankings.
