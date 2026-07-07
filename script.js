/* ============================================================
   Dear Pastor's Wife site logic
   Data-driven sections (resources, events, giving) live
   here so they're easy to update and ready to wire to live
   services (Stripe, systeme.io) later.

   The site is now MULTI-PAGE. The shared header, announcement bar,
   and footer are injected by buildChrome() below so there is a
   single source of truth across every page. Each page sets
   <body data-page="..."> to drive the active nav state, and drops
   <div data-chrome="top"></div> / <div data-chrome="footer"></div>
   where the chrome should render.
   ============================================================ */

/* ---------- SOCIAL LINKS ---------- */
// Facebook URL not confirmed by the client yet: keep the icon visible but
// point it at "#" with a "link coming soon" title so nothing 404s.
const SOCIAL = {
  instagram: "https://www.instagram.com/dearpastorswife",
  facebook: "#",
  youtube: "https://www.youtube.com/@DearPastorsWife",
};

function socialLink(href, label, svg) {
  if (href === "#") {
    return `<a href="#" title="link coming soon" aria-label="${label} (link coming soon)" data-pending="url">${svg}</a>`;
  }
  return `<a href="${href}" target="_blank" rel="noopener" aria-label="${label}">${svg}</a>`;
}

/* ---------- SHARED CHROME (header + footer) ---------- */
const NAV_ITEMS = [
  { page: "resources", label: "Resources", href: "resources.html" },
  { page: "events", label: "Events", href: "events.html", dropdown: [
    { label: "Conferences", href: "events.html?filter=conference" },
    { label: "Tea Parties", href: "events.html?filter=tea-party" },
    { label: "Retreats", href: "events.html?filter=retreat" },
  ]},
  { page: "booking", label: "Booking", href: "booking.html" },
  { page: "about", label: "About Us", href: "about.html" },
  { page: "community", label: "Community", href: "community.html" },
];

const VESSEL_SVG = `
  <svg class="brand-vessel" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M16 6h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M18 6c0 6-6 8-6 18 0 9 5 18 12 18s12-9 12-18c0-10-6-12-6-18"
      stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 24c4 3 16 3 20 0" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;

const IG_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2zm0 4.86A4.94 4.94 0 1 0 12 16.94 4.94 4.94 0 0 0 12 7.06zm0 8.14A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm6.3-8.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>`;
const FB_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>`;
const YT_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.6 4 12 4 12 4s-7.6 0-9.4.4A3 3 0 0 0 .5 6.5C.1 8.3.1 12 .1 12s0 3.7.4 5.5a3 3 0 0 0 2.1 2.1c1.8.4 9.4.4 9.4.4s7.6 0 9.4-.4a3 3 0 0 0 2.1-2.1c.4-1.8.4-5.5.4-5.5s0-3.7-.4-5.5zM9.5 15.5v-7l6.5 3.5-6.5 3.5z"/></svg>`;

