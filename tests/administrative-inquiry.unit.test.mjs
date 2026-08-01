import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALLOWED_PREFERENCES,
  ALLOWED_TOPICS,
  createAdministrativeInquiryHandler,
  isAllowedRequestOrigin,
  validateAdministrativeInquiry,
  validateTurnstile
} from '../functions/_shared/administrative-inquiry.js';

const NOW = 1_780_000_000_000;
const ORIGIN = 'https://demo.example';
const BASIN_ENDPOINT = 'https://usebasin.com/f/example123';

function validForm(overrides = {}) {
  const values = {
    name: 'Alex Patient',
    phone: '(843) 555-0100',
    email: 'alex@example.com',
    preference: 'Phone call',
    topic: 'New-patient scheduling',
    message: 'Please call me about new-patient appointment availability.',
    safe: 'confirmed',
    _gotcha: '',
    form_started_at: String(NOW - 5_000),
    'cf-turnstile-response': 'valid-turnstile-token',
    ...overrides
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

function requestWith(formData, headers = {}) {
  return new Request(`${ORIGIN}/api/administrative-inquiry`, {
    method: 'POST',
    body: formData,
    headers: {
      Origin: ORIGIN,
      'Sec-Fetch-Site': 'same-origin',
      'CF-Connecting-IP': '203.0.113.25',
      ...headers
    }
  });
}

function environment(overrides = {}) {
  return {
    BASIN_FORM_ENDPOINT: BASIN_ENDPOINT,
    TURNSTILE_SECRET_KEY: 'turnstile-secret-for-tests',
    ADMIN_INQUIRY_ALLOWED_ORIGINS: ORIGIN,
    ADMIN_INQUIRY_PUBLIC_ORIGIN: ORIGIN,
    ...overrides
  };
}

test('allowed inquiry options remain explicit and stable', () => {
  assert.deepEqual(ALLOWED_PREFERENCES, ['Phone call', 'Email']);
  assert.equal(ALLOWED_TOPICS.length, 6);
  assert.ok(ALLOWED_TOPICS.includes('Billing or insurance administration'));
});

test('validates and normalizes a safe administrative request', () => {
  const result = validateAdministrativeInquiry(validForm({ name: '  Alex\nPatient  ' }), { now: NOW });
  assert.equal(result.ok, true);
  assert.equal(result.data.name, 'Alex Patient');
  assert.equal(result.data.email, 'alex@example.com');
  assert.equal(result.data.message, 'Please call me about new-patient appointment availability.');
});

test('requires an email address when email is the requested reply method', () => {
  const result = validateAdministrativeInquiry(validForm({ preference: 'Email', email: '' }), { now: NOW });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'invalid_fields');
  assert.ok(result.fields.includes('email'));
});

test('rejects implausibly fast, stale, and attachment-bearing submissions', () => {
  const fast = validateAdministrativeInquiry(validForm({ form_started_at: String(NOW - 100) }), { now: NOW });
  assert.equal(fast.code, 'submitted_too_quickly');

  const stale = validateAdministrativeInquiry(validForm({ form_started_at: String(NOW - 8_000_000) }), { now: NOW });
  assert.equal(stale.code, 'stale_form');

  const attachment = validForm();
  attachment.set('upload', new Blob(['not allowed'], { type: 'text/plain' }), 'notes.txt');
  const attached = validateAdministrativeInquiry(attachment, { now: NOW });
  assert.equal(attached.code, 'attachments_not_allowed');
});

test('treats a completed honeypot as accepted without forwarding', () => {
  const result = validateAdministrativeInquiry(validForm({ _gotcha: 'spam.example' }), { now: NOW });
  assert.equal(result.ok, false);
  assert.equal(result.status, 200);
  assert.equal(result.code, 'accepted_bot');
});

test('requires a same-origin or explicitly allowed browser request', () => {
  const allowed = requestWith(validForm());
  assert.equal(isAllowedRequestOrigin(allowed, environment()), true);

  const crossSite = requestWith(validForm(), { Origin: 'https://attacker.example', 'Sec-Fetch-Site': 'cross-site' });
  assert.equal(isAllowedRequestOrigin(crossSite, environment()), false);
});

test('Turnstile verification sends the secret and remote address only to Siteverify', async () => {
  let captured;
  const result = await validateTurnstile({
    token: 'token-value',
    secret: 'secret-value',
    remoteIp: '203.0.113.25',
    fetchImpl: async (url, init) => {
      captured = { url, body: init.body };
      return Response.json({ success: true, action: 'administrative-contact' });
    }
  });

  assert.equal(result.success, true);
  assert.equal(captured.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(captured.body.get('secret'), 'secret-value');
  assert.equal(captured.body.get('response'), 'token-value');
  assert.equal(captured.body.get('remoteip'), '203.0.113.25');
});

test('handler forwards only allowlisted administrative fields after Turnstile succeeds', async () => {
  const calls = [];
  const handler = createAdministrativeInquiryHandler({
    now: () => NOW,
    randomUUID: () => 'request-123',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      if (url.includes('/siteverify')) {
        return Response.json({ success: true, action: 'administrative-contact', hostname: 'demo.example' });
      }
      return Response.json({ success: true });
    }
  });

  const response = await handler({ request: requestWith(validForm()), env: environment() });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.requestId, 'request-123');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, BASIN_ENDPOINT);
  assert.equal(calls[1].init.headers.Origin, ORIGIN);

  const forwarded = calls[1].init.body;
  assert.equal(forwarded.get('name'), 'Alex Patient');
  assert.equal(forwarded.get('phone'), '(843) 555-0100');
  assert.equal(forwarded.get('request_id'), 'request-123');
  assert.equal(forwarded.get('cf-turnstile-response'), null);
  assert.equal(forwarded.get('_gotcha'), null);
  assert.equal(forwarded.get('safe'), null);
  assert.equal(forwarded.get('form_started_at'), null);
});

