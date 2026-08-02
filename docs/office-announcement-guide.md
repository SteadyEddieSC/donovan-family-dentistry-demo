# Site-wide office announcement guide

The website includes one office-controlled announcement banner that appears immediately below the header on every classic and modern page when enabled. It is managed through **Pages CMS → Quick updates → Contact, hours, homepage, and announcement**.

## Appropriate uses

Use the announcement for short, practice-wide administrative information such as:

- weather or hurricane closures;
- holiday hours;
- an office-wide phone outage;
- temporary parking or entrance instructions;
- a short notice that normal hours will resume on a specific date.

Do not use it for an individual patient, appointment, treatment, balance, insurance matter, medical detail, or any protected health information. Do not use the banner as a replacement for calling emergency services or for an approved urgent-dental workflow.

## Publish an announcement

1. Open Pages CMS and choose the `main` branch.
2. Open **Quick updates**.
3. Open **Contact, hours, homepage, and announcement**.
4. Under **Homepage announcement**, enter a short complete message in **Announcement text**.
5. Read the message aloud and confirm that it includes the date or time period when one is needed.
6. Turn on **Show announcement**.
7. Select **Save**.
8. Confirm the new `office update:` commit and matching Cloudflare Pages deployment.
9. Open the same deployment on a phone and desktop. Check the homepage and at least one interior page in both the modern and classic concepts.
10. Run **Build and verify website** for the complete automated check.

The banner is intentionally text-only. Do not paste HTML, scripts, tracking links, shortened links, or phone numbers that differ from the approved office number.

## Revise an active announcement

Edit the existing text, save, and repeat the phone/desktop review. Keep one current message rather than stacking several unrelated notices into a long paragraph.

## Remove an announcement

1. Turn off **Show announcement**.
2. Select **Save**.
3. Confirm the corrective commit and deployment.
4. Verify that the banner is absent from the modern and classic homepages and an interior page.

The text may remain in the hidden field for reuse, but it must be current and non-sensitive. Clear outdated text when retaining it could cause confusion during a future emergency.

## Emergency removal

When an announcement is incorrect and the mistaken Pages CMS save is still the newest safe `office update:` commit on `main`, use **GitHub Actions → Restore latest office save**. Otherwise, turn off **Show announcement**, save, and contact the website administrator if the result is uncertain.

A failed build does not overwrite the prior green Cloudflare deployment. Pages CMS changes website content only; it does not alter DNS, email, Open Dental, scheduling, texting, payments, or patient records.
