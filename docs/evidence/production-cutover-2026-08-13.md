# Donovan Family Dentistry production cutover evidence — 2026-08-13

## Authorization and window

- Eddie authorized the full after-hours production cutover, including the Cloudflare nameserver change, Pages routing, canonical redirect, governed production release, and indexing switch.
- The monitored change event began at `2026-08-13 21:30:34 -04:00` (`America/New_York`).
- Eddie is the owner/delegate, office verifier, and rollback decision-maker. Codex is the delegated DNS and website operator for this event.
- The normal development identity remains `Eddie-LowcountryDigitalWorks`; repository ownership and CLI authentication were not changed.
- GoDaddy hosting must remain active. Mail, application, secondary-domain, and unrelated DNS records are outside the website release scope.

## Pre-change repository and deployment evidence

- Repository: `SteadyEddieSC/donovan-family-dentistry-demo` (public).
- Approved pre-cutover `main`: `ee087b9aaf514cefb94fe489bb483113671caf7b` (merge of PR #41).
- Last-green Cloudflare Pages deployment ID: `eeb1fb2f-522e-4c44-bd1b-a3928a3ad689`.
- The immutable deployment, stable Pages hostname, Classic routes, Modern noindex controls, PDFs, redirects, and 404 behavior were checked before the DNS change.

## DNS evidence and integrity

The accepted external cutover archive is retained outside the public repository. These hashes bind this record to the exact reviewed artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `Donovan-GoDaddy-Live-Zone-Export-2026-08-13.txt` | `72F3B2263D81AC4D0CF7AC1E3E0DF536FC068D16529CFE9B2D28DBD1848642A4` |
| `Donovan-Cloudflare-Final-Staged-Zone-Export-2026-08-13.txt` | `5FE58765AB4F7EB5B6D19E8A6819013A9B497A7D6B1002C8EFCABE149BA5C65D` |
| `Donovan-DNS-Migration-Preflight-2026-08-13.md` | `DD464528E72E0AAC758435C0D9B0EE162BDD60DBC414E26ABE6AE98EEED0AA20` |

- The accepted Cloudflare baseline contained 24 operational records. `admin`, `mail`, `webdisk.admin`, and `www.admin` were intentionally absent from the Cloudflare zone and were not changed at GoDaddy.
- `cpanel` retains its accepted 3600-second TTL.
- DNSSEC was disabled at GoDaddy before delegation; no parent DS record was present before or after the change.
- Delegation changed from `ns69.domaincontrol.com` / `ns70.domaincontrol.com` to `nick.ns.cloudflare.com` / `tina.ns.cloudflare.com`.
- Both Cloudflare authoritative nameservers answered all 24 accepted baseline records correctly immediately after activation.
- After the web-only routing change, all 22 non-web records matched the accepted baseline on both authoritative nameservers (`22 pass, 0 fail` on each).
- MX, SPF, Microsoft verification TXT, autodiscover, mail-service CNAMEs, SIP/SRV records, cPanel, FTP, WebDisk, and WHM records were not edited.
- No Open Dental, portal, scheduling, payment, or other vendor-specific DNS record existed in the accepted baseline; no such service was created, deleted, or rerouted.

## Pages routing and canonical-host evidence

- `donovanfamilydentistry.com` and `www.donovanfamilydentistry.com` are active Cloudflare Pages custom domains with SSL enabled on `donovan-family-dentistry-demo`.
- The apex and `www` web records are the only proxied DNS records required for this website route; all non-web records remain DNS-only.
- Active redirect rule: `Canonical www to apex (path-preserving)`.
- Rule behavior: `https://www.*` → `https://${1}`, HTTP status `301`, query-string preservation enabled.
- Direct checks confirmed one-hop redirects for ordinary paths and PDF paths, preserving both path and query string.
- During routing validation, Classic remained protected by response and page-level `noindex`, `robots.txt` blocked crawling, and the sitemap contained only the seven Classic routes.

## Validation completed in the change window

- Seven Classic routes returned `200`, rendered current Donovan content, and retained pre-launch noindex protection.
- Both patient PDFs returned `200` with `application/pdf`.
- `/procedures/`, `/patient-forms/`, and `/directions/` returned the intended permanent redirects.
- A synthetic nonexistent URL returned a real `404`.
- TLS, security headers, Canonical/robots metadata, desktop navigation, and a 390 × 844 mobile layout/menu check passed.
- The mobile check found no horizontal overflow.
- Modern remained noindex and absent from Classic navigation and the sitemap.

## Required-evidence dispositions

- Physical-device matrix: **approved-deferred**. A recorded Android physical-device review exists. Current-browser automation, desktop browser validation, and mobile emulation passed during this event. Remaining physical iPhone, iPad, macOS, and Windows reviews stay as documented post-launch work; this record does not claim they occurred.
- Human WCAG/PDF review: **approved-deferred**. Automated WCAG 2.2 AA coverage, keyboard/focus/reflow checks, compatibility suites, and PDF availability checks remain required in CI. A broader human assistive-technology and supported-PDF application review remains documented post-launch work; this record does not claim complete WCAG conformance.
- DNS-zone backup, mail preservation, portal/application preservation, rollback readiness, and change-window evidence: **verified** by the artifact hashes and live checks recorded above.
- The administrative inquiry remains intentionally deferred and disabled. The production Classic site uses telephone, the public office email, address/directions, contact card, and downloadable PDFs.

## Rollback posture

Use the least disruptive rollback that addresses the failure:

1. If Pages routing or the production build fails while DNS and mail remain healthy, restore only the two web records inside Cloudflare: apex `A 107.180.115.120` (DNS-only) and `www CNAME donovanfamilydentistry.com` (DNS-only), and disable the `Canonical www to apex (path-preserving)` rule.
2. Keep all 22 non-web records untouched and keep GoDaddy hosting active.
3. Roll back nameservers to `ns69.domaincontrol.com` and `ns70.domaincontrol.com` only for an authoritative-DNS failure that cannot be corrected safely in Cloudflare.
4. After any rollback, verify the legacy WordPress site, MX/SPF/mail-service answers, cPanel, the patient PDFs/links available on the restored site, and both apex/`www` behavior.

The pre-change legacy WordPress site and the hosting administration endpoint were both reachable during the event, so the web-only rollback target was live when this release was authorized.