test('handler fails closed when runtime services are not configured', async () => {
  let called = false;
  const handler = createAdministrativeInquiryHandler({
    now: () => NOW,
    fetchImpl: async () => {
      called = true;
      return Response.json({ success: true });
    }
  });

  const response = await handler({ request: requestWith(validForm()), env: {} });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.code, 'not_configured');
  assert.equal(called, false);
});

test('handler rejects invalid Turnstile tokens without contacting Basin', async () => {
  let callCount = 0;
  const handler = createAdministrativeInquiryHandler({
    now: () => NOW,
    fetchImpl: async () => {
      callCount += 1;
      return Response.json({ success: false, 'error-codes': ['invalid-input-response'] });
    }
  });

  const response = await handler({ request: requestWith(validForm()), env: environment() });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.code, 'verification_failed');
  assert.equal(callCount, 1);
});

test('handler returns a retryable 429 when the optional edge limiter blocks a request', async () => {
  let called = false;
  const handler = createAdministrativeInquiryHandler({
    now: () => NOW,
    fetchImpl: async () => {
      called = true;
      return Response.json({ success: true });
    }
  });

  const response = await handler({
    request: requestWith(validForm()),
    env: environment({ ADMIN_INQUIRY_RATE_LIMITER: { limit: async () => ({ success: false }) } })
  });
  const body = await response.json();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal(body.code, 'rate_limited');
  assert.equal(called, false);
});

test('handler maps an upstream Basin rate limit to a safe same-origin response', async () => {
  let callCount = 0;
  const handler = createAdministrativeInquiryHandler({
    now: () => NOW,
    fetchImpl: async (url) => {
      callCount += 1;
      if (url.includes('/siteverify')) {
        return Response.json({ success: true, action: 'administrative-contact' });
      }
      return new Response('slow down', { status: 429, headers: { 'Retry-After': '120' } });
    }
  });

  const response = await handler({ request: requestWith(validForm()), env: environment() });
  const body = await response.json();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '120');
  assert.equal(body.code, 'rate_limited');
  assert.equal(callCount, 2);
});
