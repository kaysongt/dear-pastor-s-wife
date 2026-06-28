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

Both integrations run in **demo mode** until the client provides credentials
(forms log to the console and show a success message; payment shows the redirect step).

- **systeme.io (CRM):** set `CONFIG.crm.endpoint` to the systeme.io form/submission
  endpoint. When set, all form submissions (newsletter, contact, booking, and the
  partner sign-up) are POSTed there automatically. **Endpoint URL pending from client.**
- **Stripe (payments + ACH):** set `CONFIG.payments.giveBaseUrl` to the Stripe-hosted
  checkout / Payment Link URL (accepts `?amount=`, `?recurring=monthly`, and
  `?prefilled_email=`). Enable **Card** and **ACH Direct Debit** in the Stripe
  Dashboard so bank transfer appears at checkout. **Stripe details pending from client.**

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
