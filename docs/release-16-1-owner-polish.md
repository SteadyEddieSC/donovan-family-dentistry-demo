# Release 16.1 — owner recovery, mobile polish, and sign-aligned branding

## Purpose

Release 16.1 responds to the first real Pages CMS owner-edit test and the accompanying mobile review. It remains a private pre-cutover release and does not change production DNS, indexing, analytics, email, inquiry delivery, or patient systems.

## Owner acceptance evidence

The owner successfully:

- signed in to Pages CMS;
- opened the private `SteadyEddieSC/donovan-family-dentistry-demo` repository;
- opened the Quick updates editor;
- changed the homepage introduction;
- saved commit `db6c9e9b0393f5c88df4ba83e260bd4fac2ce7bd` directly to `main`;
- observed the changed text on the Cloudflare Pages candidate.

This proves the basic editor-to-GitHub-to-Cloudflare path. Release 16.1 restores the test wording and adds the remaining recovery guidance and validation.

## Changes

### CMS recovery and operating clarity

- Restores the approved homepage introduction after the harmless `Test test test` acceptance edit.
- Explains that **Save** writes a GitHub commit and starts the normal main-branch checks and Cloudflare deployment.
- Explains that **Build and verify website** tests the already-saved branch and does not save, revert, or independently deploy content.
- Adds a guarded manual GitHub Actions workflow named **Restore latest office save**.
- Limits the workflow to the newest `office update:` commit on `main` and to approved office-managed paths.
- Creates a normal revert commit rather than resetting or force-pushing history.
- Adds exact mobile and desktop instructions to the README, quick start, and owner guide.

### Mobile polish

- Removes the redundant fixed quick-action dock from the modern homepage, which already contains the same Call, Directions, and Forms actions.
- Keeps the dock on useful interior pages and adds mobile bottom clearance plus safe-area spacing.
- Reduces and constrains the modern page-hero heading on narrow screens so `Comprehensive` remains intact instead of breaking after the final letter.

### Sign-aligned logo

- Revises the existing vector logo rather than adding an unrelated brand treatment.
- Uses the owner-supplied horizontal wordmarks and office-sign images as the visual reference.
- Adds a stronger blue outline, darker navy wordmark and secondary text, a more prominent blue underline, and darker green toothbrush-inspired bars.
- Preserves the white card and forced-dark resilience used in the header and footer.

## Recovery workflow safety

The rollback workflow refuses to run unless:

- it is dispatched against `main`;
- the latest commit subject begins with `office update:`;
- at least one file changed; and
- every changed path is one of the approved CMS-managed data, image, or blank-PDF paths.

If any check fails, the workflow exits without changing the branch. If a release or another commit has landed after the mistaken office save, the owner must restore the field manually or ask the website administrator for a corrective/revert pull request.

## Validation required before promotion

- Unit tests for the clean site copy, new logo colors, rollback workflow constraints, and documentation.
- Static build and performance budgets.
- Primary browser/accessibility suite.
- Compatibility suite.
- Mobile confirmation that the homepage has no duplicate fixed dock.
- Mobile confirmation that the Services heading keeps `Comprehensive` on one line.
- Interior-page confirmation that the fixed dock retains safe bottom clearance.
- Cloudflare branch preview at the exact release head.

## Release boundary

Release 16.1 does not:

- change production DNS, nameservers, registrar, or GoDaddy hosting;
- change Microsoft 365 or any mail record;
- enable indexing, analytics, Turnstile, Basin delivery, or public inquiry delivery;
- select a secure patient-intake, scheduling, messaging, payment, or review platform;
- resolve the provider, services, insurance/payment, urgent-care, or after-hours decisions still owned by the practice;
- replace the need for physical-device and human accessibility/PDF review.
