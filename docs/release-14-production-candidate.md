# Release 14 — production candidate

## Purpose

Release 14 turns the private demonstration into a production-candidate codebase without changing the production domain, enabling search indexing, activating live administrative delivery, or representing owner-controlled content as approved.

The release adds broader browser-engine coverage, WCAG 2.2 AA review evidence, responsive image delivery, measurable performance budgets, deterministic dependency handling, scheduled monitoring, and explicit rollback procedures.

## Safety boundary

The following controls remain mandatory throughout Release 14:

- `src/data/site.json` keeps `previewMode: true`.
- `public/robots.txt` disallows crawling.
- Cloudflare headers send `X-Robots-Tag: noindex, nofollow, noarchive`.
- `PUBLIC_ADMIN_INQUIRY_ENABLED` defaults to `false`.
- The administrative request page sends nothing in its default preview state.
- Medical history remains a local fillable PDF and is not submitted through the website.
- No production DNS, email, patient portal, scheduling, payment, or text-messaging configuration is changed.
- Service wording, insurance/payment language, urgent-care workflow, and live inquiry operations remain launch blockers until supported by practice approval and configuration evidence.

## Automated browser compatibility matrix

The compatibility suite exercises a focused patient journey in the following Playwright projects:

| Project | Automated coverage | What it represents |
| --- | --- | --- |
| Chrome desktop | Branded Google Chrome channel | Current Chrome behavior on the CI runner |
| Edge desktop | Branded Microsoft Edge channel | Current Edge behavior on the CI runner |
| Firefox desktop | Playwright Firefox | Current Playwright-supported Firefox build |
| WebKit desktop | Playwright WebKit | Safari-engine compatibility, not a substitute for physical macOS Safari testing |
| Android Chrome | Pixel 7 device emulation with branded Chrome | Android viewport, input, and Chrome behavior in CI |
| iOS Safari | iPhone 14 device emulation with WebKit | iOS viewport and WebKit behavior in CI, not a substitute for physical iPhone/iPad testing |

The compatibility suite checks page loading, console errors, horizontal overflow, navigation, patient-form links, and local-only inquiry preview behavior.

### Real-device manual verification

**Status: pending before production launch.**

Automated engine and device emulation is evidence, but it is not represented as real-device certification. Record date, operating-system version, browser version, device, tester, and result for:

- current iPhone Safari;
- current iPad Safari;
- current Android Chrome;
- current macOS Safari;
- current Windows Chrome;
- current Windows Edge;
- current Windows or macOS Firefox.

Any device-specific defect becomes a release-blocking issue unless the affected path is removed from launch scope.

## WCAG 2.2 Level AA review

Automated axe checks run across the classic and modern public routes using WCAG 2.0 A/AA, WCAG 2.1 AA, and WCAG 2.2 AA tags. Release 14 adds focused manual-review automation and a human checklist.

### Automated and code-reviewed items

- semantic `header`, `nav`, `main`, `footer`, section, heading, list, table, form, status, and disclosure structures;
- one skip link per layout;
- visible three-pixel focus indicators with offset and contrasting perimeter;
- minimum target sizing for buttons, form controls, navigation, summaries, and persistent quick actions;
- focus scroll margins and page scroll padding to reduce sticky-header obstruction;
- reduced-motion behavior that removes smooth scrolling and shortens animation and transition durations;
- labeled fields, required-state semantics, native validation, and polite status output on the administrative form;
- no keyboard trap in the classic menu, modern menu, disclosure components, or inquiry form;
- responsive reflow without horizontal page scrolling at a 320-CSS-pixel viewport and a desktop-equivalent 200% zoom width;
- text alternatives on meaningful images and empty/decorative treatment where appropriate;
- no serious or critical axe findings in the automated suite.

### Human review checklist

Record a pass, fail, or not-applicable result for each item. A code review or automated assertion may support the decision but does not replace the human check.

- [ ] Keyboard-only traversal follows a logical order on every public route.
- [ ] Every focused control is visible and not obscured by the header, mobile dock, dialog, or disclosure content.
- [ ] Focus indicators remain visible on light, dark, photographic, and outlined surfaces.
- [ ] Page content remains usable at 200% and 400% browser zoom.
- [ ] Text spacing overrides do not clip, overlap, or hide content.
- [ ] Screen-reader announcements for form validation, sending, success, and failure are understandable.
- [ ] Headings describe page sections and do not skip structure in a confusing way.
- [ ] Link text is meaningful in context and repeated destinations use consistent names.
- [ ] Color is not the only way information, required state, error state, or selection is conveyed.
- [ ] Text and non-text contrast are acceptable in normal, hover, focus, disabled, and error states.
- [ ] Touch targets are usable with coarse input and do not overlap neighboring controls.
- [ ] Orientation changes do not block content or controls.
- [ ] Reduced-motion mode avoids unnecessary movement while preserving functionality.
- [ ] PDFs can be opened, completed, saved, and printed with the supported desktop and mobile PDF applications selected by the practice.
- [ ] Accessibility, website-use, privacy, and telephone fallback information is easy to locate.

