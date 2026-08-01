const enabledValue = process.env.PUBLIC_ADMIN_INQUIRY_ENABLED;
const publicSiteKey = process.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';
const exposedBasinEndpoint = process.env.PUBLIC_BASIN_FORM_ENDPOINT?.trim() ?? '';
const exposedSecret = process.env.PUBLIC_TURNSTILE_SECRET_KEY?.trim() ?? '';

if (enabledValue !== undefined && !['true', 'false'].includes(enabledValue)) {
  console.error('PUBLIC_ADMIN_INQUIRY_ENABLED must be either true or false when supplied.');
  process.exit(1);
}

if (exposedBasinEndpoint) {
  console.error('PUBLIC_BASIN_FORM_ENDPOINT is no longer supported. Store BASIN_FORM_ENDPOINT as an encrypted Cloudflare Pages runtime secret.');
  process.exit(1);
}

if (exposedSecret) {
  console.error('PUBLIC_TURNSTILE_SECRET_KEY must never be exposed to the static build. Store TURNSTILE_SECRET_KEY as an encrypted Cloudflare Pages runtime secret.');
  process.exit(1);
}

const liveRequested = enabledValue === 'true';
if (liveRequested && !publicSiteKey) {
  console.error('PUBLIC_TURNSTILE_SITE_KEY is required when PUBLIC_ADMIN_INQUIRY_ENABLED=true.');
  process.exit(1);
}

if (liveRequested) {
  console.log('Administrative inquiry build configuration passed: the same-origin live form and public Turnstile site key are enabled.');
} else {
  console.log('Administrative inquiry build configuration passed: safe preview mode remains active.');
}
