# Donovan Family Dentistry Demo Roadmap

## Product direction

The modern concept should function as a clear patient-facing digital front door rather than a collection of repeated marketing sections. Each page should have one primary responsibility:

- **Home:** orient visitors and route them to the correct next step.
- **About:** explain the practice experience, values, and local setting.
- **Services:** serve as the detailed source of truth for published procedures.
- **Team:** contain all dentist biographies and staff profiles.
- **Patient Forms:** provide reviewed downloads and clear privacy instructions.
- **Contact:** provide directions, hours, phone access, and a limited administrative inquiry path.

## Milestone 1 - Corrective design pass

Status: implemented in the mobile/content/form-alignment build.

- Stop the mobile location card from covering the office image.
- Add stronger outlines and contrast to secondary actions.
- Put logo artwork inside intentional white rounded brand cards.
- Consolidate dentists and staff on the Team page.
- Remove duplicated full service lists and provider profiles from the homepage.
- Refocus the About page on the practice experience.
- Align Date of birth, Sex M/F, and Marital status fields in the fillable PDF.
- Add mobile, dark-mode, content-ownership, branding, and PDF-hash regression tests.

## Milestone 2 - Practice content approval

Priority: required before any public launch.

- Confirm the complete dentist roster, credentials, biographies, and approved photographs.
- Replace all sample staff names, roles, biographies, and illustrations with approved content or remove the section.
- Confirm the exact service list and preferred patient-friendly terminology.
- Verify office hours, phone number, address, emergency instructions, and accepted-insurance wording.
- Decide whether Social Security number fields remain necessary in the patient form.
- Obtain approval for privacy, accessibility, and website disclaimer language.

## Milestone 3 - Patient conversion and trust

Priority: high after content approval.

- Add an approved appointment-request workflow with spam protection and a documented response owner.
- Keep medical, insurance, and treatment details out of general web forms unless a secure healthcare workflow is selected.
- Add real practice photography for the office, team, and patient experience.
- Add approved reviews or testimonials with source and consent tracking.
- Add a concise new-patient page or expandable section covering arrival time, paperwork, payment expectations, and what to bring.
- Add visible emergency guidance clarifying when to call the office versus emergency services.

## Milestone 4 - Accessibility, performance, and search readiness

Priority: required before production promotion.

- Run full WCAG 2.2 AA review, including keyboard, zoom, screen-reader, contrast, and reduced-motion checks.
- Test current iOS Safari, Android Chrome, desktop Chrome, Firefox, Edge, and Safari.
- Convert approved images to responsive formats and define width/height and lazy-loading rules.
- Establish Core Web Vitals budgets and automated Lighthouse checks.
- Replace demo `noindex` behavior only after final content approval.
- Add final metadata, canonical URLs, sitemap rules, local-business structured data, and social preview images.

## Milestone 5 - Production operations

Priority: launch gate.

- Select and document the production domain, DNS, hosting, email, analytics, and form-processing owners.
- Add privacy-respecting analytics only after approval.
- Define content update ownership and a quarterly accuracy review.
- Add uptime monitoring, broken-link checks, dependency updates, and security-header validation.
- Document backup, rollback, incident response, and credential-management procedures.
- Perform a final production-readiness review before changing DNS or accepting patient submissions.

## Suggested release sequence

1. **Design review release:** current corrective build for visual and content-structure feedback.
2. **Content-approved release:** verified practice information and real people/assets.
3. **Conversion release:** approved request workflow, patient guidance, and trust content.
4. **Production candidate:** accessibility, performance, SEO, privacy, and operational gates complete.
5. **Public launch:** DNS promotion only after written owner approval.