function buildChrome() {
  const current = document.body.dataset.page || "";
  const homeHref = current === "home" ? "#top" : "index.html";

  const navLinksHtml = NAV_ITEMS.map(item => {
    const active = item.page === current ? " is-current" : "";
    if (item.dropdown) {
      const sub = item.dropdown.map(d => `<a href="${d.href}" role="menuitem">${d.label}</a>`).join("");
      return `
        <div class="nav-dropdown">
          <a href="${item.href}" class="nav-dropdown-toggle${active}" aria-haspopup="true" aria-expanded="false">${item.label} <span class="caret" aria-hidden="true">▾</span></a>
          <div class="nav-dropdown-menu" role="menu">${sub}</div>
        </div>`;
    }
    return `<a href="${item.href}" class="${active.trim()}">${item.label}</a>`;
  }).join("");

  const partnerActive = current === "partnership" ? " is-current" : "";

  const topHtml = `
    <div class="announce-bar" id="announceBar">
      <div class="announce-inner">
        <span class="announce-tag">Next up</span>
        <p>Summer Blast, <strong>July 30 to Aug 2, 2026.</strong> Save the date.</p>
        <a href="events.html">See all events →</a>
      </div>
      <button class="announce-close" aria-label="Dismiss announcement">×</button>
    </div>

    <header class="site-header" id="siteHeader">
      <a class="brand" href="${homeHref}">
        ${VESSEL_SVG}
        <span class="brand-wordmark">
          <span class="bw-main">Dear Pastor's Wife</span>
          <span class="bw-sub">Vessel</span>
        </span>
      </a>
      <button class="menu-toggle" aria-expanded="false">Menu</button>
      <nav class="nav-links" aria-label="Primary navigation">
        ${navLinksHtml}
        <a class="nav-give${partnerActive}" href="partnership.html">♥ Partner</a>
        <span class="nav-social" aria-label="Social media">
          ${socialLink(SOCIAL.instagram, "Instagram", IG_SVG)}
          ${socialLink(SOCIAL.facebook, "Facebook", FB_SVG)}
          ${socialLink(SOCIAL.youtube, "YouTube", YT_SVG)}
        </span>
      </nav>
    </header>`;

  const footerHtml = `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <a class="brand" href="${homeHref}" style="margin-bottom:0.6rem">
            ${VESSEL_SVG}
            <span class="brand-wordmark"><span class="bw-main">Dear Pastor's Wife</span><span class="bw-sub">Vessel</span></span>
          </a>
          <p class="footer-tagline">A global resource hub and community for women in ministry. Clarity, confidence, and real support.</p>
          <div class="footer-social" aria-label="Social media">
            ${socialLink(SOCIAL.instagram, "Instagram", IG_SVG)}
            ${socialLink(SOCIAL.facebook, "Facebook", FB_SVG)}
            ${socialLink(SOCIAL.youtube, "YouTube", YT_SVG)}
          </div>
        </div>
        <div class="footer-links">
          <div>
            <strong>Explore</strong>
            <a href="resources.html">Resources</a>
            <a href="events.html">Events</a>
            <a href="booking.html">Booking</a>
            <a href="about.html">About Us</a>
            <a href="community.html">Community</a>
          </div>
          <div>
            <strong>Get Involved</strong>
            <a href="partnership.html">Partner &amp; Give</a>
            <a href="index.html#newsletter">Newsletter</a>
            <a href="community.html">Community</a>
            <a href="booking.html">Invite May to speak</a>
          </div>
          <div>
            <strong>Connect</strong>
            <a href="${SOCIAL.youtube}" target="_blank" rel="noopener">YouTube</a>
            <a href="${SOCIAL.instagram}" target="_blank" rel="noopener">Instagram</a>
            <a href="#" title="link coming soon" data-pending="url">Facebook</a>
            <a href="https://www.amazon.com/Dear-Pastors-Wife-May-Ijisesan-ebook/dp/B09TQ2G8PJ" target="_blank" rel="noopener">Amazon</a>
            <a href="mailto:connect@dearpastorswife.org">Email</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Dear Pastor's Wife by May Ijisesan. All rights reserved.</p>
      </div>
    </footer>`;

  const topSlot = document.querySelector('[data-chrome="top"]');
  if (topSlot) topSlot.outerHTML = topHtml;
  const footSlot = document.querySelector('[data-chrome="footer"]');
  if (footSlot) footSlot.outerHTML = footerHtml;
}
buildChrome();

/* ---------- CONFIG (fill in when live credentials are ready) ----------
   Everything that needs a real account/key is centralized here so the
   client (or a follow-up dev) can flip the site live without hunting
   through the code.

   PAYMENTS (Stripe Payment Links):
     • `oneTimeUrl` is a "Customers choose what to pay" link — the giver
       sets the amount on Stripe's page, so it covers every one-time gift
       (give card + partner form "one time"). NOTE: Stripe Payment Links
       ignore any ?amount= we append, which is why one-time uses a single
       pay-what-you-want link instead of one link per preset.
     • `monthly` maps a USD amount to a FIXED recurring subscription link.
       Custom monthly amounts snap to the nearest of these; Stripe always
       shows the real charge before the giver confirms.
     • Enable "Card" and "ACH Direct Debit" in the Stripe Dashboard so
       bank transfer shows at checkout.
     • These are LIVE-mode links (buy.stripe.com/... ; test links carry a
       /test_ segment). Real cards are charged.

   CRM (systeme.io):
     • In systeme.io, create a form and copy its POST/submission endpoint
       (or use the systeme.io API via a serverless function) into
       `crm.endpoint`. When set, form submissions are POSTed there.
     • Leave it empty to keep forms in "demo" mode (logs + success msg).
*/
const CONFIG = {
  payments: {
    // MASTER SWITCH. Keep false until every link below is verified AND the
    // client has confirmed go-live. While false, all give/donate buttons stay
    // in the friendly "checkout opens once Stripe is connected" demo state and
    // charge nobody. Flip to true to arm real payments.
    // TODO: still needed before arming — a working $25/mo link (current one
    // 404s) and, for the widget's $75/$500 monthly buttons, matching links
    // (they currently snap down to $50/$250).
    live: false,
    oneTimeUrl: "https://buy.stripe.com/9B6eVd4HK0F3awy7qB6Vq07",
    monthly: {
      25:  "https://buy.stripe.com/dRmbJ15LO2Nb3a16Vq08",
      50:  "https://buy.stripe.com/aFaaEX8Y0bjHbAC9yJ6Vq09",
      100: "https://buy.stripe.com/14AfZh2zC0F3awyeT36Vq0a",
      250: "https://buy.stripe.com/7sY28ra24gE18oq9yJ6Vq0b",
    },
  },
  crm: {
    // systeme.io form endpoint. Empty = demo mode (no network call).
    endpoint: "",
  },
};

