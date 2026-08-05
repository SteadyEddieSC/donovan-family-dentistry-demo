# Automated validation

This repository uses repository-controlled checks that run without an additional paid service, external account, or routine dashboard operation. The approved initial public experience is the Classic site at `/`. The retained Modern concept remains a direct-link future-design demo under `/modern/` and must remain noindexed, absent from the Classic sitemap, and absent from Classic navigation.

## Local commands

Run the same deterministic checks used by CI:

```bash
npm ci
npm run test:unit
npm run build
npm run check:seo
npm run check:structured-data
npm run check:links
npm run check:html
npm run check:lighthouse
npm run check:audit
npm run check:workflow-security
```

Install Playwright browsers before the browser matrices:

```bash
npx playwright install --with-deps chromium firefox webkit
npx playwright install chrome msedge
npm run test:e2e
npm run test:compat
```

The composed commands are:

- `npm run check:quality` — build, performance budgets, deterministic SEO, structured data, internal links, generated HTML, and Lighthouse CI.
- `npm run check:security` — production-aware npm audit policy and repository workflow-security policy.
- `npm run check:all` — unit, quality, browser, compatibility, and security commands.

`npm run check:all` does not substitute for GitHub-hosted CodeQL, Gitleaks, Zizmor, or the scheduled external-link advisory. Those checks run through GitHub Actions because they depend on repository history, GitHub event context, or GitHub security reporting.

## Blocking pull-request checks

### Build, unit, and launch boundaries

The existing unit suite, launch-readiness registers, production-candidate gate, CMS/tool-readiness checks, materialized public assets, patient-form patching, responsive-image generation, and performance budgets remain blocking.

### Browser, screenshot, and accessibility

Playwright continues to cover Chromium desktop and mobile, branded Chrome and Edge, Firefox, WebKit, Android Chrome emulation, and iOS Safari emulation. Existing screenshot evidence and axe-core WCAG regression checks remain blocking. The new Classic `/new-patients/` page is included without changing the approved Classic visual system.

### Deterministic SEO

`npm run check:seo` validates every intended Classic public page for:

- exactly one title, description, canonical, H1, robots directive, and required Open Graph field;
- unique titles and descriptions;
- meaningful title, description, and H1 content;
- preview-mode noindex/nofollow behavior;
- Pages-preview canonical consistency before launch;
- readiness for the intended `https://www.donovanfamilydentistry.com` origin without enabling it;
- consistent social-image URL, dimensions, type, and alternative text;
- Classic-only sitemap membership;
- exclusion of Modern, review, and utility routes;
- internal reachability from the Classic homepage;
- absence of editor notes, placeholder copy, template language, and internal approval text.

Preview mode and production readiness are intentionally separate. Current generated output must remain noindexed and use the Pages preview origin. An isolated Lighthouse fixture rewrites only a copied build to test future production crawlability. It never changes `dist`, repository launch flags, Cloudflare, or the production domain.

### Structured data

`npm run check:structured-data` parses JSON-LD locally. Intended Classic public pages must emit exactly one coherent `Dentist`, `WebSite`, and `WebPage` graph. Practice name, address, telephone, URL, image, logo, and opening hours derive from shared site data. Ratings, reviews, awards, accepted-insurance assertions, and other unverified claims are prohibited.

Modern and review pages retain only nonbusiness `WebPage` metadata. They must not emit a competing `Dentist` or `LocalBusiness` entity.

### Lighthouse CI

Lighthouse CI audits the Classic public targets:

- `/`
- `/about/`
- `/services/`
- `/new-patients/`
- `/contact/`

Blocking category floors are:

- SEO: `1.00`
- Accessibility: `0.95`
- Best Practices: `0.95`
- Performance: `0.90`

It also blocks missing titles, descriptions, canonicals, crawlability, image alternative text or dimensions, serious console errors, CLS above `0.10`, LCP above `3000 ms`, and total blocking time above `300 ms`. Reports are stored in the `lighthouse-reports` artifact. Threshold changes require a documented reproducible reason and evidence; they must not be silently weakened.

### Links and HTML

The repository-controlled internal-link validator blocks missing pages, images, downloads, `srcset` assets, fragments, malformed URLs, and redirect loops. It also verifies that the administrative form action maps to the checked-in Cloudflare Function and that the private 404-review probe maps to the generated 404 document. Lychee independently checks generated internal links in offline mode. External hosts are checked on a scheduled advisory workflow with retries and caching because CI traffic is often rate-limited or blocked.

`html-validate` checks generated HTML for invalid nesting, duplicate IDs, heading and landmark issues, malformed metadata, missing required attributes, and semantic problems. The configuration keeps semantic failures blocking and makes only these exact exceptions:

