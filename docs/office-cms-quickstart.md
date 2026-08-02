# Donovan Family Dentistry website editor quick start

## Editor link

Open **Pages CMS** at:

https://app.pagescms.org/

The hosted Pages CMS service is free. It edits approved website files in GitHub and does not maintain a separate copy of the website content.

## Current status

The repository-side editor configuration is ready, and the owner acceptance test has now proved that:

- the authorized owner can open the private repository in Pages CMS;
- the office editing screens render;
- a harmless edit to `src/data/site.json` can be saved to `main`;
- the save creates an `office update:` GitHub commit;
- Cloudflare Pages deploys the saved main-branch commit.

The remaining acceptance proof is a successful **Build and verify website** run and a demonstrated restoration.

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

## Save versus Build and verify website

### Save

Selecting **Save** writes the edited file to GitHub and creates a commit. On `main`, that commit automatically starts the normal GitHub checks and a Cloudflare Pages deployment.

### Build and verify website

Selecting **Build and verify website** manually starts the exhaustive office-site-check workflow against the branch that is already saved. It does not save content, undo content, or deploy a different version. It runs dependency, unit, build, browser, compatibility, link, form, mobile, metadata, performance, and automated accessibility checks and stores a temporary build artifact.

The normal sequence is:

1. edit;
2. Save;
3. confirm the GitHub commit and Cloudflare deployment;
4. run Build and verify website;
5. review the same commit on phone and desktop.

## Acceptance exercise

Complete this once before relying on the editor:

1. Open **Quick updates** and find the homepage introduction or hidden announcement.
2. Make a harmless temporary wording change while keeping any announcement hidden.
3. Save.
4. Confirm that a GitHub `office update:` commit appears on `main`.
5. Confirm Cloudflare Pages creates a deployment from that commit.
6. Run **Build and verify website** from the Pages CMS actions menu.
7. Confirm the workflow finishes successfully.
8. Open the deployed website on a phone and desktop browser.
9. Restore the prior wording using one of the recovery methods below.
10. Confirm the restoration commit, Cloudflare deployment, and phone/desktop result.

Record the tester, date, GitHub commit links, workflow run, Cloudflare deployment, recovery method, and result in the launch evidence.

## Restore an office edit

### Preferred: edit the value back and save

1. Open the same Pages CMS entry.
2. Restore the prior value.
3. Save.
4. Confirm the corrective `office update:` commit and Cloudflare deployment.
5. Review the restored page.

### One-click GitHub workflow: Restore latest office save

Use this only when the mistaken Pages CMS save is still the newest commit on `main`.

1. Open the GitHub repository.
2. On mobile, choose **More → Actions**. On desktop, choose **Actions**.
3. Select **Restore latest office save**.
4. Select **Run workflow**.
5. Choose **main** and select the green **Run workflow** button.
6. Wait for the workflow to complete.
7. Confirm the new revert commit and Cloudflare deployment.
8. Review the restored page on phone and desktop.

The workflow stops without changing anything if the latest commit is not an `office update:` commit or if it changed an unexpected file. There is no ordinary direct-commit Revert button in the GitHub mobile commit view; the web Revert button is generally associated with merged pull requests.

## Normal editing process

1. Open the relevant section.
2. Change only the fields that need updating.
3. Use the visibility switches to hide outdated providers, services, forms, or announcements before replacing them.
4. Save the change.
5. Confirm the GitHub commit and Cloudflare deployment.
6. Run **Build and verify website**.
7. Review the resulting deployment on both a phone and desktop.
8. Keep the item hidden and contact the website administrator when the check fails or the result is uncertain.

## Publish or remove the site-wide announcement

1. Open **Quick updates → Contact, hours, homepage, and announcement**.
2. Enter one short practice-wide notice under **Homepage announcement**.
3. Use the banner for closures, storms, holiday hours, phone outages, or temporary arrival instructions—not individual patient information.
4. Turn on **Show announcement** and save.
5. Confirm the commit and Cloudflare deployment.
6. Review the banner on a phone and desktop across a modern page, a classic page, and an interior page.
7. Run **Build and verify website**.
8. When the notice expires, turn off **Show announcement**, save, and verify that it disappears everywhere.

Do not include patient names, appointment details, balances, insurance matters, symptoms, diagnoses, treatment information, or other protected health information. See `docs/office-announcement-guide.md` for detailed revision, removal, and emergency rollback steps.

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

## Recovery boundary

Every save is a GitHub commit. A failed build does not replace the last successful Cloudflare deployment.

For a wording error, restore the prior field value and save. For the immediately preceding safe office save, use **Restore latest office save**. For an older, multi-commit, code, configuration, or conflicted problem, the website administrator must create a corrective/revert pull request or redeploy the last green deployment. Domain rollback is a separate administrator procedure and is not performed through Pages CMS.
