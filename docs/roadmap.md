# Donovan Family Dentistry Website Roadmap

## Product direction

The modern concept is the patient-facing digital front door. Each page has one primary responsibility:

- **Home:** orient visitors and route them to the correct next step.
- **About:** explain the care approach, verified provider background, values, and Lowcountry setting.
- **Services:** serve as the detailed source of truth for published procedures.
- **Team:** contain dentist biographies and staff or role-based team profiles.
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

### Release 11 — launch metadata and safety gates

- Added one shared metadata component across both concepts.
- Added canonical, Open Graph, Twitter, manifest, and Dentist/WebPage structured-data support.
- Kept the entire demo explicitly `noindex` while unverified launch blockers remain.
- Added a structured content-verification register.
- Added a build gate that rejects premature public promotion.

### Release 12 — office editor and safe public content

- Reorganized Pages CMS into plain-language office editing groups.
- Added a one-click **Build and verify website** action.
- Added content validation before every local or Cloudflare build.
- Made About, Team, and Services wording editable without code changes.
- Established one provider source shared by the classic and modern concepts.
- Removed fictional public identities and replaced them with safe role-based team descriptions.
- Kept a hidden associate-dentist template for future approved information.
- Removed invented practice-history claims from the public About page.
- Connected modern service groups to the shared service list.
- Enforced a system-font policy and verified that clean browser sessions make no Google Fonts requests.
- Reduced the launch-blocker register to service approval, policy wording, urgent-care wording, and production integrations.

Practice-approved provider, staff, history, service, image, and policy updates can now be entered through the office editor whenever that information becomes available; they do not require a separate code release unless layout changes are needed.

## Release 13 — low-cost administrative inquiry activation

**This is the next release after Release 12.**

- Select either Basin or a small Cloudflare Worker for non-PHI administrative requests.
- Configure Cloudflare Turnstile and a honeypot.
- Add server-side validation, rate limiting, and minimal safe logging.
- Route requests only to an office-approved mailbox.
- Display clear success, failure, and call-the-office fallback states.
- Document response ownership, expected response time, retention, deletion, and failed-delivery handling.
- Keep medical-history submission and protected health information completely outside the public form.
- Add service-health checks without exposing message contents.

## Release 14 — production candidate

- Conduct manual WCAG 2.2 AA review in addition to automated axe checks.
- Test current iOS Safari, Android Chrome, Chrome, Firefox, Edge, and Safari.
- Optimize responsive images and establish Core Web Vitals budgets.
- Complete final metadata, social imagery, structured data, and sitemap review for the selected design.
- Add uptime monitoring, broken-link monitoring, dependency review, and rollback instructions.
- Verify privacy, accessibility, disclaimer, insurance, payment, and emergency language.
- Confirm all launch-blocker records are verified or removed from the public site.

## Release 15 — domain and operations launch

- Inventory current DNS, MX, SPF, DKIM, DMARC, portal, and scheduling records.
- Select the final classic or modern design path.
- Back up the existing DNS zone and document rollback.
- Attach the real domain without disrupting email or existing services.
- Change preview controls from `noindex` to the approved production policy only after all launch gates pass.
- Perform post-cutover checks for TLS, redirects, forms, analytics, email, sitemap, and search-console ownership.
- Train the office on routine updates, the one-click website check, hiding outdated content, and restoring prior versions.

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
