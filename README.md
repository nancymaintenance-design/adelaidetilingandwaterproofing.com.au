# Ellis Services Group — Adelaide Waterproofing & Tiling

Static website source for the existing GitHub → Vercel workflow. Canonical origin: `https://www.adelaidetilingandwaterproofing.com.au`. The production Contact form uses `api/contact.js` and Resend; the local preview returns a non-sending response instead.

## Source baseline

This package was refreshed from GitHub `main` commit `99c4cdcc32beeaee0aff829970360c4836f7f868` on 23 September 2026 before the Service areas branch was created.

## Local preview and verification

Use Node.js 20 or later. These commands need no added packages or service credentials:

```powershell
npm test
npm run verify:seo
npm run preview
```

Open `http://127.0.0.1:4188/`. The server binds only to `127.0.0.1`; stop your own foreground preview with Ctrl+C. To select another port in PowerShell:

```powershell
$env:PORT = '4189'
npm run preview
# After stopping that preview:
Remove-Item Env:PORT -ErrorAction SilentlyContinue
```

The default is 4188 when `PORT` is unset. Invalid ports and occupied ports produce clear errors; no other service is stopped. Responses use `Cache-Control: no-store` and the configured security headers. Redirects, GET and HEAD are supported; unsupported methods return 405. `/api/contact` returns 503 with an explicit local-only message, including for POST, and never runs the email handler. Analytics initialization and events are disabled on localhost and 127.0.0.1. Existing external map/analytics script URLs can still be loaded by a browser; this is not a fully offline preview.

`verify:seo` reads local files only. It checks sitemap coverage, canonical/indexability, one H1, unique titles/descriptions, static links/fragments/assets/srcset, image alt/dimensions, JSON-LD entities and commercial pages reachable from Home. It does not fetch production, submit indexing, measure field Core Web Vitals, or validate factual business claims. The scanner deliberately supports this repository's explicit static markup and sitemap format; unsupported or malformed source fails with a file-specific error.

## Sitemap and routes

Active `sitemap.xml` and `robots.txt` are already included for the canonical origin. The sitemap currently contains 16 indexable pages; do not generate them from the retired template files. Update the active sitemap when page URLs change and use truthful modification dates.

`/index.html` redirects to `/`; `/products.html` redirects to `/services.html`; `/news.html` redirects to `/faq.html`; `/tiling-adelaide.html` redirects to `/services.html#room-tiling`. Retired source files are excluded from the verifier's indexable set. The complete 19-item service catalogue remains in `services.html`; FAQ answers remain centralized in `faq.html`.

Area selections now link to `contact.html#enquiry-form?area=...&suburb=...`. The fragment carries client-side form state; the document canonical stays the clean Contact URL. Old query-based selection links still prefill the form. The About page connects the Adelaide office and its own local team to ELLIS SERVICES GROUP PTY LTD and links the verified ABR record; owner confirmation, rather than the ABR main-location field, establishes the Adelaide office/team facts.

Read the [2026-10-10 GSC baseline](docs/GOOGLE-API-REPORT-adelaidetilingandwaterproofing.com.au.md) alongside the local handoff. Its historical URL Inspection results predate publication of these changes; canonical/indexation outcomes require post-publication checks.

## Publication gate and production email

This work is local only. **The user must approve the final local preview before any push, merge, GitHub write or Vercel publication.** A push to the connected repository may trigger Vercel automatically, so pushing is part of publication, not a harmless preview step. No push, deploy, real enquiry or indexing submission is performed by the local commands above.

After explicit approval, use the existing connected GitHub repository and verify Vercel's target branch/project rather than creating a replacement repository. Production email requires a verified Resend sender and these Vercel environment variables:

- `RESEND_API_KEY` — keep secret; never commit or place in browser code.
- `RESEND_FROM_EMAIL` — an address on the verified sender domain.

The recipient is fixed as `handyman.lyric@outlook.com`; visitor email is used for reply-to. Account configuration and a real delivery test require separate authorized production work. Passing local tests does not prove production delivery or indexing.

## Local handoff

The Chinese handoff, implemented checklist, verification results and factual/account-dependent pending items are in [docs/SEO-LOCAL-PREVIEW-2026-10-10.md](docs/SEO-LOCAL-PREVIEW-2026-10-10.md). Public contact details remain Ellis Services Group, Adelaide, 0425 170 688 and `handyman.lyric@outlook.com`. Existing company information and illustrative service images do not establish unverified credentials, cases or Google Business Profile eligibility.
