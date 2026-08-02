# Physical-device and human review guide

## Purpose

The private launch candidate already has automated browser-engine, emulation, accessibility, link, PDF, metadata, and performance coverage. Those checks do not prove that the website behaves correctly on the practice owner's actual phones, tablets, computers, browser settings, or PDF applications.

Release 16.5 adds a local-only review center at:

`/review/`

The review center detects the local browser environment, provides a fixed checklist, and generates a report that the tester may copy, download as JSON, or print. It does not submit, store, email, or upload the report.

## Required safety boundary

Do not enter patient names, appointment details, symptoms, diagnoses, medications, insurance IDs, completed form information, Social Security numbers, or other protected health information.

A report may contain:

- tester name or initials;
- device model and operating system;
- browser name and version;
- page, orientation, zoom, and display settings;
- pass, fail, or blocked status;
- general visual, usability, PDF, keyboard, switch, or screen-reader findings.

## Minimum physical-device matrix

Complete at least one current review for each category before clearing the `physical-device-review` launch-evidence item:

| Category | Minimum evidence |
| --- | --- |
| iPhone | Current supported iOS and Safari on a physical iPhone |
| iPad | Current supported iPadOS and Safari on a physical iPad |
| Android phone | Current Android and Chrome on a physical phone |
| Windows | Current supported Windows with Edge or Chrome |
| macOS | Current supported macOS with Safari |

Add Firefox, larger Android tablets, older supported devices, forced-dark browsers, assistive technology, or office-specific PDF applications when they are available or operationally important.

## Review sequence on each device

1. Open the exact Cloudflare deployment being considered for launch.
2. Open `/review/` from the **Review this device** footer link or by entering the path directly.
3. Record the device/OS and browser/version fields.
4. Open each linked test page in a separate tab.
5. Check portrait and landscape where the device supports orientation changes.
6. Review the logo corners, colors, white field, and surrounding backgrounds.
7. Open and close the menu; confirm that the active page and focus are understandable.
8. Test Call, Directions, Patient Forms, Save office contact, and Contact actions.
9. Open both patient PDFs in the office-approved application. Confirm that they open, zoom, scroll, and remain legible.
10. Test browser text enlargement or zoom. At minimum, review 200% desktop zoom and the largest practical mobile text setting.
11. Review device dark mode or forced-dark behavior.
12. Use keyboard, switch control, VoiceOver, TalkBack, Narrator, or another available assistive input when applicable.
13. Choose the overall result and add actionable notes.
14. Select **Generate report**.
15. Download the JSON or print/save the report as evidence. Review it before sharing.

## Result definitions

- **Pass:** all checks completed with no launch-relevant defect.
- **Pass with notes:** the experience is usable and launch-safe, but a non-blocking observation should be retained.
- **Fail — correction needed:** a visual, functional, accessibility, PDF, or device issue must be corrected and retested.
- **Blocked — could not complete:** the device, browser, application, credential, or test condition prevented completion.

A failed or blocked report does not clear launch evidence. After correction, create a new report on the same device and retain both the original and successful retest.

## Evidence handling

Recommended evidence naming:

`physical-device-review-YYYY-MM-DD-device-browser.json`

Keep reports with the launch records or attach them to the controlled launch issue/PR. Do not commit reports containing private staff details, credentials, mailbox information, or patient information to the public repository.

The launch-readiness register should be changed to `verified` only after the required matrix is complete, failures have been retested, and the evidence reference identifies the retained review package.

## Human WCAG and PDF review

The local review center assists with device evidence but does not replace the separate `human-wcag-review` item. That review should include:

- logical heading and landmark use;
- keyboard order and visible focus;
- menu disclosure behavior;
- link purpose and button naming;
- zoom, reflow, text spacing, and orientation;
- error identification and recovery on the administrative preview form;
- screen-reader announcement of form status and generated reports;
- color, contrast, forced-colors, and non-color cues;
- PDF reading order, form-field labels, keyboard access, zoom, and supported application behavior.

Record the reviewer, date, applications, assistive technologies, findings, corrections, and retest result. Automated axe and browser checks remain supporting evidence, not a substitute for the human review.
