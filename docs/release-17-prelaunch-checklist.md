# Release 17 — Prelaunch preparation and cutover checklist

## Decisions now recorded

- The Classic concept at `/` is the approved initial public website.
- The Modern concept remains available at `/modern/` as a future-design demo.
- Modern and private review routes must remain excluded from search indexing, the public sitemap, and the Classic navigation.
- Modern and review HTML must remain crawlable after launch so search engines can observe their permanent `noindex` rules; `robots.txt` is not an indexing control.
- Owner-confirmed office hours are Monday through Thursday, 8:00 AM–5:00 PM; Friday through Sunday closed.
- The office email address remains unverified and must not be published or activated for delivery until an office-controlled send-and-reply test succeeds.

## What this preparation release changes

- Updates the shared office-hours record.
- Derives Dentist structured-data hours from the same shared record.
- Renders Classic and Modern footer hours from the shared record.
- Forces every Modern and review page to emit `noindex, nofollow, noarchive` independently of the future Classic launch flag.
- Limits the sitemap to Classic public routes.
- Makes the approved Classic website the installable site's start page while retaining Modern by direct URL.
- Replaces the static robots file with a launch-aware route:
  - prelaunch: block all crawling;
  - after the explicit launch switch: allow crawling so page-level noindex rules can be observed, and advertise the Classic-only sitemap.
- Records `https://www.donovanfamilydentistry.com` as the intended production URL without changing the current Astro canonical base or enabling indexing.

## Required evidence before any DNS change

### GoDaddy and DNS

- Rotate the support PIN exposed in the owner-supplied screenshot.
- Confirm two-step verification is active for every GoDaddy administrator.
- Export the complete DNS zone file.
- Save full screenshots or a record table containing every record, value, TTL, and proxy state where applicable.
- Specifically identify:
  - current root `@` record;
  - current `www` record;
  - MX records;
  - SPF TXT record;
  - every DKIM selector;
  - DMARC;
  - autodiscover;
  - Microsoft or Google verification records;
  - SIP/SRV records;
  - CAA records;
  - `mail`, `admin`, `cpanel`, and other application records.
- Do not edit or delete unrelated DNS or mail records.

### Legacy WordPress and GoDaddy hosting

- Create a fresh full-site backup containing WordPress files, uploads, themes, plugins, and database.
- Download a copy outside the GoDaddy hosting account.
- Record the current hosting product, renewal date, document root, PHP version, WordPress version, active theme, and active plugins.
- Record the current root website target and the rollback values for both `@` and `www`.
- Keep Web Hosting Deluxe active through the launch acceptance and rollback window.
- Avoid major WordPress, theme, plugin, or PHP upgrades immediately before cutover unless a confirmed security issue requires them; inventory and back up first so the legacy site remains a dependable rollback target.

### Email

- Verify the office-controlled mailbox by sending from an unrelated account and receiving a reply from office staff.
- Confirm who monitors it, expected response hours, and whether it is administrative-only.
- Do not publish or route a website form to an unverified mailbox.
- Test inbound and outbound office email immediately before and after the DNS change.

### Google and search

- Identify the owner or manager of the Google Business Profile.
- Verify the practice name, address, phone, hours, map pin, providers, and website field.
- Confirm access to Google Search Console for the existing domain or create a domain-property verification plan that does not require removing current DNS records.
- Record currently indexed legacy URLs and direct each useful URL to the most relevant replacement route.

### Roles and timing

Name the following before cutover:

- DNS operator;
- Cloudflare/site operator;
- office verifier;
- email verifier;
- rollback decision-maker.

Select a monitored change window when the office can verify phone, website, email, forms, and directions.

## Cloudflare preparation

- Confirm the latest `main` deployment and its exact commit.
- In Cloudflare Pages, add `www.donovanfamilydentistry.com` to the existing project before editing GoDaddy `www`.
- Record the Cloudflare-required CNAME target and domain status.
- Do not activate analytics, inquiry delivery, Turnstile, Open Dental, payments, scheduling writeback, or any paid service as part of the domain cutover.

## Final code launch switch — do not perform early

Only after the custom domain is ready and all evidence above is retained:

1. Change the Astro canonical site from the Pages preview URL to `https://www.donovanfamilydentistry.com`.
2. Change `previewMode` from `true` to `false`.
3. Replace the current global Cloudflare `X-Robots-Tag: noindex, nofollow, noarchive` preview header with production rules that make Classic indexable while retaining noindex response protection on Modern, review utilities, and any nonpublic resources that require it.
4. Confirm Classic pages emit `index, follow` and production canonicals.
5. Confirm Modern and review pages still emit `noindex, nofollow, noarchive`.
6. Confirm `robots.txt` allows crawlers to reach all HTML so page-level noindex rules can be observed and points to the production sitemap.
7. Confirm the sitemap contains only Classic public routes and only production-domain URLs.
8. Confirm the site manifest opens `/`, not `/modern/`.
9. Remove preview/demo wording from the Classic footer while keeping clear future-demo wording on Modern.
10. Run the full unit, build, performance, accessibility, primary browser, and compatibility suites.
11. Verify the exact Cloudflare branch preview, merge commit, and `main` deployment.

## DNS cutover and rollback

After the final code release is verified:

1. Point only `www` to the Cloudflare Pages target supplied by Cloudflare.
2. Wait for `https://www.donovanfamilydentistry.com` and its certificate to become active.
3. Test the full Classic site before changing the root domain.
4. Add a GoDaddy permanent HTTPS forward-only redirect from the root domain to `https://www.donovanfamilydentistry.com`.
5. Do not use masking.

Rollback:

- remove root forwarding;
- restore the prior root `@` value;
- restore the prior `www` record;
- verify legacy WordPress and office email;
- retain the backup and hosting plan until written launch acceptance.

## Post-launch verification

Test from phone and desktop, Wi-Fi and cellular:

- all HTTP/HTTPS and root/www combinations;
- homepage, About, Services, Forms, Contact, accessibility, and privacy pages;
- legacy redirects;
- phone, directions, contact card, and PDFs;
- office inbound and outbound email;
- no horizontal overflow or visual regression;
- production canonical, robots, sitemap, manifest, response headers, and structured data;
- Modern remains reachable by direct URL but noindexed and absent from the sitemap and Classic navigation;
- private review routes remain noindexed and absent from public navigation and the sitemap.

Then update Google Business Profile, submit the sitemap in Search Console, inspect the principal URLs, and monitor crawl, indexing, certificate, DNS, and email behavior during the rollback window.

## Boundaries

This document and preparation release do not change DNS, nameservers, registrar settings, GoDaddy hosting, mail records, indexing, analytics, live inquiry delivery, Open Dental, scheduling, payments, PHI processing, or paid services.
