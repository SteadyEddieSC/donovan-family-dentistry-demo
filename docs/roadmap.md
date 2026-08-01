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
- Established one provider source shared by both concepts.
- Removed fictional public identities and replaced them with safe role-based team descriptions.
- Kept a hidden associate-dentist template for future approved information.
- Removed invented practice-history claims from the public About page.
- Connected modern service groups to the shared service list.
- Enforced a system-font policy and verified that clean browser sessions make no Google Fonts requests.
- Reduced the launch-blocker register to service approval, policy wording, urgent-care wording, and production integrations.

Practice-approved provider, staff, history, service, image, and policy updates can now be entered through the office editor whenever that information becomes available; they do not require a separate code release unless layout changes are needed.

### Release 13 — protected administrative inquiry foundation

- Replaced direct browser-to-Basin submission with a same-origin Cloudflare Pages Function.
- Kept the public page in local preview mode unless an administrator explicitly enables the live build and supplies a public Turnstile site key.
- Added fail-closed runtime checks for the Basin endpoint and Turnstile secret.
- Added server-side origin, method, content-type, size, field, length, timing, topic, reply-method, consent, honeypot, and Turnstile validation.
- Rebuilt the upstream payload from an allowlist so arbitrary fields, files, tokens, IP addresses, browser details, and internal controls are not forwarded.
- Added optional edge-rate-limiter binding support and a documented Cloudflare zone-level rate-limiting rule.
- Added clear success, validation, verification, rate-limit, delivery-failure, and call-the-office fallback states.
- Restricted Functions invocation to `/api/*` so normal static requests remain static.
- Added serverless unit tests to both CI and the office's one-click website check.
- Documented Basin, Turnstile, allowed origins, notification recipient, retention, deletion, response ownership, delivery testing, failure handling, and rollback.

The code portion of Release 13 is complete. Actual message delivery remains intentionally disabled until the office-owned Basin account, notification mailbox, retention decision, response owner, Turnstile keys, allowed origins, rate limit, and real delivery test are completed. That operational activation remains a launch blocker rather than a code defect.

### Release 14 — production-candidate testing and launch hardening

- Added automated branded Chrome and Edge, Firefox, WebKit, Android Chrome emulation, and iOS Safari emulation coverage for the core patient journey.
- Added WCAG 2.2 AA-focused axe checks, visible-focus checks, target-size checks, keyboard-focus visibility, 320-pixel reflow, reduced-motion behavior, and public accessibility guidance.
- Added a human WCAG review checklist and explicitly separated automated emulation from pending physical-device verification.
- Added deterministic responsive WebP derivatives for approved photography, explicit image dimensions, responsive selection hints, and a 1200 by 630 social card that preserves the office sign.
- Added static HTML, CSS, JavaScript, image, and total-site performance budgets plus local layout-shift, loading-time, and resource-count guardrails.
- Completed production-candidate canonical, Open Graph, Twitter, structured-image, manifest, sitemap, robots, and noindex regression coverage.
- Added public Accessibility and Website Use & Privacy pages without representing unapproved service, insurance, payment, or emergency policies as finalized.
- Added a committed npm lockfile, deterministic installs, npm audit, weekly Dependabot, daily deployed-site checks, internal-link checks, PDF checks, performance checks, and rollback instructions.
- Expanded the office's one-click website check to include the production-candidate gates.
- Preserved the four practice-owned launch blockers and kept live inquiry delivery, indexing, DNS, and domain changes disabled.

The Release 14 code and automated production-candidate controls are complete. The physical-device matrix, human WCAG review, service approval, insurance/payment approval, urgent-care workflow approval, and office-owned inquiry configuration remain required launch evidence rather than items silently marked complete.

## Release 15 — domain and operations launch

**This is the next governed release after Release 14, but it cannot begin cutover until the remaining launch evidence is complete.**

- Complete and record the physical-device/browser matrix and human WCAG checklist.
- Obtain practice approval for the service list, insurance/payment wording, and urgent/after-hours workflow.
- Configure and test the office-owned inquiry recipient, Basin account, Turnstile keys, allowed origins, rate limiting, retention, response ownership, and backup handling—or keep the form preview-only for launch.
- Inventory current DNS, MX, SPF, DKIM, DMARC, portal, and scheduling records.
- Select the final classic or modern design path.
- Back up the existing DNS zone and document rollback.
- Attach the real domain without disrupting email or existing services.
- Change preview controls from `noindex` to the approved production policy only after all launch gates pass.
- Perform post-cutover checks for TLS, redirects, forms, analytics, email, sitemap, and search-console ownership.
- Train the office on routine updates, the one-click website check, hiding outdated content, monitoring results, and restoring prior versions.

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
