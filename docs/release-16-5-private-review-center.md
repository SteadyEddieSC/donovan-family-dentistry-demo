# Release 16.5 — private launch review center

## Decision

Continue useful pre-cutover work without inventing provider, service, insurance, payment, urgent-care, scheduling, messaging, or patient-system information.

Release 16.5 focuses on one of the remaining launch-evidence gaps: repeatable review on physical phones, tablets, and computers.

## Added

### Local-only review center

A private review page is available at `/review/` while the launch candidate remains in preview.

It:

- detects the current date/time, viewport, screen size, pixel ratio, touch points, language, user agent, color preference, forced-colors state, contrast preference, and reduced-motion preference;
- links to the selected modern pages, patient-form journey, page-not-found recovery, and classic comparison;
- requires the tester to record the physical device/OS, browser/version, concept, overall result, and completion of the fixed review checklist;
- provides a general findings field with an explicit prohibition on patient information;
- generates a plain-text report locally;
- allows user-controlled copy, JSON download, and print;
- clears without retaining the report in local storage, session storage, a cookie, a remote service, or the website backend.

### Permanent discovery protection

The shared metadata component now supports `forceNoIndex` for internal or operational pages. The review center uses it even if the patient website is later promoted to an indexed production phase.

The review route:

- is not part of the primary patient navigation;
- is not included in `sitemap.xml`;
- does not display the fixed mobile patient-action dock;
- is linked from the modern footer only while `site.previewMode` is true.

### Physical review guide

`docs/physical-device-review-guide.md` defines:

- the minimum iPhone, iPad, Android, Windows, and macOS matrix;
- the step-by-step review process;
- pass, pass-with-notes, fail, and blocked result meanings;
- evidence handling and retest rules;
- the boundary between device review and the separate human WCAG/PDF review.

## Privacy and cost boundary

Release 16.5 adds no paid service, account, API, analytics collection, email delivery, form endpoint, database, cookie, local-storage retention, or patient-data workflow.

The report remains on the device until the tester deliberately copies, downloads, or prints it. Testers are instructed not to include protected health information or patient details.

## Launch status

This release provides the collection tool and process. It does not mark `physical-device-review` or `human-wcag-review` as complete.

The production-domain cutover remains blocked by the governed Release 15 and Release 16 requirements, including owner content decisions, CMS acceptance completion, physical-device evidence, human WCAG/PDF review, authoritative DNS and hosting evidence, email/application preservation, rollback rehearsal, and an approved monitored change window.
