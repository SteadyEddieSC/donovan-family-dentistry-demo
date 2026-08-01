# Donovan Family Dentistry production candidate

Private production-candidate website for Donovan Family Dentistry in Beaufort, South Carolina.

## Safety boundary

This repository does not modify or connect the production domain, DNS, existing email service, scheduling system, patient portal, analytics account, payment service, or text-messaging service. Public indexing remains disabled.

The Contact page contains a non-PHI administrative-request experience. It remains a local-only preview by default. A same-origin Cloudflare Pages Function is included for eventual activation, but it fails closed unless the office-owned Basin endpoint, Turnstile secret, allowed origins, notification recipient, retention procedure, response owner, and rate-limiting control are configured. Medical and dental history is not submitted through the website.

The current service list, insurance/payment language, urgent-care workflow, and live inquiry operations remain documented launch blockers pending practice approval or office-owned configuration evidence.

## Stack

- Astro 7 with static HTML output
- Cloudflare Pages Function for the optional protected administrative-request endpoint
- TypeScript-aware Astro components
- Pages CMS configuration in `.pages.yml`
- Cloudflare Pages-compatible build
- Sharp-generated responsive WebP images and a 1200×630 social card
- Node unit tests for the serverless request handler
- Playwright coverage for Chromium, branded Chrome and Edge, Firefox, WebKit, Android Chrome emulation, and iOS Safari emulation
- axe-core WCAG 2.2 AA regression checks plus a manual-review checklist
- Static performance budgets, scheduled deployed-site checks, npm audit, and Dependabot
- Fillable, locally completed patient-history PDF; no website submission

## Local development

```bash
npm ci
npm run dev
```

Open `http://localhost:4321`.

The normal Astro development server keeps the administrative form in preview mode. See `docs/release-13-administrative-inquiry.md` for optional Cloudflare Pages Function testing with local runtime values.

## Test and build

```bash
npm run test:unit
npm run build
npx playwright install --with-deps chromium firefox webkit
npx playwright install chrome msedge
npm run test:e2e
npm run test:compat
```

`npm run build` validates inquiry configuration, editable content, launch readiness, production-candidate safety, responsive image generation, the patient PDF, and static performance budgets.

The compatibility suite provides browser-engine and emulation evidence. It does not replace the physical iOS, Android, macOS, and Windows checks recorded in `docs/release-14-production-candidate.md`.

## Cloudflare Pages preview

Use these project settings:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22`

The `functions/` directory deploys the same-origin `/api/administrative-inquiry` route. `public/_routes.json` limits Function invocation to `/api/*`, so ordinary static page requests remain static.

Do not connect `donovanfamilydentistry.com` or `www.donovanfamilydentistry.com` during Release 14.

## Monitoring

- CI uses the committed npm lockfile and runs dependency review, npm audit, unit, build, performance, browser, compatibility, metadata, link, PDF, and accessibility checks on pull requests and `main`.
- **Production candidate monitor** runs daily and can be dispatched manually for another Pages URL using `SITE_URL`.
- Dependabot checks npm dependencies weekly.
- Monitoring never submits the administrative form and must not include visitor messages, completed patient forms, or patient information in issues or artifacts.

See `docs/release-14-production-candidate.md` for the browser matrix, WCAG checklist, performance budgets, public-language review, monitoring procedure, and rollback steps.

## Owner editing

Pages CMS reads `.pages.yml` and provides protected editors for practice details, hours, announcements, services, profiles, images, and PDF forms. See `docs/owner-editing-guide.md`.

Office editors do not manage Turnstile secrets, Basin endpoints, Cloudflare rate limits, production activation flags, indexing controls, or DNS. Those remain administrator-owned settings.

## Content provenance

Initial text comes from the existing public website, the supplied website screenshot, and owner-provided corrections. See `docs/content-inventory.md` and `docs/owner-review.md`.
