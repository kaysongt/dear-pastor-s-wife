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
