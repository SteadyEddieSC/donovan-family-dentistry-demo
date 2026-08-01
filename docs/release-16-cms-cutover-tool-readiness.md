# Release 16 — CMS acceptance, cutover blockers, and tool enablement

## Release purpose

Release 16 prepares the office and administrator to operate the replacement site safely. It does not change the production domain. Actual DNS cutover is Release 17 unless every required acceptance item is completed and separately approved.

## What the existing public site tells us

The legacy website remains useful as a content and migration source even though its TLS certificate was observed expired.

Public observations recorded in Releases 15 and 16 show:

- the apex currently resolves to `107.180.115.120`;
- the authoritative nameservers are GoDaddy `domaincontrol.com` servers;
- the address is within a GoDaddy-owned hosting network, making GoDaddy infrastructure the likely legacy web host;
- the exact GoDaddy product is not provable from public DNS alone;
- Microsoft 365 handles mail routing and Outlook autodiscover;
- the current SPF record references `secureserver.net` and cannot be removed without determining why it is present;
- `mail.donovanfamilydentistry.com` resolves to the current web-host address and must be investigated before any apex change;
- the current website publishes Home, About, Procedures, Patient Forms, and Contact content, including Dr. William Donovan and Dr. Robert Koolkin and the twelve-item procedure list.

The legacy hosting account or invoice is still needed to confirm:

- the precise hosting product and subscription owner;
- renewal and cancellation dates;
- control-panel and backup access;
- whether the site is WordPress, a site builder, or a conventional hosted file tree;
- document root, database ownership, and restore method;
- whether mail, DNS, or other applications depend on the same hosting plan;
- when the old hosting can be safely cancelled after cutover.

## Cutover blocker summary

### Owner and content decisions

1. **Current dentist roster** — confirm whether Dr. Robert Koolkin remains with the practice and approve a current profile or explicit omission.
2. **Services** — confirm that all twelve currently published procedures remain offered and approve patient-friendly wording.
3. **Insurance and payment** — approve what can be said about plans, estimates, financing, cards, payment timing, and financial policy.
4. **Urgent and after-hours care** — approve the phone instructions, emergency limitations, escalation wording, and after-hours path.
5. **Administrative inquiry mode** — choose preview-only launch or live non-PHI delivery.

### Human validation

6. **Physical devices** — complete iPhone, iPad, Android, macOS, and Windows checks using current browsers.
7. **Human accessibility and PDF review** — complete the WCAG checklist and verify both blank patient PDFs in approved desktop and mobile applications.
8. **CMS acceptance** — complete a real Pages CMS save, workflow, Cloudflare deployment, and recovery exercise.

### Infrastructure and operations

9. **Authoritative DNS export** — capture every record, TTL, and proxy state from the actual DNS account.
10. **Mail preservation** — preserve MX, SPF, all DKIM selectors, DMARC, autodiscover, verification records, and any mail-related subdomains.
11. **Application preservation** — identify portal, scheduling, payment, review, remote-access, and vendor records that may not appear in simple public queries.
12. **Legacy hosting details** — identify the exact GoDaddy hosting product, owner, renewal, backups, and cancellation plan.
13. **Rollback rehearsal** — record the current web targets and TTLs, identify the last green Cloudflare deployment, and rehearse restoration.
14. **Change window** — name the DNS operator, website operator, office verifier, and rollback decision-maker and choose a monitored window.

## Self-edit CMS readiness

### Repository-side status: ready

The repository contains:

- a complete `.pages.yml` editor definition;
- four office-facing editing groups;
- image and blank-PDF media libraries;
- protected visibility and approval fields;
- a one-click **Build and verify website** action;
- validation that rejects missing contact data, invalid service groups, duplicate order values, visible sample providers, unsafe inquiry settings, launch-control removal, broken PDFs, layout failures, performance regressions, and serious accessibility failures;
- Git history and Cloudflare deployment rollback paths.

### Operational status: pending owner acceptance

The hosted editor is:

https://app.pagescms.org/

Pages CMS is configured in the repository, but the following still need human proof:

- the Pages CMS GitHub App is installed or authorized for the private repository;
- the intended office editor can open the repository and `main` branch;
- the editor screens render correctly;
- a harmless save creates the expected GitHub commit;
- **Build and verify website** starts the correct workflow;
- Cloudflare rebuilds the same commit;
- the office can restore the prior wording.

The acceptance process is documented in `docs/office-cms-quickstart.md`.

## Tool enablement plan

