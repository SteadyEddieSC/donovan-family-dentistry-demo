# Donovan Family Dentistry demo

Private demonstration website for Donovan Family Dentistry in Beaufort, South Carolina.

## Safety boundary

This repository is for the temporary owner-review demo. It does not modify or connect the production domain, DNS, existing email service, scheduling system, patient portal, analytics account, or payment service.

The Contact page contains a non-PHI administrative-request experience. It remains a local-only preview by default. A same-origin Cloudflare Pages Function is included for eventual activation, but it fails closed unless the office-owned Basin endpoint, Turnstile secret, allowed origins, notification recipient, retention procedure, response owner, and rate-limiting control are configured. Medical and dental history is not submitted through the website.

## Stack

- Astro 7 with static HTML output
- Cloudflare Pages Function for the optional protected administrative-request endpoint
- TypeScript-aware Astro components
- Pages CMS configuration in `.pages.yml`
- Cloudflare Pages-compatible build
- Node unit tests for the serverless request handler
- Playwright browser tests and axe-core accessibility checks
- Fillable, locally completed patient-history PDF; no website submission

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

The normal Astro development server keeps the administrative form in preview mode. See `docs/release-13-administrative-inquiry.md` for optional Cloudflare Pages Function testing with local runtime values.

## Test and build

```bash
npm run test:unit
npm run build
npx playwright install chromium
npm run test:e2e
```

## Cloudflare Pages preview

Use these project settings:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22`

The `functions/` directory deploys the same-origin `/api/administrative-inquiry` route. `public/_routes.json` limits Function invocation to `/api/*`, so ordinary static page requests do not consume the Functions allowance.

Do not connect `donovanfamilydentistry.com` or `www.donovanfamilydentistry.com` during the demo stage.

## Owner editing

Pages CMS reads `.pages.yml` and provides protected editors for practice details, hours, announcements, services, profiles, images, and PDF forms. See `docs/owner-editing-guide.md`.

Office editors do not manage Turnstile secrets, Basin endpoints, Cloudflare rate limits, or production activation flags. Those remain administrator-owned settings.

## Content provenance

Initial text comes from the existing public website, the supplied website screenshot, and owner-provided corrections. See `docs/content-inventory.md` and `docs/owner-review.md`.
