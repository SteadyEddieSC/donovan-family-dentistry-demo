# Office website editor guide

Routine website updates are designed to be completed in Pages CMS without editing code, installing software, or using the command line.

## Editor link

Open Pages CMS at:

https://app.pagescms.org/

Use `docs/office-cms-quickstart.md` for the first-time authorization and acceptance exercise. The owner acceptance test has now proved that an authorized owner can open the private repository, edit `src/data/site.json`, save a direct commit to `main`, and trigger the Cloudflare Pages deployment. The remaining acceptance evidence is the full website-check result and a demonstrated restoration.

## First-time access

1. Sign in with the GitHub account that owns or is authorized to administer `SteadyEddieSC/donovan-family-dentistry-demo`.
2. Install or authorize the Pages CMS GitHub App for this private repository. The `SteadyEddieSC` account owner may need to approve the installation.
3. Open `donovan-family-dentistry-demo`.
4. Choose the `main` branch for normal office updates.
5. Confirm these four editing areas appear:
   - **Quick updates**
   - **Modern page wording**
   - **Dentists and team**
   - **Services and patient forms**

## What Save does

**Save** is the step that changes the website source.

1. Pages CMS writes the edited content or media file directly to the selected GitHub branch.
2. GitHub records the change as a commit such as `office update: revise site.json`.
3. When the branch is `main`, the commit starts the repository's normal automated checks and a Cloudflare Pages deployment.
4. When the branch is not `main`, Cloudflare normally creates a branch preview instead of replacing the main candidate.

Pages CMS has no separate content database. The GitHub file and commit are the saved record.

## What Build and verify website does

**Build and verify website** is an optional manual test action. It does not save a field, undo a field, or create a different deployment.

It checks the already-saved branch with:

- locked dependency installation and high-severity dependency review;
- serverless administrative-request unit tests;
- editable-content and launch-safety validation;
- responsive-image, blank-PDF, and performance-budget checks;
- browser, mobile, link, form, metadata, and automated accessibility checks;
- the Chrome, Edge, Firefox, WebKit, Android-emulation, and iOS-emulation compatibility matrix.

It also stores a temporary copy of the successfully built site as a GitHub Actions artifact.

The normal sequence is:

1. edit the intended field;
2. select **Save**;
3. confirm the `office update:` commit and Cloudflare deployment;
4. run **Build and verify website** for the complete acceptance check;
5. review the same saved version on phone and desktop.

## Normal update process

1. Open the section that needs to change.
2. Edit only the relevant fields.
3. Use **Show profile**, **Show service**, or **Show announcement** to control whether an item appears publicly.
4. Save the change.
5. Confirm the new `office update:` commit appears in GitHub.
6. Wait for the Cloudflare deployment for the same commit.
7. Choose **Build and verify website** from the editor actions for the full validation run.
8. Wait for the check to finish successfully.
9. Open the matching Cloudflare Pages deployment and review the changed page on both a phone and desktop browser.
10. Keep uncertain or unapproved content hidden until the office owner or website administrator approves it.

A failed build does not replace the last successful deployment.

## Restore or roll back an office edit

There is no ordinary **Revert** button on the GitHub mobile commit page for a direct Pages CMS save. GitHub's web Revert button is normally attached to a merged pull request, not an individual direct commit.

### Method 1 — edit the value back and save again

This is the preferred method for a wording, hours, announcement, provider, service, image-selection, or similar mistake.

1. Open the same Pages CMS entry and branch.
2. Restore the prior value manually.
3. Select **Save**.
4. Confirm a new `office update:` commit appears on `main`.
5. Confirm Cloudflare deploys that corrective commit.
6. Review the page on phone and desktop.

This preserves a clear record: the first commit made the mistake and the next commit corrected it.

### Method 2 — use Restore latest office save in GitHub Actions

Use this immediately after the mistaken Pages CMS save when it is still the newest commit on `main`.

1. Open `SteadyEddieSC/donovan-family-dentistry-demo` in GitHub.
2. On a phone, select **More** and then **Actions**. On desktop, select **Actions** directly.
3. Select the workflow named **Restore latest office save**.
4. Select **Run workflow**.
5. Confirm the selected branch is **main**.
6. Select the green **Run workflow** button.
7. Wait for the workflow to complete successfully.
8. Open the new revert commit created by `github-actions[bot]`.
9. Confirm Cloudflare deploys the new `main` commit.
10. Review the restored page on phone and desktop.

The workflow is intentionally fail-closed. It changes nothing unless:

- the newest `main` commit message starts with `office update:`; and
- every changed file is an approved office-managed data, website-image, or blank-PDF path.

It creates a new revert commit and does not erase history. If a release or another commit has landed after the mistaken office save, it stops without changing anything.

### Method 3 — administrator recovery

Contact the website administrator when:

- the mistaken commit is not the newest commit on `main`;
- several commits must be undone together;
- the change involved code, configuration, DNS, secrets, or a production release;
- the rollback workflow rejects an unexpected path;
- GitHub reports a conflict; or
- the desired version is not clear.

