# Event registration operations

The UK retreat continues to use its Google Form. The Chicago and Nigeria forms use a protected Supabase Edge Function. Browsers cannot read or write the registration table directly.

## Production activation order

Do not merge the GitHub Pages branch until steps 1 through 6 are complete.

1. Create a Cloudflare Turnstile widget for `dearpastorswife.org` and `www.dearpastorswife.org`. Keep the secret key out of Git.
2. Apply `supabase/migrations/20260817000000_event_registrations.sql` to the DPW Supabase project.
3. Confirm Row Level Security is enabled on `event_registrations` and `event_registration_rate_limits`. Confirm `anon` and `authenticated` have no table permissions.
4. Set the Edge Function secrets:
   - `TURNSTILE_SECRET_KEY`: the Cloudflare secret
   - `RATE_LIMIT_SECRET`: a randomly generated secret of at least 32 characters
   Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to its hosted function. Never copy the service-role key into this repository or browser code.
5. Deploy `supabase/functions/register-event`. Its gateway JWT check is disabled in `supabase/config.toml` because the endpoint is public; the function enforces exact origins, Turnstile verification, a server-side honeypot, field validation, and a five-attempt-per-15-minute hashed-IP rate limit.
6. Probe the deployed function without attendee data and confirm disallowed origins, missing Turnstile proof, and invalid fields are rejected. Confirm direct anonymous table reads and writes remain denied.
7. Put the public Turnstile site key in `CONFIG.registration.turnstileSiteKey` in `script.js`.
8. Merge the GitHub Pages PR only after explicit production approval.
9. Submit one owner-approved test registration on the live site. Confirm the saved row and exact retry behavior, then delete that named test row.

The browser fails closed if Turnstile, the Edge Function, or storage is unavailable. It does not show a false registration confirmation.

## View or export registrations

1. Sign in to the Supabase dashboard and open the DPW project.
2. Open Table Editor and select `event_registrations`.
3. Filter `event_slug` by `dpw-tea-party-chicago` or `dpw-kingsword-nigeria`.
4. Sort by `created_at` descending.
5. Use the dashboard export option when DPW needs a CSV.

Never share a REST URL, service-role key, or exported attendee file through a public link. Give each administrator named Supabase project access and remove access when it is no longer needed.

## Privacy and retention

Registrations contain names, contact information, addresses, ministry roles, accessibility or dietary notes, consent, and event identity. DPW must approve a retention period before activation. Until that decision is documented, do not add automated deletion or distribute exports. A practical starting point for owner review is deletion 90 days after an event unless an applicable contract, consent record, or legal requirement calls for a different period.

The rate-limit table stores only an HMAC hash of the caller's IP. The claim function removes hashes older than 24 hours during normal traffic.

## Retry behavior

A browser keeps one random submission ID while the form is open. The database accepts the first write, returns `duplicate` only when a retry matches every stored field, and rejects a reused ID with different data. systeme.io runs afterward as a secondary contact sync and cannot change the durable registration result.
