# Dear Pastor's Wife Website Draft

This is a static website refresh for Dear Pastor's Wife using content from the current site at https://dearpastorswife.org and a simple, bold landing-page structure inspired by the compact landonnorris.com layout.

## Files

- `index.html` — main one-page website
- `styles.css` — full responsive styling
- `script.js` — mobile menu behavior
- `assets/` — copied public images/logo from the current site

## Local preview

From this folder:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Deployment note

Because this is static HTML/CSS/JS, it can be deployed on Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any normal web host. Static hosting is the most reliable option for client demos because there is no local dev server required to keep the site online.

## Week 1 sync — what changed

- **Navigation:** Retreats → **Events** (dropdown: Conferences, Tea Parties, Retreats), Speaking → **Bookings** (with a request form), Pastor May → **About Us** (DPW history + founder journey on one page), and **Community** is now a forum.
- **Events loaded:** Summer Blast (Jul 30–Aug 2), Tea Party / A Day Out in Chicago (Aug 15), Nigeria – KingsWord (Sept 2026), UK – DPW Retreat (Oct 9–11). Edit them in `script.js` → `EVENTS`.
- **Partnership tiers:** simplified to tier names + suggested price ranges only.
- **Resources:** book + YouTube kept; added the **7-Day Guided Reset** PDF download.
- **Community forum:** topic threads with posting/replies (parenting, relationship management in ministry). Front-end MVP — data persists in the visitor's browser via `localStorage`. **Production needs a backend** (accounts + moderation); see `initForum`/`loadForum` in `script.js`.

## Configuration before go-live (`script.js` → `CONFIG`)

- **Stripe (payments + ACH):** set `CONFIG.payments.giveBaseUrl` to your Stripe-hosted donation/checkout page (accepts `?amount=` and `?recurring=monthly`). In the Stripe Dashboard, enable **Card** and **ACH Direct Debit** as payment methods so bank transfer appears at checkout.
- **systeme.io (CRM):** set `CONFIG.crm.endpoint` to your systeme.io form/submission endpoint. While empty, forms run in demo mode (log + success message, no network call). The newsletter, contact, and booking forms all post through this.

## Blocked / waiting on client

These are wired with placeholders — search the code for `data-pending` / the noted spots and drop in the real assets:

- **Pastor May's detailed bio** — `index.html`, About Us section (`.bio-placeholder`).
- **Logo file** — `assets/logo.png`. A wordmark fallback shows automatically if the file is missing.
- **Professional photos** — real photos only, no AI imagery (permissions handled client-side).
- **Official social URLs** — Instagram / Facebook links are placeholders (`data-pending` in header social + footer). YouTube is live.
- **Final 7-Day Reset PDF** — `assets/dpw-7-day-reset.pdf` is a placeholder; replace with the designed PDF.

**Launch deadline: July 29, 2026** (must be live before Summer Blast on July 30).
