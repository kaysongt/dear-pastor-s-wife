# Dear Pastor's Wife Website

A static, multi-page website for Dear Pastor's Wife, founded by May Ijisesan. Built with plain HTML, CSS, and JavaScript (no build step), so it can be hosted anywhere.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Landing (scrollable hub with "However you arrived" routing + teasers) |
| `resources.html` | Resource library (searchable, filterable) |
| `events.html` | Events (conferences, tea parties, retreats) + ways we gather + Summit |
| `event.html` | Event details and registration |
| `booking.html` | Bookings (invite May to speak) |
| `about.html` | About Us (DPW story + founder + book + contact) |
| `community.html` | Community forum |
| `partnership.html` | Partnership (warm intro, impact stories, share, partner sign-up → Stripe) |

The article pages use the same shared chrome and editorial layout as the main site.

## Shared chrome (one source of truth)

The header, announcement bar, and footer are **injected by JavaScript** from
`buildChrome()` in `script.js`, so they are identical across every page. Each
page only needs:

- `<body data-page="...">`, drives the active nav state (e.g. `data-page="events"`).
- `<div data-chrome="top"></div>`, where the announce bar + header render.
- `<div data-chrome="footer"></div>`, where the footer renders.

Edit nav links once in `NAV_ITEMS`, and social URLs once in `SOCIAL`, both at the
top of `script.js`.

## Brand identity

- **Logo:** "vessel" mark (inline SVG) + wordmark, defined in `script.js` (`VESSEL_SVG`).
- **Palette:** Tyrian wine (primary), linen surfaces, antique gold, and clay accents. All set
  via CSS variables in `:root` of `styles.css` (the whole site re-skins from there).
- **Fonts:** Fraunces (display/headings) + Jost (body/UI).

## Local preview

```bash
npx --yes serve -l 4173
# then open http://localhost:4173
```

## Live integrations (`script.js` → `CONFIG`)

- **systeme.io (CRM):** newsletter and other general forms post to
  `newsletter.dearpastorswife.org` with the default opt-in entity. Per-event
  registrations can use a dedicated funnel via `CONFIG.crm.eventOptins` (submit
  button entity id) and `CONFIG.crm.eventEndpoints` (that funnel's public opt-in
  URL) — both are required, because posting an event entity id to the newsletter
  domain will not land the contact in the event funnel. The UK retreat
  (`dpw-retreat-uk`) posts to `https://svg.systeme.io/9d871f1f/` (funnel
  "DPW UK-Retreat", step "Retreat Registrations (from site)"). The site still
  shows a direct-email fallback if a request fails. Registration for a paid event
  stops at the error rather than moving on to payment, so the contact is never
  lost.
- **Stripe (payments + ACH):** live Payment Links are enabled. One-time gifts use a
  customer-chosen amount, and fixed recurring links are configured for every amount
  offered by the monthly giving interface. Stripe presents the final amount and
  available payment methods before confirmation.
  - The donation widget lives on `partnership.html` (`#donateBox`); Stripe collects
    name, email, and address at checkout.
  - Paid **event registration** uses an embedded Stripe Buy Button (see the UK
    retreat section below), not the giving links.
- **Supabase (community):** the public forum reads and creates topics, threads, and
  replies through Supabase. Row Level Security allows public read/insert while blocking
  client-side updates and deletes.

### Partner flow (partnership.html)

The partner sign-up captures **name, email, phone, country, and mailing address**,
records them to the CRM **first**, and only then redirects to Stripe for payment
(see `initPartnerForm()` in `script.js`). This keeps the contact even if someone
drops off at the payment step.

### Paid event registration (UK retreat)

The UK retreat used to hand registrants to an external Google Form. It now runs
entirely on the site, using the same "capture first, charge second" order as the
partner flow:

1. **On-site multi-step form** on `event.html?slug=dpw-retreat-uk` collects name,
   email, phone, location, and ministry role.
2. **systeme.io** receives the contact *before* payment on the UK-retreat funnel
   (not the newsletter list), so a registrant who abandons checkout is still in
   that funnel's Leads tab and reachable.
3. **Stripe Buy Button** is then rendered in place of the form, pre-filled with her
   email and stamped with a registration reference (`client-reference-id`) so a
   payment in the Stripe Dashboard maps back to the person who registered. The
   matching Payment Link is kept as a fallback if the embed is blocked.
