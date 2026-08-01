# Public domain inventory evidence — 2026-08-01

## Source

- GitHub Actions workflow: **Domain readiness inventory**
- Run ID: `30718591705`
- Branch head: `57e6365ca8dfeff115e8ed74ebd2aa3196c8e0b5`
- Artifact ID: `8824120255`
- Artifact digest: `sha256:8b0eb8289db550a0736aef6505b39cca2f93573f511a25516548e1a57532c8d7`
- Generated: `2026-08-01T21:11:36.365Z`

The workflow collected public DNS answers, TLS certificate metadata, and an allowlisted set of HTTP response metadata. It did not authenticate to a DNS provider or change records.

## Observed public records

| Name | Type | Observed value |
| --- | --- | --- |
| `donovanfamilydentistry.com` | A | `107.180.115.120` |
| `donovanfamilydentistry.com` | AAAA | No data returned |
| `donovanfamilydentistry.com` | NS | `ns69.domaincontrol.com`, `ns70.domaincontrol.com` |
| `donovanfamilydentistry.com` | MX | Priority 0: `donovanfamilydentistry-com.mail.protection.outlook.com` |
| `donovanfamilydentistry.com` | TXT | `v=spf1 include:secureserver.net -all` |
| `donovanfamilydentistry.com` | TXT | `NETORGFT12395633.onmicrosoft.com` |
| `donovanfamilydentistry.com` | CAA | No data returned |
| `www.donovanfamilydentistry.com` | CNAME | `donovanfamilydentistry.com` |
| `www.donovanfamilydentistry.com` | A | `107.180.115.120` |
| `_dmarc.donovanfamilydentistry.com` | TXT | Name not found |
| `autodiscover.donovanfamilydentistry.com` | CNAME | `autodiscover.outlook.com` |
| `mail.donovanfamilydentistry.com` | A | `107.180.115.120` |
| `portal.donovanfamilydentistry.com` | A/CNAME | Name not found |
| `appointments.donovanfamilydentistry.com` | A/CNAME | Name not found |
| `schedule.donovanfamilydentistry.com` | A/CNAME | Name not found |

## TLS and HTTP observations

- Authorized TLS connection to the apex failed with `CERT_HAS_EXPIRED`.
- Authorized TLS connection to `www` failed with `CERT_HAS_EXPIRED`.
- Safe HTTPS fetches to both apex and `www` failed from the GitHub-hosted runner.

This evidence supports investigation of the current website certificate and hosting configuration. It does not authorize a DNS cutover or prove that every client experiences the same failure.

## Migration implications

- The authoritative nameservers appear to be GoDaddy `domaincontrol.com` servers.
- Mail routing appears to use Microsoft 365 through `mail.protection.outlook.com`.
- Autodiscover points to Microsoft Outlook.
- The current SPF record authorizes `secureserver.net`; the responsible administrator must determine whether this is still required before changing it.
- No public DMARC record was found at the time of the inventory. DMARC policy must be reviewed by the email administrator rather than added as part of an unrelated website cutover.
- Generic DNS queries cannot discover every DKIM selector. Export all DKIM records from the authoritative DNS provider and verify Microsoft 365 configuration.
- `mail.donovanfamilydentistry.com` resolves to the current web-host IP and must be investigated before changing the apex or current hosting target.
- No CAA record was observed; certificate-authority policy remains an administrator decision.

## Evidence still required

This public snapshot does **not** clear the `dns-zone-backup` or `email-service-preservation` launch gates. Before production cutover, obtain and review:

- a complete authoritative DNS-zone export, including TTL and proxy state;
- every MX, SPF, DKIM, DMARC, autodiscover, verification, and mail-related record;
- the current registrar, DNS, Microsoft 365, and website-host account owners;
- any portal, scheduling, payment, review, analytics, remote-access, or vendor records that use the domain;
- the intended current-site certificate remediation or replacement timeline;
- the exact prior web targets and tested rollback procedure.
