# Release 12 — Office editor and safe public content

## Purpose

Make routine website updates practical for a dentist or office team member while removing fictional public identities and preserving the existing launch-safety controls.

## Office-editable content

Pages CMS now presents the repository as four plain-language editing groups:

- Quick updates
- Modern page wording
- Dentists and team
- Services and patient forms

The editor can update contact information, hours, announcements, homepage copy, page headings, practice wording, dentist profiles, role-based team descriptions, services, images, and PDFs without editing Astro templates.

`settings.content.merge` is enabled so structured editor saves preserve repository fields that are intentionally not exposed to routine office users.

## One-click website check

The Pages CMS action **Build and verify website** starts `.github/workflows/office-site-check.yml` on the branch currently open in the editor.

The workflow:

1. installs the website dependencies;
2. runs the office-content validator;
3. runs the launch-readiness gate;
4. materializes and verifies the binary assets;
5. builds the Astro site;
6. runs the complete Playwright and accessibility suite;
7. uploads the successful static build for seven days;
8. writes a plain-language GitHub Actions summary.

A failed build does not replace the previous successful Cloudflare Pages deployment.

## Content validation

`scripts/check-editor-content.mjs` fails the build for unsafe or inconsistent editor changes, including:

- incomplete contact information;
- an enabled empty announcement;
- an invalid seven-day hours list;
- duplicate or ungrouped services;
- visible sample providers;
- incomplete visible provider or team profiles;
- duplicate profile IDs;
- missing required page wording.

## Shared provider source

`src/data/providers.json` is now the single source for dentist profiles used by both concepts.

- Dr. William Donovan remains visible and verified.
- A hidden associate-dentist template remains available for later approved information.
- The classic About page and modern Team page read the same provider record.

## Safer team presentation

The fictional associate dentist and fictional named staff are no longer public. The modern Team page now presents:

- Dr. William Donovan;
- Front Office Team;
- Dental Hygiene Team;
- Dental Assisting Team.

The role-based descriptions remain useful without claiming a specific roster. Individual staff can be added later through the editor.

## Safer practice story

The modern About page no longer publishes invented practice-history claims. It uses confirmed location information and verified parts of Dr. Donovan's professional background.

## Editable services

The classic and modern concepts continue to use the same visible service list. Each service now has a group ID, and the modern page headings, summaries, and planning notes live in office-editable content.

## Font and CSP review

The supplied browser log showed blocked requests for Google-hosted Inter and DM Mono stylesheets. The site now applies an explicit operating-system-font policy and automated browser tests confirm that a clean site session makes no requests to Google Fonts. The strict Content Security Policy remains unchanged.

## Remaining public-launch blockers

Release 12 reduces the launch-blocker register to:

- service-list approval;
- insurance and payment wording;
- urgent and after-hours wording;
- production inquiry, anti-spam, analytics, retention, and response ownership.

Optional associate-dentist, individual staff, and practice-history additions are tracked separately as editorial follow-ups rather than blocking the safe role-based preview.

## Next release

Release 13 will implement the low-cost non-PHI administrative inquiry workflow and anti-spam controls, subject to an office-approved recipient and operating procedure.
