# Ellis Services Group — Adelaide Waterproofing & Tiling

Static website package prepared for GitHub and Vercel. The Contact form posts to a Vercel serverless function, which sends approved enquiries to `handyman.lyric@outlook.com` through Resend.

## Source baseline

This package was refreshed from GitHub `main` commit `99c4cdcc32beeaee0aff829970360c4836f7f868` on 23 September 2026 before the Service areas branch was created.

## Deploy with Vercel and Resend

1. Create an empty GitHub repository and upload the contents of this folder to its root.
2. Import that repository into Vercel. Vercel automatically recognises `api/contact.js` as the form endpoint.
3. In Resend, verify a domain that you control and use an address on that verified domain as the sender.
4. In **Vercel → Project → Settings → Environment Variables**, add these values for Production (and Preview if you want to test preview deployments):

   - `RESEND_API_KEY` — the secret API key created in Resend.
   - `RESEND_FROM_EMAIL` — for example: `Ellis Services Group <enquiries@your-verified-domain.com>`.

5. Redeploy the project after adding the variables. Submit one real test enquiry and confirm it arrives at `handyman.lyric@outlook.com`.

The API key is not included in this repository and must never be added to GitHub or browser code. The recipient is fixed in `api/contact.js`; visitor email addresses are used only as the reply-to address for the enquiry.

## Local preview

The static pages can be previewed locally, but sending requires a Vercel deployment with the two environment variables above. The local static preview server does not send email.

## Required SEO step before public release

This package deliberately does not ship an active `sitemap.xml` or `robots.txt` because the final domain has not been supplied.

1. Replace every `https://YOUR-DOMAIN` value in `sitemap.xml.template` and `robots.txt.template` with the final HTTPS domain, with no trailing slash.
2. Rename `sitemap.xml.template` to `sitemap.xml` and `robots.txt.template` to `robots.txt`.
3. Upload the two completed files to the repository root, then request indexing through Google Search Console.

## Included service pages

- Home, Services, Tiling, Guides, FAQ and Contact pages
- Waterproofing Adelaide, Bathroom Waterproofing Adelaide and Tiling Adelaide detail pages
- Local stylesheets, scripts and image assets

## Verified business details

- Business: Ellis Services Group
- Location focus: Adelaide
- Phone: 0425 170 688
- Email: handyman.lyric@outlook.com

