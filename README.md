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

- **systeme.io (CRM):** forms post to the configured newsletter funnel endpoint at
  `newsletter.dearpastorswife.org`. The DNS CNAME is in place and the host resolves,
  so submissions reach systeme.io; the site still shows a direct-email fallback if a
  request fails. Registration for a paid event stops at the error rather than moving
  on to payment, so the contact is never lost.
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
2. **systeme.io** receives the contact *before* payment, so a registrant who
   abandons checkout is still in the CRM and reachable.
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

GA4 (`G-QS9WC3KM1J`) is loaded per-page from each HTML `<head>`. The **Meta Pixel**
loads from `script.js` instead, so it ships once rather than being pasted into
every page. `track()` fires each conversion to whichever tools are present:

| Event | Fires when |
| --- | --- |
| `ViewContent` | a live registration page is opened |
| `InitiateCheckout` | she starts filling the form (first keystroke, once) |
| `Lead` | her details reach the systeme.io CRM |
| `Purchase` | `retreat-thank-you.html` loads after a completed payment |

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
  — without this the `Purchase` conversion never fires.
- Optional: give the UK retreat its own systeme.io opt-in funnel and paste the
  entity id into `CONFIG.crm.eventOptins["dpw-retreat-uk"]` so its registrants land
  tagged instead of in the general newsletter list.
- Licensed Freight Display Pro and Futura PT files can replace the current Fraunces and
  Jost web-font stand-ins when the font licenses/files are available.
