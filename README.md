# Dear Pastor's Wife Website Draft

Static website refresh for Dear Pastor's Wife using content from the current site at https://dearpastorswife.org and a modernized resource-hub direction inspired by large ministry sites without copying their dated layouts.

## Current direction

This draft positions Dear Pastor's Wife as more than an event brochure:

- A resource hub for pastors' wives and women in ministry
- A pathway for support, prayer, community, retreats, workshops, and conferences
- A book-centered ministry platform around *Dear Pastor's Wife: A Memoir*
- A future-ready place for articles, devotionals, study guides, finance/leadership training, and giving/sponsorship

## Files

- `index.html` — main one-page website
- `styles.css` — responsive styling
- `script.js` — mobile menu behavior + resource filters
- `assets/` — public logo and images from the current site
- `open-site.command` — opens the local/tailnet-served site

## Access

Tailnet/shared preview:

```text
https://kaysons-macbook-pro.tail70a5b3.ts.net/dear-pastor-s-wife/
```

Local preview through OpenClaw static server:

```text
http://127.0.0.1:18789/dear-pastor-s-wife/
```

Standalone folder preview:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Deployment

This is a static HTML/CSS/JS site. It can be deployed on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any standard static host.
