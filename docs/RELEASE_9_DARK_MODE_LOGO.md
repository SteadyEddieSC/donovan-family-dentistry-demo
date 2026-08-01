# Release 9 — Dark-mode logo hardening

## Scope

- Bake a white rounded card into the Donovan logo SVG so the artwork itself retains the intended background.
- Add a white background-image layer to the classic and modern logo containers so browser forced-dark rendering cannot expose a black card behind the logo.
- Keep the site palette explicitly light while preserving existing accessibility behavior.
- Stack the modern footer into one readable column on mobile, with a two-column link group where space allows.
- Preserve the Release 8 patient-form correction and optional service integrations without functional changes.

## Why both layers are used

Some mobile browsers alter CSS background colors when a device or browser-level forced-dark option is enabled. The release uses two independent protections:

1. The SVG contains its own rounded white surface.
2. The containing element uses both a white background color and a white background image.

If a browser rewrites the CSS color, the image layer and the logo artwork remain white.

## Validation gates

- Static Astro build
- Existing desktop and mobile Playwright suite
- axe-core serious and critical accessibility checks
- Logo SVG geometry assertion
- Computed white logo surface plus non-color background layer
- Mobile footer single-column geometry assertion
- Mobile footer screenshot artifact
- Existing corrected patient-form length and SHA-256 assertion

## No production-service changes

This release does not activate Basin, Turnstile, Cloudflare Web Analytics, DNS, email routing, or any PHI-capable workflow.
