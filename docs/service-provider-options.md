# Service Provider Options

Pricing checked July 31, 2026. Vendor pricing and eligibility can change; obtain a written quote and Business Associate Agreement (BAA), where applicable, before production use.

## Recommended staged stack

### Stage 1 — public website and non-PHI administrative inquiries

| Service | Recommended option | Current price | Purpose |
|---|---|---:|---|
| Hosting/CDN | Cloudflare Pages | $0 for static-site requests | Site hosting and preview deployments |
| Spam protection | Cloudflare Turnstile Free | $0 | Bot protection for forms |
| Analytics | Cloudflare Web Analytics | $0 | Privacy-oriented traffic measurement |
| Non-PHI contact form | Basin Free | $0; 1 form and 50 submissions/month | Pilot administrative inquiry form |
| Non-PHI contact form upgrade | Basin Starter | $12.50/month, billed annually | 3 forms and 250 submissions/month |
| Optional custom backend | Cloudflare Workers Paid | $5/month minimum | Custom routing or integrations when needed |

**Expected Stage 1 operating cost:** $0–$17.50/month, excluding the domain and any email service already used by the practice.

This workflow must remain administrative. The form should reject or clearly warn against symptoms, diagnoses, medication lists, Social Security numbers, insurance identifiers, medical history, and treatment details.

## Secure patient forms and messaging

| Service | Current public price | Included / notable features | Best fit |
|---|---:|---|---|
| Hushmail Secure Messaging & Forms | $14.99/month | 1 user, up to 25 HIPAA-capable forms, BAA, secure contact form/file drop, e-signatures | Lowest-cost secure forms pilot |
| Jotform Gold | $99/month, billed annually | HIPAA-enabled features, 100 forms, 10,000 monthly submissions | Flexible multi-form intake and workflow |
| Formstack Forms | $83/month annual or $99/month monthly | General form platform; healthcare/BAA terms must be confirmed | More advanced workflow and integrations |
| Spruce Basic | $24/user/month | BAA, secure calls, texts, fax, video, and team messaging | Small-office communications |
| Spruce Communicator | $49/user/month | Expanded communications and workflow features | Heavier patient communication needs |
| OhMD Core | Starts at $300/month | Healthcare communication platform | Larger or more automated messaging workflow |
| OhMD AI & Automation | Starts at $500/month | Added automation capabilities | Higher-volume practice operations |

Spruce also lists a one-time $19.50 outbound SMS registration fee; telecom taxes and fees may apply.

### Example Spruce monthly totals

| Seats | Basic | Communicator |
|---:|---:|---:|
| 3 | $72 | $147 |
| 5 | $120 | $245 |

## Dental scheduling and patient-engagement platforms

| Service | Public pricing status | Notes |
|---|---|---|
| Weave | Official pages show starting prices of $149–$199/month; quote required | Phones, texting, scheduling, forms, reviews, and payments may be bundled |
| NexHealth | Quote required | Scheduling, forms, messaging, and practice-management integrations |
| LocalMed | Quote required | Dental-focused real-time online scheduling |
| RevenueWell | Quote required | Dental marketing and patient communication |
| Solutionreach | Quote required | Patient reminders and communication |

For any quote-based vendor, request an itemized proposal that separates setup, monthly subscription, phone/SMS usage, number porting, forms, scheduling, payments, support, contract term, and cancellation fees.

## Recommendation

1. Launch the brochure site on Cloudflare Pages.
2. Use Cloudflare Turnstile and either Basin Free or Basin Starter for **non-PHI administrative inquiries only**.
3. Use Hushmail Secure Messaging & Forms for a low-cost secure-intake pilot if the practice wants online submission of protected information.
4. Evaluate Spruce when secure texting/calling becomes a priority.
5. Solicit comparable quotes from Weave, NexHealth, and LocalMed only after confirming the practice-management system and required integrations.

A vendor claiming HIPAA support is not enough by itself. Production use also requires a signed BAA, correct configuration, access controls, retention decisions, staff procedures, and an approved incident-response path.