### Ready for owner setup now

#### Pages CMS

- **Purpose:** routine content, image, provider, service, and blank-PDF updates.
- **Current cost:** free hosted service.
- **Technical status:** configured.
- **Remaining work:** GitHub App authorization and the acceptance exercise.
- **PHI rule:** never upload completed forms or patient information.

#### Cloudflare Pages

- **Purpose:** static website hosting, previews, deployments, and future custom-domain TLS.
- **Current cost:** free at the present site scale.
- **Technical status:** working for previews and `main` deployments.
- **Remaining work:** complete cutover evidence and attach the real domain during Release 17.

#### Cloudflare Turnstile

- **Purpose:** bot protection for the limited public administrative form.
- **Current cost:** free plan is suitable for normal small-business use.
- **Technical status:** code path is ready but keys are not configured.
- **Remaining work:** create an office-controlled widget, restrict hostnames, store keys only in Cloudflare, and test verification.

#### Cloudflare Web Analytics

- **Purpose:** privacy-first page-view and performance analytics.
- **Current cost:** free.
- **Technical status:** optional integration point exists and remains disabled.
- **Remaining work:** owner approval, office-controlled site setup, privacy-language update, and validation that no form content or patient information is collected.

### Ready only after an operating decision

#### Basin administrative inquiry delivery

- **Purpose:** deliver general call-back or administrative requests from the protected same-origin function.
- **Current cost:** free plan can support limited testing; the current paid entry tier is approximately $12.50 per month when billed yearly.
- **Technical status:** handler, validation, Turnstile verification, PHI warnings, error states, and fail-closed controls are implemented.
- **Remaining work:** office-owned endpoint and mailbox, retention/deletion decision, response and backup owners, rate limit, and live delivery/failure tests.
- **PHI rule:** this path is not approved for medical or dental history, symptoms, diagnoses, images, insurance identifiers, or other PHI.

#### Google Search Console

- **Purpose:** domain ownership, sitemap submission, indexing diagnostics, and search visibility.
- **Current cost:** free.
- **Technical status:** sitemap, metadata, canonical support, and robots controls exist.
- **Remaining work:** real-domain cutover, owner verification, explicit indexing approval, and production sitemap submission.

### Requires vendor selection and healthcare workflow approval

#### Secure online intake

The current downloadable PDF workflow is intentionally local and does not submit patient information through this repository.

Potential directions include:

- a HIPAA-enabled Jotform account, currently advertised on Gold at about $99 per month billed annually;
- NexHealth Forms or another dental-platform forms product with practice-management integration;
- the practice's existing patient portal or practice-management vendor if it already provides secure intake.

Before adding secure intake, the practice must select the system of record, execute an appropriate BAA, define access roles, consent, retention, deletion, incident response, support, downtime, and staff ownership, and complete a controlled test.

#### Scheduling, messaging, payments, and reviews

NexHealth can combine scheduling, forms, communications, payments, verification, and reviews and advertises EHR integration and HIPAA-oriented security, but pricing is quote-based. The practice's current dental software may provide some or all of the same functions.

Before selecting a platform:

- identify the current practice-management system;
- list existing texting, reminders, payments, forms, reviews, and portal services;
- avoid paying twice for overlapping functions;
- verify real-time read/write support for the exact dental system;
- define reconciliation and downtime procedures;
- obtain required agreements and complete a sandbox or controlled pilot.

## Recommended launch sequence

1. Complete Pages CMS owner acceptance.
2. Confirm provider, service, insurance/payment, urgent-care, and inquiry decisions.
3. Complete physical-device and human accessibility/PDF review.
4. Obtain the authoritative DNS export and exact legacy-hosting account details.
5. Preserve mail and application records and rehearse rollback.
6. Choose whether Turnstile, Basin, and Cloudflare Web Analytics are enabled at launch or deferred.
7. Perform the website-only DNS cutover in Release 17.
8. Verify TLS, redirects, canonical URLs, indexing policy, PDFs, forms, email, and application subdomains.
9. Keep the legacy GoDaddy hosting active through the monitoring and rollback period.
10. Evaluate secure intake and dental-platform tools separately after the website launch is stable.

## Release boundary

Release 16 does not:

- modify production DNS or nameservers;
- cancel legacy hosting;
- alter Microsoft 365 or mail records;
- enable indexing, analytics, Turnstile, Basin delivery, secure intake, scheduling, messaging, or payments;
- store credentials or patient information;
- represent the CMS as accepted before the owner exercise is recorded.
