# Donovan Family Dentistry — ownership handoff readiness

Status: **PREPARATION ONLY — NO CUTOVER AUTHORIZATION**

Owning issue: #65 `HANDOFF-001 — Transfer production site to Donovan-owned GitHub + Cloudflare and retire this repo`

This document is the customer-readable repository-side handoff inventory for the eventual move to Donovan-controlled GitHub and Cloudflare. It intentionally contains no credentials, secret values, private DNS-zone exports, mailbox contents, patient information, completed forms, or other protected/private data.

## 1. How to use this document

At transfer time, refresh every item marked **VERIFY AT TRANSFER** against live GitHub, Cloudflare, registrar/DNS, and office-owned service state. Repository history is useful evidence, but live provider state is authoritative for account ownership, secrets, DNS, billing, MFA/recovery, and deployment configuration.

Do not use this document as permission to start the transfer. #65 remains the owner gate for activation and cutover.

## 2. Repository-side baseline

Snapshot prepared from `main` at:

`24d6aec65cfb51cf66c1c2b934b978d7e5950b1f`

Refresh the accepted production `main` SHA immediately before handoff.

Repository-observed stack:

- Astro static site;
- Node pinned by `.node-version` (`22.23.4` at this snapshot);
- committed npm lockfile;
- Cloudflare Pages build contract: `npm run build` -> `dist`;
- same-origin Cloudflare Pages Function under `/api/administrative-inquiry` for the optional protected administrative inquiry flow;
- Pages CMS configuration in `.pages.yml`;
- Playwright browser/compatibility coverage and axe accessibility checks;
- GitHub Actions for CI, security, monitoring, domain inventory, office verification, office backup, and guarded rollback.

### Live-site observation

On 2026-10-28, the public canonical site at `https://donovanfamilydentistry.com/` was reachable and served the current Classic Donovan Family Dentistry experience, including the public About, Services, Patient Forms, and Contact/Directions navigation.

That observation proves public reachability/content only. It does **not** prove which Cloudflare account owns the project, which DNS account is authoritative, what provider-side variables are configured, or who controls account recovery.

### Documentation drift status

Current operator-facing status wording has been reconciled so it no longer presents the already-completed production launch as future work:

- `README.md` and `docs/cloudflare-pages.md` identify Classic as the maintained public production experience and preserve the Modern/private-review noindex boundaries;
- `docs/roadmap.md` identifies the August 13, 2026 governed production-domain cutover as completed and points to the durable cutover evidence rather than instructing a future operator to repeat it.

Older release-era documents intentionally retain the planning and execution language that was accurate when those releases were prepared. Treat that material as **historical launch evidence**, not as current provider-state proof or current permission to change DNS, indexing, domains, hosting, or account ownership. Live provider state plus current operator documentation is authoritative.

Before handoff, perform one final documentation sweep for any newly introduced current-state contradictions, but do not rewrite historical evidence merely to remove old launch wording.

## 3. GitHub handoff inventory

### Repository and history

- Current source repository: `SteadyEddieSC/donovan-family-dentistry-demo`.
- Production branch: `main`.
- Transfer target: **VERIFY AT TRANSFER** — Donovan-owned user or organization selected by the customer.
- Preserve full history unless the owner deliberately chooses an import method with a documented reason not to.
- Capture a final repository backup/export immediately before ownership migration.
- Preserve release/tag history that remains useful for rollback or provenance.

### Runtime/toolchain files that should transfer

- `.node-version`
- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `.pages.yml`
- `functions/`
- `public/`
- `src/`
- `scripts/`
- `tests/`
- Playwright configuration files
- `docs/`
- security/configuration files under `.github/`

### GitHub Actions inventory

Current repository workflows include:

| Workflow | Purpose | Handoff disposition |
| --- | --- | --- |
| `ci.yml` | Locked install, application/build/test verification | **KEEP** |
| `codeql.yml` | CodeQL analysis | **KEEP** |
| `security.yml` | Dependency/security baseline | **KEEP** |
| `production-candidate-monitor.yml` | Scheduled deployed-site + dependency health check | **KEEP**, re-verify schedule/permissions |
| `domain-readiness-inventory.yml` | Public-only DNS/TLS/HTTP inventory | **KEEP** as diagnostic |
| `office-site-check.yml` | Office-triggered full website verification | **KEEP** |
| `office-content-backup.yml` | Read-only CMS-managed content backup | **KEEP** |
| `office-rollback.yml` | Guarded restore of newest safe office content save | **KEEP**, retest under Donovan identity |
| `repository-keepalive.yml` | Prevent scheduled-workflow inactivity on the current repo | **REASSESS** after transfer; retire if no longer needed |

