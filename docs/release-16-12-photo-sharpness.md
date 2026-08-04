# Release 16.12 — Provider photo sharpness

## Purpose

Release 16.12 corrects the desktop blur reported on the Classic About page and Modern Team page. It also removes the visible “Henke Family” caption and verifies that the site does not request Google Fonts under the existing Content Security Policy.

## Changes

- Rebuilt the approved Dr. William Donovan and Dr. Jordan Henke family photographs from the supplied original files.
- Materializes hash-verified WebP assets during development and build:
  - `/images/dr-william-donovan-photo-r16-12.webp`: 480 × 428, 35,822 bytes.
  - `/images/dr-jordan-henke-family-r16-12.webp`: 480 × 714, 49,098 bytes.
- Uses immutable Release 16.12 filenames rather than overwriting an existing image. This preserves the repository safeguard that never replaces a file already committed or uploaded through Pages CMS.
- Preserves each photograph’s natural aspect ratio instead of forcing a 4:3 or 5:4 crop.
- Limits rendered provider photographs to 30rem (480px), preventing browser upscaling beyond the encoded width.
- Removes provider photo captions from both site concepts.
- Keeps the strict CSP unchanged. Automated browser coverage fails if either provider page requests `fonts.googleapis.com` or `fonts.gstatic.com`.

## Asset integrity

The materialization manifest records each provider asset’s expected byte count and SHA-256 digest. The build stops if reconstructed bytes do not match the recorded values. Existing materialized or CMS-managed files remain untouched.

## Boundaries

This release does not change production DNS, mail, indexing, analytics, inquiry delivery, scheduling, Open Dental, payments, patient records, PHI handling, or paid services. The replacement site remains a private production-candidate preview.
