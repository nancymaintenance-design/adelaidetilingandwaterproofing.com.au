# Local performance review — 2026-10-08

Tool: Lighthouse CLI 13.5.0, installed Chrome, headless, http://127.0.0.1:4173. Default simulated mobile throttling and desktop preset. No deployment, tunnel or real enquiry submission.

| Page | Mode | Performance | LCP | TBT | CLS |
|---|---|---:|---:|---:|---:|
| Homepage | Mobile | 99 | 2.0 s | 60 ms | 0 |
| Homepage repeat | Mobile | 99 | 2.0 s | 50 ms | 0 |
| Homepage | Desktop | 100 | 0.5 s | 0 ms | 0 |
| Services | Mobile | 99 | 1.9 s | 30 ms | 0 |
| Contact | Mobile | 98 | 2.3 s | 30 ms | 0 |

Initial homepage mobile and desktop runs were concurrent. Homepage mobile was then repeated serially, followed serially by Services and Contact. No Lighthouse runtime warnings. Accessibility, Best Practices and SEO automated scores were 100 in the four full-category runs; this is not a manual WCAG certification, comprehensive SEO audit or ranking prediction.

## Remaining technical refinement (not implemented in this diagnostic turn)

- Discover/prioritise the CSS-background hero image earlier; Lighthouse reports missing high-priority discovery.
- Reduce render-blocking styles and the analytics.js request. Review compatibility CSS before consolidating; preserve layout and analytics order.
- Further tailor image derivatives to rendered size and compress the detailed imagery without losing construction detail.
- Back/forward cache warnings relate to the preview server's intentional Cache-Control: no-store; assess production separately rather than treating these local warnings as production defects.
- Preview HTML is not compressed; production CDN compression, caching, latency and email configuration are outside this local test.

## Data and functional limits

Scores are single lab observations (plus one homepage repeat), not CrUX field data. TBT is not INP. The local host does not validate production hosting or actual enquiry delivery. Existing handler dry runs returned 405 for GET, 400 for missing fields, and 400 for malformed email; none sent email.

Company case-study labels still need photo ownership/authenticity, publication permission and project details. No precise locations, dates or verified-company-project claims were fabricated.

Reports are saved under evidence/lighthouse-*.report.html and .json; repeat JSON is evidence/lighthouse-home-mobile-repeat.json. Relevant official methodology: https://developers.google.com/speed/docs/insights/v5/about and https://github.com/GoogleChrome/lighthouse .
