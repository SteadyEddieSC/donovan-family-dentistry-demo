# Donovan Family Dentistry demo

Private, static demonstration website for Donovan Family Dentistry in Beaufort, South Carolina.

## Safety boundary

This repository is for the temporary owner-review demo. It does not modify or connect the production domain, DNS, email, hosting, scheduling, patient portal, or analytics. The website does not collect patient information and does not include a public contact form.

## Stack

- Astro 7 with static HTML output
- TypeScript-aware Astro components
- Pages CMS configuration in `.pages.yml`
- Cloudflare Pages-compatible build
- Playwright browser tests and axe-core accessibility checks
- Fillable, locally completed patient-history PDF; no website submission

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Test and build

```bash
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

Do not connect `donovanfamilydentistry.com` or `www.donovanfamilydentistry.com` during the demo stage.

## Owner editing

Pages CMS reads `.pages.yml` and provides protected editors for practice details, hours, announcements, services, profiles, images, and PDF forms. See `docs/owner-editing-guide.md`.

## Content provenance

Initial text comes from the existing public website, the supplied website screenshot, and owner-provided corrections. See `docs/content-inventory.md` and `docs/owner-review.md`.
