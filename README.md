# Dear Pastor's Wife Website

A static, multi-page website for Dear Pastor's Wife, founded by May Ijisesan. Built with plain HTML, CSS, and JavaScript (no build step), so it can be hosted anywhere.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Landing (scrollable hub with "However you arrived" routing + teasers) |
| `resources.html` | Resource library (searchable, filterable) |
| `events.html` | Events (conferences, tea parties, retreats) + ways we gather + Summit |
| `booking.html` | Bookings (invite May to speak) |
| `about.html` | About Us (DPW story + founder + book + contact) |
| `community.html` | Community forum |
| `partnership.html` | Partnership (warm intro, impact stories, share, partner sign-up → Stripe) |

## Shared chrome (one source of truth)

The header, announcement bar, and footer are **injected by JavaScript** from
`buildChrome()` in `script.js`, so they are identical across every page. Each
page only needs:

- `<body data-page="...">` — drives the active nav state (e.g. `data-page="events"`).
- `<div data-chrome="top"></div>` — where the announce bar + header render.
- `<div data-chrome="footer"></div>` — where the footer renders.

Edit nav links once in `NAV_ITEMS`, and social URLs once in `SOCIAL`, both at the
top of `script.js`.

## Brand identity

- **Logo:** "vessel" mark (inline SVG) + wordmark, defined in `script.js` (`VESSEL_SVG`).
- **Palette:** purple (primary), off-white surfaces, clay/brown neutrals. All set
  via CSS variables in `:root` of `styles.css` (the whole site re-skins from there).
- **Fonts:** Fraunces (display/headings) + Inter (body/UI).

## Local preview

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Configuration before go-live (`script.js` → `CONFIG`)

- **systeme.io (CRM):** set `CONFIG.crm.endpoint` to the systeme.io form/submission
  endpoint. When set, all form submissions (newsletter, contact, booking, and the
  partner sign-up) are POSTed there automatically. **Endpoint URL pending from client** —
  contact capture runs in demo mode (logs to console) until then.
- **Stripe (payments + ACH):** Live Payment Links are wired in `CONFIG.payments`, but
  gated behind a master switch: **`CONFIG.payments.live` is `false`**, so every
  give/donate button stays in the "checkout opens once Stripe is connected" demo state
  and charges nobody. Flip it to `true` to arm real payments.
  - `oneTimeUrl` is a "customers choose what to pay" link (covers every one-time gift);
    `monthly` maps $25/$50/$100/$250 to fixed recurring-subscription links. One-time
    amounts are chosen on Stripe's page; custom/off-grid monthly amounts snap to the
    nearest tier link (Stripe shows the real charge before the giver confirms). Payment
    Links ignore `?amount=`, which is why one-time uses a single pay-what-you-want link.
  - **Before arming (`live: true`):** replace the truncated **$25/mo** link (currently
    404s); optionally add **$75/mo** and **$500/mo** links so the donation widget's
    those buttons charge exactly (they currently snap to $50/$250 for monthly). Enable
    **Card** and **ACH Direct Debit** in the Stripe Dashboard so bank transfer appears.
  - The donation widget lives on `partnership.html` (`#donateBox`); Stripe collects
    name/email/address at checkout (the old pre-Stripe sign-up form was removed).

### Partner flow (partnership.html)

The partner sign-up captures **name, email, phone, country, and mailing address**,
records them to the CRM **first**, and only then redirects to Stripe for payment
(see `initPartnerForm()` in `script.js`). This keeps the contact even if someone
drops off at the payment step.

## Email

Email is handled by **Google Workspace**. No dev action is required unless DNS/MX
setup is assigned to us.

## Still pending / placeholders

- **Social URLs** — Instagram and Facebook are placeholders (`data-pending` + `SOCIAL`
  in `script.js`). YouTube is live.
- **Logo file** — `assets/logo.png` is still used for the favicon; the header/footer
  now use the inline vessel mark.
- **Final 7-Day Reset PDF** — `assets/dpw-7-day-reset.pdf` is a placeholder.
- **Community forum** — front-end MVP; threads/replies persist in the visitor's
  browser (localStorage). Production needs a backend (accounts + moderation).

**Launch deadline: July 29, 2026** (must be live before Summer Blast on July 30).
