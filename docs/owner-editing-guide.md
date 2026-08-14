# Office website editor guide

Routine updates to the current public Classic website can be made in Pages CMS without editing code or using a command line. For the shortest operating checklist, use `docs/office-cms-quickstart.md`.

## Access and editor areas

Open Pages CMS at https://app.pagescms.org/ and sign in with a GitHub account authorized for the public `SteadyEddieSC/donovan-family-dentistry-demo` repository. Select the `main` branch for normal office changes.

The office editor exposes exactly three areas:

- **Current website quick updates** — contact details, hours, homepage wording, images, announcement, and search-preview text;
- **Dentist profiles** — approved dentist names, credentials, photographs, Classic biographies, order, and visibility;
- **Services and patient forms** — published service names/order/visibility and downloadable blank patient PDFs.

Modern-only content, code, deployments, infrastructure, DNS, mail, security, analytics, integrations, and indexing controls are deliberately not exposed. Some approved shared data also appears in the hidden Modern demo, but office staff do not manage that distinction.

## Save and publish

**Save** writes the edited file to GitHub and creates an `office update:` commit. Saving to `main` starts the normal GitHub checks and Cloudflare Pages deployment; there is no separate Pages CMS database or second Publish button.

After saving:

1. Confirm the new `office update:` commit on `main`.
2. Confirm Cloudflare deploys that same commit.
3. Run **Build and verify website** from the Pages CMS actions menu.
4. Wait for the workflow to pass.
5. Open https://donovanfamilydentistry.com/ and the changed page on both a phone and desktop.
6. Confirm the wording, links, images, hours, and layout are correct.

A failed build does not replace the last successfully deployed site.

## Information that must never be entered

Pages CMS, GitHub, and Cloudflare Pages are not patient-record or credential systems. Never enter or upload:

- patient names, appointment details, completed forms, insurance information, identification, symptoms, diagnoses, medications, treatment details, medical history, images, or other protected health information (PHI);
- passwords, API keys, tokens, recovery codes, credentials, private keys, or other secrets;
- patient messages or files copied from email, text, a portal, or a practice-management system.

Only office-approved blank PDF templates and public website content belong in the editor.

## Normal update process

1. Open only the relevant editor area.
2. Change the smallest necessary field.
3. Use **Show profile**, **Show service**, or **Show announcement** to keep uncertain content hidden.
4. Save once, then verify the commit, deployment, workflow, and live result.
5. Remove an expired announcement promptly.

The currently published dentist records are Dr. William Donovan and Dr. Jordan Henke. Hide an outdated profile before replacing it, and publish only practice-approved names, credentials, biography text, and photographs. Individual staff names and photographs require permission.

## Images, forms, and wording

- Upload only images the practice owns or has permission to publish.
- Provide useful alternative text that describes what an image communicates.
- Replace a blank patient PDF inside its existing form entry so public links continue to work.
- Never upload a completed patient form.
- Do not claim a specialty, insurance participation, payment option, credential, affiliation, office policy, or emergency workflow unless the practice has confirmed it.
- Use **Show announcement** for a weather closure, holiday hours, an office-wide phone outage, or another practice-wide notice, never for an individual patient. Review it on a phone and desktop.

## Build and verify website

**Build and verify website** tests the already-saved branch. It does not save, undo, or deploy different content. It runs locked-dependency, unit, build, browser, compatibility, link, form, mobile, metadata, performance, security, and automated accessibility checks and stores a temporary build artifact.

An office user opens the action from Pages CMS after Save, or opens GitHub **Actions**, selects **Office website check**, chooses the saved branch, and selects **Run workflow**.

## Back up public office content

The GitHub **Create office content backup** workflow creates a temporary downloadable artifact of current public CMS-managed files from `main`. It is not a WordPress, email, patient-record, or full hosting backup. Download the artifact within its stated retention period when an administrator requests an extra recovery copy.

## Correct or restore an office edit

For a simple wording, hours, image, service, profile, or announcement mistake, edit the value back and save again. This is the preferred recovery method.

There is no ordinary **Revert** button for a direct Pages CMS save on the GitHub commit page.

**Restore latest office save** may be used only when the mistaken Pages CMS commit is still the newest commit on `main`. The workflow is fail-closed: it proceeds only when the commit message starts with `office update:` and every changed file is an approved office-managed data, public-image, or blank-PDF path. It creates a revert commit and never erases history.

Contact the website administrator instead when:

- a release or another commit landed after the mistake;
- several commits, code, configuration, DNS, secrets, or production controls are involved;
- the workflow rejects the commit or reports a conflict; or
- the intended prior state is unclear.

Do not reset or force-push `main`.

## Help and escalation

Stop editing if a check fails or the production page does not match the saved commit. Send the website administrator the affected public page URL plus the GitHub commit or workflow-run link, and describe what you expected to see. Never include PHI, patient content, passwords, credentials, or secrets in the help request.

DNS, mail, hosting, Cloudflare, indexing, Modern, administrative-form delivery, patient systems, and older multi-commit recovery remain administrator-only work.
