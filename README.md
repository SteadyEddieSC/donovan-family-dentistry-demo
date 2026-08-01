# Donovan Family Dentistry launch candidate

Private launch-readiness website for Donovan Family Dentistry in Beaufort, South Carolina. The modern concept is the selected production design, but the repository remains in private preview until the governed launch evidence is complete.

## Safety boundary

This repository does not modify the production domain, nameservers, DNS records, existing email service, scheduling system, patient portal, analytics account, payment service, or text-messaging service. Public indexing remains disabled.

The Contact page contains a non-PHI administrative-request experience. It remains a local-only preview by default. A same-origin Cloudflare Pages Function is included for eventual activation, but it fails closed unless the office-owned Basin endpoint, Turnstile secret, allowed origins, notification recipient, retention procedure, response owner, backup owner, and rate-limiting control are configured. Medical and dental history is not submitted through the website.

The provider roster, service wording, insurance/payment language, urgent-care workflow, inquiry launch decision, physical-device review, human accessibility review, authoritative DNS backup, mail/application preservation, rollback rehearsal, and change window remain documented launch evidence.

## Stack

- Astro 7 with static HTML output
- Cloudflare Pages Function for the optional protected administrative-request endpoint
- TypeScript-aware Astro components
- Pages CMS configuration in `.pages.yml`
- Cloudflare Pages-compatible build
- Sharp-generated responsive WebP images and a 1200×630 social card
- Node unit tests for serverless, launch-gate, and domain-inventory logic
- Playwright coverage for Chromium, branded Chrome and Edge, Firefox, WebKit, Android Chrome emulation, and iOS Safari emulation
- axe-core WCAG 2.2 AA regression checks plus a manual-review checklist
- Static performance budgets, scheduled deployed-site checks, npm audit, and Dependabot
- Manual public DNS, TLS, and HTTP inventory workflow that never edits records
- Fillable, locally completed patient-history PDF; no website submission

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:4321`.

The normal Astro development server keeps the administrative form and all discovery controls in preview mode. See `docs/release-13-administrative-inquiry.md` for optional Cloudflare Pages Function testing with local runtime values.

## Test and build

```bash
npm run test:unit
npm run build
npx playwright install --with-deps chromium firefox webkit
npx playwright install chrome msedge
npm run test:e2e
npm run test:compat
```

`npm run build` validates inquiry configuration, editable content, launch readiness, production-candidate safety, the Release 15 evidence register, responsive image generation, the patient PDF, and static performance budgets.

The compatibility suite provides browser-engine and emulation evidence. It does not replace the physical iOS, Android, macOS, and Windows checks or the human WCAG/PDF review recorded in `docs/release-15-launch-readiness.md`.

## Public domain inventory

Run a safe local inventory:

```bash
npm run inventory:domain -- --domain donovanfamilydentistry.com --output artifacts/domain-inventory.json
```

The manual **Domain readiness inventory** GitHub Actions workflow performs the same public-only collection and uploads a JSON artifact. It queries public DNS answers, TLS certificate metadata, and a small allowlist of HTTP response headers. It does not authenticate to a DNS provider or change records.

The inventory must still be reconciled with an authoritative DNS-zone export because generic queries cannot discover every DKIM selector, proxy setting, vendor dependency, or administrator-only record.

## Cloudflare Pages preview

Use these project settings:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22`

The `functions/` directory deploys the same-origin `/api/administrative-inquiry` route. `public/_routes.json` limits Function invocation to `/api/*`, so ordinary static page requests remain static.

Do not connect `donovanfamilydentistry.com` or `www.donovanfamilydentistry.com`, remove `noindex`, or enable live inquiry delivery during Release 15.

## Monitoring

- CI uses the committed npm lockfile and runs dependency review, npm audit, unit, build, performance, browser, compatibility, metadata, link, PDF, accessibility, and launch-readiness checks on pull requests and `main`.
- **Production candidate monitor** runs daily and can be dispatched manually for another Pages URL using `SITE_URL`.
- **Domain readiness inventory** is manually dispatched for a public infrastructure snapshot.
- Dependabot checks npm dependencies weekly.
- Monitoring never submits the administrative form and must not include visitor messages, completed patient forms, credentials, private mailbox details, or patient information in issues or artifacts.

See:

- `docs/release-14-production-candidate.md` for the production-candidate browser, accessibility, performance, metadata, and monitoring controls.
- `docs/release-15-launch-readiness.md` for current-site reconciliation, owner evidence, domain inventory, cutover prerequisites, and rollback thresholds.

## Owner editing

Pages CMS reads `.pages.yml` and provides protected editors for practice details, hours, announcements, services, profiles, images, and PDF forms. See `docs/owner-editing-guide.md`.

Office editors do not manage Turnstile secrets, Basin endpoints, Cloudflare rate limits, production activation flags, indexing controls, DNS, registrar settings, or mail records. Those remain administrator-owned settings.

## Content provenance

Initial text comes from the existing public website, the supplied website screenshot, and owner-provided corrections. The Release 15 reconciliation records the current public two-dentist roster as an unresolved replacement-site decision rather than silently omitting or republishing it. See `docs/content-inventory.md`, `docs/owner-review.md`, and `docs/release-15-launch-readiness.md`.
