# Donovan Family Dentistry website editor quick start

## Editor link

Open **Pages CMS** at:

https://app.pagescms.org/

The hosted Pages CMS service is free. It edits approved website files in GitHub and does not maintain a separate copy of the website content.

## Current status

The repository-side editor configuration is ready, and the owner acceptance test has proved that an authorized owner can open the repository, save a safe office-content change, create an `office update:` GitHub commit, and trigger Cloudflare Pages.

The editor is intentionally limited to content that staff may reasonably need on the **current public Classic website**. Modern-only page wording and Modern-only role-based staff profiles are deliberately not exposed in the office editor so staff do not have to distinguish between the live Classic site and the hidden future-design demo.

Shared records such as office contact information, hours, dentist data, services, and patient PDFs may also appear in the hidden Modern demo because both designs read the same approved source data. Modern-specific design and wording changes remain a developer/administrator task in GitHub.

## First-time access

1. Sign in at Pages CMS with the GitHub account that owns or is authorized to administer `SteadyEddieSC/donovan-family-dentistry-demo`.
2. Install or authorize the Pages CMS GitHub App for this public repository. A user who can edit files but cannot administer GitHub App installations may need the repository owner to approve this step.
3. Open **donovan-family-dentistry-demo**.
4. Select the **main** branch for normal office changes.
5. Confirm that these three areas appear:
   - Current website quick updates
   - Dentist profiles
   - Services and patient forms
6. Do not enter patient information, completed forms, insurance cards, identification, clinical details, passwords, API keys, or other credentials into Pages CMS or GitHub.

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

1. Open **Current website quick updates** and find the homepage introduction or hidden announcement.
2. Make a harmless temporary wording change while keeping any announcement hidden.
3. Save.
4. Confirm that a GitHub `office update:` commit appears on `main`.
5. Confirm Cloudflare Pages creates a deployment from that commit.
6. Run **Build and verify website** from the Pages CMS actions menu.
7. Confirm the workflow finishes successfully.
8. Open the deployed website on a phone and desktop browser.
9. Restore the prior wording using one of the recovery methods below.
10. Confirm the restoration commit, Cloudflare deployment, and phone/desktop result.

Record the tester, date, GitHub commit links, workflow run, Cloudflare deployment, recovery method, and result in the maintenance record.

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

The workflow stops without changing anything if the latest commit is not an `office update:` commit or if it changed an unexpected file.

## Normal editing process

1. Open the relevant current-site section.
2. Change only the fields that need updating.
3. Use visibility switches to hide an outdated dentist, service, or form before replacing it when appropriate.
4. Save the change.
5. Confirm the GitHub commit and Cloudflare deployment.
6. Run **Build and verify website**.
7. Review the resulting deployment on both a phone and desktop.
8. Keep the item hidden and contact the website administrator when the check fails or the result is uncertain.

## Publish or remove the site-wide announcement

1. Open **Current website quick updates → Contact, hours, homepage, and announcement**.
2. Enter one short practice-wide notice under **Homepage announcement**.
3. Use the banner for closures, storms, holiday hours, phone outages, or temporary arrival instructions - not individual patient information.
4. Turn on **Show announcement** and save.
5. Confirm the commit and Cloudflare deployment.
6. Review the banner on a phone and desktop.
7. Run **Build and verify website**.
8. When the notice expires, turn off **Show announcement**, save, and verify that it disappears.

Do not include patient names, appointment details, balances, insurance matters, symptoms, diagnoses, treatment information, or other protected health information.

## What office editors can change

- practice name, phone, public email, address, hours, homepage wording, office image, logo, announcement, and search-preview text;
- approved dentist names, credentials, photographs, Classic biographies, order, and visibility;
- published service names, order, and visibility;
- downloadable blank patient PDFs.

Some shared data also feeds the hidden Modern demo. Staff do not need to manage that distinction; the office-facing editor hides Modern-only page wording and Modern-only staff-profile content.

## What office editors must not change

Pages CMS is not the control plane for:

- Modern-only page layouts, Modern-only wording, or Modern-only staff profiles;
- DNS, registrar, nameservers, MX, SPF, DKIM, DMARC, or autodiscover;
- Cloudflare production-mode, indexing, analytics, rate-limit, Turnstile-secret, or Basin-secret settings;
- Google Business Profile or Search Console permissions;
- patient portals, scheduling, payment, texting, or practice-management systems;
- completed patient paperwork or any protected health information.

## Patient PDF rule

The downloadable forms are **blank templates only**. They may be replaced with an office-approved blank PDF, but completed patient forms must never be uploaded to Pages CMS or GitHub.

For the current launch, the approved PDFs preserve the existing Donovan form artwork, wording, page count, and layout while adding invisible fillable text fields over the existing blank lines. The website should use one canonical copy of each PDF for both Classic and the hidden Modern demo.

## Recovery boundary

Every save is a GitHub commit. A failed build does not replace the last successful Cloudflare deployment.

For a wording error, restore the prior field value and save. For the immediately preceding safe office save, use **Restore latest office save**. For an older, multi-commit, code, configuration, or conflicted problem, the website administrator must create a corrective/revert pull request or redeploy the last green deployment. Domain rollback is a separate administrator procedure and is not performed through Pages CMS.

## If something looks wrong

Stop editing and contact the website administrator if a check fails, the deployed page does not match the saved commit, the wrong branch is selected, or the intended prior value is unclear. Send the page URL and GitHub commit or workflow-run link; do not send patient information, passwords, credentials, or secrets.
