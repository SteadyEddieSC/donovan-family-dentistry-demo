import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALLOWED_PREFERENCES,
  ALLOWED_TOPICS,
  isAllowedRequestOrigin,
  validateAdministrativeInquiry,
  validateTurnstile,
} from '../functions/_shared/administrative-inquiry.js';

const NOW = 1_780_000_000_000;
const ORIGIN = 'https://demo.example';

function validForm() {
  const form = new FormData();
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
    'cf-turnstile-response': 'test-token',
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function randomAscii(next, maxLength = 900) {
  const length = next() % (maxLength + 1);
  let value = '';
  for (let index = 0; index < length; index += 1) {
    const bucket = next() % 8;
    if (bucket === 0) value += '\n';
    else if (bucket === 1) value += '\t';
    else value += String.fromCharCode(32 + (next() % 95));
  }
  return value;
}

test('deterministic form fuzzing never escapes accepted field boundaries', () => {
  const next = xorshift32(0x44464431);
  const fields = ['name', 'phone', 'email', 'preference', 'topic', 'message', 'safe'];

  for (let index = 0; index < 600; index += 1) {
    const form = validForm();
    const field = fields[next() % fields.length];
    form.set(field, randomAscii(next));

    let result;
    assert.doesNotThrow(() => {
      result = validateAdministrativeInquiry(form, { now: NOW });
    });

    if (result.ok) {
      assert.ok(result.data.name.length <= 100);
      assert.ok(result.data.phone.length <= 40);
      assert.ok(result.data.email.length <= 160);
      assert.ok(result.data.message.length <= 600);
      assert.ok(ALLOWED_PREFERENCES.includes(result.data.preference));
      assert.ok(ALLOWED_TOPICS.includes(result.data.topic));
      assert.doesNotMatch(result.data.name, /[\r\n\t]/);
      assert.doesNotMatch(result.data.phone, /[\r\n\t]/);
      assert.doesNotMatch(result.data.email, /[\r\n\t]/);
      assert.doesNotMatch(result.data.preference, /[\r\n\t]/);
      assert.doesNotMatch(result.data.topic, /[\r\n\t]/);
      assert.doesNotMatch(result.data.message, /\r/);
    }
  }
});

test('origin validation rejects scheme, host, credential, port, and fetch-site confusion', () => {
  const env = { ADMIN_INQUIRY_ALLOWED_ORIGINS: ORIGIN };
  const allowed = new Request(ORIGIN + '/api/administrative-inquiry', {
    headers: { Origin: ORIGIN, 'Sec-Fetch-Site': 'same-origin' },
  });
  assert.equal(isAllowedRequestOrigin(allowed, env), true);

  const rejected = [
    ['http://demo.example', 'same-origin'],
    ['https://demo.example.evil.test', 'same-origin'],
    ['https://sub.demo.example', 'same-origin'],
    ['https://demo.example:8443', 'same-origin'],
    ['https://user@demo.example', 'same-origin'],
    [ORIGIN, 'cross-site'],
  ];

  for (const [origin, fetchSite] of rejected) {
    const request = new Request(ORIGIN + '/api/administrative-inquiry', {
      headers: { Origin: origin, 'Sec-Fetch-Site': fetchSite },
    });
    assert.equal(isAllowedRequestOrigin(request, env), false, origin + ' / ' + fetchSite);
  }
});

test('attachments and oversized Turnstile tokens fail closed before external verification', async () => {
  const withAttachment = validForm();
  withAttachment.set('attachment', new Blob(['synthetic']), 'test.txt');
  const validation = validateAdministrativeInquiry(withAttachment, { now: NOW });
  assert.equal(validation.ok, false);
  assert.equal(validation.code, 'attachments_not_allowed');

  let fetchCalls = 0;
  const fetchImpl = async () => {
    fetchCalls += 1;
    throw new Error('fetch should not be called for invalid token boundaries');
  };

  for (const token of ['', 'x'.repeat(2049)]) {
    const result = await validateTurnstile({
      token,
      secret: 'test-secret',
      remoteIp: '203.0.113.25',
      fetchImpl,
    });
    assert.equal(result.success, false);
  }

  assert.equal(fetchCalls, 0);
});
