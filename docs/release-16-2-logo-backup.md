# Release 16.2 — Canonical Sign Logo and Office Content Backup

## Purpose

Release 16.2 responds to the owner review of the Release 16.1 logo and adds another practical office-safety action without changing any production-domain, mail, indexing, inquiry-delivery, or patient-system setting.

## Canonical modern logo

The owner supplied a cleaner oval sign reference after reviewing the first sign-informed wordmark. The uploaded reference included a visible checkerboard-style raster background, so it was not committed directly as a transparent production asset.

Release 16.2 rebuilds the approved visual direction as a true SVG:

- self-protected oval shape with an off-white field;
- blue outer border and underline;
- dark navy practice name;
- green toothbrush-inspired bars;
- no embedded raster image;
- no checkerboard background; and
- no second rectangular white card around the artwork.

The modern header and footer now use `/images/donovan-sign-logo.svg`. The existing classic concept retains its prior horizontal logo asset so this release does not unexpectedly restyle the archived comparison concept.

The oval itself provides contrast on light, dark, gradient, and photographic backgrounds. A subtle CSS drop shadow adds separation without placing the logo inside another rectangular badge.

## Office content backup action

Release 16.2 adds the manual **Create office content backup** workflow.

The workflow:

- runs only when manually dispatched on `main`;
- uses read-only repository permission;
- collects the Pages CMS configuration and current public CMS-managed data, images, and blank forms;
- writes a manifest with the exact source commit;
- writes SHA-256 checksums;
- uploads a compressed GitHub artifact; and
- retains the artifact for 30 days.

The workflow does not modify the repository, deploy the website, or roll back content. It does not collect completed forms, inquiry messages, credentials, secrets, email, patient records, or protected health information.

See `docs/office-content-backup.md` for phone, desktop, download, verification, and administrator-assisted restoration instructions.

## Validation

Release 16.2 adds checks that confirm:

- the modern layout uses the new SVG in both header and footer;
- the asset is a true vector and contains no embedded raster or checkerboard content;
- the old rectangular backing-card styles are overridden;
- the logo remains loaded and visible at the tested mobile size and dark color preference;
- the backup action is manual, read-only, fixed-scope, checksum-protected, and unable to push changes; and
- the README, backup guide, release notes, and roadmap describe the workflow and its restoration boundary.

## Unchanged launch boundaries

Release 16.2 does not:

- connect the production domain;
- modify GoDaddy, Cloudflare DNS, nameservers, or Microsoft 365 records;
- enable indexing or analytics;
- activate live administrative-inquiry delivery;
- select secure intake, scheduling, messaging, payment, or other PHI-capable systems; or
- resolve the pending provider, service, insurance/payment, urgent-care, and after-hours decisions.

Release 17 remains the separately governed production-domain cutover after the remaining evidence and owner decisions are complete.