## Responsive image and performance work

The build materializes the approved source photographs and generates:

- 480-pixel and 720-pixel WebP variants of the office photograph;
- 480-pixel and 720-pixel WebP variants of the approved provider-family photograph;
- a padded 1200×630 WebP social card that preserves the full office photograph rather than cropping the sign;
- `srcset`, `sizes`, explicit width and height, async decoding, and appropriate eager/lazy loading attributes.

The post-build budget rejects:

- HTML files over 100 KiB each;
- total CSS over 240 KiB;
- total JavaScript over 120 KiB;
- individual images over 220 KiB;
- total image output over 700 KiB;
- total non-PDF output over 1.8 MiB;
- missing or incorrectly sized responsive image variants;
- homepages that omit responsive image candidates or sizing guidance.

Browser tests also record layout-shift and navigation timing evidence under local CI conditions. Field Core Web Vitals must be reviewed after real production traffic exists; local laboratory results are not represented as real-user data.

## Metadata, social, and discovery review

Release 14 verifies:

- unique page titles and descriptions;
- canonical URLs on the configured Pages domain during preview;
- explicit `noindex` metadata and response headers;
- Open Graph and Twitter titles, descriptions, URL, 1200×630 image, image type, dimensions, and alternative text;
- Dentist, WebSite, WebPage, PostalAddress, service-area, opening-hours, and ImageObject structured data;
- a valid manifest with a modern start URL;
- one sitemap entry for each public HTML route, including Accessibility and Website Use & Privacy;
- a preview `robots.txt` that disallows crawling.

The canonical host and indexing policy change only during the separately governed domain-launch release.

## Public language review

### Privacy and protected health information

- The public inquiry form repeatedly states that it is not a secure patient portal.
- Symptoms, diagnoses, medications, insurance identifiers, Social Security numbers, treatment details, medical history, photographs, and files are prohibited.
- Completed medical-history forms remain local to the visitor's device and are brought to the office unless a separately approved secure workflow is provided.
- The practice Notice of Privacy Practices remains a separate patient PDF.

### Accessibility

- A public Accessibility page explains the design measures, current production-candidate status, third-party/PDF limitations, telephone feedback path, and pending real-device verification.

### Website disclaimer

- A Website Use & Privacy page states that general website information is not diagnosis, treatment, or individualized medical advice and does not replace an examination.

### Insurance and payment

- The site avoids naming unapproved plans or payment products.
- Benefit information and estimates are described as non-guarantees.
- Current participation, responsibility, payment options, and office policies must be confirmed directly.
- **Launch blocker remains:** the practice must approve the final insurance/payment wording and any specific policies before launch.

### Urgent and emergency language

- The site directs urgent dental concerns to the office telephone rather than the website form.
- It directs difficulty breathing or swallowing, severe uncontrolled bleeding, or serious face/head injury to 911 or emergency care.
- **Launch blocker remains:** the practice must approve the final wording and after-hours workflow before launch.

## Monitoring and dependency review

The scheduled production-candidate workflow:

- builds from the committed lockfile with `npm ci`;
- runs the serverless unit tests and static performance budgets;
- runs a high-severity npm audit;
- checks the stable Pages URL, modern homepage, sitemap, robots policy, patient-form download, and contact-page noindex policy;
- validates internal links without submitting the administrative form;
- uploads diagnostic artifacts without including visitor messages or patient information.

The workflow is also manually dispatchable. Alerts remain in GitHub Actions until an office-approved external notification path is selected.

## Rollback

### Code rollback

1. Identify the last green merge commit on `main`.
2. Revert the Release 14 merge commit or redeploy the selected prior commit in Cloudflare Pages.
3. Confirm the stable Pages URL serves the prior assets, sitemap, headers, PDFs, and preview-only form.
4. Record the reason, affected pages, and follow-up issue without including patient or inquiry content.

### Administrative-form rollback

Set `PUBLIC_ADMIN_INQUIRY_ENABLED=false` and redeploy. This restores local preview behavior while preserving the telephone path. Runtime Basin and Turnstile values may remain configured but are unreachable from a preview-only build.

### Domain-launch rollback

Production DNS rollback is not part of Release 14. It is documented and tested during Release 15 before any real-domain change.

## Promotion evidence required

Release 14 code may merge when:

- unit, build, performance, Chromium, compatibility, link, PDF, metadata, and accessibility checks pass;
- the exact head commit deploys successfully to a Cloudflare branch preview;
- desktop and mobile screenshots are reviewed;
- no secrets, recipients, completed forms, inquiry contents, or patient data are committed;
- the launch blocker register remains enforced;
- real-device and office-approval items are clearly recorded as pending rather than silently treated as complete.

Release 14 does **not** authorize public indexing, real-domain cutover, live administrative delivery, or removal of the four current launch blockers.
