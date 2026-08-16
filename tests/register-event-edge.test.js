const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { handleRegistrationRequest } = require('../supabase/functions/register-event/core.js');

const env = {
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
  TURNSTILE_SECRET_KEY: 'turnstile-secret',
  RATE_LIMIT_SECRET: 'rate-limit-secret-at-least-32-bytes',
};

const validBody = {
  submission_id: 'f4fd62e3-9445-4d9f-a937-ef45c6989587',
  event_slug: 'dpw-tea-party-chicago',
  event_title: 'DPW Tea Party',
  first_name: 'Grace', last_name: 'Jones', email: 'grace@example.com',
  phone: '+1 312 555 0100', address: '', city: 'Chicago', country: 'USA',
  ministry_role: "Pastor's wife", notes: '', consent: true,
  website: '', turnstile_token: 'browser-proof',
};

function request(body = validBody, overrides = {}) {
  return new Request('https://project.functions.supabase.co/register-event', {
    method: 'POST',
    headers: {
      origin: 'https://dearpastorswife.org',
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.10',
      ...overrides.headers,
    },
    body: JSON.stringify(body),
    ...overrides,
  });
}

function backendMock({ turnstile = true, rate = true, registration = 'stored' } = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('challenges.cloudflare.com')) {
      return new Response(JSON.stringify({ success: turnstile, hostname: 'dearpastorswife.org', action: 'event_registration' }), { status: 200 });
    }
    if (String(url).endsWith('/rest/v1/rpc/claim_event_registration_attempt')) {
      return new Response(JSON.stringify(rate), { status: 200 });
    }
    if (String(url).endsWith('/rest/v1/rpc/register_event_registration')) {
      return new Response(JSON.stringify(registration), { status: 200 });
    }
    throw new Error('unexpected URL');
  };
  return { calls, fetchImpl };
}

test('validates Turnstile, claims a rate-limit slot, and atomically stores a registration', async () => {
  const mock = backendMock();
  const response = await handleRegistrationRequest(request(), env, mock.fetchImpl);
  const responseForLeakCheck = response.clone();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'stored' });
  assert.equal(mock.calls.length, 3);
  assert.ok(mock.calls[1].url.endsWith('/rest/v1/rpc/claim_event_registration_attempt'));
  assert.ok(mock.calls[2].url.endsWith('/rest/v1/rpc/register_event_registration'));
  assert.equal(mock.calls[2].options.headers.Authorization, 'Bearer service-role-secret');
  assert.doesNotMatch(await responseForLeakCheck.text(), /service-role-secret|browser-proof|grace@example/);
});

test('returns exact duplicate success from the atomic RPC', async () => {
  const mock = backendMock({ registration: 'duplicate' });
  const response = await handleRegistrationRequest(request(), env, mock.fetchImpl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'duplicate' });
});

test('rejects disallowed origins, invalid server-side fields, Turnstile failure, and rate limits', async () => {
  let mock = backendMock();
  let response = await handleRegistrationRequest(request(validBody, { headers: { origin: 'https://evil.example' } }), env, mock.fetchImpl);
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.equal(mock.calls.length, 0);

  mock = backendMock();
  response = await handleRegistrationRequest(request({ ...validBody, phone: 'xxxxxxx' }), env, mock.fetchImpl);
  assert.equal(response.status, 400);
  assert.equal(mock.calls.length, 0);

  mock = backendMock({ turnstile: false });
  response = await handleRegistrationRequest(request(), env, mock.fetchImpl);
  assert.equal(response.status, 403);

  mock = backendMock({ rate: false });
  response = await handleRegistrationRequest(request(), env, mock.fetchImpl);
  assert.equal(response.status, 429);
});

test('bounds bodies without trusting Content-Length and uses the gateway-appended IP', async () => {
  let mock = backendMock();
  const oversized = new Request('https://project.functions.supabase.co/register-event', {
    method: 'POST',
    headers: {
      origin: 'https://dearpastorswife.org',
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.10',
    },
    body: JSON.stringify({ ...validBody, notes: 'x'.repeat(21000) }),
  });
  let response = await handleRegistrationRequest(oversized, env, mock.fetchImpl);
  assert.equal(response.status, 400);
  assert.equal(mock.calls.length, 0);

  mock = backendMock();
  response = await handleRegistrationRequest(request(validBody, {
    headers: {
      origin: 'https://dearpastorswife.org',
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.200, 203.0.113.10',
    },
  }), env, mock.fetchImpl);
  assert.equal(response.status, 200);
  assert.match(mock.calls[0].options.body, /remoteip=203\.0\.113\.10/);
});

test('bounds streaming bodies without Content-Length and times out stalled request streams', async () => {
  let mock = backendMock();
  const oversizedStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(15000));
      controller.enqueue(new Uint8Array(6000));
      controller.close();
    },
  });
  let streamedRequest = new Request('https://project.functions.supabase.co/register-event', {
    method: 'POST',
    headers: {
      origin: 'https://dearpastorswife.org',
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.10',
    },
    body: oversizedStream,
    duplex: 'half',
  });
  let response = await handleRegistrationRequest(streamedRequest, env, mock.fetchImpl, { bodyTimeoutMs: 100 });
  assert.equal(response.status, 400);
  assert.equal(mock.calls.length, 0);

  mock = backendMock();
  const stalledStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"submission_id":'));
    },
  });
  streamedRequest = new Request('https://project.functions.supabase.co/register-event', {
    method: 'POST',
    headers: {
      origin: 'https://dearpastorswife.org',
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.10',
    },
    body: stalledStream,
    duplex: 'half',
  });
  const started = Date.now();
  response = await handleRegistrationRequest(streamedRequest, env, mock.fetchImpl, { bodyTimeoutMs: 20 });
  assert.equal(response.status, 400);
  assert.ok(Date.now() - started < 500);
  assert.equal(mock.calls.length, 0);
});

test('backend timeout remains active while a response body is stalled', async () => {
  const stalledFetch = async () => new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"success":true'));
    },
  }), { status: 200 });
  const started = Date.now();
  const response = await handleRegistrationRequest(request(), env, stalledFetch, { backendTimeoutMs: 20 });
  assert.equal(response.status, 503);
  assert.ok(Date.now() - started < 500);
  assert.doesNotMatch(await response.text(), /success|backend/i);
});

test('server-enforces the honeypot without writing or revealing rejection', async () => {
  const mock = backendMock();
  const response = await handleRegistrationRequest(request({ ...validBody, website: 'spam.example' }), env, mock.fetchImpl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'stored' });
  assert.equal(mock.calls.length, 0);
});

test('fails closed with static errors when configuration or backend calls fail', async () => {
  let response = await handleRegistrationRequest(request(), { ...env, TURNSTILE_SECRET_KEY: '' }, async () => { throw new Error('should not call'); });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /TURNSTILE|secret/i);

  response = await handleRegistrationRequest(request(), env, async () => { throw new Error('private backend detail'); });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private backend detail/);
});

test('declares the public Edge Function gateway contract explicitly', () => {
  const config = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'config.toml'), 'utf8');
  assert.match(config, /\[functions\.register-event\][\s\S]*?verify_jwt\s*=\s*false/);
});
