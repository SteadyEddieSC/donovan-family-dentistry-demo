# Release 16.8 — Open Dental readiness and office updates

## Purpose

Release 16.8 responds to two new pieces of owner evidence:

1. Donovan Family Dentistry uses Open Dental as its practice-management and patient-record system.
2. A physical Galaxy S24 FE review completed the required page, action, PDF, reflow, dark-mode, and focus checks with a pass-with-notes result.

The release avoids adding Weave, NexHealth, Jotform, or another overlapping platform before the office inventories the patient tools already available through Open Dental.

## Site-wide office announcement

- Finishes the existing Pages CMS announcement control by rendering it after the header on both the classic and modern concepts.
- Keeps the announcement disabled by default, so no unverified closure, schedule, or operational statement is published.
- Uses the logo-aligned green family, responsive wrapping, and forced-colors support.
- Removes the former classic-home-only announcement output so one message cannot appear twice.
- Requires no account, API, script, database, analytics event, or paid service.

## Open Dental readiness

- Records Open Dental as the confirmed practice system in the tool-readiness register.
- Replaces the generic secure-intake candidate with Open Dental Web Forms while keeping activation unverified and blocked.
- Replaces the generic scheduling/messaging candidate with Open Dental eServices and Patient Portal while keeping specific service decisions open.
- Adds a private, noindex `/review/open-dental/` checklist covering Web Forms, Patient Portal, eReminders, Web Sched, eConnector, testing, workflow ownership, direct-link rules, and API safety.
- Keeps all patient-system links absent from public patient navigation until the office supplies and tests its exact URLs.
- Prohibits credentials, registration keys, API keys, completed forms, and patient information in GitHub or Pages CMS.
- Preserves the rule that any future custom two-way integration must use the Open Dental API rather than direct database writes.

Official setup references:

- https://www.opendental.com/site/webforms.html
- https://www.opendental.com/site/patientportal.html
- https://www.opendental.com/site/websched.html
- https://www.opendental.com/manual/eservicessetup.html
- https://www.opendental.com/manual/fhir.html
- https://www.opendental.com/site/fees.html

## Physical-device evidence

- Preserves the uploaded report without changing the tester's wording.
- Records the Android result as `partial-evidence-recorded`, not as completion of the full matrix.
- Keeps iPhone, iPad, macOS, and Windows physical checks open.
- Evidence: `docs/evidence/physical-device-review-galaxy-s24-fe-2026-08-02.json`
- Uploaded-file SHA-256: `52fd6a5cf2eaeca1dc3368c4ccbc655c837048903f222743b78a24839afab39a`

## Safety boundary

This release does not:

- activate Open Dental Web Forms, Patient Portal, Web Sched, texting, payments, or API access;
- publish an unverified external patient link;
- collect, transmit, store, or proxy PHI;
- change production DNS, mail, TLS, indexing, analytics, or inquiry delivery;
- clear the full physical-device matrix or human WCAG/PDF review;
- authorize Release 17 production cutover.
