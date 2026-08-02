# Release 16.9 — Mobile heading and patient-facing copy polish

## Purpose

Release 16.9 responds to the physical-phone review of the modern About page. It corrects an awkward narrow-screen line break, removes visible implementation language from patient-facing copy, and documents the office announcement workflow introduced in Release 16.8.

## Mobile heading refinement

- Keeps **calm communication** together as one phrase in the values heading.
- Adds balanced heading wrapping where supported while retaining normal reflow and zoom behavior.
- Preserves the existing type scale and does not reduce the heading merely to force a desktop-like layout onto a phone.

## Patient-facing copy refinement

- Replaces the About paragraph that referred visitors to the Team-page biography with a concise explanation of how Dr. Donovan's laboratory, advanced-education, and Navy dentistry background informs the practice approach.
- Removes editor, template, and future-publication language from the visible Team and Services introductions.
- Keeps provider, service, and launch approvals enforced in the private readiness records rather than exposing internal project language to patients.

## Announcement documentation

- Adds a direct README workflow for enabling, reviewing, updating, and disabling the site-wide office announcement.
- Expands the office quick start and editing guide with appropriate uses, prohibited content, phone/desktop review, and emergency removal steps.
- Keeps the announcement disabled by default and prohibits patient-specific information.

## Safety boundary

This release adds no account, API, external script, analytics event, patient-system link, form, database, or paid service. It does not alter production DNS, email, indexing, inquiry delivery, Open Dental configuration, or PHI handling.
