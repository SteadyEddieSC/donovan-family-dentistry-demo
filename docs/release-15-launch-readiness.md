# Release 15 — launch readiness and migration reconciliation

## Purpose

Release 15 prepares a complete, fail-closed launch package for Donovan Family Dentistry without changing the production domain, nameservers, email records, indexing policy, analytics, or administrative-inquiry delivery.

The release deliberately separates **launch readiness** from **production cutover**. The current owner, accessibility, device, DNS, and operating evidence is not complete enough to perform a responsible cutover. Release 16 will perform the real-domain change only after every required evidence item is recorded.

## Selected launch candidate

The **modern concept** is the selected launch candidate.

- It is the patient-facing design described by the product roadmap.
- It contains the dedicated Home, About, Services, Team, New Patients, Patient Forms, Contact, Accessibility, and Website Use & Privacy journeys.
- It has the strongest mobile, accessibility, content-ownership, protected-inquiry, metadata, and performance evidence.
- The classic concept remains available during private preview for comparison, but it is not the planned production design.

Selecting the modern concept does not enable indexing or move it to the production domain. Production routing and canonical-host changes remain part of Release 16.

## Current-public-site reconciliation

Reviewed on 2026-08-01:

| Current source | Current public responsibility | Candidate mapping | Release 15 finding |
| --- | --- | --- | --- |
| `https://donovanfamilydentistry.com/` | Tagline, twelve procedures, forms, contact, directions | `/modern/`, `/modern/services/`, `/modern/forms/`, `/modern/contact/` | Core public journeys are represented with clearer separation and safer form language. |
| `https://donovanfamilydentistry.com/about/` | Dr. William Donovan, Dr. Robert Koolkin, and practice-history text | `/modern/about/`, `/modern/team/` | The candidate includes only the verified Dr. Donovan profile and role-based staff copy. The provider roster is now a launch blocker rather than an optional enhancement. |
| `https://donovanfamilydentistry.com/procedures/` | Twelve-item procedure list | `/modern/services/` | All twelve current procedures are mirrored with minor punctuation and patient-friendly presentation differences; continued availability and wording still require practice approval. |
| `https://donovanfamilydentistry.com/patient-forms/` | New-patient and privacy-practices downloads | `/modern/forms/` | The candidate preserves local PDF downloads and adds clearer privacy and no-online-submission guidance. |
| `https://donovanfamilydentistry.com/contact/` | Telephone number and address | `/modern/contact/` | Verified contact details are preserved; the candidate adds hours, directions, and a fail-closed administrative inquiry preview. |

### Provider-roster decision

The current public About page identifies both Dr. William Donovan and Dr. Robert Koolkin. The replacement candidate currently publishes only Dr. Donovan because that is the only owner-confirmed provider profile and supplied photograph in the repository.

Before launch, the practice must choose one of these evidence-backed paths:

1. Confirm that Dr. Koolkin currently practices with the office, approve current biography wording and a publishable photograph, then add the profile through the office editor; or
2. Confirm that the replacement website should omit the profile.

Release 15 does not infer current employment or republish an old biography merely because it exists on the current website.

### Practice-history decision

The current About page contains succession and practice-history details. The candidate omits that material because the dates and wording were not separately approved. This is not required for a safe launch, but the practice should explicitly choose whether to migrate, revise, or continue omitting it.

## Governed evidence register

`src/data/launch-readiness.json` is the Release 15 source of truth for cutover evidence. It records:

- selected design and target domain;
- production, indexing, inquiry, and analytics decisions;
- owner-approved content evidence;
- physical-device and human accessibility evidence;
- authoritative DNS-zone backup evidence;
- email, portal, scheduling, and application-record preservation;
- rollback rehearsal;
- approved change window and named operators;
- reviewed current-site sources.

A cleared evidence item must include a durable `evidenceRef`. Status text alone cannot clear a launch gate.

## Fail-closed launch gate

`scripts/check-release15-readiness.mjs` runs before development and production builds.

### Readiness phase

The current committed phase is `readiness`. The gate requires:

- the modern concept to remain the selected launch candidate;
- `site.previewMode` to remain enabled;
- production cutover, indexing, and analytics approval to remain false;
- the inquiry workflow to remain preview-only;
- every required evidence ID and current-site source to remain present;
- all five content or operating blockers to remain visible in `content-status.json`.

### Production phase

A future production build fails unless:

- every required evidence item is `verified` or explicitly `approved-deferred` with a non-empty evidence reference;
- preview mode is disabled;
- production cutover and indexing are approved;
- an approved change window and rollback owner are recorded;
- the canonical HTTPS origin matches the target domain;
- a live inquiry launch has fully verified integration evidence.

A preview-only inquiry workflow may be an approved production decision. It must be documented as `approved-deferred` rather than silently treated as configured.

## Public domain inventory

