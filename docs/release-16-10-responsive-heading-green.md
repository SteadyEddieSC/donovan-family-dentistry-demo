# Release 16.10 — Responsive heading and perceptual green correction

## Purpose

Release 16.10 responds to another physical Galaxy phone review. The nonbreaking treatment added in Release 16.9 kept **calm communication** together, but the phrase exceeded the available content width and created horizontal overflow. The review also found that the large green contact-card surface appeared darker than the smaller green toothbrush mark in the logo.

## Responsive heading correction

- Restores the office-editable heading to ordinary spaces instead of storing a nonbreaking character in Pages CMS content.
- Wraps only the phrase **calm communication** in presentation markup.
- Uses a narrower responsive type scale at reviewed phone widths so the phrase remains on one line without widening the document.
- Verifies that the phrase stays inside the heading box and that document width equals viewport width at 384 CSS pixels.
- Allows ordinary wrapping below 340 CSS pixels so zoom and exceptionally narrow layouts remain usable rather than clipping content.

## Green treatment

The active logo continues to use the exact toothbrush green `#72a928`. Pixel sampling of the supplied phone screenshot showed that the logo bars and the contact-card background were rendering at essentially the same device-captured color. The perceived difference comes primarily from simultaneous contrast: a large solid green area surrounded by dark teal appears heavier than the same green used as a small mark on white.

- Keeps `#72a928` on compact accents such as value markers, team markers, heading rules, and the logo itself.
- Uses `#8bb84f`, a lighter tint of the same hue family, on the large Downloadable Contact Card surfaces.
- Uses `#96c25f` for the large-surface hover state.
- Preserves dark text and forced-colors behavior.

## Safety boundary

This release changes presentation and regression coverage only. It does not activate Open Dental, Web Forms, Patient Portal, Web Sched, messaging, payments, the Open Dental API, analytics, indexing, live inquiry delivery, production DNS, mail, or patient-data handling.
