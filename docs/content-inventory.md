# Existing-site content inventory

Captured July 31, 2026 for the private demonstration rebuild.

## Pages and URLs

| Existing page | Existing URL | Demo route | Status |
| --- | --- | --- | --- |
| Home | `https://donovanfamilydentistry.com/` | `/` | Recreated |
| About | `https://donovanfamilydentistry.com/about/` | `/about/` | Dr. Donovan retained; former provider removed |
| Forms | `https://donovanfamilydentistry.com/patient-forms/` | `/forms/` | Recreated with fillable demo PDFs based on the supplied forms |
| Procedures | `https://donovanfamilydentistry.com/procedures/` | `/services/` | Recreated; redirect needed later |
| Contact | `https://donovanfamilydentistry.com/contact/` | `/contact/` | Combined contact and directions |
| Directions | Existing navigation item | `/contact/` | Exact legacy destination not captured because the live site returned 502 errors |

## Verified practice information

- Business name: Donovan Family Dentistry
- Phone: (843) 525-6866
- Address: 91 Sams Point Road, Beaufort, SC 29907
- Hours: Monday-Thursday 7:30 AM-5:00 PM; Friday-Sunday closed
- Dr. William Donovan profile: owner confirmed current
- Dr. Koolkin profile: removed because he has been replaced

## Assets

| Asset | Demo location | Source |
| --- | --- | --- |
| Practice logo | `/public/images/donovan-logo.svg` | Recreated from the branding shown in the supplied current-site screenshot |
| Office exterior | `/public/images/office-exterior.webp` | Cropped from supplied current-site screenshot |
| New-patient and medical-history form | `/public/forms/new-patient-medical-history.pdf` | Owner-supplied form recreated as an accessible, locally fillable demo PDF |
| Notice of Privacy Practices | `/public/forms/privacy-practices.pdf` | Owner-supplied notice recreated as a cleaner PDF with a fillable acknowledgement page |

## Service wording

The service list is stored in `src/data/services.json`. It preserves the current public wording with only light punctuation and capitalization normalization.

## Retrieval limitation

The live website returned HTTP 502 responses during direct inspection. Search-engine indexed copies and owner-supplied files/screenshots were used, and uncertain items are recorded in `docs/owner-review.md`.