4. **`retreat-thank-you.html`** is Stripe's post-payment destination and the only
   place a `Purchase` conversion can honestly fire, since checkout itself happens
   on Stripe's domain.

Any event becomes a paid event by adding a `payment` block to its entry in
`EVENTS` — no new code. Events without one keep the existing free-registration
confirmation.

`/europe-retreat/` is kept as a redirect to the new page, so links already shared
under the old short URL still work.

### Analytics & conversion tracking

GA4 (`G-QS9WC3KM1J`) and the Google Ads tag (`AW-18426236503`) are loaded
per-page from each HTML `<head>`. The **Meta Pixel** loads from `script.js`
instead, so it ships once rather than being pasted into every page. `track()`
fires Meta + GA4 conversions to whichever tools are present. Google Ads uses
its own `conversion` event — the GA4 `Purchase` is not the Ads conversion.

| Event | Fires when |
| --- | --- |
| `ViewContent` | a live registration page is opened |
| `InitiateCheckout` / GA4 `begin_checkout` | the Stripe checkout button is presented after the CRM request |
| `Lead` / GA4 `generate_lead` | the CRM request completes; the opaque response cannot confirm server acceptance |
| `Purchase` / GA4 `purchase` | the thank-you page receives a live Stripe session ID in its return URL |
| Google Ads `conversion` (`AW-18426236503/VWT9CIej3e0cENecqNJE`) | same moment as `Purchase` on the thank-you page only, value £300 |

A thank-you refresh is collapsed by Stripe's `session_id`: Meta uses it as
`eventID`, GA4 and Google Ads use it as `transaction_id`.

GA4 receives standard ecommerce event names and item data; Meta retains its
own event names. Google Ads receives its separate, case-sensitive conversion
label. Direct visits, missing IDs, unresolved placeholders, and test-mode IDs
do not trigger purchase tracking. The fallback Stripe link also carries the
registration reference, and the legacy retreat redirect preserves query parameters.

### Verification limits

This is a static site: a correctly shaped session ID is not proof of payment.
Server-side Stripe session verification or a signed webhook is needed to verify
payment status and actual totals (including discounts), and to record purchases
when a customer never returns from Stripe. The browser currently uses the £300
catalog price. Do not use browser analytics as the payment ledger.

The CRM submission uses `no-cors`, so the site cannot inspect acceptance or errors
returned by systeme.io. Address, city, ministry role, and notes are not included
in the current opt-in payload. Those fields need a supported server-side CRM
integration before their persistence can be guaranteed. The paid-contact opt-in
is not configured. Stripe remains the source of truth for completed payments.

### Regression checks

`tests/site-audit.cjs` uses Node and `jsdom` (v26) to render all main pages and
test local asset links, registration validation, simulated CRM failure/success,
checkout references, conversion payloads and guards, and attribution redirects.
Install jsdom in a temporary directory and expose its `node_modules` using
`NODE_PATH`, then run `node tests/site-audit.cjs`. All requests are stubbed; no
contacts or payments are created by these tests.

**Nothing loads from Meta and no events are sent until `CONFIG.tracking.metaPixelId`
is filled in** — the site is safe to ship with it blank.


## Email

Email is handled by **Google Workspace**. No dev action is required unless DNS/MX
setup is assigned to us.

## Remaining external setup

- Paste the Meta Pixel id into `CONFIG.tracking.metaPixelId` (Events Manager >
  Data sources > your pixel).
- In the Stripe Dashboard, set the retreat Buy Button **and** its Payment Link to
  redirect after payment to
  `https://dearpastorswife.org/retreat-thank-you.html?session_id={CHECKOUT_SESSION_ID}`
  — without this Meta/GA4 `Purchase` and the Google Ads conversion never fire.
- To give another event its own systeme.io funnel, set both
  `CONFIG.crm.eventOptins[slug]` (the opt-in page's submit-button entity id) and
  `CONFIG.crm.eventEndpoints[slug]` (that funnel's public opt-in URL). Leaving
  either empty falls back to the newsletter endpoint + entity.
- Licensed Freight Display Pro and Futura PT files can replace the current Fraunces and
  Jost web-font stand-ins when the font licenses/files are available.
