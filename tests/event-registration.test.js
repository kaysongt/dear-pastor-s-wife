const assert = require('node:assert/strict');
const test = require('node:test');

const {
  ALLOWED_EVENTS,
  buildRegistrationPayload,
  submitRegistration,
} = require('../event-registration.js');

const validInput = {
  firstName: '  Grace ',
  lastName: ' Jones  ',
  email: ' GRACE@example.com ',
  phone: ' +1 312 555 0100 ',
  address: ' 12 Main Street ',
  city: ' Chicago ',
  country: ' USA ',
  role: " Pastor's wife ",
  notes: ' Vegetarian meal, please. ',
  consent: 'on',
  website: '',
};

const baseSubmission = {
  supabaseUrl: 'https://project.supabase.co',
  anonKey: 'publishable-key',
  eventSlug: 'dpw-tea-party-chicago',
  submissionId: 'f4fd62e3-9445-4d9f-a937-ef45c6989587',
  turnstileToken: 'verified-browser-token',
  data: validInput,
};

test('allowlists only DPW events handled by the on-site form', () => {
  assert.deepEqual(ALLOWED_EVENTS, {
    'dpw-tea-party-chicago': 'DPW Tea Party',
    'dpw-kingsword-nigeria': 'DPW at KingsWord',
  });
});

test('builds a bounded payload without trusting a client title', () => {
  const payload = buildRegistrationPayload(baseSubmission);
  assert.deepEqual(payload, {
    submission_id: 'f4fd62e3-9445-4d9f-a937-ef45c6989587',
    event_slug: 'dpw-tea-party-chicago',
    event_title: 'DPW Tea Party',
    first_name: 'Grace',
    last_name: 'Jones',
    email: 'grace@example.com',
    phone: '+1 312 555 0100',
    address: '12 Main Street',
    city: 'Chicago',
    country: 'USA',
    ministry_role: "Pastor's wife",
    notes: 'Vegetarian meal, please.',
    consent: true,
    website: '',
    turnstile_token: 'verified-browser-token',
  });
});

test('rejects unknown events, malformed submissions, missing bot proof, honeypot input, controls, and overlong fields', () => {
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, eventSlug: 'made-up-event' }));
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, submissionId: 'not-a-uuid' }));
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, turnstileToken: '' }));
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, data: { ...validInput, consent: '' } }));
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, data: { ...validInput, website: 'spam.example' } }));
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, data: { ...validInput, firstName: 'Bad\u0000Name' } }));
  assert.throws(() => buildRegistrationPayload({ ...baseSubmission, data: { ...validInput, notes: 'x'.repeat(2001) } }));
});

test('posts to the protected Edge Function and accepts stored or exact duplicate results', async () => {
  const calls = [];
  const responses = ['stored', 'duplicate'];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ status: responses.shift() }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const first = await submitRegistration({ ...baseSubmission, fetchImpl });
  const retry = await submitRegistration({ ...baseSubmission, fetchImpl });
  assert.equal(first.status, 'stored');
  assert.equal(retry.status, 'duplicate');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://project.supabase.co/functions/v1/register-event');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.apikey, 'publishable-key');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer publishable-key');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.submission_id, baseSubmission.submissionId);
  assert.equal(body.turnstile_token, 'verified-browser-token');
  assert.equal(body.website, '');
});

test('fails closed on malformed success, backend failure, timeout, or network ambiguity', async () => {
  const cases = [
    async () => new Response(JSON.stringify({ status: 'unknown' }), { status: 200 }),
    async () => new Response(JSON.stringify({ detail: 'private backend detail' }), { status: 400 }),
    async () => { throw new Error('network detail'); },
  ];
  for (const fetchImpl of cases) {
    await assert.rejects(submitRegistration({ ...baseSubmission, fetchImpl }), /Registration could not be saved/);
  }
});

test('client timeout remains active while a response body is stalled', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"status":"stored"'));
    },
  });
  const fetchImpl = async () => new Response(stream, { status: 200 });
  const started = Date.now();
  await assert.rejects(
    submitRegistration({ ...baseSubmission, fetchImpl, timeoutMs: 20 }),
    /Registration could not be saved/
  );
  assert.ok(Date.now() - started < 500);
});
