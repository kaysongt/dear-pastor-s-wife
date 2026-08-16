-- Private, abuse-controlled event registration for DPW.
-- Apply this migration before deploying the Edge Function or browser client.

create extension if not exists pgcrypto;

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null,
  event_slug text not null check (
    event_slug in ('dpw-tea-party-chicago', 'dpw-kingsword-nigeria')
  ),
  event_title text not null check (
    (event_slug = 'dpw-tea-party-chicago' and event_title = 'DPW Tea Party')
    or (event_slug = 'dpw-kingsword-nigeria' and event_title = 'DPW at KingsWord')
  ),
  first_name text not null check (
    first_name = btrim(first_name) and char_length(first_name) between 1 and 80
  ),
  last_name text not null check (
    last_name = btrim(last_name) and char_length(last_name) between 1 and 80
  ),
  email text not null check (
    email = lower(btrim(email))
    and char_length(email) between 3 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text not null check (
    phone = btrim(phone)
    and char_length(phone) between 7 and 40
    and phone ~ '^[0-9+(). -]+$'
    and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 7 and 20
  ),
  address text not null default '' check (
    address = btrim(address) and char_length(address) <= 200
  ),
  city text not null default '' check (
    city = btrim(city) and char_length(city) <= 100
  ),
  country text not null default '' check (
    country = btrim(country) and char_length(country) <= 100
  ),
  ministry_role text not null default '' check (
    ministry_role = btrim(ministry_role) and char_length(ministry_role) <= 160
  ),
  notes text not null default '' check (
    notes = btrim(notes) and char_length(notes) <= 2000
  ),
  consent boolean not null check (consent is true),
  created_at timestamptz not null default now(),
  constraint event_registrations_no_controls check (
    concat(first_name, last_name, email, phone, address, city, country, ministry_role, notes)
      !~ '[[:cntrl:]]'
  ),
  constraint event_registrations_submission_id_key unique (submission_id)
);

comment on table public.event_registrations is
  'Private DPW event registrations. Access only through named Supabase project administrators.';

alter table public.event_registrations enable row level security;
alter table public.event_registrations force row level security;
drop policy if exists event_registrations_public_insert on public.event_registrations;
revoke all on table public.event_registrations from public;
revoke all on table public.event_registrations from anon;
revoke all on table public.event_registrations from authenticated;

create index if not exists event_registrations_event_created_idx
  on public.event_registrations (event_slug, created_at desc);

create table if not exists public.event_registration_rate_limits (
  client_hash text primary key check (client_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  attempts smallint not null default 1 check (attempts between 1 and 5)
);

alter table public.event_registration_rate_limits enable row level security;
alter table public.event_registration_rate_limits force row level security;
revoke all on table public.event_registration_rate_limits from public;
revoke all on table public.event_registration_rate_limits from anon;
revoke all on table public.event_registration_rate_limits from authenticated;

create index if not exists event_registration_rate_window_idx
  on public.event_registration_rate_limits (window_started_at);

create or replace function public.claim_event_registration_attempt(p_client_hash text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_row public.event_registration_rate_limits%rowtype;
begin
  if p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$' then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_client_hash, 0));
  delete from public.event_registration_rate_limits
    where window_started_at < now() - interval '24 hours';

  select * into v_row
    from public.event_registration_rate_limits
    where client_hash = p_client_hash
    for update;

  if not found then
    insert into public.event_registration_rate_limits (client_hash, window_started_at, attempts)
      values (p_client_hash, now(), 1);
    return true;
  end if;

  if v_row.window_started_at < now() - interval '15 minutes' then
    update public.event_registration_rate_limits
      set window_started_at = now(), attempts = 1
      where client_hash = p_client_hash;
    return true;
  end if;

  if v_row.attempts >= 5 then
    return false;
  end if;

  update public.event_registration_rate_limits
    set attempts = attempts + 1
    where client_hash = p_client_hash;
  return true;
end;
$$;

revoke all on function public.claim_event_registration_attempt(text) from public;
revoke all on function public.claim_event_registration_attempt(text) from anon;
revoke all on function public.claim_event_registration_attempt(text) from authenticated;
grant execute on function public.claim_event_registration_attempt(text) to service_role;

create or replace function public.register_event_registration(p_registration jsonb)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_submission_id uuid;
  v_event_slug text;
  v_event_title text;
  v_first_name text;
  v_last_name text;
  v_email text;
  v_phone text;
  v_address text;
  v_city text;
  v_country text;
  v_ministry_role text;
  v_notes text;
  v_existing public.event_registrations%rowtype;
  v_inserted integer;
begin
  if p_registration is null or jsonb_typeof(p_registration) <> 'object' then
    raise exception using message = 'invalid registration', errcode = '22023';
  end if;

  v_submission_id := (p_registration ->> 'submission_id')::uuid;
  v_event_slug := btrim(p_registration ->> 'event_slug');
  v_event_title := btrim(p_registration ->> 'event_title');
  v_first_name := btrim(p_registration ->> 'first_name');
  v_last_name := btrim(p_registration ->> 'last_name');
  v_email := lower(btrim(p_registration ->> 'email'));
  v_phone := btrim(p_registration ->> 'phone');
  v_address := btrim(coalesce(p_registration ->> 'address', ''));
  v_city := btrim(coalesce(p_registration ->> 'city', ''));
  v_country := btrim(coalesce(p_registration ->> 'country', ''));
  v_ministry_role := btrim(coalesce(p_registration ->> 'ministry_role', ''));
  v_notes := btrim(coalesce(p_registration ->> 'notes', ''));

  if (p_registration ->> 'email') is distinct from v_email
    or (p_registration ->> 'consent')::boolean is not true
    or v_event_slug not in ('dpw-tea-party-chicago', 'dpw-kingsword-nigeria')
    or not (
      (v_event_slug = 'dpw-tea-party-chicago' and v_event_title = 'DPW Tea Party')
      or (v_event_slug = 'dpw-kingsword-nigeria' and v_event_title = 'DPW at KingsWord')
    )
    or char_length(regexp_replace(v_phone, '[^0-9]', '', 'g')) not between 7 and 20
  then
    raise exception using message = 'invalid registration', errcode = '22023';
  end if;

  insert into public.event_registrations (
    submission_id, event_slug, event_title, first_name, last_name, email, phone,
    address, city, country, ministry_role, notes, consent
  ) values (
    v_submission_id, v_event_slug, v_event_title, v_first_name, v_last_name, v_email, v_phone,
    v_address, v_city, v_country, v_ministry_role, v_notes, true
  ) on conflict (submission_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 1 then
    return 'stored';
  end if;

  select * into strict v_existing
    from public.event_registrations
    where submission_id = v_submission_id;

  if v_existing.event_slug = v_event_slug
    and v_existing.event_title = v_event_title
    and v_existing.first_name = v_first_name
    and v_existing.last_name = v_last_name
    and v_existing.email = v_email
    and v_existing.phone = v_phone
    and v_existing.address = v_address
    and v_existing.city = v_city
    and v_existing.country = v_country
    and v_existing.ministry_role = v_ministry_role
    and v_existing.notes = v_notes
    and v_existing.consent is true
  then
    return 'duplicate';
  end if;

  raise exception using message = 'submission identifier conflict', errcode = '23505';
end;
$$;

revoke all on function public.register_event_registration(jsonb) from public;
revoke all on function public.register_event_registration(jsonb) from anon;
revoke all on function public.register_event_registration(jsonb) from authenticated;
grant execute on function public.register_event_registration(jsonb) to service_role;
