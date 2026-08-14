# Release 17 — Production cutover record and checklist

## Decisions now recorded

- The Classic concept at `/` is the approved initial public website.
- The Modern concept remains available at `/modern/` as a future-design demo.
- Modern and private review routes must remain excluded from search indexing, the public sitemap, and the Classic navigation.
- Modern and review HTML must remain crawlable after launch so search engines can observe their permanent `noindex` rules; `robots.txt` is not an indexing control.
- Owner-confirmed office hours are Monday through Thursday, 7:30 AM–5:00 PM; Friday through Sunday closed.
- The office controls `dfdbeaufort@gmail.com`, has confirmed access to it, and has approved it for publication on the Contact page and as the notification mailbox when the protected administrative inquiry is activated.
- The owner-approved current provider roster is Dr. William Donovan and Dr. Jordan Henke. Dr. Henke replaces Dr. Robert Koolkin on the replacement site. The current Classic About page, Dr. Donovan's updated photograph, and the biography wording that he and Mary Beth have two daughters are approved.
- The Classic Contact page places a prominent **Download Office Contact Card** action above the phone/email/address blocks and explains how to open the downloaded vCard and add it to device contacts.

## What the release changes

- Updates the shared office-hours record.
- Derives Dentist structured-data hours from the same shared record.
- Renders Classic and Modern footer hours from the shared record.
- Publishes the verified office email on the Contact experience and downloadable office contact card.
- Includes the verified office email in Dentist structured data.
- Makes the public office email editable through the protected Pages CMS quick-update form.
- Records `dfdbeaufort@gmail.com` as the intended notification mailbox for the protected administrative inquiry; live inquiry delivery remains disabled until its other production controls are configured and tested.
- Records the Donovan/Henke provider roster and current Classic About page as owner-approved launch evidence rather than an unresolved provider blocker.
- Improves the Classic contact-card download action without changing the vCard's local/static safety boundary.
- Forces every Modern and review page to emit `noindex, nofollow, noarchive` independently of the future Classic launch flag.
- Limits the sitemap to Classic public routes.
- Makes the approved Classic website the installable site's start page while retaining Modern by direct URL.
- Replaces the static robots file with a launch-aware route:
  - prelaunch: block all crawling;
  - after the explicit launch switch: allow crawling so page-level noindex rules can be observed, and advertise the Classic-only sitemap.
- Sets `https://donovanfamilydentistry.com` as the production canonical origin and enables indexing for the approved Classic routes only.

## Required evidence before any DNS change

The infrastructure, authorization, routing, validation, and rollback evidence completed during the approved 2026-08-13 change window is recorded in `docs/evidence/production-cutover-2026-08-13.md`. Deferred physical-device and human accessibility work remains identified there without being represented as complete.

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

Verified before this cutover:

- `dfdbeaufort@gmail.com` is controlled by the practice and is approved for public Contact-page use and future administrative-inquiry notifications.

Still required for launch operations:

- Confirm who monitors the mailbox, expected response hours, and that the public website form is limited to general administrative questions rather than protected health information.
- When the administrative inquiry is activated, configure the office-owned Basin form to notify `dfdbeaufort@gmail.com` and complete a real synthetic delivery test before enabling the production flag.
- Test inbound and outbound office email immediately before and after the DNS change.

### Google and search

- Identify the owner or manager of the Google Business Profile.
- Verify the practice name, address, phone, hours, map pin, providers, and website field.
- Confirm access to Google Search Console for the existing domain or create a domain-property verification plan that does not require removing current DNS records.
- Record currently indexed legacy URLs and direct each useful URL to the most relevant replacement route.
- Lack of Google Business Profile access is not a reason to change unrelated DNS or delay the safe website code preparation; update the profile when an authorized manager is available.

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
- In Cloudflare Pages, attach both `donovanfamilydentistry.com` and `www.donovanfamilydentistry.com` to the existing project.
- Record the Cloudflare-required CNAME target and domain status.
- Do not activate analytics, inquiry delivery, Turnstile, Open Dental, payments, scheduling writeback, or any paid service as part of the domain cutover.

## Governed production release

Only after the custom domain is ready and all evidence above is retained:

1. Change the Astro canonical site from the Pages preview URL to `https://donovanfamilydentistry.com`.
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

The authorized architecture uses Cloudflare as the authoritative DNS provider and Cloudflare Pages for both web hostnames:

1. Delegate to `nick.ns.cloudflare.com` and `tina.ns.cloudflare.com` only after the accepted 24-record Cloudflare zone matches the GoDaddy baseline.
2. Attach both apex and `www` to the same Pages project with SSL enabled.
3. Proxy only the apex and `www` website records; keep every non-web record DNS-only.
4. Apply a one-hop, path- and query-preserving permanent redirect from `www` to the apex.
5. Do not use GoDaddy forwarding or masking.

Rollback first restores only the apex and `www` web records to the reachable legacy origin inside Cloudflare and disables the canonical redirect. Revert nameservers to `ns69.domaincontrol.com` and `ns70.domaincontrol.com` only for a broader authoritative-DNS failure. Always verify the legacy site and office email, and retain the hosting plan through written launch acceptance.

## Post-launch verification

Test from phone and desktop, Wi-Fi and cellular:

- all HTTP/HTTPS and root/www combinations;
- homepage, About, Services, Forms, Contact, accessibility, and privacy pages;
- legacy redirects;
- phone, email, directions, contact card, and PDFs;
- office inbound and outbound email;
- no horizontal overflow or visual regression;
- production canonical, robots, sitemap, manifest, response headers, and structured data;
- Modern remains reachable by direct URL but noindexed and absent from the sitemap and Classic navigation;
- private review routes remain noindexed and absent from public navigation and the sitemap.

Then update Google Business Profile, submit the sitemap in Search Console, inspect the principal URLs, and monitor crawl, indexing, certificate, DNS, and email behavior during the rollback window.

## Boundaries

This production release changes authoritative nameservers, the two web records, Pages routing, the canonical host, and Classic indexing under the separately recorded owner authorization. It does not cancel or alter GoDaddy hosting, change mail or non-web service records, enable analytics or live inquiry delivery, configure Open Dental/scheduling/payments, process PHI, migrate a secondary domain, or add paid services.
