# Release 17.1 — Automated validation and release evidence

## Purpose

Release 17.1 proposes a repository-controlled quality, SEO, security, and release-validation layer for the Donovan Family Dentistry launch candidate. It is intentionally a draft review release. It does not authorize or perform a production launch.

## Baseline inspected

The branch was created from `main` commit `992223e01ca4c4d1dfef94d3fb25c593f9397bd8`, the merged Release 17 prelaunch preparation baseline. Before implementation, the repository had:

- no open pull requests;
- Astro static output with preview-mode canonicals and global noindex controls;
- strong Node unit, Playwright browser, screenshot, compatibility, axe-core, performance-budget, launch-readiness, production-candidate, CMS/tool-readiness, recovery, and domain-inventory coverage;
- a Classic-only sitemap and retained noindex Modern demo;
- no Lighthouse CI, HTML validator, Lychee, CodeQL, Gitleaks, or Zizmor configuration;
- npm-only Dependabot configuration;
- mutable GitHub Action tags in existing workflows.

The latest validated baseline CI reported 74 passing unit tests, a 17-page build, passing performance budgets, 254 passing primary browser tests with 14 intentional skips, and 24 passing compatibility tests. Release 17.1 must preserve or improve that evidence.

## Proposed implementation

### Classic public surface

The Classic site remains the approved initial public design. A Classic `/new-patients/` page is added because it is a required public quality target and previously existed only in the retained Modern demo. It reuses the established Classic layout and shared content boundaries, links only to existing office calls, directions, blank forms, and approved administrative guidance, and derives office hours from the shared site record.

It is linked from the Classic homepage, primary navigation, footer, and sitemap. No Modern design is promoted or made indexable.

### Deterministic validation

New local scripts validate:

- Classic SEO metadata and internal reachability;
- preview versus production-origin readiness;
- JSON-LD parsing, entity integrity, shared-data consistency, and prohibited unverified claims;
- generated internal links, assets, downloads, fragments, malformed URLs, and redirect loops;
- generated HTML validity;
- Lighthouse CI thresholds;
- production-aware npm audit policy;
- GitHub Actions workflow-security policy.

### GitHub Actions

The proposed workflow organization separates:

- build, unit, SEO, structured-data, HTML, and internal-link validation;
- Lighthouse CI;
- Lychee internal-link validation;
- browser, screenshot, axe-core, and compatibility validation;
- dependency audit;
- Gitleaks secret scanning;
- Zizmor workflow-security validation;
- CodeQL JavaScript and TypeScript analysis;
- scheduled advisory external-link checking.

Every new workflow uses explicit least-privilege permissions and immutable action pins. Existing workflows are subject to the same repository policy before this draft can be considered ready.

### Dependency maintenance

Dependabot covers npm and GitHub Actions weekly. Minor and patch updates are grouped to reduce noise. Automatic merging is not configured.

### Reports

Generated site output, deterministic validation logs, Lighthouse reports, Playwright reports, screenshots, link reports, and npm audit JSON are retained as GitHub Actions artifacts. Security scanners use GitHub-native annotations or security reporting where supported.

## Blocking versus advisory

Blocking:

- existing launch and production-candidate gates;
- unit and build failures;
- performance-budget regressions;
- Playwright, screenshot, compatibility, and axe-core regressions;
- deterministic Classic SEO failures;
- malformed or conflicting structured data;
- internal broken links, assets, downloads, fragments, and redirect loops;
- HTML validation failures;
- Lighthouse category and major audit threshold failures;
- unaccepted high or critical production dependency vulnerabilities;
- detected secrets;
- CodeQL findings according to GitHub's configured code-scanning policy;
- actionable Zizmor and repository workflow-policy findings.

Advisory:

- external-link failures from hosts that reject or rate-limit CI traffic;
- moderate and low npm advisories without demonstrated production impact;
- residual manual review items documented below.

## Lighthouse targets

The proposed initial thresholds are the requested strict but realistic floors:

- SEO: `1.00`
- Accessibility: `0.95`
- Best Practices: `0.95`
- Performance: `0.90`

The draft PR must record actual observed scores and any reproducible variance before it can be marked ready. No threshold is lowered silently.

## Accepted exceptions

- Dependency vulnerability exceptions: none.
- Gitleaks allowlist entries: none.
- Broad link-check exclusions: none.
- HTML exceptions: limited to existing inline style use, equivalent standards-valid serialization differences, and no SRI requirement for same-origin assets governed by the existing CSP.
- Lighthouse threshold exceptions: none at branch creation.

## Launch boundaries preserved

This release does not:

- change production DNS, nameservers, registrar, forwarding, or SSL configuration;
- connect the production domain;
- change `previewMode` from `true`;
- remove the global preview noindex response header;
- enable production indexing or production canonicals;
- activate analytics, inquiry delivery, Turnstile, Open Dental, scheduling, payment, patient-data, PHI, or email functionality;
- create paid service dependencies or new external accounts;
- change the approved Classic design system;
- make Modern publicly indexable.

Lighthouse crawlability is tested only in an isolated copied fixture. The generated site and deployed branch preview remain preview-blocked.

## Residual human checks

Before production launch, humans must still complete physical-device review, keyboard review, screen-reader review, WCAG/PDF review, Search Console review, Google Rich Results validation, production-domain crawl and TLS verification, office-fact verification, and owner launch approval.

## Draft acceptance criteria

The draft PR remains unmerged until:

- the lockfile installs cleanly;
- the complete unit and Playwright suites pass;
- compatibility, screenshot, and axe-core evidence passes;
- the build and performance budgets pass;
- deterministic SEO, structured-data, link, and HTML validation passes;
- Lighthouse reports meet the recorded thresholds;
- npm audit policy passes and reports are inspected;
- Gitleaks and Zizmor pass without broad exceptions;
- CodeQL workflow syntax, permissions, and analysis succeed;
- Dependabot configuration is syntactically valid;
- the exact Cloudflare branch preview deploys successfully and remains preview-safe;
- generated reports and screenshots are inspected rather than accepted solely by exit code;
- the PR documents current scores, findings, accepted exceptions, and residual manual checks.
