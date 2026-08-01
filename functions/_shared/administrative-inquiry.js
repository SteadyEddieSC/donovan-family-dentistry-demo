const MAX_REQUEST_BYTES = 16 * 1024;
const DEFAULT_MIN_FORM_AGE_MS = 1_500;
const DEFAULT_MAX_FORM_AGE_MS = 2 * 60 * 60 * 1_000;

export const ALLOWED_PREFERENCES = ['Phone call', 'Email'];
export const ALLOWED_TOPICS = [
  'New-patient scheduling',
  'Existing appointment',
  'Forms question',
  'Billing or insurance administration',
  'Directions or office information',
  'Other general question'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BASIN_ENDPOINT_PATTERN = /^https:\/\/usebasin\.com\/f\/[A-Za-z0-9_-]+$/;

function responseHeaders(extra = {}) {
  return {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...extra
  };
}

export function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders(extraHeaders)
  });
}

function envNumber(value, fallback) {
  if (value === undefined || value === null || String(value).trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function stringValue(formData, key) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function singleLine(value, maximum) {
  return value.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, maximum);
}

function multiLine(value, maximum) {
  return value.replace(/\r\n?/g, '\n').trim().slice(0, maximum);
}

function hasOnlyStringValues(formData) {
  for (const [, value] of formData.entries()) {
    if (typeof value !== 'string') return false;
  }
  return true;
}

export function validateAdministrativeInquiry(formData, options = {}) {
  const now = options.now ?? Date.now();
  const minFormAgeMs = options.minFormAgeMs ?? DEFAULT_MIN_FORM_AGE_MS;
  const maxFormAgeMs = options.maxFormAgeMs ?? DEFAULT_MAX_FORM_AGE_MS;

  if (!hasOnlyStringValues(formData)) {
    return { ok: false, status: 400, code: 'attachments_not_allowed' };
  }

  if (singleLine(stringValue(formData, '_gotcha'), 200)) {
    return { ok: false, status: 200, code: 'accepted_bot' };
  }

  const startedAt = Number(stringValue(formData, 'form_started_at'));
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return { ok: false, status: 400, code: 'missing_form_start' };
  }

  const formAge = now - startedAt;
  if (formAge < minFormAgeMs) {
    return { ok: false, status: 400, code: 'submitted_too_quickly' };
  }
  if (formAge > maxFormAgeMs || formAge < 0) {
    return { ok: false, status: 400, code: 'stale_form' };
  }

  const name = singleLine(stringValue(formData, 'name'), 100);
  const phone = singleLine(stringValue(formData, 'phone'), 40);
  const email = singleLine(stringValue(formData, 'email'), 160).toLowerCase();
  const preference = singleLine(stringValue(formData, 'preference'), 40);
  const topic = singleLine(stringValue(formData, 'topic'), 80);
  const message = multiLine(stringValue(formData, 'message'), 600);
  const safe = stringValue(formData, 'safe');
  const phoneDigits = phone.replace(/\D/g, '');

  const errors = [];
  if (name.length < 2) errors.push('name');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) errors.push('phone');
  if (email && !EMAIL_PATTERN.test(email)) errors.push('email');
  if (!ALLOWED_PREFERENCES.includes(preference)) errors.push('preference');
  if (preference === 'Email' && !email) errors.push('email');
  if (!ALLOWED_TOPICS.includes(topic)) errors.push('topic');
  if (message.length < 10) errors.push('message');
  if (safe !== 'confirmed') errors.push('safe');

  if (errors.length > 0) {
    return { ok: false, status: 400, code: 'invalid_fields', fields: [...new Set(errors)] };
  }

  return {
    ok: true,
    data: { name, phone, email, preference, topic, message }
  };
}

function configuredOrigins(request, env) {
  const raw = String(env.ADMIN_INQUIRY_ALLOWED_ORIGINS ?? '').trim();
  if (!raw) return [new URL(request.url).origin];
  return raw
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

export function isAllowedRequestOrigin(request, env = {}) {
  const origin = request.headers.get('Origin')?.replace(/\/$/, '') ?? '';
  if (!origin) return false;

  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && !['same-origin', 'same-site'].includes(fetchSite)) return false;

  return configuredOrigins(request, env).includes(origin);
}

export async function validateTurnstile({ token, secret, remoteIp, fetchImpl = fetch }) {
  if (!token || token.length > 2048 || !secret) {
    return { success: false, 'error-codes': ['missing-input-response'] };
  }

  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);
  body.set('idempotency_key', crypto.randomUUID());

  try {
    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return { success: false, 'error-codes': ['internal-error'] };
    return await response.json();
  } catch {
    return { success: false, 'error-codes': ['internal-error'] };
  }
}

function publicOrigin(request, env) {
  const configured = String(env.ADMIN_INQUIRY_PUBLIC_ORIGIN ?? '').trim().replace(/\/$/, '');
  return configured || new URL(request.url).origin;
}

function validRuntimeConfiguration(env) {
  const basinEndpoint = String(env.BASIN_FORM_ENDPOINT ?? '').trim();
  const turnstileSecret = String(env.TURNSTILE_SECRET_KEY ?? '').trim();
  return {
    basinEndpoint,
    turnstileSecret,
    valid: BASIN_ENDPOINT_PATTERN.test(basinEndpoint) && turnstileSecret.length >= 8
  };
}

