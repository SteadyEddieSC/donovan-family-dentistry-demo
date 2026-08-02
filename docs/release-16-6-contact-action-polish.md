# Release 16.6 — Contact action polish

## Purpose

Release 16.6 responds to the first physical-device review of the modern contact page. The office vCard worked correctly, but the save-contact action looked like every other card and appeared below call and directions. The release improves recognition and hierarchy without adding a new vendor, account, script library, tracking event, or patient-data workflow.

## Changes

### Save-contact hierarchy

- Moves **Save office contact** to the first position in the modern contact action stack.
- Uses the existing brand lime surface with dark text and a stronger border so the utility is visually distinct from call, directions, and forms.
- Keeps the whole card tappable and preserves the static `/donovan-family-dentistry.vcf` download.
- Adds the same highlighted save-contact utility near the top of the New Patients journey.

### Restrained icon language

- Adds small inline SVG icons for contact, phone, directions, and forms.
- Keeps every visible text label; icons never replace words or become the only accessible name.
- Marks decorative icons `aria-hidden` and non-focusable.
- Uses no external icon font, JavaScript package, image request, CDN, account, or paid service.
- Limits icon use to high-value action surfaces rather than decorating every heading or navigation item.

### Mobile and accessibility safeguards

- Preserves minimum touch-friendly card height and narrow-phone reflow.
- Adds forced-colors handling for the featured card and icon containers.
- Adds unit and Playwright coverage for card order, vCard download attributes, visible labels, mobile overflow, computed featured colors, and serious/critical automated accessibility findings.

## Review-page export location

The private device-review exports remain at `/review/`. **Copy report**, **Download JSON**, and **Print report** are intentionally disabled until the reviewer completes the checklist and selects **Generate report**. The exports are local and do not submit or store the report.

## Safety boundary

This release does not:

- change production DNS, TLS, hosting, email, or Microsoft 365 records;
- enable indexing, analytics, or live administrative inquiry delivery;
- add scheduling, texting, payments, secure intake, patient records, or PHI handling;
- clear the physical-device or human accessibility launch-evidence items;
- change provider, service, insurance/payment, urgent-care, or after-hours claims.

Release 17 remains gated on the governed launch-readiness evidence and office decisions already recorded in the repository.
