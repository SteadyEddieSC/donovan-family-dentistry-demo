# Release 8 — Free-service integration

Status: implementation-ready; external account values are intentionally not committed.

## Included in this release

- Corrected fillable patient form v7. The bottom responsible-party fields now remain inside the section panel.
- Optional Cloudflare Web Analytics on both classic and modern concepts.
- Optional Basin submission for the modern administrative request form.
- Optional Cloudflare Turnstile protection for the Basin form.
- Preview-only behavior remains the default when no service variables are configured.
- Content Security Policy updated only for the required Cloudflare and Basin origins.

## Safety boundary

The public form is limited to general administrative requests. It must not be used for symptoms, diagnoses, medications, medical history, treatment details, Social Security numbers, insurance identifiers, or other protected health information.

The medical-history PDF remains an offline download. A HIPAA-capable intake platform and appropriate agreement are required before accepting protected health information online.

## Environment variables

Configure these in Cloudflare Pages under the production and preview environments as appropriate. They are public build-time values; do not place secret keys in them.

| Variable | Purpose |
|---|---|
| `PUBLIC_BASIN_FORM_ENDPOINT` | Basin endpoint in the form `https://usebasin.com/f/<form-id>` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile site key |
| `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | Token from the Cloudflare Web Analytics beacon snippet |

The Turnstile secret key belongs only in the Basin dashboard's spam-protection configuration. It must never be committed to GitHub or exposed as a `PUBLIC_` variable.

## Activation sequence

### 1. Cloudflare Web Analytics

1. Create or select the Web Analytics site in Cloudflare.
2. Copy the token from the JavaScript beacon snippet.
3. Add it as `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` in Cloudflare Pages.
4. Redeploy.
5. Confirm that the beacon appears in page source and data begins appearing in Web Analytics.

When the token is blank, no analytics script is emitted.

### 2. Basin administrative form

1. Create one Basin form endpoint.
2. Configure the practice-approved recipient email.
3. Set retention and notification preferences.
4. Add the endpoint as `PUBLIC_BASIN_FORM_ENDPOINT`.
5. Redeploy and submit only test administrative data.
6. Confirm delivery, reply workflow, and deletion behavior.

When the endpoint is blank or malformed, the site remains in local preview mode and sends nothing.

### 3. Cloudflare Turnstile

1. Create a Turnstile widget in Cloudflare using Managed mode.
2. Add the active `pages.dev` hostname and, later, the production domain.
3. Add the public site key as `PUBLIC_TURNSTILE_SITE_KEY`.
4. In Basin, add the Turnstile secret key and enable **Require valid Turnstile response**.
5. Redeploy and verify successful and rejected submissions.

Turnstile is rendered only when both a valid Basin endpoint and a site key are present. Basin performs server-side token enforcement when its Turnstile requirement is enabled.

## Current cost target

- Cloudflare Pages: $0 for the current static site usage.
- Cloudflare Web Analytics: $0.
- Cloudflare Turnstile: $0.
- Basin Free: $0 for one endpoint and up to the vendor's current free submission allowance.

Expected initial recurring platform cost: **$0/month**, subject to vendor limits and future pricing changes.

## Production checklist

- [ ] Practice approves the recipient inbox and who monitors it.
- [ ] Basin account uses a strong unique password and MFA if offered.
- [ ] Turnstile is required in Basin, not merely displayed in the browser.
- [ ] Test submissions contain no real patient or health information.
- [ ] Failure states direct users to call the office.
- [ ] Data retention is documented and minimized.
- [ ] Staff understand that the form is administrative only.
- [ ] Custom domain is added to Turnstile before DNS cutover.
- [ ] Medical-history PDF remains download-only until secure intake is approved.
