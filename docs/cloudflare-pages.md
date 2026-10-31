# Cloudflare Pages deployment

This repository is deployed as a static Astro site through Cloudflare Pages.

## Build settings

- Production branch: `main`
- Root directory: leave blank
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 22

The repository root contains `package.json`; Cloudflare must build the latest accepted `main` commit rather than retrying an earlier failed deployment.

## Production safety

The practice's production domain is already serving the current Classic site. Treat live Cloudflare, DNS, registrar, mail, and account state as authoritative rather than relying on older pre-cutover release notes.

For routine maintenance, preserve the current production domain, existing DNS and mail behavior, and the least-disruptive rollback path. For the eventual customer-ownership transfer, follow `docs/HANDOFF_READINESS.md` and issue #65; do not move the domain, recreate provider configuration, change account ownership, or alter non-web DNS until that transfer is explicitly activated and the live provider state has been re-verified.
