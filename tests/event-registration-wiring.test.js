const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const eventHtml = fs.readFileSync(path.join(root, 'event.html'), 'utf8');

test('loads Turnstile and registration storage before the event controller', () => {
  const turnstile = eventHtml.indexOf('challenges.cloudflare.com/turnstile/');
  const storage = eventHtml.indexOf('src="event-registration.js"');
  const controller = eventHtml.indexOf('src="script.js"');
  assert.ok(turnstile >= 0);
  assert.ok(storage > turnstile);
  assert.ok(controller > storage);
});

test('routes registrationOnly event details to their configured external registration URL', () => {
  assert.match(script, /if \(e\.registrationOnly\)[\s\S]*?window\.location\.replace\(e\.link\)/);
});

test('stores before CRM sync and isolates secondary CRM failure from durable success', () => {
  const handlerStart = script.indexOf('const submissionId = window.crypto?.randomUUID?.()');
  const storageCall = script.indexOf('DPWEventRegistration.submitRegistration', handlerStart);
  const successRender = script.indexOf("<h3>You're registered!", handlerStart);
  const isolatedCrm = script.indexOf('void sendToCrm("eventRegistration", data)', handlerStart);
  assert.ok(handlerStart >= 0);
  assert.ok(storageCall > handlerStart);
  assert.ok(isolatedCrm > storageCall);
  assert.ok(successRender > storageCall);
});

test('does not log attendee payloads or raw CRM errors', () => {
  assert.doesNotMatch(script, /contact sent to systeme\.io CRM`,\s*\{/);
  assert.doesNotMatch(script, /CRM submission failed`,\s*err/);
  assert.doesNotMatch(script, /submission \(demo, no CRM endpoint set\)`,\s*data/);
});

test('includes a Turnstile token, server-enforced honeypot, and bounded failure message', () => {
  assert.match(script, /name="cf-turnstile-response"/);
  assert.match(script, /name="website" tabindex="-1" autocomplete="off"/);
  assert.match(script, /We couldn't save your registration\. Please try again or email connect@dearpastorswife\.org\./);
});
