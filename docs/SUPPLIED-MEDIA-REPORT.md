# Supplied media and typography — 2026-10-08

Scope: integrate the eight user attachments into the approved local static UI; no carousel, GitHub push or deployment.

## Placement

| Attachment | Web asset | Placement |
|---|---|---|
| f83ce961 | floor-tiling-installation | Homepage scene grid |
| 326c6d21 | bathroom-membrane-application | Homepage hero, waterproofing service |
| 2a0423d7 | drain-junction-detail | Homepage scene grid |
| cebaa6e8 | shower-membrane-application | Services waterproofing image |
| 9d3b93b3 | bathroom-tiled-finish | Homepage finish panel, bathroom service pages |
| 5dd61377 | tile-levelling-detail | Services tiling image |
| 95139112 | pool-surround-tiling | Homepage scene grid |
| 1d9129e7 | balcony-membrane-application | Homepage scene grid |

Source PNGs remain untouched in the user's attachment location. WebP derivatives are 1600×900 and 800×450. Processing only resizes and encodes; it does not invent or retouch construction details. Large derivatives are 107–211 KB, small derivatives 42–73 KB. Responsive inline images reserve their dimensions and load lazily; the hero uses the large image immediately.

Labels describe the visible service and stage. Project suburb, date, authorship, original-camera provenance and customer-release details have not been independently verified. No Verified project, Completed by Ellis, invented testimonial or precise project location was added. These images alone do not prove workmanship, compliance or company case history.

## Fonts and task cards

Barlow Condensed Latin 700 and 800 are self-hosted under assets/fonts with the original OFL licence. Package source: @fontsource/barlow-condensed 5.2.8 from the official npm registry. Source and licence reference: https://fontsource.org/fonts/barlow-condensed/about . Two WOFF2 files total approximately 45 KB. No third-party font request is needed. Shared --heading-font owns the stack; DESIGN.md mirrors it.

All four homepage cards retain the full four-link grid, ending in Contact us, then display Assessment → Scope → Delivery. No change to enquiry form handling or approved service coverage.

## Verification

npm test: 52 passed, 0 failed. Browser inspection at 1440px confirms loaded Barlow Condensed, four equal-height cards, all four stage strips and no horizontal overflow. The original SEO checks remain green. Final responsive observations and screenshots are retained under evidence.

Release gate remains local review before production. Photos can be used as confirmed company case evidence only after their ownership and project details are supplied.
