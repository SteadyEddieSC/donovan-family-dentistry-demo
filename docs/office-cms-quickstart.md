# Donovan Family Dentistry website editor quick start

## Editor link

Open **Pages CMS** at:

https://app.pagescms.org/

The hosted Pages CMS service is free. It edits approved website files in GitHub and does not maintain a separate copy of the website content.

## Current status

The repository-side editor configuration is ready:

- `.pages.yml` defines the office editing screens;
- the editable JSON files, image folder, and PDF folder are present;
- the **Build and verify website** action is connected to `.github/workflows/office-site-check.yml`;
- every normal build checks content, launch safeguards, images, PDFs, links, browsers, mobile layouts, performance, and automated accessibility rules;
- Cloudflare Pages rebuilds after a successful save to `main`.

The CMS is not yet considered operationally accepted. An authorized owner must complete the first-time access and acceptance exercise below.

## First-time access

1. Sign in at Pages CMS with the GitHub account that owns or is authorized to administer `SteadyEddieSC/donovan-family-dentistry-demo`.
2. Install or authorize the Pages CMS GitHub App for this private repository. A user who can edit files but cannot administer GitHub App installations may need the `SteadyEddieSC` account owner to approve this step.
3. Open **donovan-family-dentistry-demo**.
4. Select the **main** branch for normal office changes.
5. Confirm that these four areas appear:
   - Quick updates
   - Modern page wording
   - Dentists and team
   - Services and patient forms
6. Do not enter patient information, completed forms, insurance cards, identification, clinical details, or credentials into Pages CMS or GitHub.

## Acceptance exercise

Complete this once before relying on the editor:

1. Open **Quick updates** and find the homepage announcement.
2. Keep **Show announcement** turned off.
3. Add a harmless temporary sentence to the hidden announcement text and save.
4. Confirm that a GitHub commit appears on `main`.
5. Run **Build and verify website** from the Pages CMS actions menu.
6. Confirm the workflow finishes successfully.
7. Confirm Cloudflare Pages creates a new deployment from the same commit.
8. Open the deployed website on a phone and desktop browser.
9. Restore the prior hidden announcement text and save again.
10. Confirm the restoration commit, website check, and Cloudflare deployment also succeed.

Record the tester, date, GitHub commit links, workflow run, Cloudflare deployment, and result in the Release 16 evidence.

## Normal editing process

1. Open the relevant section.
2. Change only the fields that need updating.
3. Use the visibility switches to hide outdated providers, services, forms, or announcements before replacing them.
4. Save the change.
5. Run **Build and verify website**.
6. Review the resulting Cloudflare deployment on both a phone and desktop.
7. Keep the item hidden and contact the website administrator when the check fails or the result is uncertain.

## What office editors can change

- practice name, phone, address, hours, homepage wording, office image, logo, announcement, and search-preview text;
- About, Team, and Services page wording;
- dentist biographies, photographs, credentials, order, and visibility after approval;
- role-based staff descriptions;
- service names, groups, order, and visibility;
- downloadable blank patient PDFs.

## What office editors must not change

Pages CMS is not the control plane for:

- DNS, registrar, nameservers, MX, SPF, DKIM, DMARC, or autodiscover;
- Cloudflare production-mode, indexing, analytics, rate-limit, Turnstile-secret, or Basin-secret settings;
- Microsoft 365, patient portals, scheduling, payment, texting, or practice-management systems;
- completed patient paperwork or any protected health information.

## Recovery

Every save is a GitHub commit. A failed build does not replace the last successful Cloudflare deployment.

For a wording error, restore the prior field value and save. For a larger problem, the website administrator can revert the responsible GitHub commit or redeploy the last green `main` deployment. Domain rollback is a separate administrator procedure and is not performed through Pages CMS.
