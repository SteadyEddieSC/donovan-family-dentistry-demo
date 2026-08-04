# Release 16.11 — Dr. Henke profile and provider-roster update

## Purpose

Release 16.11 implements the practice-supplied provider update received from Dr. William Donovan on August 4, 2026.

The request supplied a Dr. Jordan Henke biography and Henke family photograph, requested the caption **Henke Family**, requested removal of the outdated Koolkin reference, and asked that the supplied photograph replace the previous Donovan family photograph with an appropriate crop.

## Public changes

### Classic concept

- `/about/` now publishes Dr. William Donovan and Dr. Jordan Henke from the shared provider data.
- Dr. Donovan remains represented without the retired family photograph.
- Dr. Henke's full supplied biography is published with the approved family image and caption.

### Modern concept

- `/modern/team/` now publishes both dentists.
- Dr. Henke's concise modern biography, professional highlights, family image, and **Henke Family** caption are included.
- The former hidden associate-dentist template is replaced by the verified Dr. Henke record.

## Image treatment

- The supplied portrait-oriented family photograph was cropped to a landscape composition suitable for both concepts.
- The crop retains Dr. Henke, his wife Mia, and all four children.
- The source is stored as a 900 × 675 WebP.
- The build generates 480-pixel and 720-pixel responsive derivatives.
- Images remain local to the repository; no image CDN, paid service, or third-party host is used.

## Readiness effect

The historical `provider-roster` launch item remains in the audit register but is now marked **verified**. Evidence is recorded at:

`docs/evidence/provider-roster-henke-2026-08-04.md`

This release does not clear or modify the remaining service, insurance/payment, urgent-care, production-integration, physical-device, accessibility, DNS, mail, rollback, or change-window requirements.

## Validation

Release coverage verifies:

- both approved dentists appear in the Classic and Modern concepts;
- Dr. Henke's supplied biography and photograph are present;
- **Henke Family** appears as the family-photo caption;
- no Koolkin reference appears in current provider data or rendered provider pages;
- 480-, 720-, and 900-pixel image assets resolve;
- mobile layouts do not overflow at the reviewed Galaxy width; and
- the updated pages have no serious or critical automated accessibility findings.

## Safety boundary

This release does not activate Open Dental, Web Forms, Patient Portal, Web Sched, messaging, payments, APIs, analytics, indexing, live inquiry delivery, production DNS, mail changes, or patient-data handling.