async function applyOptionalRateLimit(context, remoteIp) {
  const limiter = context.env.ADMIN_INQUIRY_RATE_LIMITER;
  if (!limiter || typeof limiter.limit !== 'function') return true;
  const result = await limiter.limit({ key: `administrative-inquiry:${remoteIp || 'unknown'}` });
  return Boolean(result?.success);
}

async function parseSizedFormData(request) {
  const rawBody = await request.arrayBuffer();
  if (rawBody.byteLength > MAX_REQUEST_BYTES) {
    return { ok: false, status: 413, code: 'request_too_large' };
  }

  const parsingRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: rawBody
  });
  const formData = await parsingRequest.formData();
  return { ok: true, formData };
}

export function createAdministrativeInquiryHandler(options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => Date.now());
  const randomUUID = options.randomUUID ?? (() => crypto.randomUUID());

  return async function handleAdministrativeInquiry(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
      return jsonResponse(
        { ok: false, code: 'method_not_allowed', message: 'Use POST for this endpoint.' },
        405,
        { Allow: 'POST' }
      );
    }

    if (!isAllowedRequestOrigin(request, env)) {
      return jsonResponse(
        { ok: false, code: 'origin_not_allowed', message: 'The request could not be verified.' },
        403
      );
    }

    const contentType = request.headers.get('Content-Type') ?? '';
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      return jsonResponse(
        { ok: false, code: 'unsupported_media_type', message: 'Submit the website form and try again.' },
        415
      );
    }

    const contentLength = Number(request.headers.get('Content-Length') ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return jsonResponse(
        { ok: false, code: 'request_too_large', message: 'The request is too large.' },
        413
      );
    }

    const runtime = validRuntimeConfiguration(env);
    if (!runtime.valid) {
      return jsonResponse(
        { ok: false, code: 'not_configured', message: 'Online requests are temporarily unavailable. Please call the office.' },
        503
      );
    }

    let parsed;
    try {
      parsed = await parseSizedFormData(request);
    } catch {
      return jsonResponse(
        { ok: false, code: 'invalid_form', message: 'The request could not be read. Please review the form and try again.' },
        400
      );
    }

    if (!parsed.ok) {
      return jsonResponse(
        { ok: false, code: parsed.code, message: 'The request is too large.' },
        parsed.status
      );
    }

    const formData = parsed.formData;
    const validation = validateAdministrativeInquiry(formData, {
      now: now(),
      minFormAgeMs: envNumber(env.ADMIN_INQUIRY_MIN_FORM_AGE_MS, DEFAULT_MIN_FORM_AGE_MS),
      maxFormAgeMs: envNumber(env.ADMIN_INQUIRY_MAX_FORM_AGE_MS, DEFAULT_MAX_FORM_AGE_MS)
    });

    if (!validation.ok) {
      if (validation.code === 'accepted_bot') {
        return jsonResponse({ ok: true, message: 'Your administrative request was sent.' });
      }
      return jsonResponse(
        {
          ok: false,
          code: validation.code,
          fields: validation.fields ?? [],
          message: 'Please review the highlighted information and try again.'
        },
        validation.status
      );
    }

    const remoteIp = request.headers.get('CF-Connecting-IP') ?? '';
    if (!(await applyOptionalRateLimit(context, remoteIp))) {
      return jsonResponse(
        { ok: false, code: 'rate_limited', message: 'Too many requests were received. Please wait and try again or call the office.' },
        429,
        { 'Retry-After': '60' }
      );
    }

    const turnstileToken = stringValue(formData, 'cf-turnstile-response');
    const turnstile = await validateTurnstile({
      token: turnstileToken,
      secret: runtime.turnstileSecret,
      remoteIp,
      fetchImpl
    });

    if (!turnstile.success || (turnstile.action && turnstile.action !== 'administrative-contact')) {
      return jsonResponse(
        { ok: false, code: 'verification_failed', message: 'The anti-spam check expired or could not be verified. Please try again.' },
        400
      );
    }

    const requestId = randomUUID();
    const outgoing = new FormData();
    outgoing.set('form_name', 'Donovan Family Dentistry administrative request');
    outgoing.set('source_page', 'Modern contact page');
    outgoing.set('request_id', requestId);
    outgoing.set('received_at', new Date(now()).toISOString());
    for (const [key, value] of Object.entries(validation.data)) outgoing.set(key, value);

    try {
      const upstream = await fetchImpl(runtime.basinEndpoint, {
        method: 'POST',
        body: outgoing,
        headers: {
          Accept: 'application/json',
          Origin: publicOrigin(request, env)
        }
      });

      if (upstream.status === 429) {
        return jsonResponse(
          { ok: false, code: 'rate_limited', message: 'Too many requests were received. Please wait and try again or call the office.' },
          429,
          { 'Retry-After': upstream.headers.get('Retry-After') ?? '60' }
        );
      }

      if (!upstream.ok) {
        console.error(`Administrative inquiry upstream failure: ${requestId} status=${upstream.status}`);
        return jsonResponse(
          { ok: false, code: 'delivery_failed', message: 'The request was not delivered. Please call the office instead.' },
          502
        );
      }

      return jsonResponse({
        ok: true,
        requestId,
        message: 'Your administrative request was sent.'
      });
    } catch {
      console.error(`Administrative inquiry upstream error: ${requestId}`);
      return jsonResponse(
        { ok: false, code: 'delivery_failed', message: 'The request was not delivered. Please call the office instead.' },
        502
      );
    }
  };
}
