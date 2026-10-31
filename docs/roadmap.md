# Donovan Family Dentistry Website Roadmap

## Current product direction

The **Classic** concept at `/` is the current public production website and patient-facing digital front door. The **Modern** concept at `/modern/` is retained as a future-design demo; it remains outside the public sitemap/navigation and must remain `noindex` unless a separately approved product decision changes that boundary.

For current production operations, live repository/provider state plus the current README and operating guides outrank historical release-planning language below. Earlier release sections are preserved as provenance for decisions made while the replacement site was still being prepared.

The public production experience prioritizes these patient jobs:

- **Home:** orient visitors and route them to the correct next step.
- **About:** explain the care approach, verified provider background, values, and Lowcountry setting.
- **Services:** serve as the detailed source of truth for published procedures.
- **Patient Forms:** provide reviewed downloads and clear privacy instructions.
- **Contact:** provide directions, hours, phone access, office email, and other approved administrative contact paths.

Modern-only concepts such as a dedicated **Team** or **New Patients** experience may continue as design exploration, but they do not replace the Classic production source of truth unless a future approved release explicitly promotes them.

## Completed foundation

### Releases 7–10 — document, mobile, and patient-journey stabilization

- Rebuilt the fillable patient form on a fixed layout grid and corrected remaining field geometry.
- Standardized form borders, fills, heights, and label spacing.
- Hardened mobile contrast, logo treatment, footer layout, PHI warnings, and quick actions.
- Added the dedicated New Patients page and first-visit guidance.
- Added optional Cloudflare Web Analytics, Basin, and Turnstile integration points while keeping preview-only behavior as the safe default.

### Release 11 — launch metadata and safety gates

- Added shared canonical, Open Graph, Twitter, manifest, sitemap, and structured-data support.
- Kept the entire candidate explicitly `noindex` while launch blockers remain.
- Added a structured content-verification register and a build gate that rejects premature public promotion.

### Release 12 — office editor and safe public content

- Reorganized Pages CMS into plain-language office editing groups.
- Added the one-click **Build and verify website** action.
- Made About, Team, Services, provider, image, PDF, contact, hours, announcement, and homepage content editable without code changes.
- Established one provider source shared by both concepts.
- Removed fictional public identities and invented practice-history claims.
- Added validation for office-managed content and media.

### Release 13 — protected administrative inquiry foundation

- Added a same-origin Cloudflare Pages Function rather than direct browser-to-vendor submission.
- Added fail-closed Basin and Turnstile runtime requirements.
- Added server-side origin, size, field, timing, honeypot, consent, topic, and verification controls.
- Kept the path non-PHI and disabled until office-owned accounts, retention, response ownership, rate limiting, and real delivery testing are approved.

### Release 14 — production-candidate testing and hardening

- Added Chrome, Edge, Firefox, WebKit, Android Chrome emulation, and iOS Safari emulation coverage.
- Added WCAG 2.2 AA-focused automated checks, visible-focus checks, target sizing, reflow, reduced motion, and public accessibility guidance.
- Added deterministic responsive images, social-card generation, performance budgets, npm audit, Dependabot, monitoring, metadata checks, internal-link checks, PDF checks, and rollback guidance.
- Preserved the distinction between automated evidence and pending physical-device and human review.

### Release 15 — launch readiness and migration reconciliation

- Selected the modern concept as the planned production design while retaining both concepts in private preview.
- Reconciled the current public Home, About, Procedures, Patient Forms, and Contact pages against the replacement candidate.
- Elevated the current two-dentist roster discrepancy into a launch blocker.
- Added the twelve-item launch-evidence register and fail-closed production gate.
- Added public-only DNS, TLS, HTTP, mail-record, and common-application inventory tooling.
- Recorded GoDaddy nameservers, a GoDaddy-hosted web address, Microsoft 365 mail routing, Outlook autodiscover, the current SPF record, and the expired legacy certificate observation.
- Added authoritative-zone, mail/application-preservation, change-window, monitoring, and rollback procedures.

See `docs/release-15-launch-readiness.md`.

### Release 16 — CMS acceptance, blocker decomposition, and tool enablement

