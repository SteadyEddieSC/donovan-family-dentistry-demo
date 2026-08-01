# Release 11 — Launch metadata and safety gates

## Purpose

Prepare both design concepts for eventual production promotion without allowing the current demo, fictional staff, or unverified policies to be mistaken for an approved public site.

## Shared metadata

Both layouts use `src/components/SiteMetadata.astro` for:

- page titles and descriptions;
- canonical URLs;
- Open Graph metadata;
- Twitter card metadata;
- a web-app manifest;
- preview-aware robots directives;
- Dentist, WebSite, and WebPage JSON-LD structured data;
- verified contact, address, service-area, and Monday–Thursday opening-hours data.

The demo remains `noindex, nofollow, noarchive` while `previewMode` is enabled.

## Content-verification register

`src/data/content-status.json` separates owner-confirmed material from launch blockers. Current blockers include:

- the sample associate dentist;
- sample staff names, biographies, and illustrations;
- fictional practice-history copy;
- final service-list approval;
- insurance and payment policy language;
- urgent-care and after-hours wording;
- production inquiry, anti-spam, analytics, retention, and response ownership.

## Build gate

`scripts/check-launch-readiness.mjs` runs before development and production builds.

- In preview mode, it reports the blocker count and allows the demo build.
- If preview mode is disabled while blockers remain, it fails the build and names every unresolved item.
- Duplicate content-register IDs also fail the build.

This is a safeguard, not a substitute for owner approval, legal review, accessibility review, or production operational testing.

## Additional launch foundation

- `public/site.webmanifest` supports a consistent site identity and installable browser experience.
- Header and footer images include explicit dimensions and async decoding; the footer image is lazy-loaded.
- Existing Cloudflare `X-Robots-Tag` protection remains in place.
- No production domain, DNS, email, analytics token, Basin endpoint, Turnstile key, patient-data workflow, or payment workflow is activated.

## Validation gates

- Launch-readiness script in preview mode
- Static Astro build
- Existing patient-form hash and byte-length checks
- Desktop and mobile Playwright suites
- axe-core serious/critical checks
- Metadata, canonical, robots, manifest, and JSON-LD assertions
- Internal-link and downloadable-asset checks
- Cloudflare Pages branch preview

## Next release

Release 12 replaces sample and unverified content with practice-approved provider, staff, history, service, policy, and imagery information.