At transfer time verify each workflow still has the least permissions required and that no workflow relies on an Eddie/LDW-owned token, runner, secret, or external account.

### Repository settings — VERIFY AT TRANSFER

Record the receiving settings privately or in customer-owned administration notes:

- default branch;
- branch/ruleset protections;
- Actions permissions;
- Dependabot/security settings;
- required checks;
- merge policy;
- Pages CMS/GitHub authorization identities;
- repository administrators and recovery contacts;
- repository variables/secrets **by name and purpose only** in any shareable runbook.

Do not copy secret values into Git history or an issue.

## 4. Office content-editing and recovery path

Pages CMS is the editing layer; GitHub stores the source/content/history; Cloudflare builds and hosts the website. There is no separate Pages CMS content database to migrate.

`.pages.yml` currently exposes guarded editing for office-managed content including:

- practice/contact details, hours, homepage copy, and announcements;
- dentist profiles;
- services;
- website images;
- blank patient PDF forms.

Current owner workflow to preserve:

1. authorized office user edits in Pages CMS;
2. Pages CMS writes an `office update:` commit to GitHub;
3. `main` triggers normal verification/deployment behavior;
4. office can run **Build and verify website**;
5. safe content can be restored through Pages CMS or the guarded **Restore latest office save** workflow;
6. **Create office content backup** can create a read-only downloadable snapshot before large content changes.

### Required handoff acceptance proof

Under Donovan-controlled identities, demonstrate all of the following before retiring the old repo:

- authorized office user can open Pages CMS;
- user can make a harmless synthetic/test content edit;
- the edit lands in the Donovan-owned GitHub repository;
- the corresponding Donovan-owned Cloudflare deployment succeeds;
- the exact commit is visible on the intended production/preview URL;
- website verification action succeeds;
- rollback/recovery is demonstrated;
- backup artifact creation and retrieval is demonstrated;
- no Eddie/LDW credential is required for the normal path.

Never use patient information for this acceptance test.

## 5. Cloudflare handoff inventory

Repository-declared deployment contract:

- production branch: `main`;
- root directory: repository root;
- build command: `npm run build`;
- output directory: `dist`;
- Node version: use the repo pin from `.node-version` rather than an ambiguous major-only selection;
- Pages Function routes: repository `functions/` plus `public/_routes.json` controls;
- canonical public site currently observed at `https://donovanfamilydentistry.com/`.

### Provider-side facts — VERIFY AT TRANSFER

Capture these from the live Cloudflare account before cutover; do not infer them from Git:

- current Pages/Workers project name and account owner;
- production and preview branch configuration;
- custom domains attached to the project;
- environment separation and current variables/secrets;
- DNS zone ownership and complete authoritative export;
- proxy state and record-level configuration;
- redirects/rules/security-header dependencies not expressed in source;
- TLS/SSL mode and certificate state;
- analytics/monitoring configuration;
- rate-limiting rule state;
- least-privilege deployment token/API configuration, if any;
- billing owner;
- MFA/recovery owners;
- rollback target / last known green deployment.

Mail and non-web DNS must be preserved. Do not edit mail-related records as a side effect of website transfer.

## 6. Variable, secret, and binding names

The following names are present in repository examples/documentation. They are an inventory of **names/purposes**, not proof that a value is currently enabled in production.

### Static/public build values

