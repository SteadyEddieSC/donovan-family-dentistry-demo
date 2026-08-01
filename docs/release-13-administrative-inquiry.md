# Release 13 — protected administrative inquiry

## Purpose

Release 13 adds a first-party, same-origin endpoint for general administrative questions. The public form is intentionally limited to contact information, reply preference, a general topic, and a short administrative message.

It is **not** a patient portal and must not be used for symptoms, diagnoses, medications, insurance identifiers, Social Security numbers, medical history, treatment details, photographs, files, or urgent clinical guidance.

The code is present, tested, and safe to deploy in preview mode. Live submission remains disabled until the office-owned accounts, recipient, retention choice, response owner, Turnstile keys, allowed origins, and rate-limiting control are configured and tested.

## Architecture

1. The browser posts only to `/api/administrative-inquiry` on the same website origin.
2. A Cloudflare Pages Function validates the request method, origin, content type, size, allowed fields, lengths, form age, honeypot, reply method, topic, and consent.
3. The Function validates the Cloudflare Turnstile token with the server-side Siteverify API.
4. An optional Cloudflare runtime rate-limiter binding can reject bursts before delivery. A zone-level Cloudflare rate-limiting rule is the preferred production control for the custom domain.
5. The Function creates a new allowlisted payload and forwards only approved administrative fields to the office-owned Basin form.
6. The browser receives a small same-origin JSON success or failure response. Runtime secrets and the Basin endpoint are never embedded in page HTML or browser JavaScript.

The Function does not forward the Turnstile token, honeypot, timing field, consent control, client IP address, browser user agent, or arbitrary extra fields to Basin.

## Safe default

The page is a local preview unless both build-time values are present:

```text
PUBLIC_ADMIN_INQUIRY_ENABLED=true
PUBLIC_TURNSTILE_SITE_KEY=<public site key>
```

Without those values, the button says **Preview request**, displays the proposed message locally, and sends nothing.

Even when the page is built in live mode, the server endpoint returns a fail-closed service-unavailable response unless its runtime configuration is valid.

## Office-owned decisions required before activation

Record these decisions in the launch checklist or the practice's operating documentation:

- Basin account owner
- Basin form name
- Office-controlled notification mailbox
- Primary person responsible for reviewing requests each business day
- Backup person when the primary owner is absent
- Expected response time communicated internally
- Approved data-retention period
- Who may access and delete submissions
- Approved preview and production hostnames
- Cloudflare administrator responsible for keys and rate limiting
- Date and result of the final real-delivery test

Do not use a developer's personal mailbox as the permanent recipient.

## Basin setup

1. Create an office-owned Basin account and require multi-factor authentication where available.
2. Create one form named **Donovan Family Dentistry administrative request**.
3. Configure notifications to an office-controlled mailbox approved by the practice.
4. Under the form's spam settings, enable Basin's available baseline spam filtering and add the approved website domains to **Allowed Domains**.
5. Do **not** enable Basin's separate “Require valid Turnstile response” control for this proxy design. The Pages Function already redeems the single-use token with Cloudflare and intentionally does not forward it.
6. Do not enable file uploads.
7. Under the form's general settings, set the approved retention period. Basin stores submissions; it does not provide an email-only/no-storage mode. The proposed starting point is 30 days or a shorter office-approved period.
8. Verify who can view, export, and delete submissions. Use the smallest practical access group.
9. Review the Basin spam folder regularly during the initial rollout so legitimate requests are not missed.

The form endpoint will look like:

```text
https://usebasin.com/f/xxxxxxxxxxxx
```

Treat it as a runtime-only value. Do not place it in a `PUBLIC_` variable or commit it to Git.

## Cloudflare Turnstile setup

1. Create a Turnstile widget named **Donovan administrative contact**.
2. Add only approved preview and production hostnames.
3. Use the public site key as `PUBLIC_TURNSTILE_SITE_KEY` in the corresponding Cloudflare Pages build environment.
4. Store the matching secret key as the encrypted Pages runtime secret `TURNSTILE_SECRET_KEY`.
5. Use separate preview and production widgets when practical.
6. Keep the widget action set to `administrative-contact`; the server rejects a mismatched action.

Server-side validation is mandatory. A visible widget by itself is not a security boundary.

## Cloudflare Pages variables and secrets

Configure preview and production separately under **Workers & Pages → project → Settings → Variables and Secrets**.

### Static build values

```text
PUBLIC_ADMIN_INQUIRY_ENABLED=false
PUBLIC_TURNSTILE_SITE_KEY=<public site key>
```

Keep `PUBLIC_ADMIN_INQUIRY_ENABLED=false` until the full delivery test passes. `PUBLIC_TURNSTILE_SITE_KEY` is public by design.

