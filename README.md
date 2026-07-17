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
python3 -m http.server 4173
# then open http://localhost:4173
```

## Live integrations (`script.js` → `CONFIG`)

- **systeme.io (CRM):** forms post to the configured newsletter funnel endpoint. The
  custom `newsletter.dearpastorswife.org` hostname still needs its DNS CNAME before
  submissions can reach systeme.io; the site displays a direct-email fallback when it
  cannot connect.
- **Stripe (payments + ACH):** live Payment Links are enabled. One-time gifts use a
  customer-chosen amount, and fixed recurring links are configured for every amount
  offered by the monthly giving interface. Stripe presents the final amount and
  available payment methods before confirmation.
  - The donation widget lives on `partnership.html` (`#donateBox`); Stripe collects
    name, email, and address at checkout.
- **Supabase (community):** the public forum reads and creates topics, threads, and
  replies through Supabase. Row Level Security allows public read/insert while blocking
  client-side updates and deletes.

### Partner flow (partnership.html)

The partner sign-up captures **name, email, phone, country, and mailing address**,
records them to the CRM **first**, and only then redirects to Stripe for payment
(see `initPartnerForm()` in `script.js`). This keeps the contact even if someone
drops off at the payment step.

## Email

Email is handled by **Google Workspace**. No dev action is required unless DNS/MX
setup is assigned to us.

## Remaining external setup

- Add the DNS CNAME required by systeme.io for `newsletter.dearpastorswife.org`.
- Licensed Freight Display Pro and Futura PT files can replace the current Fraunces and
  Jost web-font stand-ins when the font licenses/files are available.