| Name | Purpose |
| --- | --- |
| `PUBLIC_ADMIN_INQUIRY_ENABLED` | Build-time feature gate for the administrative inquiry experience |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public Turnstile site key; public by design |
| `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | Public Cloudflare Web Analytics token when analytics is enabled |

### Runtime secrets

| Name | Purpose |
| --- | --- |
| `BASIN_FORM_ENDPOINT` | Office-owned Basin administrative form endpoint |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile verification secret |

### Runtime variables / optional controls

| Name | Purpose |
| --- | --- |
| `ADMIN_INQUIRY_ALLOWED_ORIGINS` | Exact allowed origins for the administrative endpoint |
| `ADMIN_INQUIRY_PUBLIC_ORIGIN` | Origin forwarded for upstream allowed-domain validation |
| `ADMIN_INQUIRY_MIN_FORM_AGE_MS` | Optional minimum form-age override |
| `ADMIN_INQUIRY_MAX_FORM_AGE_MS` | Optional maximum form-age override |
| `ADMIN_INQUIRY_RATE_LIMITER` | Optional Cloudflare runtime rate-limiter binding |

At transfer time verify whether the administrative inquiry and analytics are actually enabled. Do not create missing services merely because the source contains optional support for them.

## 7. External dependency inventory

Verify only services actually in use when transfer is activated.

### Required/current operating dependencies

- Donovan-controlled domain/registrar ownership for `donovanfamilydentistry.com`;
- authoritative DNS zone and all non-web/mail records;
- GitHub repository and Actions;
- Cloudflare website hosting;
- Pages CMS authorization for office editors;
- public website assets and downloadable blank forms stored with the repository.

### Optional / feature-dependent dependencies

- Cloudflare Turnstile;
- Basin administrative form delivery;
- Cloudflare Web Analytics;
- Cloudflare rate-limiting rule/binding;
- Search Console or other search ownership tooling.

For every enabled external service record:

- customer/account owner;
- administrator(s);
- MFA/recovery status;
- billing owner if applicable;
- purpose;
- configuration location;
- rotation/recovery process;
- removal condition if the service is later retired.

Keep private account data outside this public repository.

## 8. Transfer activation checklist

Do not start this sequence until #65 is explicitly activated and the customer-controlled identities/accounts exist.

- [ ] Re-read #65 and current live production state.
- [ ] Freeze/record the final accepted production `main` SHA.
- [ ] Confirm no source writer/deployment/customer content change is in flight.
- [ ] Capture final repo backup/export.
- [ ] Capture authoritative DNS/Cloudflare configuration privately.
- [ ] Confirm Donovan-owned GitHub destination, admins, MFA, and recovery.
- [ ] Confirm Donovan-owned Cloudflare account, admins, MFA, recovery, and billing owner.
- [ ] Transfer or import full repository history.
- [ ] Recreate repository settings/rulesets/security controls.
- [ ] Recreate required variables/secrets using least privilege; never move them through Git.
- [ ] Recreate Cloudflare project from the accepted source.
- [ ] Prove preview build before changing the production web path.
- [ ] Reconcile apex, `www`, TLS, redirects, security headers, routes, PDFs/forms, 404s, metadata/indexing, mobile/desktop behavior, and accessibility.
- [ ] Preserve mail/non-web DNS.
- [ ] Prove Pages CMS office edit, verify action, backup, and rollback under Donovan identity.
- [ ] Observe the Donovan-owned production path for the agreed bounded period.
- [ ] Remove obsolete Eddie/LDW deployment credentials/integrations.
- [ ] Confirm no production dependency still requires the old repository.
- [ ] Archive the old repository only after operational ownership is accepted.

## 9. Retirement checklist for this repository

After the Donovan-owned path is authoritative and the rollback/observation window is complete:

- replace the old repo README/status with a historical pointer to the new owner-controlled source if appropriate;
- disable scheduled production monitors on the historical copy;
- disable/retire keepalive automation;
- stop Dependabot/security update noise on the historical copy if the repo is archived;
- remove obsolete deploy integrations and credentials;
- retain only the history/evidence needed for provenance and recovery;
- verify no public/customer workflow still links to the old repository as production authority.

## 10. Safety boundary

The website and transfer process are not patient-record systems. Handoff artifacts must not contain:

- patient names tied to treatment/appointments;
- symptoms, diagnoses, medical/dental history, medications, insurance identifiers, or completed forms;
- administrative inquiry message bodies;
- mailbox contents;
- secret values/tokens/passwords;
- private DNS exports in public GitHub;
- MFA/recovery codes or private recovery contacts.

Use synthetic content for transfer testing and keep provider exports/credentials in the approved private customer-admin channel.

## 11. Completion criterion

The handoff is complete only when Donovan controls the GitHub source, Cloudflare production path, routine office editing, verification, backup, rollback, security maintenance, and account recovery without requiring Eddie/LDW for normal operation. Only then is this repository eligible to become a historical archived copy.
