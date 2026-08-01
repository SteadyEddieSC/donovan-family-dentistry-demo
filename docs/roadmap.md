# Donovan Family Dentistry Website Roadmap

## Product direction

The modern concept is the patient-facing digital front door. Each page has one primary responsibility:

- **Home:** orient visitors and route them to the correct next step.
- **About:** explain the practice history, experience, values, and Lowcountry setting.
- **Services:** serve as the detailed source of truth for published procedures.
- **Team:** contain dentist biographies and staff profiles.
- **New Patients:** explain the first-call, paperwork, arrival, payment, and urgent-contact journey.
- **Patient Forms:** provide reviewed downloads and clear privacy instructions.
- **Contact:** provide directions, hours, phone access, and a limited administrative inquiry path.

## Completed foundation

### Release 7 — mobile and document stabilization

- Rebuilt the fillable patient form on a fixed layout grid.
- Standardized field borders, fills, heights, and label spacing.
- Stabilized mobile contrast, logo treatment, the PHI warning, photo caption, and quick actions.
- Added concrete provider pricing research and the first production roadmap.

### Release 8 — corrected form and optional free-service scaffolding

- Corrected the remaining responsible-party form geometry.
- Added optional Cloudflare Web Analytics, Basin, and Turnstile integration points.
- Kept preview-only behavior as the safe default.

### Release 9 — mobile logo hardening

- Added the rounded white card directly to the SVG.
- Hardened the logo against forced-dark rendering.
- Rebuilt the modern mobile footer into a readable single-column layout.

### Release 10 — new-patient journey and duplicate-card cleanup

- Removed the extra wrapper card around the rounded SVG.
- Added the dedicated New Patients page.
- Added first-visit preparation, forms, insurance/payment cautions, and urgent-contact guidance.

## Release 11 — launch metadata and safety gates

- Use one shared metadata component across both concepts.
- Add canonical, Open Graph, Twitter, manifest, and Dentist/WebPage structured-data support.
- Keep the entire demo explicitly `noindex` while sample content remains.
- Add a structured content-verification register.
- Fail the build if preview mode is disabled while fictional, unverified, or unconfigured launch blockers remain.
- Add automated tests for metadata, structured data, the web manifest, and the launch gate.

## Release 12 — verified practice content

**This is the next release after Release 11.**

- Replace the sample associate dentist with the actual provider name, credentials, biography, and photograph.
- Replace or remove sample front-desk, hygiene, and assisting identities.
- Confirm the practice history and Lowcountry narrative.
- Confirm every listed service and the preferred patient-friendly wording.
- Confirm insurance, payment, urgent-care, and after-hours language.
- Update the content-verification register as each item is approved.
- Add any additional real office and team photography supplied by the practice.

## Release 13 — low-cost administrative inquiry activation

- Create the approved Basin endpoint or small Cloudflare Worker.
- Configure Cloudflare Turnstile.
- Add server-side validation, rate limiting, honeypot controls, and minimal safe logging.
- Route only non-PHI administrative inquiries to an owner-approved mailbox.
- Document response ownership, retention, deletion, and fallback procedures.
- Keep medical-history submission offline.

## Release 14 — production candidate

- Conduct manual WCAG 2.2 AA review in addition to automated axe checks.
- Test current iOS Safari, Android Chrome, Chrome, Firefox, Edge, and Safari.
- Optimize responsive images and establish Core Web Vitals budgets.
- Complete final metadata, social imagery, structured data, and sitemap review for the selected design.
- Add uptime monitoring, broken-link monitoring, dependency review, and rollback instructions.
- Verify privacy, accessibility, disclaimer, and emergency language.

## Release 15 — domain and operations launch

- Inventory current DNS, MX, SPF, DKIM, DMARC, portal, and scheduling records.
- Select the final classic or modern design path.
- Back up the existing DNS zone and document rollback.
- Attach the real domain without disrupting email or existing services.
- Change preview controls from `noindex` to the approved production policy only after all launch gates pass.
- Perform post-cutover checks for TLS, redirects, forms, analytics, email, sitemap, and search-console ownership.

## Optional later release — secure patient workflow

Choose only after the practice identifies a real operational need and approves a vendor with an appropriate agreement.

- Secure online intake through a healthcare-capable forms platform with a signed BAA.
- Secure communications through an approved calling, texting, or portal platform.
- Real-time scheduling only after practice-management-system compatibility is confirmed.
- Document role-based access, consent, retention, deletion, incident response, and staff ownership.

## Longer-term ideas

- Closure and storm-alert banner editable by office staff.
- Approved patient testimonials and review links with consent tracking.
- Useful service-specific pages for local search, without thin or duplicated content.
- Google Business Profile integration.
- Quarterly accessibility, link, content-freshness, privacy, and security reviews.
