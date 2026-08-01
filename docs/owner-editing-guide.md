# Office website editor guide

Routine website updates are designed to be completed in Pages CMS without editing code, installing software, or using the command line.

## First-time access

1. Open the hosted Pages CMS application in a browser.
2. Sign in with the GitHub account that has access to the website repository, or accept a Pages CMS collaborator invitation from the website administrator.
3. Open `donovan-family-dentistry-demo`.
4. Choose the `main` branch for normal office updates.

The office editor is organized into four plain-language areas:

- **Quick updates:** phone, address, hours, homepage message, office image, and announcement.
- **Modern page wording:** About, Team, and Services page headings and supporting text.
- **Dentists and team:** provider biographies, visibility, photographs, and role-based team descriptions.
- **Services and patient forms:** service names, display order, grouping, visibility, and downloadable PDFs.

## Normal update process

1. Open the section that needs to change.
2. Edit only the relevant fields.
3. Use **Show profile**, **Show service**, or **Show announcement** to control whether an item appears publicly.
4. Save the change.
5. Choose **Build and verify website** from the editor actions.
6. Wait for the check to finish. A successful check confirms that editable content, dependencies, the protected administrative-request handler, launch safeguards, responsive images, performance budgets, links, forms, metadata, browser layouts, mobile behavior, and automated accessibility checks passed.
7. Open the Cloudflare Pages deployment or branch-preview link and review the changed page on both a phone and a desktop browser.
8. For a launch candidate, complete the physical-device and human WCAG checklist in `docs/release-14-production-candidate.md`; automated emulation does not replace that review.

Cloudflare Pages automatically rebuilds the website after a saved change. A failed build does not replace the last successful deployment.

## Built-in protections

The editor and build pipeline reject common mistakes before they can replace the working site:

- an enabled announcement with no text;
- missing contact or address fields;
- fewer or more than seven office-hour entries;
- duplicate service names or display-order numbers;
- a service assigned to a nonexistent group;
- a visible sample dentist profile;
- a visible provider without biography content;
- duplicate provider or team IDs;
- missing page headings or required public text;
- unsafe public inquiry configuration or a public secret/endpoint variable;
- removal of the preview, noindex, robots, or documented launch-blocker controls;
- missing responsive image variants or a performance-budget regression;
- broken builds, links, form assets, metadata, responsive layouts, browser compatibility, serverless inquiry safeguards, or serious accessibility checks.

When validation fails, the prior successfully deployed website remains available. Correct the highlighted editor field and save again.

## Provider and team updates

- Dr. Donovan's profile is shared by the classic and modern concepts, so one editor update changes both.
- The hidden Associate Dentist entry is a safe template. Replace every sample field, upload an approved photograph, change the approval status, and only then turn on **Show profile**.
- Role-based Front Office, Dental Hygiene, and Dental Assisting profiles are safe to keep indefinitely.
- Individual staff names and photographs are optional. Publish them only after the practice has permission to use the names, wording, and images.
- Hide an outdated profile before replacing or deleting it.

## Images and PDFs

- Upload website photographs through **Website images**.
- Use the highest-resolution approved original available. A large office photograph should generally be at least 1600 pixels wide.
- The build creates smaller WebP variants automatically for patient-facing photographs.
- Alternative text should briefly describe what the image communicates; do not start with “image of.”
- Upload only images the practice owns or has permission to publish.
- Replace a patient PDF inside its existing form entry so public links continue to work.
- Never upload completed patient forms, records, insurance cards, identification, or any other patient information to the website repository.

## Administrative request form

The Contact page is limited to general administrative requests. The dentist or office editor does not need to manage its technical keys.

- In preview mode, **Preview request** displays the proposed message only in the visitor's browser. It sends and stores nothing.
- Live delivery is enabled only by the website administrator after the office mailbox, Basin account, Turnstile keys, allowed domains, retention, response owner, and rate limit have been approved and tested.
- Never ask a visitor to enter symptoms, diagnoses, medications, treatment details, Social Security numbers, insurance identifiers, medical history, photographs, files, or other protected health information.
- The designated office owner should review the approved mailbox and Basin inbox according to the office procedure.
- Clinical or urgent content must move to the approved telephone or secure workflow rather than continuing through the public form.
- Do not copy form messages into GitHub issues, website content, monitoring output, screenshots, or unrelated personal systems.

## Launch approvals still required

A green website check does not authorize public launch by itself. Before indexing, domain cutover, or live inquiry delivery, the practice must still approve or configure:

- the current service list and patient-friendly terminology;
- insurance participation, payment options, estimates, and financial-policy language;
- urgent-dental and after-hours wording;
- the office-owned administrative-request recipient, Basin account, Turnstile keys, allowed origins, rate limiting, retention period, response owner, backup owner, and real delivery test;
- the physical-device/browser checks and human WCAG review recorded in the Release 14 checklist.

## Safe wording rules

- Do not publish a service, insurance plan, payment method, office policy, credential, professional affiliation, or emergency workflow unless the practice has confirmed it.
- Do not describe a general dentist as a specialist unless that designation is accurate and approved.
- General website inquiries must not request or contain symptoms, diagnoses, medications, Social Security numbers, insurance identifiers, treatment records, or other protected health information.
- Use the announcement for closures, storms, or short administrative notices—not individual patient messages.

## Monitoring and recovery

The scheduled production-candidate monitor checks the deployed pages, sitemap, internal links, PDFs, social image, preview indexing controls, form mode, dependencies, unit tests, and performance budgets. It does not submit the inquiry form.

Every editor save becomes a GitHub commit, so prior wording can be restored. If an office user is uncertain, hide the item, run the website check, and ask the website administrator to review the change before making it visible again.

To disable live administrative requests quickly, the website administrator sets `PUBLIC_ADMIN_INQUIRY_ENABLED=false` and redeploys. The office telephone path remains available. For a wider code rollback, redeploy or revert to the last green `main` commit documented in the Release 14 guide.
