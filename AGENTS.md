# Repository agent operating rules

These instructions apply to automated contributors and assistants working in this repository.

## Ownership and authority

- This is an **Eddie personal / non-LDW production website repository**. Reuse of LDW tooling or review controls does not make it an LDW-owned product, service, customer environment, or revenue property.
- Live repository and provider state is authoritative over stale chat history, old handoffs, or historical release notes.
- This repository remains the maintained production source until the customer-ownership transfer in issue #65 is explicitly activated and accepted.
- `docs/HANDOFF_READINESS.md` is the repository-side preparation guide for that eventual transfer. It is not cutover authorization.

## Safety and data boundaries

- Never place patient information, completed forms, medical/dental details, private mailbox contents, credentials, secret values, private DNS exports, recovery codes, or other protected/private data in Git, issues, pull requests, logs, fixtures, screenshots, or workflow artifacts.
- Use synthetic or clearly public-safe test data only.
- Do not change DNS, nameservers, registrar settings, mail/non-web DNS, Cloudflare account ownership, billing, MFA/recovery, customer identities, or transfer/cutover state without explicit owner/customer authorization for that action.
- Preserve current production availability, mail behavior, and the least-disruptive rollback path during normal maintenance.
- Do not infer provider/account ownership, secrets, DNS state, billing, or recovery configuration from repository text; verify live provider state at the applicable owner gate.

## Change discipline

- Use a short-lived branch and pull request; do not commit routine changes directly to `main`.
- Keep changes narrowly scoped and avoid new services, dependencies, or platform complexity unless they materially reduce risk or solve an approved requirement.
- Preserve the existing Astro/Cloudflare Pages architecture unless an approved issue authorizes an architectural change.
- Preserve the Classic production experience, explicit noindex/private-demo boundaries, accessibility/security controls, Pages CMS recovery paths, and patient-data exclusions unless the owning issue explicitly changes them.
- For dependencies and workflows, prefer immutable version/SHA pins and preserve least-privilege permissions.

## Validation and acceptance

- Validate the exact PR head after the final source change.
- Run the repository's applicable CI, security, CodeQL, build, unit, browser/compatibility, accessibility, and content/readiness checks for the changed surface.
- Add regression coverage when behavior changes.
- Do not treat a stale green run as acceptance after the candidate head moves.
- Require independent review before merging security-sensitive, production-affecting, ownership-transfer, recovery, deployment, or other consequential changes.
- After merge, verify the accepted `main` commit and applicable post-merge checks before declaring the work closed.

## Production and handoff boundaries

- Routine production source/security/content maintenance may continue under normal controls.
- Issue #65 is the activation gate for moving production to Donovan-owned GitHub/Cloudflare and retiring this repository.
- Do not archive, disable production automation, remove credentials/integrations, or move the production domain merely because handoff preparation exists.
- At transfer time, re-verify live GitHub, Cloudflare, registrar/DNS, Pages CMS, mail dependencies, recovery/MFA, and billing ownership; preserve non-web DNS and a tested rollback path.