/* ---------- DATA ---------- */

// Resource library. type: book | download | video | article. status: current | archived.
const RESOURCES = [
  { type: "book", status: "current", title: "Dear Pastor's Wife (The Book)", desc: "Biblical wisdom and honest encouragement for women in ministry life.", cta: "Get it on Amazon", link: "https://www.amazon.com/Dear-Pastors-Wife-May-Ijisesan-ebook/dp/B09TQ2G8PJ" },
  { type: "video", status: "current", title: "Weekly Encouragement on YouTube", desc: "New teaching, Q&A, and real talk for ministry women every week.", cta: "Watch on YouTube", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "download", status: "current", title: "The 7-Day Guided Reset (PDF)", desc: "A simple 7-day plan to slow down, refill, and reset when ministry has run you dry.", cta: "Download the PDF", link: "assets/dpw-7-day-reset.pdf", download: true },
  { type: "video", status: "current", title: "Leading Without Losing Yourself", desc: "A teaching session on staying rooted while you serve and lead.", cta: "Watch now", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "video", status: "archived", title: "2024 Conference Replay: Thrive", desc: "The full replay of our first leadership conference for ministry women.", cta: "Watch replay", link: "https://www.youtube.com/@DearPastorsWife" },
];

// Events. category: conference | tea-party | retreat. status: open | soon | past.
// `sort` is an ISO-ish date used only for ordering.
// `featured` events render as large cards at the top of the Events page.
// `art` picks the brand-palette placeholder block (no stock photos until
// the client's event photos arrive).
const EVENTS = [
  { category: "conference", year: 2026, date: "Jul 30 to Aug 2, 2026", sort: "2026-07-30", title: "Summer Blast", location: "United States", desc: "Our summer gathering to open the season, with worship, teaching, and connection for women in ministry.", status: "soon", link: "index.html#newsletter", featured: true, art: "plum" },
  { category: "tea-party", year: 2026, date: "Aug 15, 2026", sort: "2026-08-15", title: "DPW Tea Party", location: "Chicago, USA", desc: "An intimate two-hour gathering with icebreakers and table topics, the kind of conversation that quickly feels like a reunion. Free and open to pastors' wives, ministers' wives, and women in Christian leadership.", status: "soon", link: "index.html#newsletter", featured: true, art: "clay" },
  { category: "conference", year: 2026, date: "September 2026", sort: "2026-09-01", title: "DPW at KingsWord", location: "Nigeria", desc: "Join us in Nigeria with KingsWord. Firm dates are being confirmed.", status: "soon", link: "index.html#newsletter" },
  { category: "retreat", year: 2026, date: "Oct 9 to 11, 2026", sort: "2026-10-09", title: "DPW Retreat", location: "United Kingdom", desc: "A multi-day, immersive weekend away, with teaching, worship, prayer, and honest table conversations. Women arrive carrying the weight of their call and leave lighter, clearer, and more equipped.", status: "soon", link: "index.html#newsletter" },
];

const EVENT_CAT_LABEL = { conference: "Conference", "tea-party": "Tea Party", retreat: "Retreat" };

// Giving
const ONE_TIME_AMOUNTS = [25, 50, 100, 250];

// Fundraising Partnership Program: names + suggested ranges only.
const TIERS = [
  { name: "Friend of the Ministry", min: 25, monthly: "$25 to $50", annual: "$300 to $600" },
  { name: "Ministry Partner", min: 50, monthly: "$50 to $99", annual: "$600 to $1,200" },
  { name: "Impact Partner", min: 100, monthly: "$100 to $249", annual: "$1,200 to $3,000" },
  { name: "Legacy Partner", min: 250, monthly: "$250 to $499", annual: "$3,000 to $6,000" },
];

