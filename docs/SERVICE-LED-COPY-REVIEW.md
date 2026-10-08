# Service-led copy review — 2026-10-08

Scope: the local preview candidate, not production deployment or search-result snippets.

Reviewed all 11 active pages and the 3 retired redirect documents. Updated all 9 customer acquisition pages: Home, Services, Waterproofing, Bathroom Waterproofing, Bathroom Renovation Waterproofing, About, Contact, FAQ and Areas. Privacy, Terms and redirects remain unchanged.

Changes:
- Replaced standards history, regulatory primers and external-institution teaching blocks with Ellis preparation, installation, repair, coordination and handover services.
- Replaced nine “Know your surface” modules with page-specific “Our service approach” content and direct enquiry/call links.
- Rewrote renovation sequencing, quote and handover paragraphs to explain what Ellis does rather than instruct customers to question separate trades.
- Removed procedural DIY flood-test instructions and universal testing assumptions. Retained project-specific checks, curing and safety guidance.
- Strengthened pool, external wall and balcony sections with explicit service delivery.
- Updated affected FAQ structured answers to match visible content; preserved existing fragment IDs, canonical URLs, service routes and navigation.
- Retained project conditions, privacy terms and optional photo guidance. Added no new licence, insurance, certification, warranty or photo-provenance claims.

Verification: new regression test failed against the original copy and passed after changes. Full `npm test` passes 53 tests, including local links/fragments, JSON-LD, FAQ equality, navigation, redirects and the service-copy regression.

Preview: http://127.0.0.1:4173/ . No Git push or production deployment was performed for this revision.
