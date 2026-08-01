# Donovan Family Dentistry Website Roadmap

## Product direction

The modern concept should function as a clear patient-facing digital front door rather than a collection of repeated marketing sections. Each page has one primary responsibility:

- **Home:** orient visitors and route them to the correct next step.
- **About:** explain the practice history, experience, values, and Lowcountry setting.
- **Services:** serve as the detailed source of truth for published procedures.
- **Team:** contain all dentist biographies and staff profiles.
- **Patient Forms:** provide reviewed downloads and clear privacy instructions.
- **Contact:** provide directions, hours, phone access, and a limited administrative inquiry path.

## Release 7 — mobile and document stabilization

- Rebuild the fillable patient form on a fixed layout grid.
- Apply one consistent field border, fill, height, and label gap.
- Verify all 137 fillable fields and render all three pages in multiple PDF engines.
- Lock the modern design to its intentional light palette rather than browser auto-darkening.
- Keep the logo on a white rounded brand card in the header and footer.
- Fix the duplicate mobile Call label.
- Ensure the Lowcountry photo caption does not cover the office photograph.
- Strengthen outlines and contrast for mobile actions and the PHI warning.
- Remove visible design-review language from public-facing pages.
- Add automated regression checks for PDF integrity, mobile call text, PHI-warning colors, branding, and content separation.

## Release 8 — content depth and visual credibility

Until verified practice content is available, use polished fictional content and clearly track every item that must be replaced before production.

- Add more distinct office, team, and patient-experience imagery.
- Expand the practice story and Lowcountry identity without duplicating the Team page.
- Deepen service explanations while keeping the homepage concise.
- Add an emergency-care information block with owner-approved language.
- Add insurance and payment content after owner confirmation.
- Create a dedicated new-patient guide only if it adds information beyond the Forms page.

## Release 9 — low-cost production inquiry workflow

- Implement Cloudflare Turnstile.
- Connect a non-PHI administrative form through Basin or a small Cloudflare Worker.
- Add server-side validation, rate limiting, honeypot controls, and safe logging.
- Send inquiries only to an owner-approved mailbox.
- Document retention, deletion, and response ownership.
- Keep medical-history submission offline until a secure vendor and BAA are approved.

## Release 10 — production readiness

- Replace fictional names, biographies, and portraits with verified practice content.
- Confirm the second dentist and all staff roles.
- Verify every service, policy, hour, telephone number, and address.
- Conduct manual WCAG review in addition to automated axe checks.
- Test current iOS Safari, Android Chrome, Chrome, Firefox, Edge, and Safari.
- Optimize responsive images and Core Web Vitals.
- Add final SEO titles, descriptions, canonical URLs, local-business schema, sitemap rules, and social imagery.
- Configure uptime monitoring and rollback instructions.
- Inventory existing DNS, MX, SPF, DKIM, DMARC, portal, and scheduling records.
- Attach the real domain only after email and rollback testing.

## Release 11 — secure patient workflow, optional

Choose one path based on actual office needs.

### Secure forms only

- Hushmail Secure Messaging & Forms or a Jotform HIPAA-enabled plan.
- Signed BAA.
- Secure notification and role-based access.
- Retention and deletion policy.

### Secure communications

- Spruce, Weave, or another approved healthcare communication platform.
- Confirm calling, texting, fax, number porting, consent, staffing expectations, and telecom fees.

### Full scheduling and engagement

- Obtain comparable quotes from Weave, NexHealth, and LocalMed.
- Confirm compatibility with the practice-management system.
- Pilot scheduling before making it the primary appointment path.

## Longer-term ideas

- Secure online new-patient intake.
- Real-time appointment scheduling.
- Closure and storm-alert banner editable by office staff.
- Approved patient testimonials and review links.
- Service-specific landing pages only where useful to patients and local search.
- Google Business Profile integration.
- Quarterly accessibility, link, content-freshness, and privacy reviews.