/* ---------- HELPERS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const TYPE_LABEL = { book: "Book", download: "Downloadable", video: "Video", article: "Article" };
const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- RESOURCE LIBRARY ---------- */
const resourceGrid = $("#resourceGrid");
const resourceEmpty = $("#resourceEmpty");
const archiveToggle = $("#archiveToggle");
const resourceSearch = $("#resourceSearch");
let activeFilter = "all";

function renderResources() {
  if (!resourceGrid) return;
  const term = (resourceSearch?.value || "").trim().toLowerCase();
  const includeArchived = archiveToggle?.checked;

  const list = RESOURCES.filter(r => {
    if (r.status === "archived" && !includeArchived) return false;
    if (activeFilter !== "all" && r.type !== activeFilter) return false;
    if (term && !(r.title.toLowerCase().includes(term) || r.desc.toLowerCase().includes(term))) return false;
    return true;
  });

  resourceGrid.innerHTML = list.map(r => {
    const isHttp = r.link.startsWith("http");
    const attrs = r.download ? 'download' : (isHttp ? 'target="_blank" rel="noopener"' : "");
    return `
    <article class="resource-card reveal">
      <div class="resource-top">
        <span class="resource-type">${TYPE_LABEL[r.type] || r.type}</span>
        ${r.status === "archived" ? '<span class="resource-archived-tag">Archived</span>' : ""}
      </div>
      <h3>${r.title}</h3>
      <p>${r.desc}</p>
      <a href="${r.link}" ${attrs}>${r.cta} →</a>
    </article>`;
  }).join("");

  if (resourceEmpty) resourceEmpty.hidden = list.length !== 0;
  observeReveals();
}

$$(".resource-filters .filter-chip[data-filter]").forEach(chip => {
  chip.addEventListener("click", () => {
    $$(".resource-filters .filter-chip[data-filter]").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeFilter = chip.dataset.filter;
    renderResources();
  });
});
resourceSearch?.addEventListener("input", renderResources);
archiveToggle?.addEventListener("change", renderResources);

/* ---------- EVENTS ---------- */
let activeEventFilter = "all";

