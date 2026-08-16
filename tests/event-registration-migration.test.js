const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260817000000_event_registrations.sql');

test('registration migration denies all direct public table access', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();
  assert.match(sql, /enable row level security/);
  assert.match(sql, /force row level security/);
  assert.match(sql, /revoke all on table public\.event_registrations from anon/);
  assert.match(sql, /revoke all on table public\.event_registrations from authenticated/);
  assert.doesNotMatch(sql, /grant insert[\s\S]*?event_registrations[\s\S]*?to anon/);
  assert.doesNotMatch(sql, /for insert[\s\S]*?to anon/);
  assert.doesNotMatch(sql, /grant select[\s\S]*?to anon/);
});

test('database and RPC enforce identity, event, phone, control-character, and consent rules', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();
  assert.match(sql, /unique \(submission_id\)/);
  assert.match(sql, /event_slug in \('dpw-tea-party-chicago', 'dpw-kingsword-nigeria'\)/);
  assert.match(sql, /regexp_replace\(phone, '\[\^0-9\]', '', 'g'\)/);
  assert.match(sql, /char_length\(regexp_replace\(phone,[\s\S]*?\) between 7 and 20/);
  assert.match(sql, /\[\[:cntrl:\]\]/);
  assert.match(sql, /char_length\(notes\) <= 2000/);
  assert.match(sql, /consent is true/);
  assert.match(sql, /create or replace function public\.register_event_registration/);
  assert.match(sql, /submission identifier conflict/);
  assert.match(sql, /grant execute on function public\.register_event_registration\(jsonb\) to service_role/);
});

test('migration adds a private durable rate-limit ledger and service-only claim RPC', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();
  assert.match(sql, /create table if not exists public\.event_registration_rate_limits/);
  assert.match(sql, /alter table public\.event_registration_rate_limits enable row level security/);
  assert.match(sql, /revoke all on table public\.event_registration_rate_limits from anon/);
  assert.match(sql, /create or replace function public\.claim_event_registration_attempt/);
  assert.match(sql, /grant execute on function public\.claim_event_registration_attempt\(text\) to service_role/);
});