- Verified every Pages CMS editable file, media path, action workflow, and build dependency.
- Published the exact hosted editor link and first-time, routine, validation, and recovery process.
- Kept CMS status as configured but pending owner acceptance until a real save, website check, Cloudflare rebuild, and restoration exercise could be recorded.
- Recorded what public evidence supports about the legacy host while separating likely GoDaddy infrastructure from the still-unconfirmed exact hosting product.
- Added a structured readiness register for Pages CMS, Cloudflare Pages, Turnstile, Basin, Cloudflare Web Analytics, Search Console, secure patient intake, and dental-platform scheduling/messaging/payments.
- Separated repository readiness from account ownership, owner decisions, healthcare agreements, operating procedures, and real-world testing.
- Kept the public inquiry path non-PHI and healthcare-capable tools unselected until the practice identifies its system of record and approves a vendor and BAA.

See:

- `docs/office-cms-quickstart.md`
- `docs/release-16-cms-cutover-tool-readiness.md`
- `src/data/tool-readiness.json`

### Release 16.1 — first owner test, recovery, branding, and mobile polish

Release 16.1 incorporates the first real Pages CMS owner test while preserving every pre-cutover safety boundary.

- Records that the owner successfully opened Pages CMS, edited `src/data/site.json`, saved commit `db6c9e9b0393f5c88df4ba83e260bd4fac2ce7bd`, and observed the Cloudflare candidate update.
- Restores the harmless temporary test wording.
- Explains that **Save** creates the GitHub commit and triggers the normal main-branch checks and Cloudflare deployment.
- Explains that **Build and verify website** validates the already-saved branch and does not separately save or deploy content.
- Adds a guarded **Restore latest office save** workflow for the newest safe `office update:` commit on `main`.
- Adds exact phone and desktop recovery instructions to the README and owner guides.
- Removes the redundant fixed quick-action dock from the modern homepage and keeps safe-area clearance on interior pages.
- Corrects the narrow-screen Services heading so `Comprehensive` does not break mid-word.
- Adds the first sign-informed logo treatment pending owner visual review.

See `docs/release-16-1-owner-polish.md`.

### Release 16.2 — canonical sign logo and office content backup

Release 16.2 responds to the owner review of the first logo treatment and adds a read-only safety export.

- Rebuilds the supplied oval sign direction as a true self-protected SVG rather than committing the checkerboard-backed raster reference.
- Uses the oval sign vector in the modern header and footer while leaving the archived classic comparison concept unchanged.
- Removes the second rectangular backing card and uses the oval's off-white field, blue border, and subtle drop shadow for contrast on light, dark, gradient, and photographic backgrounds.
- Adds mobile and dark-preference browser coverage for logo visibility, dimensions, background treatment, and vector integrity.
- Adds the manual **Create office content backup** action.
- Keeps the backup read-only, fixed to public CMS-managed content, checksum-protected, and retained as a downloadable GitHub artifact for 30 days.
- Documents that the backup does not deploy or roll back the site and must never include completed forms, messages, credentials, patient records, or protected health information.

See:

- `docs/release-16-2-logo-backup.md`
- `docs/office-content-backup.md`

### Release 16.3 — shared logo and device dark-mode correction

Release 16.3 adopts the owner-preferred second image direction instead of iterating on the oval sign interpretation.

- Uses the same horizontal `site.logo` asset in both the classic and modern concepts.
- Preserves the Release 16.2 oval vector as a prior visual-development asset, but removes it from the active modern header and footer.
- Matches the horizontal logo's intrinsic 510 × 138 geometry in the modern layout.
- Gives the modern wrapper and image an explicit white rendering surface with no CSS filter or blend mode.
- Adds light-color-scheme and forced-color-adjust safeguards to both the page CSS and the SVG itself.
- Reduces the mobile header height to fit the wider logo cleanly.
- Expands unit and browser coverage for shared asset use, approved color values, dark-preference rendering, mobile geometry, and the absence of color-altering filters.

See `docs/release-16-3-shared-logo-dark-mode.md`.

### Release 16.4 — logo polish and contact utilities

Release 16.4 responds to the first physical-device screenshot of the shared horizontal logo and adds small, verified utilities that do not depend on new practice decisions.

