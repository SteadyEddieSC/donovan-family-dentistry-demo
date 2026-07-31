# Production migration checklist

Production migration is not authorized by completion of the demo.

## Before any DNS change

- Identify the domain registrar and current authoritative DNS provider
- Export or screenshot every DNS record
- Preserve MX, SPF, DKIM, DMARC, verification, patient-portal, and scheduling records
- Document current hosting and rollback steps
- Create permanent redirects for changed URLs, including `/procedures/` to `/services/`
- Confirm forms download correctly and HTTPS works on the preview
- Obtain written owner approval of content and design

## Cutover validation

- Apex and `www` resolve correctly
- HTTPS certificate is valid
- Phone and directions links work on mobile
- All PDFs download successfully
- Legacy URLs redirect without loops
- Email delivery and authentication remain intact
- Patient portal and scheduling integrations remain intact
- Owner approves the live result

Do not cancel previous hosting until validation is complete and the rollback period has passed.