- `no-inline-style`: disabled because a small amount of approved, existing layout styling is authored inline; CSP still governs allowed style execution and visual regression tests cover it.
- `void-style` and `attribute-boolean-style`: disabled because Astro's generated serialization can use equivalent standards-valid forms.
- `doctype-style`: enforced as uppercase because Astro emits the standards-valid `<!DOCTYPE html>` form.
- `tel-non-breaking`: disabled because it is a typography preference rather than HTML validity; phone links, accessible names, responsive layout, and target sizing remain independently tested.
- `no-raw-characters`: disabled because generated inline JavaScript and JSON-LD can legitimately contain raw ampersands and related characters outside ambiguous entity contexts; JSON parsing, CSP, CodeQL, and browser execution remain blocking.
- `form-dup-name`: disabled because the private local review checklist intentionally uses a repeated checkbox name so `FormData.getAll()` can collect a standards-valid checkbox group; the form is local-only and covered by Playwright.
- `no-implicit-input-type`: disabled because HTML defines a missing input type as `text`; all production-capable administrative form inputs now declare explicit types, while the remaining implicit text fields are confined to the private local review utility and are browser-tested.
- `require-sri`: disabled because checked resources are same-origin or explicitly permitted by the existing restrictive CSP; no new third-party script service is introduced by this release.

`heading-level`, `unique-landmark`, `no-dup-id`, `no-redundant-role`, recommended form rules other than the exact exceptions above, invalid nesting, required attributes, and the rest of the recommended validator profile remain blocking. Any new exception must name the rule, affected markup, standards basis, risk, owner, and review condition.

### Dependency and application security

The npm audit policy blocks unaccepted high or critical vulnerabilities in production dependencies. Moderate, low, and development-only findings remain visible in uploaded reports but do not automatically block unless analysis shows production impact. Approved exceptions must be exact and include package, advisory, impact, reason, and expiration. The current exception register is empty.

CodeQL covers JavaScript and TypeScript only, using the official GitHub action, least-privilege permissions, pull-request and main-branch triggers, and a weekly schedule.

Gitleaks scans pull-request commits, repository content, and history with default rules and no broad allowlist. Exact false-positive allowances must identify the rule and exact fingerprint or path; credentials, tokens, private keys, mailbox secrets, Cloudflare tokens, Open Dental secrets, analytics credentials, or patient-system credentials must never be allowed merely to make CI pass.

Zizmor and the repository policy script check workflow permissions, immutable action pins, checkout credential persistence, event-expression injection, `pull_request_target`, secrets inheritance, dependency-update cooldowns, and unsafe workflow patterns.

## Advisory checks

The scheduled external-link workflow is advisory because external sites can reject GitHub-hosted runners or change temporarily. Its report is still retained as an artifact and should be reviewed when it finds a durable stale link. Internal link, asset, download, fragment, and redirect failures remain blocking.

Moderate and low npm advisories are reported rather than automatically blocking. Any promotion to production relevance must be handled as a blocking finding.

## Artifacts

GitHub Actions retains useful evidence for 14 days unless a workflow documents another period:

- `generated-site-and-quality-reports`
- `lighthouse-reports`
- `lychee-internal-report`
- `browser-test-results`
- `npm-audit-reports`
- `external-link-advisory-report`
- Gitleaks SARIF/report artifacts when findings occur
- CodeQL and Zizmor results in GitHub security reporting when supported

Reports must not contain credentials, completed forms, inquiry content, mailbox details, patient information, or protected health information.

## False positives and approved exceptions

1. Reproduce the finding locally or in a clean branch run.
2. Confirm that the finding is not an actual broken contract, vulnerability, leaked secret, or workflow weakness.
3. Prefer correcting the implementation or narrowing the validator.
4. Add an exception only when correction is not appropriate.
5. Document exact scope, risk, reason, owner, review condition, and expiration when applicable.
6. Never use directory-wide exclusions, wildcard secret allowlists, or lower Lighthouse thresholds without evidence.

## Human review that remains required

Automation does not replace:

- current physical-device review on iPhone, iPad, Android, Windows, and macOS;
- manual keyboard testing;
- screen-reader testing;
- human WCAG and PDF review;
- Google Search Console review;
- final Google Rich Results validation;
- final production-domain DNS, TLS, headers, redirects, canonical, sitemap, and crawl verification;
- owner approval for content, office facts, launch decisions, email handling, analytics, inquiry delivery, Open Dental, patient-data functionality, and production indexing.

No automated check authorizes a launch or clears an owner-controlled evidence item by itself.
