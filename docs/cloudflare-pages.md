# Cloudflare Pages deployment

This repository is deployed as a static Astro site through Cloudflare Pages.

## Build settings

- Production branch: `main`
- Root directory: leave blank
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 22

The repository root contains `package.json`; Cloudflare must build the latest `main` commit rather than retrying an earlier failed deployment.

## Production safety

Do not attach the practice's production domain until the preview has been reviewed and the existing DNS, email, portal, and scheduling records have been inventoried and preserved.
