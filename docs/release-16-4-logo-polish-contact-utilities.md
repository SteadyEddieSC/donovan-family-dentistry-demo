# Release 16.4 — Logo polish and contact utilities

## Owner-reported defects

A physical-device screenshot showed two problems that automated light/dark preference checks did not fully capture:

1. The modern header logo's outer corners were visibly clipped.
2. The modern footer logo sat inside an oversized dark rounded rectangle that was not part of the approved artwork.

Both came from keeping a second CSS-rendered card around an SVG that already contains its own white rounded card.

## Logo correction

- The SVG remains the only visible logo surface.
- The modern header and footer wrappers are transparent, square, and unclipped.
- The image element is also transparent and unfiltered.
- `overflow: visible` prevents the SVG border and corners from being cut off.
- The SVG retains its own light color-scheme and forced-color protections, so the approved navy, blue, green, and white artwork remains authoritative.
- The release adds regression coverage for transparent wrappers, zero wrapper radius, visible overflow, no image filter, and matching wrapper/image geometry.

## Safe utility improvements

### Downloadable office contact card

A static vCard is available at `/donovan-family-dentistry.vcf` and contains only already-published office information:

- Donovan Family Dentistry
- public office phone number
- public street address
- published Monday-through-Thursday hours note

Links are available from both contact concepts and the modern footer. The file has no external service, account, tracking, recurring fee, PHI, or patient-data dependency.

### Modern recovery page

The site-wide 404 page now follows the selected modern visual direction and gives visitors reliable recovery actions:

- return to the modern homepage;
- call the office;
- open directions;
- open patient forms.

## What can continue before doctor review

The project can continue with engineering, accessibility, resilience, CMS, testing, migration evidence, and low-risk utilities. User-facing expansion should remain selective because provider, service, insurance/payment, urgent-care, after-hours, scheduling, texting, intake, and other operational claims still require authoritative practice decisions.

## Safety boundary

This release does not change production DNS, registrar settings, nameservers, GoDaddy hosting, Microsoft 365 mail, indexing, analytics, live inquiry delivery, scheduling, payments, texting, secure intake, patient records, or any PHI-capable workflow.
