# Office Content Backup

Use **Create office content backup** before a large Pages CMS edit, before replacing several images or forms, or whenever the office wants a dated copy of the current public website content.

This workflow is a read-only export. It does not edit the website, does not create a deployment, and does not roll back a change.

## What the backup contains

The downloadable artifact contains the current `main`-branch copies of:

- `.pages.yml`;
- the Pages CMS-managed JSON files in `src/data/`;
- public website images in `public/images/`;
- blank public forms in `public/forms/`;
- a manifest identifying the source commit and workflow run; and
- SHA-256 checksums for every file in the bundle.

The artifact is retained by GitHub for 30 days.

The workflow does **not** back up patient records, completed forms, inquiry messages, email, credentials, Cloudflare secrets, GoDaddy settings, Microsoft 365 data, or any protected health information. Never add completed forms or patient information to the repository or the backup artifact.

## Create a backup on a phone

1. Sign in to GitHub and open `SteadyEddieSC/donovan-family-dentistry-demo`.
2. Open **More**.
3. Select **Actions**.
4. Select **Create office content backup**.
5. Select **Run workflow**.
6. Confirm the branch is **main**.
7. Select the green **Run workflow** button.
8. Wait for the workflow to finish successfully.
9. Open the completed workflow run.
10. Scroll to **Artifacts**.
11. Download `office-content-backup-<run number>` within 30 days.
12. Store the downloaded ZIP in the office-approved administrative storage location.

## Create a backup on a desktop

1. Open the repository in GitHub.
2. Select the **Actions** tab.
3. Select **Create office content backup** in the left workflow list.
4. Select **Run workflow**.
5. Confirm **main** is selected.
6. Select the green **Run workflow** button.
7. Open the completed run after it turns green.
8. Download the `office-content-backup-<run number>` artifact.

## Verify the downloaded bundle

After unzipping the artifact, confirm it contains:

- `MANIFEST.md`;
- `SHA256SUMS.txt`;
- the expected `src/data/`, `public/images/`, and `public/forms/` folders.

`MANIFEST.md` records the exact GitHub commit captured by the backup. An administrator can use that commit and the checksums to compare a later website state against the backup.

## Restore from a backup

The backup action intentionally does not provide one-click restoration. Restoration may involve one file, several CMS fields, an image, or a release-level change, so an administrator must compare the bundle with the current repository and create a normal corrective commit or pull request.

Use the existing **Restore latest office save** workflow only when the mistaken Pages CMS commit is still the newest safe `office update:` commit on `main`.

For a small wording or hours mistake, the simplest recovery remains:

1. open the same Pages CMS entry;
2. restore the correct value;
3. select **Save**;
4. confirm the corrective GitHub commit and Cloudflare deployment.

For an older or multi-file mistake, provide the backup artifact and the affected page or field to the website administrator. Do not force-push or reset shared `main` history.
