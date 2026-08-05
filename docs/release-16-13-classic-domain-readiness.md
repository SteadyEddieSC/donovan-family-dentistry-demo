# Release 16.13 — Classic profile polish and domain readiness

## Owner decisions recorded

- The practice owner confirmed that the replacement website may become the destination for `donovanfamilydentistry.com`.
- The Classic concept at the Pages project root is the approved initial domain target.
- The Modern concept remains available in private preview and is not removed by this release.
- Dr. William Donovan's profile should state that he and Mary Beth Donovan have two daughters.
- The Classic About page should provide additional visual separation between Dr. Donovan's biography and Dr. Henke's profile.

## Website changes

- Updates the shared Dr. Donovan biography from one daughter to two daughters, so the corrected fact appears anywhere the shared provider biography is rendered.
- Adds Classic-only responsive spacing between consecutive provider profiles.
- Leaves the approved provider photographs, natural aspect ratios, captions, strict Content Security Policy, and Google Fonts prohibition unchanged.

## Supplied hosting and DNS evidence

The owner-supplied GoDaddy screenshots establish the following current environment:

- The domain uses GoDaddy default authoritative nameservers.
- The legacy website is WordPress on GoDaddy Web Hosting Deluxe.
- The root website record currently points to the legacy GoDaddy hosting address.
- Existing DNS includes mail-, Microsoft-, autodiscover-, verification-, and SIP-related records that must not be removed casually.
- GoDaddy domain forwarding is not currently configured.

The screenshots also contained GoDaddy account-identification information. Those values are not recorded in this repository.

## Recommended low-risk domain architecture

Do not move authoritative nameservers for the initial transition. Preserve GoDaddy DNS and the existing mail/application records.

1. In the Cloudflare Pages project, add `www.donovanfamilydentistry.com` as a custom domain.
2. Only after Cloudflare has created the pending custom-domain setup, create or replace the GoDaddy `www` record with a CNAME to `donovan-family-dentistry-demo.pages.dev`.
3. Wait until Cloudflare reports the custom domain and certificate as active.
4. In GoDaddy domain forwarding, permanently redirect the root domain to `https://www.donovanfamilydentistry.com` using forward-only behavior, not masking.
5. Verify both HTTP and HTTPS for the root and `www`, preserve paths where supported, and test from multiple networks and devices.

This approach keeps the public address on the practice domain after the one-time apex-to-`www` redirect, allows Cloudflare Pages to serve the Classic site on `www`, and avoids a nameserver migration during the initial cutover.

## Required pre-change evidence

Before editing DNS:

- Export the complete GoDaddy DNS zone file.
- Record every DNS record, TTL, and current value.
- Confirm the current `www` record and any CAA records.
- Confirm the exact Cloudflare Pages production deployment on `main`.
- Create a current WordPress and hosting backup.
- Identify the email administrator and verify mail flow before and after the change.
- Name the DNS operator, site verifier, and rollback decision-maker.

## Rollback

- Remove GoDaddy forwarding and restore the prior root A record.
- Restore the prior `www` record.
- Keep the GoDaddy hosting subscription and WordPress backup available until the replacement site and mail behavior have been accepted.
- Do not cancel hosting during this release.

## Boundaries

This release does not execute DNS changes, change nameservers, cancel hosting, alter mail records, enable public indexing, activate analytics or live inquiry delivery, integrate Open Dental, process PHI, or purchase a service.