The manual **Domain readiness inventory** GitHub Actions workflow accepts a public domain and collects only:

- A, AAAA, MX, NS, TXT, CAA, and selected CNAME answers;
- public DMARC and common application-host answers;
- TLS protocol, authorization, issuer, validity dates, SAN, cipher, and certificate fingerprint;
- HTTP status and a small allowlist of response headers.

The workflow:

- does not authenticate to the DNS provider;
- does not edit records;
- does not submit the website form;
- does not collect mailbox contents, visitor messages, patient data, cookies, or arbitrary response headers;
- uploads a JSON artifact for comparison with the authoritative zone export.

Run locally with:

```bash
npm run inventory:domain -- --domain donovanfamilydentistry.com --output artifacts/domain-inventory.json
```

Generic DNS queries cannot discover every DKIM selector, proxy mode, vendor contract, hidden application dependency, or administrator-only record. The artifact must be reconciled against a complete export from the authoritative DNS provider.

## Launch evidence still required

### Practice approvals

- [ ] Current dentist roster and provider-publication decision.
- [ ] Twelve-item service list and patient-friendly terminology.
- [ ] Insurance, payment, estimates, financing, and financial-policy wording.
- [ ] Urgent dental, emergency escalation, telephone, and after-hours wording.
- [ ] Preview-only or live administrative-inquiry launch decision.
- [ ] Optional practice-history migration decision.

### Physical-device matrix

Record device, operating system, browser version, tester, date, and result for:

- [ ] Current iPhone Safari.
- [ ] Current iPad Safari.
- [ ] Current Android Chrome.
- [ ] Current macOS Safari.
- [ ] Current Windows Chrome.
- [ ] Current Windows Edge.
- [ ] Current Windows or macOS Firefox.

### Human WCAG 2.2 AA review

Complete the Release 14 human checklist and record evidence for:

- [ ] Logical keyboard order on every launch route.
- [ ] Unobscured, visible focus on all surfaces.
- [ ] 200% and 400% zoom usability.
- [ ] Text-spacing override behavior.
- [ ] Screen-reader form status and validation announcements.
- [ ] Heading, landmark, label, and link clarity.
- [ ] Color and contrast in normal, hover, focus, disabled, and error states.
- [ ] Coarse-input target spacing and orientation changes.
- [ ] Reduced-motion behavior.
- [ ] Patient PDF opening, completion, saving, and printing in supported applications.
- [ ] Easy access to accessibility, privacy, disclaimer, and telephone fallback information.

### Infrastructure evidence

- [ ] Authoritative DNS-zone export with TTL and proxy state.
- [ ] Current A, AAAA, CNAME, NS, CAA, and verification records.
- [ ] MX, SPF, every DKIM selector, DMARC, autodiscover, and mail-service records.
- [ ] Portal, scheduling, payment, review, analytics, and other vendor subdomains.
- [ ] Current registrar, authoritative DNS provider, website host, and account owners.
- [ ] Last green Pages deployment and production-candidate monitor result.
- [ ] Prior web targets and tested rollback procedure.
- [ ] Approved change window and named DNS, website, office-verification, and rollback operators.

## Planned Release 16 cutover sequence

Release 16 may begin only after the evidence register is clear.

1. Lower only the web-record TTLs during the approved preparation window; do not change mail or application records.
2. Export the authoritative zone again after any TTL change.
3. Verify the final Pages deployment, selected modern routing, canonical host, robots policy, sitemap, PDFs, telephone links, and chosen inquiry mode.
4. Attach the target domain in Cloudflare Pages and complete ownership verification without moving nameservers unless separately approved.
5. Change only the minimum apex and `www` web records required by the selected Cloudflare configuration.
6. Verify TLS, apex/`www` redirects, canonical URLs, metadata, sitemap, indexing policy, internal links, forms, PDFs, and accessibility pages.
7. Verify existing email delivery and application subdomains with the responsible owners.
8. Keep the launch window staffed until monitoring and office verification pass.
9. Restore prior web records immediately if the rollback threshold is met.

## Rollback threshold

Rollback the web change when any of these conditions persists beyond the agreed observation window:

- apex or `www` fails DNS or TLS resolution;
- redirect loops or incorrect canonical hosts occur;
- the selected modern routes are unavailable;
- patient forms or telephone paths fail;
- mail or an application subdomain is affected;
- indexing is enabled contrary to the approved launch decision;
- live inquiry behavior differs from the approved mode;
- the office cannot verify the primary patient journey.

Rollback changes only the website records and Cloudflare deployment. Preserve all mail, portal, scheduling, payment, and unrelated records.

## Release 15 promotion boundary

Release 15 may merge when its code, tests, documentation, and branch deployment are green. Merging Release 15 does **not** authorize DNS changes, indexing, live inquiry delivery, analytics, or public-domain cutover.
