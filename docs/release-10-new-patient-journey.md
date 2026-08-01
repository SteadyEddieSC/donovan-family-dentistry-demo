# Release 10 — New-patient journey and logo cleanup

## Scope

This release removes the visually duplicated logo card introduced during forced-dark hardening and adds a complete public-facing New Patients page to the modern concept.

## Logo treatment

The Donovan SVG already contains its own rounded white card. Header and footer wrappers now sit flush with that artwork:

- zero padding;
- zero border;
- no wrapper shadow;
- no secondary background-image layer;
- no visible size difference between the wrapper and SVG;
- forced-color protection remains enabled.

## New-patient guide

The new `/modern/new-patients/` page includes:

- first-call, forms, and arrival steps;
- a practical list of items to bring;
- cautious insurance and payment language that avoids promising coverage;
- direct links to the fillable patient form and privacy practices;
- a clear warning not to submit protected health information through the public inquiry form;
- urgent-contact guidance directing patients to call the office rather than use the website form;
- emergency guidance for breathing or swallowing difficulty, uncontrolled bleeding, and serious facial or head injuries.

The new page is linked from the modern homepage, header/mobile navigation, footer, and sitemap.

## Unchanged boundaries

- The medical-history PDF remains download-only.
- The general inquiry form remains non-PHI and preview-only unless approved service configuration is added.
- No Basin endpoint, Turnstile key, analytics token, email route, DNS setting, or production domain is activated by this release.
- No insurance network participation or payment method is represented as confirmed.

## Validation gates

- Astro static build
- Existing desktop/mobile Playwright coverage
- axe-core serious/critical accessibility checks
- Logo wrapper-to-image geometry checks
- New-patient content and link checks
- Sitemap route check
- Mobile full-page review screenshot
- Existing patient-form byte-length and SHA-256 checks
