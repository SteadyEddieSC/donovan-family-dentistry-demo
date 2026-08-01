# Donovan Family Dentistry launch candidate

Private launch-readiness website for Donovan Family Dentistry in Beaufort, South Carolina. The modern concept is the selected production design. The repository remains in private preview until the governed launch evidence and owner acceptance work are complete.

## Safety boundary

This repository does not modify the production domain, nameservers, DNS records, existing email service, scheduling system, patient portal, analytics account, payment service, or text-messaging service. Public indexing remains disabled.

The Contact page contains a non-PHI administrative-request experience. It remains preview-only by default. A same-origin Cloudflare Pages Function is included for eventual activation, but it fails closed unless the office-owned Basin endpoint, Turnstile secret, allowed origins, notification recipient, retention procedure, response owner, backup owner, and rate-limiting control are configured. Medical and dental history is not submitted through the website.

The provider roster, service wording, insurance/payment language, urgent-care workflow, inquiry launch decision, physical-device review, human accessibility review, Pages CMS acceptance, authoritative DNS backup, exact legacy-hosting details, mail/application preservation, rollback rehearsal, and change window remain documented launch evidence.

## Stack

- Astro 7 with static HTML output
- Cloudflare Pages hosting and preview deployments
- Cloudflare Pages Function for the optional protected administrative-request endpoint
- Pages CMS configuration in `.pages.yml`
- Sharp-generated responsive WebP images and a 1200×630 social card
- Node unit tests for serverless, launch, CMS, tool-readiness, and domain-inventory logic
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

`npm run build` validates inquiry configuration, editable content, launch readiness, production-candidate safety, the Release 15 launch-evidence register, the Release 16 CMS/tool-readiness register, responsive image generation, the patient PDF, and static performance budgets.

The compatibility suite provides browser-engine and emulation evidence. It does not replace the physical iOS, Android, macOS, and Windows checks or the human WCAG/PDF review recorded in `docs/release-15-launch-readiness.md`.

## Office website editor

Open the hosted Pages CMS editor at:

https://app.pagescms.org/

Pages CMS reads `.pages.yml` and provides protected editors for practice details, hours, announcements, page wording, services, profiles, images, and blank PDF forms.

Repository-side configuration is ready. Operational acceptance remains pending until an authorized owner completes a real save, the **Build and verify website** action, a matching Cloudflare deployment, and a recovery exercise.

See:

- `docs/office-cms-quickstart.md` for the exact first-time and routine process;
- `docs/owner-editing-guide.md` for editing rules and recovery guidance;
- `docs/release-16-cms-cutover-tool-readiness.md` for CMS status, cutover blockers, and tool-enablement choices.

Office editors do not manage Turnstile secrets, Basin endpoints, Cloudflare rate limits, production activation flags, indexing controls, DNS, registrar settings, mail records, or patient systems. Those remain administrator-owned settings.

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

Do not connect `donovanfamilydentistry.com` or `www.donovanfamilydentistry.com`, remove `noindex`, enable analytics, or enable live inquiry delivery during Release 16.

## Monitoring

- CI uses the committed npm lockfile and runs dependency review, npm audit, unit, build, performance, browser, compatibility, metadata, link, PDF, accessibility, CMS, tool-readiness, and launch checks on pull requests and `main`.
- **Production candidate monitor** runs daily and can be dispatched manually for another Pages URL using `SITE_URL`.
- **Domain readiness inventory** is manually dispatched for a public infrastructure snapshot.
- Dependabot checks npm dependencies weekly.
- Monitoring never submits the administrative form and must not include visitor messages, completed patient forms, credentials, private mailbox details, or patient information in issues or artifacts.

## Release documents

- `docs/release-14-production-candidate.md` — browser, accessibility, performance, metadata, and monitoring controls.
- `docs/release-15-launch-readiness.md` — current-site reconciliation, launch evidence, domain inventory, cutover prerequisites, and rollback thresholds.
- `docs/release-16-cms-cutover-tool-readiness.md` — CMS acceptance, legacy-hosting findings, remaining blockers, and optional tool decisions.
- `docs/roadmap.md` — Release 17 production-domain cutover and optional later patient-system work.

## Content provenance

Initial text comes from the existing public website, the supplied website screenshot, and owner-provided corrections. The current public two-dentist roster remains an unresolved replacement-site decision rather than being silently omitted or republished. See `docs/content-inventory.md`, `docs/owner-review.md`, and the release documents above.
