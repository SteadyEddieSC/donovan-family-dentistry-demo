# Release 16.11 — Approved provider profiles and photographs

## Purpose

Publish the practice-supplied provider update in both the Classic and Modern website concepts without changing production infrastructure or activating patient-data services.

## Public changes

- Replaces Dr. William Donovan's prior family photograph with the supplied `IMG_4850` photograph.
- Publishes Dr. Jordan Henke, DDS, using the biography supplied by the practice.
- Publishes the supplied Henke family photograph with the caption **Henke Family**.
- Removes the hidden associate-dentist template and all Koolkin/Koolkins references from the current provider roster.
- Uses one shared provider data source for the Classic About page and Modern Team page.

## Image handling

The two approved photographs are stored locally as small WebP assets. Cropping and compression are presentation changes only; no people or substantive visual details were generated or altered. No image CDN, external host, or paid service is used.

## Validation

Release coverage verifies that:

- both approved dentists appear on `/about/` and `/modern/team/`;
- both local image files decode successfully;
- the Henke family caption is visible;
- no Koolkin reference is rendered;
- the reviewed 384-pixel mobile layouts do not overflow; and
- the provider pages have no serious or critical automated accessibility findings.

## Safety boundary

This release does not activate Open Dental, Web Forms, Patient Portal, Web Sched, messaging, payments, APIs, analytics, indexing, live inquiry delivery, production DNS, mail changes, or patient-data handling.
