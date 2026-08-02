# Release 16.3 — Shared logo and device dark-mode correction

## Decision

Use the owner-preferred horizontal Donovan Family Dentistry logo in both the classic and modern concepts.

The horizontal artwork is the same logo already used successfully on the classic concept. The Release 16.2 oval sign interpretation remains in the repository as a prior visual-development asset, but it is no longer the active modern header or footer logo.

## Why this release exists

Owner review found that the oval treatment did not look right and that the second supplied image looked better on the non-modern page. The modern implementation also used a transparent wrapper and a drop-shadow treatment, which left more opportunity for device-level forced-dark processing to alter the apparent colors or background.

Release 16.3 removes that inconsistency rather than drawing another logo variant.

## Implementation

- The modern layout now reads the same `site.logo` value used by the classic concept.
- Header and footer image dimensions match the horizontal SVG's 510 × 138 aspect ratio.
- The modern wrapper and image both expose an explicit white rendering surface.
- The active logo has no CSS filter, blend mode, transparent backing treatment, or second visible card.
- The SVG contains its own white card, approved blue outline and underline, dark navy lettering, and green toothbrush-inspired bars.
- Both the page CSS and SVG request a light color scheme and opt the artwork out of forced-color adjustment.
- Mobile header sizing is reduced to fit the wider logo without recreating the tall oval-header spacing.

## Validation added

- Shared asset checks for classic and modern headers.
- Dark-preference checks for white wrapper and image backgrounds.
- Assertions that no filter is applied to the active logo.
- SVG integrity checks for the approved color values and embedded dark-mode safeguards.
- Mobile geometry checks for the horizontal logo.
- Existing accessibility, responsive, link, PDF, content, launch-readiness, and production-candidate suites remain required.

## Safety boundary

This release does not change production DNS, nameservers, registrar settings, GoDaddy hosting, Microsoft 365 mail, indexing, analytics, live inquiry delivery, scheduling, payments, patient intake, or any PHI-capable system.

Release 17 remains separately gated on owner content decisions, Pages CMS operational acceptance, physical-device and human accessibility review, authoritative DNS and hosting evidence, mail and application preservation, rollback rehearsal, and an approved monitored change window.
