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
- Revises the vector logo to better match the owner-supplied wordmarks and physical sign: stronger blue outline and underline, darker navy wording, and darker green toothbrush-inspired bars.

See `docs/release-16-1-owner-polish.md`.

## Release 17 — governed production-domain cutover

Release 17 begins only after every required Release 15 and Release 16.x item is verified or explicitly approved for deferral.

- Export and review the authoritative DNS zone, TTLs, proxy settings, registrar, and account ownership.
- Confirm the exact GoDaddy hosting product, subscription owner, backups, renewal, cancellation timing, and rollback target.
- Confirm MX, SPF, every DKIM selector, DMARC, autodiscover, mail-related records, portal, scheduling, payment, review, remote-access, and other vendor records.
- Decide whether the simplest safe architecture is a limited web-host change or a complete Cloudflare Free authoritative-DNS migration.
- Complete the physical-device/browser matrix and human WCAG/PDF review.
- Complete Pages CMS owner acceptance by recording the full website-check and restoration result.
- Obtain the provider, service, insurance/payment, urgent-care, and administrative-inquiry decisions.
- Prepare the selected modern routing and production canonical host.
- Attach the real domain in Cloudflare Pages without moving unrelated services.
- Change only the minimum approved web or authoritative-DNS records during the change window.
- Verify TLS, redirects, canonical URLs, indexing policy, forms, PDFs, analytics decision, email, application subdomains, sitemap, and search ownership.
- Keep named operators available through the monitoring window.
- Restore the prior web records and deployment immediately when a rollback threshold is met.
- Keep legacy hosting active through the agreed monitoring and rollback period, then cancel it only after the office confirms no dependency remains.

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
- Quarterly accessibility, link, content-freshness, privacy, security, CMS recovery, and account-ownership reviews.