The administrator should create a corrective or revert pull request or redeploy the last green Cloudflare deployment. Do not reset or force-push shared `main` history.

## Built-in protections

The editor and build pipeline reject common mistakes before they can replace the working site, including:

- missing phone, address, hours, headings, or required public wording;
- an enabled announcement with no text;
- duplicate service names, IDs, or display-order values;
- a service assigned to a nonexistent group;
- a visible sample dentist profile;
- a visible provider without required biography content;
- unsafe public inquiry settings or public secrets;
- removal of preview, noindex, robots, launch-evidence, CMS-readiness, or tool-readiness controls;
- missing image variants, PDFs, or approved media paths;
- broken builds, links, forms, metadata, responsive layouts, browser compatibility, serverless safeguards, performance budgets, or serious accessibility checks.

When validation fails, correct the highlighted field and save again. The prior green deployment remains available.

## Provider and team updates

- Dr. Donovan's profile is shared by the classic and modern concepts, so one editor update changes both.
- The current public website identifies Dr. William Donovan and Dr. Robert Koolkin. The replacement candidate currently publishes only the verified Dr. Donovan profile. The practice must confirm the current provider roster before launch.
- The hidden Associate Dentist entry is a nonpublic template. Do not make it visible until the practice confirms the provider, approves every biography field, and supplies an approved photograph.
- If Dr. Koolkin should remain on the replacement website, replace the template with current approved information rather than copying an old biography without confirmation.
- If the replacement website should omit Dr. Koolkin, record that explicit practice decision in the launch evidence.
- Role-based Front Office, Dental Hygiene, and Dental Assisting profiles are safe to keep indefinitely.
- Individual staff names and photographs are optional and require permission.
- Hide an outdated profile before replacing or removing it.

## Images and PDFs

- Upload website photographs through **Website images**.
- Use the highest-resolution approved original available. A large office photograph should generally be at least 1600 pixels wide.
- The build creates smaller WebP variants automatically for patient-facing photographs.
- Alternative text should briefly describe what the image communicates.
- Upload only images the practice owns or has permission to publish.
- Replace a blank patient PDF inside its existing form entry so public links continue to work.
- Never upload completed patient forms, records, insurance cards, identification, clinical details, or any patient information to Pages CMS, GitHub, or Cloudflare Pages.

## Administrative request form

The Contact page is limited to general administrative requests.

- In preview mode, **Preview request** displays the proposed message only in the visitor's browser and sends nothing.
- Launch may deliberately retain preview-only behavior when that decision is recorded and the telephone path remains clear.
- Live delivery is enabled only by the website administrator after the office mailbox, Basin account, Turnstile keys, allowed domains, retention, response owner, backup owner, and rate limit have been approved and tested.
- Never request symptoms, diagnoses, medications, treatment details, Social Security numbers, insurance identifiers, medical history, photographs, files, or other protected health information.
- Clinical or urgent content must move to the approved telephone or secure workflow.
- Do not copy messages into GitHub issues, website content, monitoring output, screenshots, or unrelated personal systems.

## Launch approvals still required

A green website check does not authorize public launch by itself. The practice and administrator must still record:

- the current dentist roster and provider-publication decision;
- the current service list and patient-friendly terminology;
- insurance participation, payment options, estimates, financing, and financial-policy wording;
- urgent-dental, emergency-escalation, telephone, and after-hours wording;
- the preview-only or live administrative-request decision;
- physical-device/browser checks and human WCAG/PDF review;
- the completed Pages CMS save, full website-check, and restoration evidence;
- a complete authoritative DNS-zone backup;
- the exact legacy-hosting product, owner, backups, renewal, and cancellation plan;
- preservation of MX, SPF, DKIM, DMARC, autodiscover, portal, scheduling, payment, review, and other application records;
- rollback rehearsal, approved change window, and named operators.

Office editors may supply and approve content. They must not edit DNS, registrar, mail-service, security-key, production-mode, or patient-system controls through Pages CMS.

## Safe wording rules

- Do not publish a provider, service, insurance plan, payment method, office policy, credential, affiliation, or emergency workflow unless the practice has confirmed it.
- Do not describe a general dentist as a specialist unless that designation is accurate and approved.
- General website inquiries must not request or contain protected health information.
- Use the announcement for closures, storms, or short administrative notices, not individual patient messages.

## Monitoring and recovery summary

Every save becomes a GitHub commit. A failed build does not replace the prior green site.

For a small owner mistake, edit the prior value back and save. For the immediately preceding safe Pages CMS save, use **Actions → Restore latest office save**. For a larger code or content problem, the website administrator creates a corrective/revert pull request or redeploys the last green deployment. To disable live administrative requests quickly, the administrator sets `PUBLIC_ADMIN_INQUIRY_ENABLED=false` and redeploys.

Domain rollback is separate from Pages CMS. Use `docs/release-15-launch-readiness.md` and `docs/release-16-cms-cutover-tool-readiness.md` for DNS, mail, application, monitoring, and rollback procedures.
