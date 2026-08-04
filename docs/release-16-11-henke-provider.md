# Release 16.11 — Dr. Henke profile and provider-photography update

## Purpose

Release 16.11 implements the practice-supplied provider update received from Dr. William Donovan on August 4, 2026.

The request supplied a Dr. Jordan Henke biography and Henke family photograph, requested the caption **Henke Family**, requested removal of the outdated Koolkin reference, and identified `IMG_4850` as Dr. Donovan's updated photograph.

## Public changes

### Classic concept

- `/about/` publishes Dr. William Donovan and Dr. Jordan Henke from shared provider data.
- Dr. Donovan is shown with the updated `IMG_4850` photograph.
- Dr. Henke's full supplied biography is published with the approved family image and caption.

### Modern concept

- `/modern/team/` publishes both dentists.
- Dr. Donovan is shown with the same updated photograph used by Classic.
- Dr. Henke's concise modern biography, professional highlights, family image, and **Henke Family** caption are included.
- The former hidden associate-dentist template is replaced by the verified Dr. Henke record.

## Image treatment

- `IMG_4850` was decoded from HEIC using libheif rather than the incomplete first-frame conversion, then cropped to a balanced landscape composition.
- The Henke family photograph was cropped to a landscape composition retaining Dr. Henke, Mia, and all four children.
- Both approved sources are stored as validated 600 × 450 WebP files.
- The build generates 480-pixel responsive derivatives without enlarging the approved source files.
- Images remain local to the repository; no image CDN, paid service, or third-party host is used.

## Readiness effect

The historical `provider-roster` launch item remains in the audit register but is marked **verified**. Evidence is recorded at:

`docs/evidence/provider-roster-henke-2026-08-04.md`

This release does not clear or modify the remaining service, insurance/payment, urgent-care, production-integration, physical-device, accessibility, DNS, mail, rollback, or change-window requirements.

## Validation

Release coverage verifies:

- both approved dentists appear in the Classic and Modern concepts;
- Dr. Donovan's updated photograph and Dr. Henke's supplied biography and family photograph are present;
- **Henke Family** appears as the Henke family-photo caption;
- no Koolkin reference appears in current provider data or rendered provider pages;
- 480- and 600-pixel provider image assets resolve;
- mobile layouts do not overflow at the reviewed Galaxy width; and
- the updated pages have no serious or critical automated accessibility findings.

## Safety boundary

This release does not activate Open Dental, Web Forms, Patient Portal, Web Sched, messaging, payments, APIs, analytics, indexing, live inquiry delivery, production DNS, mail changes, or patient-data handling.