// Large feature cards for headline events (Events page only). The visual
// block is a brand-palette gradient with the vessel mark, standing in
// until real event photos arrive.
function renderFeaturedEvents() {
  const wrap = $("#eventFeatured");
  if (!wrap) return;

  const statusLabel = { open: "Registration open", soon: "Save the date", past: "Past event" };
  const list = EVENTS.filter(e => e.featured &&
    (activeEventFilter === "all" || e.category === activeEventFilter));
  wrap.hidden = list.length === 0;

  wrap.innerHTML = list.map(e => `
    <article class="featured-event reveal">
      <div class="featured-event-art art-${e.art || "plum"}" aria-hidden="true">
        ${VESSEL_SVG}
        <span class="featured-flag">Featured</span>
      </div>
      <div class="featured-event-body">
        <span class="tl-cat tl-cat-${e.category}">${EVENT_CAT_LABEL[e.category] || ""}</span>
        <h3>${e.title}</h3>
        <p class="featured-event-date">${e.date} · ${e.location}</p>
        <p class="featured-event-desc">${e.desc}</p>
        <div class="featured-event-action">
          <span class="tl-status status-${e.status}">${statusLabel[e.status] || ""}</span>
          ${e.link ? `<a class="button primary" href="${e.link}">${e.status === "open" ? "Register" : "Notify me"} →</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");

  observeReveals();
}

function renderEvents() {
  const tl = $("#eventTimeline");
  if (!tl) return;
  const empty = $("#eventEmpty");

  const list = EVENTS
    .filter(e => activeEventFilter === "all" || e.category === activeEventFilter)
    .sort((a, b) => a.sort.localeCompare(b.sort));

  if (empty) empty.hidden = list.length !== 0;

  const statusMap = {
    open: '<span class="tl-status status-open">Registration open</span>',
    soon: '<span class="tl-status status-soon">Save the date</span>',
    past: '<span class="tl-status status-past">Past event</span>',
  };

  // Group by year (currently all 2026, but future-proof).
  const years = [...new Set(list.map(e => e.year))].sort((a, b) => a - b);
  tl.innerHTML = years.map(year => {
    const items = list.filter(e => e.year === year).map(e => `
      <div class="timeline-item ${e.status === "past" ? "is-past" : ""} reveal">
        <div class="timeline-card">
          <div class="timeline-info">
            <span class="tl-cat tl-cat-${e.category}">${EVENT_CAT_LABEL[e.category] || ""}</span>
            <span class="tl-title">${e.title}</span>
            <span class="tl-date">${e.date}</span>
            <span class="tl-loc">${e.location}</span>
            <span class="tl-desc">${e.desc}</span>
          </div>
          <div class="tl-action">
            ${statusMap[e.status] || ""}
            ${e.link ? `<a class="tl-link" href="${e.link}">${e.status === "open" ? "Register" : "Notify me"} →</a>` : ""}
          </div>
        </div>
      </div>
    `).join("");
    return `<h3 class="timeline-year">${year}</h3>${items}`;
  }).join("");

  observeReveals();
}

function setEventFilter(filter) {
  activeEventFilter = filter;
  $$(".event-filters .filter-chip").forEach(c =>
    c.classList.toggle("is-active", c.dataset.eventFilter === filter));
  renderFeaturedEvents();
  renderEvents();
}

// Filter chips inside the Events section
$$(".event-filters .filter-chip").forEach(chip => {
  chip.addEventListener("click", () => setEventFilter(chip.dataset.eventFilter));
});

// On the Events page, honor a ?filter= query param (set by the nav dropdown).
(function applyEventFilterFromQuery() {
  if (!$("#eventTimeline")) return;
  const wanted = new URLSearchParams(window.location.search).get("filter");
  const allowed = ["conference", "tea-party", "retreat"];
  if (wanted && allowed.includes(wanted)) setEventFilter(wanted);
})();

/* ---------- GIVING ---------- */
const amountGrid = $("#amountGrid");
const customAmount = $("#customAmount");
const giveBtn = $("#giveOnceBtn");
let selectedAmount = ONE_TIME_AMOUNTS[2]; // default $100

// True only when payments are armed (CONFIG.payments.live) AND a real
// one-time Stripe link is set. Until then, buttons stay in demo mode.
function paymentsConfigured() {
  return CONFIG.payments.live === true &&
    /^https:\/\/buy\.stripe\.com\//.test(CONFIG.payments.oneTimeUrl || "");
}

// Attach ?prefilled_email= to a Stripe Payment Link when we know the giver.
function withEmail(url, email) {
  if (!email) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}prefilled_email=${encodeURIComponent(email)}`;
}

// One-time gift: single "choose what you pay" link (amount set on Stripe).
function oneTimeLink(email) {
  return withEmail(CONFIG.payments.oneTimeUrl, email);
}

// Monthly gift: snap the requested amount to the nearest fixed tier link.
function monthlyLink(amount, email) {
  const tiers = Object.keys(CONFIG.payments.monthly).map(Number).sort((a, b) => a - b);
  const want = Number(amount) || tiers[0];
  const nearest = tiers.reduce((best, t) =>
    Math.abs(t - want) < Math.abs(best - want) ? t : best, tiers[0]);
  return withEmail(CONFIG.payments.monthly[nearest], email);
}

function updateGiveBtn() {
  if (!giveBtn) return;
  giveBtn.href = paymentsConfigured() ? oneTimeLink() : "#";
}

giveBtn?.addEventListener("click", (e) => {
  if (paymentsConfigured()) return;
  e.preventDefault();
  let note = $("#giveDemoNote");
  if (!note) {
    note = document.createElement("p");
    note.id = "giveDemoNote";
    note.className = "form-status";
    note.setAttribute("role", "status");
    giveBtn.insertAdjacentElement("afterend", note);
  }
  note.textContent = "Secure checkout opens here once Stripe is connected. Thank you for your heart to give!";
});

function renderAmounts() {
  if (!amountGrid) return;
  amountGrid.innerHTML = ONE_TIME_AMOUNTS.map(a => `
    <button type="button" class="amount-btn ${a === selectedAmount ? "is-active" : ""}" data-amount="${a}">$${a}</button>
  `).join("");

  $$(".amount-btn", amountGrid).forEach(btn => {
    btn.addEventListener("click", () => {
      selectedAmount = Number(btn.dataset.amount);
      if (customAmount) customAmount.value = "";
      $$(".amount-btn", amountGrid).forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      updateGiveBtn();
    });
  });
  updateGiveBtn();
}

customAmount?.addEventListener("input", () => {
  const val = Number(customAmount.value);
  if (val > 0) {
    selectedAmount = val;
    $$(".amount-btn").forEach(b => b.classList.remove("is-active"));
    updateGiveBtn();
  }
});

/* ---------- DONATION WIDGET (partnership.html) ----------
   Terri-style box: Give once / Monthly toggle + amount presets + custom.
   "Give once" routes to the pay-what-you-want link (amount chosen on
   Stripe); "Monthly" routes to the fixed monthly link nearest the amount. */
const DONATE_AMOUNTS = [25, 50, 75, 100, 250, 500];

function initDonateWidget() {
  const box = $("#donateBox");
  if (!box) return;
  const amountsWrap = $("#donateAmounts", box);
  const customInput = $("#donateCustom", box);
  const goBtn = $("#donateGo", box);
  const status = $("#donateStatus", box);

  let freq = "monthly";            // matches the default-active toggle
  let amount = 100;                // matches the default-active preset

  amountsWrap.innerHTML = DONATE_AMOUNTS.map(a =>
    `<button type="button" class="donate-amt${a === amount ? " is-active" : ""}" data-amount="${a}">$${a}</button>`
  ).join("");

  const paintAmounts = () => $$(".donate-amt", box).forEach(b =>
    b.classList.toggle("is-active", Number(b.dataset.amount) === amount && !customInput.value));

  const refresh = () => {
    goBtn.textContent = freq === "monthly" ? "Donate monthly" : "Donate";
    goBtn.href = paymentsConfigured()
      ? (freq === "monthly" ? monthlyLink(amount) : oneTimeLink())
      : "#";
    if (status) status.textContent = "";
  };

  // Frequency toggle
  $$(".donate-freq-btn", box).forEach(btn => {
    btn.addEventListener("click", () => {
      freq = btn.dataset.freq;
      $$(".donate-freq-btn", box).forEach(b => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      refresh();
    });
  });

  // Amount presets
  amountsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".donate-amt");
    if (!btn) return;
    amount = Number(btn.dataset.amount);
    customInput.value = "";
    paintAmounts();
    refresh();
  });

  // Custom amount
  customInput.addEventListener("input", () => {
    const val = Number(customInput.value);
    if (val > 0) amount = val;
    paintAmounts();
    refresh();
  });

  // Demo mode: don't navigate to a "#" placeholder — explain instead.
  goBtn.addEventListener("click", (e) => {
    if (paymentsConfigured()) return;
    e.preventDefault();
    if (status) status.textContent = "Secure checkout opens here once Stripe is connected. Thank you for your heart to give!";
  });

  refresh();
}
initDonateWidget();

function renderTiers() {
  const grid = $("#tierGrid");
  if (!grid) return;
  // Until payments are armed, tier buttons scroll up to the donation widget
  // instead of opening a checkout.
  grid.innerHTML = TIERS.map(t => {
    const href = paymentsConfigured() ? monthlyLink(t.min) : "#give";
    const attrs = paymentsConfigured() ? 'target="_blank" rel="noopener"' : "";
    return `
    <article class="tier reveal">
      <h4 class="tier-name">${t.name}</h4>
      <div class="tier-price"><strong>${t.monthly}</strong><span>/month</span></div>
      <p class="tier-annual">or ${t.annual} annually</p>
      <a class="tier-pick" href="${href}" ${attrs}>Partner at this level →</a>
    </article>`;
  }).join("");
  observeReveals();
}

/* ---------- FORMS (integration-ready: systeme.io) ---------- */
async function sendToCrm(formId, data) {
  if (!CONFIG.crm.endpoint) {
    // Demo mode: no CRM endpoint configured yet.
    console.log(`[${formId}] submission (demo, no CRM endpoint set)`, data);
    return true;
  }
  try {
    await fetch(CONFIG.crm.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: formId, ...data }),
    });
    return true;
  } catch (err) {
    console.error(`[${formId}] CRM submission failed`, err);
    return false;
  }
}

function handleForm(formId, statusId, successMsg) {
  const form = $("#" + formId);
  const status = $("#" + statusId);
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    if (status) status.textContent = "Sending…";
    const ok = await sendToCrm(formId, data);

    if (status) status.textContent = ok ? successMsg : "Something went wrong. Please email us directly.";
    if (ok) {
      form.reset();
      const defaultRadio = $('input[name="track"][value="ministry"]', form);
      if (defaultRadio) defaultRadio.checked = true;
    }
  });
}

handleForm("newsletterForm", "newsletterStatus", "You're in! Watch your inbox for a welcome note. 💛");
handleForm("contactForm", "contactStatus", "Thank you. Your message is on its way and we'll be in touch soon.");
handleForm("bookingForm", "bookingStatus", "Thank you! Your booking request is in and the team will follow up by email.");

/* ---------- PARTNER SIGN-UP → STRIPE ----------
   Captures partner contact details (name, email, address, phone) and
   records them to the CRM (systeme.io) BEFORE handing the partner off to
   Stripe for payment. Stripe Payment Links are set (see CONFIG); the CRM
   endpoint is still pending, so contact capture runs in demo mode (logs
   only) while the payment redirect is live. */
function initPartnerForm() {
  const form = $("#partnerForm");
  if (!form) return;
  const status = $("#partnerStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    const amount = Number(data.amount) || Number(data.customAmount) || 0;
    const recurring = data.frequency === "monthly";

    if (status) status.textContent = "Saving your details…";

    // 1) Record the partner in the CRM first (so we keep the contact even
    //    if they drop off at the payment step).
    const ok = await sendToCrm("partnerForm", data);
    if (!ok) {
      if (status) status.textContent = "We couldn't save your details. Please email partner@dearpastorswife.org.";
      return;
    }

    // 2) Hand off to the matching Stripe Payment Link (monthly = fixed tier
    //    link nearest the chosen amount; one-time = pay-what-you-want link).
    const checkoutUrl = recurring
      ? monthlyLink(amount, data.email)
      : oneTimeLink(data.email);
    if (!paymentsConfigured()) {
      // Demo mode: Stripe link not finalized yet.
      if (status) status.textContent = "Details saved. Payment checkout opens here once Stripe is connected.";
      console.log("[partnerForm] would redirect to Stripe:", checkoutUrl, data);
      return;
    }
    if (status) status.textContent = "Details saved. Redirecting you to secure checkout…";
    window.location.href = checkoutUrl;
  });
}
initPartnerForm();

/* ---------- SHARE BUTTON ----------
   Uses the native share sheet where available (mobile), and falls back
   to copying the link to the clipboard on desktop. */
function initShare() {
  $$("[data-share]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const shareData = {
        title: "Dear Pastor's Wife",
        text: "Partner with Dear Pastor's Wife to keep resources free for women in ministry the world over.",
        url: btn.dataset.share || window.location.href,
      };
      const label = btn.querySelector(".share-label");
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          if (label) { const prev = label.textContent; label.textContent = "Link copied!"; setTimeout(() => label.textContent = prev, 2200); }
        }
      } catch (_) { /* user dismissed the share sheet */ }
    });
  });
}
initShare();

/* ---------- COMMUNITY (Coming Soon) ----------
   The community forum is post-launch. The Community page is a styled
   "Coming Soon" card with an email signup that feeds the same
   systeme.io pipeline as the other forms (demo mode until the CRM
   endpoint is configured in CONFIG).*/
handleForm("communityForm", "communityStatus", "You're on the list! We'll let you know the moment the community opens. 💛");
/* ---------- HEADER / ANNOUNCE / NAV ---------- */
const header = $("#siteHeader");
const announceBar = $("#announceBar");

window.addEventListener("scroll", () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.pageYOffset > 30);
}, { passive: true });

$(".announce-close")?.addEventListener("click", () => {
  announceBar?.classList.add("hidden");
  try { sessionStorage.setItem("dpwAnnounceClosed", "1"); } catch (_) {}
});
try { if (sessionStorage.getItem("dpwAnnounceClosed")) announceBar?.classList.add("hidden"); } catch (_) {}

// Nav dropdown (Events): click toggle on touch, hover handled by CSS
const dropdown = $(".nav-dropdown");
const dropdownToggle = $(".nav-dropdown-toggle");
dropdownToggle?.addEventListener("click", (e) => {
  // On small screens (stacked nav), tapping the label opens the submenu
  if (window.innerWidth <= 900) {
    e.preventDefault();
    const open = dropdown.classList.toggle("open");
    dropdownToggle.setAttribute("aria-expanded", String(open));
  }
});

// Mobile menu
const menuButton = $(".menu-toggle");
const navLinks = $(".nav-links");
if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "Close" : "Menu";
  });
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      dropdown?.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "Menu";
    });
  });
}

// Smooth scroll with sticky-header offset
document.addEventListener("click", (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute("href");
  if (href === "#" || href === "#top") {
    if (href === "#top") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    return;
  }
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  const offset = (header?.offsetHeight || 90) + 16;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
});

/* ---------- REVEAL ON SCROLL ----------
   Scroll-based (not IntersectionObserver) so fast scrolling can never
   leave content stranded at opacity 0. A safety timer reveals everything
   unconditionally as a final guarantee. */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealListenerAttached = false;

function revealInViewport() {
  const trigger = window.innerHeight * 0.94;
  $$(".reveal:not(.in-view)").forEach(el => {
    if (el.getBoundingClientRect().top < trigger) el.classList.add("in-view");
  });
}

function observeReveals() {
  if (reduceMotion) { $$(".reveal").forEach(el => el.classList.add("in-view")); return; }
  revealInViewport();
  if (!revealListenerAttached) {
    revealListenerAttached = true;
    window.addEventListener("scroll", revealInViewport, { passive: true });
    window.addEventListener("resize", revealInViewport, { passive: true });
    setTimeout(() => $$(".reveal:not(.in-view)").forEach(el => el.classList.add("in-view")), 4000);
  }
}

/* ---------- STAT COUNTER ---------- */
function animateCounters() {
  $$("[data-count]").forEach(el => {
    const target = Number(el.dataset.count);
    if (!target) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 50));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { el.textContent = target + "+"; clearInterval(timer); }
          else el.textContent = current + "+";
        }, 28);
        o.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    obs.observe(el);
  });
}

/* ---------- BOOK 3D TILT ---------- */
const bookCover = $(".book-cover");
const bookWrapper = $(".book-cover-wrapper");
if (bookCover && bookWrapper && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  bookWrapper.addEventListener("mousemove", (e) => {
    const rect = bookWrapper.getBoundingClientRect();
    const rotateX = (e.clientY - rect.top - rect.height / 2) / 10;
    const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 10;
    bookCover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY - 15}deg) translateZ(20px)`;
  });
  bookWrapper.addEventListener("mouseleave", () => {
    bookCover.style.transform = "rotateY(-15deg) translateZ(0)";
  });
}