### Runtime secrets

Add these as encrypted values:

```text
BASIN_FORM_ENDPOINT=https://usebasin.com/f/xxxxxxxxxxxx
TURNSTILE_SECRET_KEY=<secret key>
```

### Runtime variables

```text
ADMIN_INQUIRY_ALLOWED_ORIGINS=https://approved-preview.pages.dev,https://www.example.com
ADMIN_INQUIRY_PUBLIC_ORIGIN=https://www.example.com
```

`ADMIN_INQUIRY_ALLOWED_ORIGINS` is a comma-separated exact-origin list. Include the scheme and hostname and do not include paths.

`ADMIN_INQUIRY_PUBLIC_ORIGIN` is the origin forwarded to Basin for its allowed-domain check. Use the current preview origin during preview testing and the selected canonical production origin after cutover.

Optional timing overrides are available but should normally remain at their defaults:

```text
ADMIN_INQUIRY_MIN_FORM_AGE_MS=1500
ADMIN_INQUIRY_MAX_FORM_AGE_MS=7200000
```

## Rate limiting

For the custom production domain, create a Cloudflare zone-level rate-limiting rule scoped to the exact path:

```text
/api/administrative-inquiry
```

A conservative starting policy is five POST attempts from one IP address in ten seconds, followed by a ten-second block or managed challenge. Validate the threshold with real traffic and adjust it if legitimate users are affected.

Cloudflare plan capabilities differ. The Free plan currently provides one zone-level rate-limiting rule with path matching, IP counting, and a ten-second counting period. Reserve that rule for this endpoint if no higher-priority public endpoint needs it.

The handler also supports an optional `ADMIN_INQUIRY_RATE_LIMITER` runtime binding with a `limit()` method. This is supplementary and is not required when the zone-level rule is deployed.

## Deployment sequence

1. Deploy this release with `PUBLIC_ADMIN_INQUIRY_ENABLED=false`.
2. Confirm that Contact still shows **Preview request** and that submitting it causes no `/api/administrative-inquiry` network request.
3. Configure the Basin form, notification recipient, retention, allowed domain, Turnstile widget, runtime secrets, and runtime origins.
4. Configure the rate-limiting rule.
5. In the Cloudflare **preview** environment only, set `PUBLIC_ADMIN_INQUIRY_ENABLED=true` and redeploy.
6. Submit a synthetic request containing no patient or health information.
7. Confirm all of the following:
   - The browser shows the success state.
   - Exactly one Basin submission appears.
   - Exactly one notification reaches the approved mailbox.
   - The submission contains only the allowlisted fields and a request ID.
   - No Turnstile secret, token, IP address, user agent, honeypot, timing value, or consent field appears in Basin.
8. Test an invalid or expired Turnstile challenge.
9. Test the user-facing fallback by temporarily using an invalid preview endpoint, then restore the correct value.
10. Confirm the rate-limit behavior without generating excessive traffic.
11. Record the test date, tester, recipient, and result.
12. Keep production disabled until the selected domain, mailbox, privacy wording, response ownership, and all other launch blockers are approved.

## Office operating procedure

A practical starting procedure is:

- The designated owner reviews the Basin inbox and notification mailbox at least twice each business day.
- The backup owner covers absences.
- Administrative requests receive a phone or email response within one business day when possible.
- Urgent or clinical content is not answered through the form; staff move the conversation to the practice's approved telephone or secure workflow.
- Staff do not copy message content into unrelated personal systems.
- Submissions are deleted automatically according to the approved retention setting and may be deleted earlier when no longer operationally needed.
- The spam folder is checked during the initial rollout and before automatic spam deletion.

This is an operational baseline, not legal advice or a substitute for the practice's privacy and records policies.

## Failure and rollback

The public page always tells visitors to call the office when delivery fails. The endpoint returns no stored draft and logs only a request ID and upstream status for failures, not the submitted message.

Fast rollback:

1. Set `PUBLIC_ADMIN_INQUIRY_ENABLED=false`.
2. Redeploy the site.
3. Confirm that the button returns to **Preview request**.
4. Preserve runtime secrets for troubleshooting or rotate them if compromise is suspected.
5. Review Basin and Cloudflare logs without copying message content into the issue tracker.

The prior static website and telephone contact path remain available throughout rollback.

## Office editor boundary

Routine office editors can continue changing hours, announcements, page wording, services, profiles, images, and PDFs in Pages CMS. They do not need access to Basin endpoint values, Turnstile secrets, Cloudflare rate-limit rules, or activation flags.

The one-click **Build and verify website** action now also runs the serverless inquiry unit tests. A dentist or office team member can continue using the simple editor and verification action without handling deployment credentials.
