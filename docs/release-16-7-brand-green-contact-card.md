# Release 16.7 — Brand-green accents and contact-card guidance

## Purpose

Release 16.7 responds to the next physical-device review. The featured contact cards were easy to find, but their lime surface was brighter than the green toothbrush mark in the active logo. The contact-card download also needed clearer wording for patients who may not know what to do with a downloaded `.vcf` file.

## Brand-green alignment

- Uses the active logo's exact toothbrush green, `#72a928`, as the modern concept's green accent.
- Replaces visible lime treatments through a final, versioned style layer rather than altering the protected logo asset or rewriting historical release files.
- Applies the brand green to the featured contact cards, value and team markers, deep-section eyebrow accents, placeholder accents, list dots, kicker rules, and related decorative treatments.
- Uses dark navy-green text on filled green surfaces; the selected pairing exceeds WCAG AA contrast for normal text.
- Keeps a slightly lighter brand-green hover state and preserves forced-colors behavior.

## Contact-card language

- Renames the featured action to **Downloadable Contact Card** on Contact and New Patients.
- Explains that the file contains the office phone number and Lady's Island address.
- Adds top-of-page guidance on Contact: after the file downloads, open it once to import the office into the device's contacts.
- Renames the modern footer link to **Download contact card**.
- Preserves the existing static `/donovan-family-dentistry.vcf` file and its patient-data-free content.

## Validation

- Updates the existing vCard and Release 16.6 regression tests for the clarified wording.
- Adds unit coverage tying the active logo and modern accent to the same `#72a928` value.
- Adds browser checks for the Contact and New Patients card colors, the About value markers, the kicker rule, narrow-phone reflow, and serious or critical automated accessibility findings.

## Safety boundary

This release uses no new account, API, script, library, analytics event, or paid service.

It does not change production DNS, TLS, email, indexing, inquiry delivery, scheduling, texting, payments, intake, or PHI handling. Release 17 remains gated on the launch-readiness evidence and office decisions already recorded in the repository.