- Removes the modern CSS card surrounding the self-contained SVG so the header corners are no longer clipped.
- Makes the modern header and footer wrappers transparent, square, and unclipped so no oversized dark box appears behind the footer logo.
- Preserves the SVG's internal light-scheme and forced-color protections rather than relying on an external white wrapper.
- Adds geometry and dark-preference regression coverage for the owner-reported device behavior.
- Adds a static downloadable office vCard using only the published phone number, address, and hours note.
- Exposes **Save office contact** from both contact concepts and the modern footer.
- Rebuilds the site-wide 404 page in the selected modern visual direction with reliable home, call, directions, and patient-form recovery actions.
- Keeps further user-facing expansion selective while provider, service, insurance/payment, urgent-care, after-hours, scheduling, texting, intake, and related operational decisions remain unverified.

See `docs/release-16-4-logo-polish-contact-utilities.md`.

### Release 16.5 — private launch review center

Release 16.5 turns the remaining physical-device review into a repeatable, evidence-producing process without adding a backend or collecting patient data.

- Adds a private `/review/` page that detects the local viewport, screen, pixel ratio, touch points, browser user agent, color preference, forced colors, contrast preference, and reduced-motion preference.
- Provides a fixed checklist for logo behavior, navigation, readability, patient actions, PDFs, zoom/reflow, device dark mode, and assistive input.
- Generates the report only in the browser and supports user-controlled copy, JSON download, and print.
- Uses no API, account, database, cookie, local storage, session storage, email, analytics event, or paid service.
- Permanently marks the review route `noindex`, omits it from the sitemap and primary navigation, and exposes it from the modern footer only during preview mode.
- Adds the iPhone, iPad, Android, Windows, and macOS review matrix, evidence-handling rules, and the separate human WCAG/PDF review boundary.
- Registers the review helper in the launch-readiness record without marking physical-device or human-accessibility evidence complete.

See:

- `docs/release-16-5-private-review-center.md`
- `docs/physical-device-review-guide.md`

### Release 17 — governed production-domain cutover (completed 2026-08-13)

The governed production-domain cutover was completed on **August 13, 2026** under the separately recorded owner authorization. The authoritative repository evidence is `docs/evidence/production-cutover-2026-08-13.md`.

Recorded accepted outcomes include:

- authoritative DNS delegation moved to Cloudflare after the accepted zone was reconciled;
- `donovanfamilydentistry.com` and `www.donovanfamilydentistry.com` became active Cloudflare Pages custom domains with SSL;
- the apex is the canonical production host and `www` uses a path/query-preserving redirect;
- only the web path changed while accepted non-web/mail records were preserved;
- Classic became the public production experience;
- Modern and private-review surfaces retained their noindex/non-public boundaries;
- the legacy GoDaddy hosting path was retained as the bounded rollback target during the launch window;
- production validation covered routes, PDFs, redirects, TLS/security headers, metadata, desktop navigation, and mobile layout;
- remaining physical-device and broader human accessibility evidence was explicitly recorded as approved-deferred rather than falsely claimed complete.

These are **historical cutover outcomes, not instructions to repeat the migration**. Do not re-delegate nameservers, reattach the production domain, change canonical/indexing policy, alter mail/non-web DNS, or retire the rollback path merely because older release documents contain launch steps. Any new provider/DNS change requires fresh live-state verification and the applicable current authorization.

Current follow-up is routine production maintenance and eventual customer ownership handoff preparation. Issue #65 remains the separate activation gate for moving GitHub/Cloudflare operational ownership to Donovan-controlled identities; it does not reopen or repeat the 2026-08-13 website launch.

## Optional later release — secure patient workflow

Choose only after the practice identifies a real operational need and approves a healthcare-capable vendor.

- Secure online intake through a vendor with an appropriate BAA.
- Secure communications through an approved calling, texting, or portal platform.
- Real-time scheduling only after practice-management-system compatibility is confirmed.
- Payments, insurance verification, recalls, reviews, and messaging only when they do not duplicate existing systems.
- Document role-based access, consent, retention, deletion, incident response, downtime, reconciliation, support, and staff ownership.

## Longer-term ideas

- Closure and storm-alert banner editable by office staff.
- Approved patient testimonials and review links with consent tracking.
- Useful service-specific pages for local search without thin or duplicated content.
- Google Business Profile integration.
- Quarterly accessibility, link, content-freshness, privacy, security, CMS recovery, backup, and account-ownership reviews.