/* ---------- LAZY IMAGES ----------
   Skip hero/above-the-fold images so the LCP image isn't lazy-loaded. */
$$("img[src]").forEach(img => {
  if (!img.loading && !img.closest(".hero, .page-hero")) img.loading = "lazy";
});

/* ---------- MOTION ENHANCEMENTS ---------- */

// Thin scroll-progress bar
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);
function updateProgress() {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  progressBar.style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Stagger a group's reveal, with optional direction
function stagger(selector, { dir, step = 80, max = 6 } = {}) {
  $$(selector).forEach((el, i) => {
    el.classList.add("reveal");
    if (dir) el.classList.add(dir);
    el.style.transitionDelay = (i % max) * step + "ms";
  });
}

// Cursor spotlight glow + gentle 3D tilt
function enhanceCards(selector, { tilt = true } = {}) {
  if (reduceMotion) return;
  $$(selector).forEach(card => {
    card.classList.add("spotlight");
    if (tilt) card.classList.add("tilt");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", px * 100 + "%");
      card.style.setProperty("--my", py * 100 + "%");
      if (tilt) {
        card.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 5}deg) translateY(-4px)`;
      }
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// Magnetic pull toward the cursor (for hero + give CTAs)
function magnetic(selector) {
  if (reduceMotion) return;
  $$(selector).forEach(btn => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
  });
}

// Gentle hero parallax (copy drifts slower than the page)
const heroCopy = $(".hero-copy");
if (heroCopy && !reduceMotion) {
  window.addEventListener("scroll", () => {
    const y = window.pageYOffset;
    if (y < window.innerHeight) heroCopy.style.transform = `translateY(${y * 0.12}px)`;
  }, { passive: true });
}

/* ---------- INIT ---------- */
renderResources();
renderFeaturedEvents();
renderEvents();
renderAmounts();
renderTiers();
animateCounters();

// Mark static sections for reveal
$$(".section-heading, .book-info, .story-copy").forEach(el => el.classList.add("reveal"));

// Staggered, directional reveals
stagger(".track-card", { dir: "zoom", step: 120 });
stagger(".resource-card");
stagger(".timeline-item");
stagger(".tier", { dir: "from-right" });
stagger(".vision-points li", { dir: "from-right", step: 90 });
stagger(".youtube-features li", { dir: "from-left", step: 80 });

// Interactive hover effects
enhanceCards(".resource-card, .tier, .track-card", { tilt: true });
magnetic(".hero-actions .button, .nav-give, .give-btn");

observeReveals();

console.log("Dear Pastor's Wife: resource hub loaded");
