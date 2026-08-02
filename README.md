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
- Node unit tests for serverless, launch, CMS, tool-readiness, owner-recovery, backup, and domain-inventory logic
- Playwright coverage for Chromium, branded Chrome and Edge, Firefox, WebKit, Android Chrome emulation, and iOS Safari emulation
- axe-core WCAG 2.2 AA regression checks plus a manual-review checklist
- Static performance budgets, scheduled deployed-site checks, npm audit, and Dependabot
- Manual public DNS, TLS, and HTTP inventory workflow that never edits records
- Guarded **Restore latest office save** workflow for the most recent safe Pages CMS commit
- Read-only **Create office content backup** workflow for downloadable CMS-managed snapshots
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

Repository-side configuration is ready. The owner acceptance test proved that an authorized owner can open the private repository, edit `src/data/site.json`, save a real commit to `main`, and trigger a Cloudflare Pages deployment. The remaining acceptance evidence is the full website-check result and a demonstrated restoration.

### Save versus Build and verify website

These are separate operations:

1. **Save in Pages CMS** writes the edited file directly to GitHub and creates a commit such as `office update: revise site.json`.
2. When the selected branch is `main`, that new commit automatically starts the normal GitHub checks and a Cloudflare Pages deployment.
3. **Build and verify website** is an optional manual GitHub Actions button. It does not save content, undo content, or deploy a different version. It checks the already-saved branch with the locked dependency, unit, build, browser, compatibility, link, form, mobile, metadata, performance, and automated accessibility tests and stores a temporary build artifact.
4. Therefore the normal owner sequence is: **edit → Save → wait for deployment → run Build and verify website for the full acceptance check → review the same commit on phone and desktop**.

Pages CMS is only the editing layer. GitHub stores the files and history; Cloudflare Pages builds and hosts the site. Pages CMS does not maintain a separate content database.

### Restore or roll back an office save

GitHub mobile and the ordinary commit page do not provide a general **Revert** button for a direct Pages CMS commit. GitHub's web **Revert** button applies to a merged pull request, which is why it is not visible on the direct `office update:` commit.

Use the first method that fits the situation:

#### Method 1 — edit the field back in Pages CMS

Use this for a wording, hours, announcement, provider, service, image-selection, or similar mistake.

1. Open the same Pages CMS entry and branch.
2. Restore the prior value manually.
3. Select **Save**.
4. Confirm a new `office update:` commit appears on `main`.
5. Confirm Cloudflare deploys the corrective commit.
6. Review the page on phone and desktop.

This is the simplest and preferred owner recovery method.

#### Method 2 — use the guarded GitHub rollback workflow

Use this immediately after the mistaken save when that `office update:` commit is still the newest commit on `main`.

1. Open this repository in GitHub.
2. On mobile, open **More** and then **Actions**. On desktop, select the **Actions** tab.
3. Select **Restore latest office save** in the workflow list.
4. Select **Run workflow**.
5. Confirm the branch is **main**.
6. Select the green **Run workflow** button.
7. Wait for the workflow to finish successfully.
8. Open the new revert commit and the matching Cloudflare deployment.
9. Confirm the prior content is restored on phone and desktop.

The workflow refuses to change `main` unless the newest commit begins with `office update:` and changes only approved office-managed data, images, or blank PDF paths. It creates a new revert commit; it does not erase history. If a release or another commit has landed after the mistaken save, the workflow stops without changing anything and the website administrator must restore the intended values manually.

#### Method 3 — administrator recovery

For a code release, multiple related commits, merge conflict, or older mistake, the website administrator should create a normal revert or corrective pull request, or redeploy the last green Cloudflare deployment. Do not reset or force-push shared `main` history.

### Create an office content backup

Use the manual **Create office content backup** action before a large Pages CMS edit, image replacement, or form update.

1. Open the repository in GitHub.
2. On mobile, choose **More → Actions**. On desktop, choose **Actions**.
3. Select **Create office content backup**.
4. Select **Run workflow**, confirm `main`, and run it.
5. Open the completed run and download the `office-content-backup-<run number>` artifact within 30 days.

The action is read-only. It does not save content, does not deploy the website, and does not roll back a change. It packages the current public CMS-managed data, images, blank forms, manifest, and checksums for administrator-assisted comparison or recovery. It must never contain completed forms, messages, credentials, patient records, or protected health information.

See `docs/office-content-backup.md` for detailed phone, desktop, verification, and restoration instructions.

See:

- `docs/office-cms-quickstart.md` for the exact first-time and routine process;
- `docs/owner-editing-guide.md` for editing, verification, and recovery rules;
- `docs/office-content-backup.md` for the read-only backup workflow;
- `docs/release-16-cms-cutover-tool-readiness.md` for CMS status, cutover blockers, and tool-enablement choices;
- `docs/release-16-1-owner-polish.md` for the owner-test findings and mobile recovery release; and
- `docs/release-16-2-logo-backup.md` for the canonical sign logo and backup action.

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

Do not connect `donovanfamilydentistry.com` or `www.donovanfamilydentistry.com`, remove `noindex`, enable analytics, or enable live inquiry delivery during Release 16.x.

## Monitoring

- CI uses the committed npm lockfile and runs dependency review, npm audit, unit, build, performance, browser, compatibility, metadata, link, PDF, accessibility, CMS, tool-readiness, owner-recovery, backup, and launch checks on pull requests and `main`.
- **Production candidate monitor** runs daily and can be dispatched manually for another Pages URL using `SITE_URL`.
- **Domain readiness inventory** is manually dispatched for a public infrastructure snapshot.
- **Restore latest office save** is manual, guarded, and limited to the newest safe `office update:` commit on `main`.
- **Create office content backup** is manual, read-only, and retains a downloadable artifact for 30 days.
- Dependabot checks npm dependencies weekly.
- Monitoring and backup workflows never submit the administrative form and must not include visitor messages, completed patient forms, credentials, private mailbox details, or patient information in issues or artifacts.

## Release documents

- `docs/release-14-production-candidate.md` — browser, accessibility, performance, metadata, and monitoring controls.
- `docs/release-15-launch-readiness.md` — current-site reconciliation, launch evidence, domain inventory, cutover prerequisites, and rollback thresholds.
- `docs/release-16-cms-cutover-tool-readiness.md` — CMS acceptance, legacy-hosting findings, remaining blockers, and optional tool decisions.
- `docs/release-16-1-owner-polish.md` — CMS save/recovery clarification and mobile polish.
- `docs/release-16-2-logo-backup.md` — self-protected oval sign logo and read-only office content backup.
- `docs/roadmap.md` — Release 17 production-domain cutover and optional later patient-system work.

## Content provenance

Initial text comes from the existing public website, the supplied website screenshot, and owner-provided corrections. The current public two-dentist roster remains an unresolved replacement-site decision rather than being silently omitted or republished. The modern oval logo is a clean true-SVG reconstruction of the owner-supplied sign reference; the uploaded checkerboard-backed raster was used only as visual direction and was not committed as a transparent source asset. See `docs/content-inventory.md`, `docs/owner-review.md`, and the release documents above.
