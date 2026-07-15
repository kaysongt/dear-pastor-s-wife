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
// No Facebook page exists, so it's intentionally absent here.
const SOCIAL = {
  instagram: "https://www.instagram.com/dearpastorswife",
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

// Official DPW logomark (vessel + four-point star), path-based so it inherits
// `currentColor`, renders Tyrian in the header and cream on dark event art.
const VESSEL_SVG = `
  <svg class="brand-vessel" viewBox="31 26 92 107" fill="currentColor" aria-hidden="true">
    <path d="M57.63,49.84c6.63-13.58,19.95-21.15,34.65-15.14,4.33,1.92,7.5,5.65,10.6,9.08,4.04,4.71,7.65,9.78,10.86,15.09,1.6,2.66,3.09,5.39,4.36,8.25,1.37,2.82,2.34,6.13,1.62,9.26-1.09,6.2-3.75,11.89-6.45,17.51-4.14,8.34-8.89,16.33-13.98,24.12-1.72,2.59-3.42,5.16-5.36,7.65-.5.64-1.23,1.28-1.95,1.69-2.13,1.21-4.57,1.71-6.95,2.02-4.72.54-9.49.36-14.13-.67-4.79-.82-8.51-4.72-11.69-8.06-4.24-4.61-7.97-9.6-11.47-14.73-3.47-5.16-6.73-10.45-9.63-15.97-1.43-2.75-2.8-5.67-3.45-8.86-1.16-4.83.81-9.65,3.03-13.84,2.07-4.18,4.32-8.26,6.86-12.18,4.53-6.6,17.45-26.01,25.63-25.94,0,0-.02.2-.02.2-7.1.07-17.99,16.88-21.94,22.61-4.26,6.34-7.9,13.23-10.9,20.2-1.12,2.76-1.49,5.67-.82,8.57.63,2.88,1.95,5.6,3.39,8.3,2.87,5.41,6.13,10.65,9.58,15.73,3.45,5.08,7.1,10.05,11.21,14.56,3.13,3.26,6.07,6.72,10.66,7.63,5.53,1.28,17.31,2.2,21.4-2.25,9.06-12.34,17.22-25.63,23.22-39.75,1.56-4.17,3.38-8.67,2.71-13.13-.37-1.39-.95-2.86-1.54-4.25-4.24-9.49-15.81-27.68-25.09-32.24-10.63-4.47-21.62-1.79-29.08,6.99-2.02,2.31-3.8,4.87-5.15,7.63l-.18-.08h0Z"/>
    <path d="M79.69,94.33c.09,4.25-.17,25.69,7.91,19.54,3.47-2.63,5.5-6.56,7.05-10.57,1.93-5.02,3.95-10.75,8.38-14.4,2.58-1.97,5.13-3.92,6.66-6.76,6.15-11.72-11.07-23.51-19.81-28.55-6.21-3.63-14.56-6.42-21.3-2.64-3.32,1.89-5.27,5.28-7.33,8.42-4.86,7.94-13.75,23.05-6.99,31.68,1.17,1.52,2.52,2.87,4.12,3.86,3.29,1.94,7.36,2.65,10.7,4.61,1.75.9,3.36,2.04,4.95,3.16-3.31-2.09-6.83-3.81-10.56-4.89-1.85-.57-3.8-1.05-5.57-2.06-5.73-3.37-8.3-8.99-7.26-15.51,1.13-7.94,4.96-15.09,9.09-21.81,2.14-3.36,4.3-7.02,7.9-9.08,11.86-6.35,25.05,2.93,34.17,10.13,6.55,5.4,14.43,14.68,9.41,23.53-1.69,3.07-4.39,5.18-7.11,7.2-4.28,3.41-6.15,8.54-8.25,13.6-1.68,4.1-3.96,8.24-7.66,10.89-.92.66-2.02,1.28-3.32,1.24-6.28-.62-5.32-16.9-5.19-21.59h0Z"/>
    <path d="M79.61,66.57c-.72,5.75-.96,9.4-2.37,11.75-2.31,2.93-6.31,3.21-13.66,3.87,7.23.85,11.14,1.04,13.46,3.72,1.73,2.37,2.04,6.64,2.6,12.5.94-7.59,1.07-12.02,4.49-14.2,2.43-1.14,6.06-1.39,11.53-2.01-6.79-.81-10.72-1-13.07-3.02-1.98-2.3-2.19-6.12-2.97-12.6Z"/>
  </svg>`;

const IG_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.21 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.21 8.8 2.2 12 2.2zm0 4.86A4.94 4.94 0 1 0 12 16.94 4.94 4.94 0 0 0 12 7.06zm0 8.14A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm6.3-8.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z"/></svg>`;
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
        <p>See where we're gathering next.</p>
        <a href="events.html">See all events →</a>
      </div>
      <button class="announce-close" aria-label="Dismiss announcement">×</button>
    </div>

    <header class="site-header" id="siteHeader">
      <a class="brand" href="${homeHref}">
        ${VESSEL_SVG}
        <span class="brand-wordmark">
          <span class="bw-main">dear pastor's wife</span>
          <span class="bw-sub">Clarity · Confidence · Community</span>
        </span>
      </a>
      <button class="menu-toggle" aria-expanded="false">Menu</button>
      <nav class="nav-links" aria-label="Primary navigation">
        ${navLinksHtml}
        <a class="nav-give${partnerActive}" href="partnership.html">♥ Partner</a>
      </nav>
    </header>`;

  const footerHtml = `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <a class="brand" href="${homeHref}" style="margin-bottom:0.6rem">
            ${VESSEL_SVG}
            <span class="brand-wordmark"><span class="bw-main">dear pastor's wife</span><span class="bw-sub">Clarity · Confidence · Community</span></span>
          </a>
          <p class="footer-tagline">A global resource hub and community for women in ministry. Clarity, confidence, and real support.</p>
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
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-social" aria-label="Social media">
          ${socialLink(SOCIAL.instagram, "Instagram", IG_SVG)}
          ${socialLink(SOCIAL.youtube, "YouTube", YT_SVG)}
        </div>
        <p>© 2026 Dear Pastor's Wife by May Ijisesan. All rights reserved.</p>
        <p class="footer-credit">Made by <a href="https://www.cozydigital.org" target="_blank" rel="noopener">Cozy Digital<span class="cozy-logo" aria-hidden="true"></span></a></p>
      </div>
    </footer>`;

  // Persistent floating "Give" button. On mobile the header's Partner button
  // hides inside the menu, so this keeps giving one tap away on every page.
  // Skipped on the partnership page, where the full donate box is already visible.
  const floatingGive = current === "partnership"
    ? ""
    : `<a class="floating-give" href="partnership.html#give" aria-label="Give to Dear Pastor's Wife">♥ Give</a>`;

  const topSlot = document.querySelector('[data-chrome="top"]');
  if (topSlot) topSlot.outerHTML = topHtml;
  const footSlot = document.querySelector('[data-chrome="footer"]');
  if (footSlot) footSlot.outerHTML = footerHtml + floatingGive;
}
buildChrome();

/* ---------- CONFIG (fill in when live credentials are ready) ----------
   Everything that needs a real account/key is centralized here so the
   client (or a follow-up dev) can flip the site live without hunting
   through the code.

   PAYMENTS (Stripe Payment Links):
     • `oneTimeUrl` is a FLEXIBLE "customer chooses what to pay" link (no
       preset/min/max on the Stripe side) — it covers every one-time gift
       (give card + partner form "one time"). Stripe does NOT support
       prefilling that amount via URL param (tested), so the giver always
       types their own amount on Stripe's hosted page; our site can't show
       or pass a specific number, only a suggested one in copy.
     • `monthly` maps a USD amount to a FIXED recurring subscription link.
       Stripe Payment Links have no "customer chooses" option for recurring
       billing at all (confirmed in the Stripe dashboard: subscriptions
       require a fixed Price) — so monthly giving is genuinely capped to
       this tier list. Custom monthly amounts snap to the nearest tier;
       Stripe always shows the real charge before the giver confirms.
     • Enable "Card" and "ACH Direct Debit" in the Stripe Dashboard so
       bank transfer shows at checkout.
     • These are LIVE-mode links (buy.stripe.com/... ; test links carry a
       /test_ segment). Real cards are charged.

   CRM (systeme.io):
     • Wired to the "DPW Newletter Signup" funnel's opt-in page (see
       `crm` below): every site form posts its first name + email there and
       systeme.io creates the contact in the CRM (Contacts → Leads).
     • Blank `crm.endpoint` returns forms to "demo" mode (logs + success msg).
*/
const CONFIG = {
  payments: {
    // MASTER SWITCH. Keep false until every link below is verified AND the
    // client has confirmed go-live. While false, all give/donate buttons stay
    // in the friendly "checkout opens once Stripe is connected" demo state and
    // charge nobody. Flip to true to arm real payments.
    live: true,
    oneTimeUrl: "https://buy.stripe.com/14A3cvdeg87v346aCN6Vq0e",
    monthly: {
      25:   "https://buy.stripe.com/dRmbJ15LO2Nb3463al6Vq08",
      50:   "https://buy.stripe.com/aFaaEX8Y0bjHbAC9yJ6Vq09",
      75:   "https://buy.stripe.com/cNi9AT4HKdrPdIK12d6Vq0d",
      100:  "https://buy.stripe.com/14AfZh2zC0F3awyeT36Vq0a",
      250:  "https://buy.stripe.com/7sY28ra24gE18oq9yJ6Vq0b",
      500:  "https://buy.stripe.com/dRmbJ1a24cnL0VY5it6Vq0c",
      750:  "https://buy.stripe.com/6oU7sLa243Rf6gifX76Vq0f",
      1000: "https://buy.stripe.com/bJe00j4HK5Zn7kmbGR6Vq0g",
      2500: "https://buy.stripe.com/7sYaEX2zC3RfcEGcKV6Vq0h",
    },
    // Standard card processing fee (2.9% + $0.30) used to show donors the
    // "cover the fees" total. NOTE: fixed Stripe Payment Links can't take an
    // arbitrary amount, so the widget DISPLAYS the fee-inclusive total and, to
    // actually charge it, needs either dedicated fee-inclusive links or a
    // Checkout Session created server-side. Hook is here; wiring is server-side.
    feePercent: 0.029,
    feeFixed: 0.30,
    // Bank transfer (ACH): ACH Direct Debit is enabled account-wide in Stripe
    // (Settings → Payment methods), so it rides on the SAME Payment Links as
    // card — no separate URL needed. The "Bank transfer" toggle below just
    // sets donor expectations before they land on Stripe's checkout, where
    // ACH shows automatically alongside card/wallets.
  },
  crm: {
    // systeme.io opt-in capture (funnel: "DPW Newletter Signup"). The endpoint
    // is the funnel's opt-in page itself; systeme.io creates/updates the CRM
    // contact from the posted first name + email. Empty = demo mode.
    //
    // ⚠ GOES LIVE ONLY WHEN DNS EXISTS: newsletter.dearpastorswife.org needs a
    // CNAME record pointing at systeme.io (systeme.io side is already
    // provisioned and serving the TLS cert). Until that record is added,
    // submissions can't reach systeme.io and forms show the "email us
    // directly" fallback message.
    endpoint: "https://newsletter.dearpastorswife.org/",
    // The opt-in page's submit-button entity id, sent as entityId so the
    // submission matches what the hosted page itself would send.
    optinEntityId: "a2e4377a-139b-4e1a-b728-b12ec7121a6a",
  },
};

/* ---------- DATA ---------- */

// Resource library. type: book | download | video | article. status: current | archived.
const RESOURCES = [
  { type: "book", status: "current", title: "Dear Pastor's Wife (The Book)", desc: "Biblical wisdom and honest encouragement for women in ministry life.", cta: "Get it on Amazon", link: "https://www.amazon.com/Dear-Pastors-Wife-May-Ijisesan-ebook/dp/B09TQ2G8PJ" },
  { type: "video", status: "current", title: "Weekly Encouragement on YouTube", desc: "New teaching, Q&A, and real talk for ministry women every week.", cta: "Watch on YouTube", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "video", status: "current", title: "Leading Without Losing Yourself", desc: "A teaching session on staying rooted while you serve and lead.", cta: "Watch now", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "video", status: "archived", title: "2024 Conference Replay: Thrive", desc: "The full replay of our first leadership conference for ministry women.", cta: "Watch replay", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "article", status: "current", title: "You Are Not \"Just a Pastor's Wife\"", desc: "The label \"pastor's wife\" was never meant to shrink you. Discover the two-fold call you've been doubly graced to carry.", cta: "Read the article", link: "not-just-a-pastors-wife.html" },
  { type: "article", status: "current", title: "Occupy Your Place", desc: "Purpose is not discovered in comfort. Here is how I found mine one assignment at a time, and how you can occupy the place God made for you.", cta: "Read the article", link: "occupy-your-place.html" },
  { type: "article", status: "current", title: "Consecration Without Burnout", desc: "A consecrated life doesn't have to be a depleted one. Learn the difference between consecration and sacrifice, and how to serve God with joy.", cta: "Read the article", link: "consecration-without-burnout.html" },
  { type: "article", status: "current", title: "When You Can't Borrow His Faith", desc: "Your husband's faith cannot carry you through every storm. Here is how I learned to stand on my own faith when everything was on the line.", cta: "Read the article", link: "when-you-cant-borrow-his-faith.html" },
  { type: "article", status: "current", title: "Thriving, Not Just Surviving", desc: "You don't have to settle for merely surviving your marriage. With intentionality and courage, a pastor's marriage can thrive.", cta: "Read the article", link: "thriving-not-surviving-marriage.html" },
  { type: "article", status: "current", title: "Raising Whole Children in a Fishbowl", desc: "Pastors' kids aren't born rebellious, they're shaped. Here's how to raise grounded, well-rounded children without the pressure of being \"the example.\"", cta: "Read the article", link: "raising-whole-children-in-a-fishbowl.html" },
  { type: "article", status: "current", title: "Guarded and Gracious", desc: "Ministry is about people, and people can hurt. Here's how to build rich church relationships, set wise boundaries, and heal a heart that's closed up.", cta: "Read the article", link: "guarded-and-gracious.html" },
];

// Events. category: conference | tea-party | retreat. status: open | soon | past.
// `sort` is an ISO date used for ordering AND auto-expiry; `endSort` (optional,
// for multi-day events) is the last day, an event "falls off" the itinerary the
// day after it ends. `slug` powers its dedicated page (event.html?slug=...).
// `featured` events render as large cards at the top of the Events page.
// `art` picks the brand-palette placeholder block (no stock photos until
// the client's event photos arrive). `details`/`requirements` feed the event page.
// `guest: true` marks an external event May is only SPEAKING at (not DPW-hosted).
// Guest events appear on the vertical timeline but are never featured and never
// drive the announcement bar; their `link` points off-site to the host.
const EVENTS = [
  {
    slug: "summer-blast", category: "conference", year: 2026,
    date: "Jul 30 to Aug 2, 2026", sort: "2026-07-30", endSort: "2026-08-02",
    title: "Summer Blast", location: "United States", venue: "Hosted by KingsWord",
    desc: "May joins KingsWord's Summer Blast as a guest speaker. Registration and full details are on the host's site.",
    status: "soon", guest: true, link: "https://summerblast.kingsword.org/",
  },
  {
    slug: "dpw-tea-party-chicago", category: "tea-party", year: 2026,
    date: "Aug 15, 2026", sort: "2026-08-15",
    title: "DPW Tea Party", location: "Chicago, USA", venue: "Central Chicago (address shared on registration)",
    desc: "An intimate two-hour gathering with icebreakers and table topics, the kind of conversation that quickly feels like a reunion. Free and open to pastors' wives, ministers' wives, and women in Christian leadership.",
    details: "Two hours around a table: icebreakers to open hearts, table topics too good to cut short, and a room that quickly feels like a reunion even among women meeting for the first time. We close praying for one another.",
    requirements: "Completely free. Open to pastors' wives, ministers' wives, and women in Christian leadership. Please register so we can set a place for you.",
    status: "soon", art: "clay",
  },
  {
    slug: "dpw-kingsword-nigeria", category: "conference", year: 2026,
    date: "September 2026", sort: "2026-09-01",
    title: "DPW at KingsWord", location: "Nigeria", venue: "KingsWord, Nigeria",
    desc: "Join us in Nigeria with KingsWord. Firm dates are being confirmed.",
    details: "We're bringing Dear Pastor's Wife to Nigeria in partnership with KingsWord. Firm dates and the full programme are being confirmed, register your interest and we'll be in touch the moment details are set.",
    requirements: "Open to women in ministry and Christian leadership. Register your interest to receive dates, venue, and registration details first.",
    status: "soon", art: "plum",
  },
  {
    slug: "dpw-retreat-uk", category: "retreat", year: 2026,
    date: "Oct 9 to 11, 2026", sort: "2026-10-09", endSort: "2026-10-11",
    title: "DPW Retreat", location: "United Kingdom", venue: "Countryside venue, UK (shared on registration)",
    desc: "A multi-day, immersive weekend away, with teaching, worship, prayer, and honest table conversations. Women arrive carrying the weight of their call and leave lighter, clearer, and more equipped.",
    details: "From Friday afternoon to Sunday morning, we gather away from the noise: teaching to testimony, worship to prayer, honest table conversations to hands-on workbook sessions. An intimate 25–30 woman experience of renewal.",
    requirements: "Open to women in ministry and Christian leadership. Places are limited to keep the retreat intimate; a deposit may apply and will be confirmed at registration.",
    status: "soon", art: "clay",
  },
];

const EVENT_CAT_LABEL = { conference: "Conference", "tea-party": "Tea Party", retreat: "Retreat" };

// --- Event date helpers: auto-expire past events so the itinerary rotates. ---
// An event drops off the day AFTER it ends, so the next one rises automatically.
const todayISO = () => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const eventEndISO = (e) => e.endSort || e.sort;
const isPastEvent = (e) => eventEndISO(e) < todayISO();
const eventUrl = (e) => e.link || `event.html?slug=${encodeURIComponent(e.slug)}`;
const isExternal = (url) => /^https?:\/\//.test(url || "");
const findEvent = (slug) => EVENTS.find(e => e.slug === slug);
const upcomingEvents = () => EVENTS.filter(e => !isPastEvent(e)).sort((a, b) => a.sort.localeCompare(b.sort));

/* ---------- ADD TO CALENDAR ----------
   Events are all-day (no set times yet), so we build all-day calendar entries
   from `sort` (start) and `endSort`/`sort` (end). All-day DTEND is exclusive,
   so we add one day. Works fully client-side: an .ics data-URI download covers
   Apple Calendar / Outlook, and a template link covers Google Calendar. */
const icsDate = (iso) => iso.replace(/-/g, "");                     // 2026-08-15 -> 20260815
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const calStart = (e) => e.sort;
const calEnd = (e) => addDays(e.endSort || e.sort, 1);              // DTEND is exclusive
const icsEsc = (s) => String(s || "").replace(/([,;\\])/g, "\\$1").replace(/\r?\n/g, "\\n");

function googleCalUrl(e) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${icsDate(calStart(e))}/${icsDate(calEnd(e))}`,
    details: (e.desc || "") + (isExternal(e.link) ? `\n\n${e.link}` : ""),
    location: e.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsHref(e) {
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dear Pastors Wife//Events//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${e.slug}@dearpastorswife.org`,
    `DTSTAMP:${icsDate(todayISO())}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDate(calStart(e))}`,
    `DTEND;VALUE=DATE:${icsDate(calEnd(e))}`,
    `SUMMARY:${icsEsc(e.title)}`,
    `LOCATION:${icsEsc(e.location)}`,
    `DESCRIPTION:${icsEsc((e.desc || "") + (isExternal(e.link) ? ` ${e.link}` : ""))}`,
    isExternal(e.link) ? `URL:${e.link}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean);
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
}

// Reusable "Add to calendar" dropdown (Google + Apple/Outlook .ics).
function calMenuHtml(e, { compact = false } = {}) {
  return `
    <div class="add-cal">
      <button type="button" class="add-cal-btn${compact ? " compact" : ""}" aria-haspopup="true" aria-expanded="false">📅 Add to calendar</button>
      <div class="add-cal-menu" role="menu" hidden>
        <a role="menuitem" href="${googleCalUrl(e)}" target="_blank" rel="noopener">Google Calendar</a>
        <a role="menuitem" href="${icsHref(e)}" download="${e.slug}.ics">Apple / Outlook (.ics)</a>
      </div>
    </div>`;
}

// Point the announcement bar at the soonest upcoming DPW-hosted event (guest
// events May only speaks at never drive it). Auto-advances as events pass;
// hides the bar when there's nothing coming up.
function updateAnnounceBar() {
  const bar = document.querySelector("#announceBar");
  const inner = bar && bar.querySelector(".announce-inner");
  if (!inner) return;
  const next = upcomingEvents().filter(e => !e.guest)[0];
  if (!next) { bar.classList.add("hidden"); return; }
  inner.innerHTML = `
    <span class="announce-tag">Next up</span>
    <p><strong>${escapeHtml(next.title)}</strong>, ${escapeHtml(next.date)}${next.location ? " · " + escapeHtml(next.location) : ""}.</p>
    <span class="announce-note">Save the date.</span>
    <a href="${eventUrl(next)}">See details →</a>`;
}

// Fundraising Partnership Program: names + suggested ranges only.
const TIERS = [
  { name: "Friend of the Ministry", min: 25, monthly: "$25 to $50", annual: "$300 to $600" },
  { name: "Ministry Partner", min: 50, monthly: "$50 to $99", annual: "$600 to $1,200" },
  { name: "Impact Partner", min: 100, monthly: "$100 to $249", annual: "$1,200 to $3,000" },
  { name: "Legacy Partner", min: 250, monthly: "$250 to $499", annual: "$3,000 to $6,000" },
];

/* ---------- COMMUNITY (preview) ----------
   One community organized by topics (not many small groups). This mock data
   powers the forum preview shell on community.html; swap it for a real API
   (topics + threads endpoints) when the backend is ready. */
const COMMUNITY_TOPICS = [
  { id: "faith",      name: "Faith & Devotion",      icon: "✦", desc: "Prayer, the Word, and staying rooted" },
  { id: "ministry",   name: "Ministry Life",         icon: "✿", desc: "Boundaries, burnout, and leading well" },
  { id: "marriage",   name: "Marriage & Partnership",icon: "❥", desc: "Thriving alongside your husband in ministry" },
  { id: "children",   name: "Raising Children",      icon: "❀", desc: "Parenting well inside the fishbowl" },
  { id: "leadership", name: "Finance & Leadership",  icon: "◆", desc: "Money, work, and leading with confidence" },
  { id: "wellbeing",  name: "Rest & Wellbeing",      icon: "☼", desc: "Caring for you, so you can pour out" },
];

const COMMUNITY_THREADS = [
  { topic: "ministry",   title: "How do you actually protect your day off?", author: "Grace O.", role: "Lead Pastor's wife", replies: 34, likes: 91, ago: "2h", excerpt: "Every time I plan to rest, something 'urgent' comes up. How do you all guard your rhythms without guilt?" },
  { topic: "faith",      title: "A prayer that carried me through a hard season", author: "Ada N.", role: "Minister's wife", replies: 18, likes: 120, ago: "5h", excerpt: "Sharing the one line I prayed on repeat when I had nothing left. Maybe it meets someone here too." },
  { topic: "children",   title: "Raising PKs who love the church, not resent it", author: "Bola A.", role: "Youth Pastor's wife", replies: 42, likes: 77, ago: "1d", excerpt: "What has actually helped our kids feel like people, not 'the example'? Compiling what's worked for us." },
  { topic: "marriage",   title: "Date nights when you both serve every weekend", author: "Kemi T.", role: "Co-Pastor", replies: 27, likes: 64, ago: "1d", excerpt: "Weekends are gone to ministry. How do you keep the marriage first without it feeling like one more task?" },
  { topic: "leadership", title: "First time managing a real budget, help?", author: "Ruth E.", role: "Ministry Director", replies: 15, likes: 39, ago: "2d", excerpt: "Nobody taught me the money side. Looking for plain-language resources other women here have trusted." },
  { topic: "wellbeing",  title: "The rest that finally refilled me", author: "May I.", role: "Founder, DPW", replies: 58, likes: 210, ago: "3d", excerpt: "Consecration without burnout is possible. Here's the difference that changed everything for me." },
];

/* ---------- HELPERS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
// Declared this early (not down by REVEAL ON SCROLL, where it's used) because
// observeReveals() can be called during initial script execution, e.g. by
// events.html's ?filter= handling, well before that point in the file. A
// later `const reduceMotion` would leave it in the temporal dead zone for
// that early call, throwing a ReferenceError that aborts the rest of the
// script's top-level execution (every init after the throw silently never
// runs: mobile menu button, dropdown toggle, community/tier rendering...).
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealListenerAttached = false; // set true once observeReveals() attaches its scroll/resize listeners
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
  // Always feature the nearest upcoming event in the active tab (auto fall-off:
  // completed events drop out and the next one rises automatically), except
  // Summer Blast, which is an external guest engagement rather than a DPW
  // event to headline. When it would be the nearest match (on "All" and
  // "Conferences"), the next-closest qualifying event steps up instead.
  const nearest = EVENTS
    .filter(e => !isPastEvent(e) && e.slug !== "summer-blast" &&
      (activeEventFilter === "all" || e.category === activeEventFilter))
    .sort((a, b) => a.sort.localeCompare(b.sort))[0];
  const list = nearest ? [nearest] : [];
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
          <a class="button primary" href="${eventUrl(e)}">${e.status === "open" ? "Register" : "View & save my spot"} →</a>
          ${calMenuHtml(e)}
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
    .filter(e => !isPastEvent(e) && (activeEventFilter === "all" || e.category === activeEventFilter))
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
    const items = list.filter(e => e.year === year).map(e => {
      const ext = isExternal(eventUrl(e));
      const linkAttrs = ext ? ' target="_blank" rel="noopener"' : '';
      const linkLabel = e.guest ? "Event details" : (e.status === "open" ? "Register" : "View details");
      return `
      <div class="timeline-item ${e.status === "past" ? "is-past" : ""}${e.guest ? " is-guest" : ""} reveal">
        <div class="timeline-card">
          <div class="timeline-info">
            <span class="tl-cat tl-cat-${e.category}">${EVENT_CAT_LABEL[e.category] || ""}</span>
            ${e.guest ? '<span class="tl-guest">✦ Guest speaker</span>' : ""}
            <span class="tl-title">${e.title}</span>
            <span class="tl-date">${e.date}</span>
            <span class="tl-loc">${e.location}</span>
            <span class="tl-desc">${e.desc}</span>
          </div>
          <div class="tl-action">
            ${e.guest ? '<span class="tl-status status-guest">Guest speaker</span>' : (statusMap[e.status] || "")}
            <a class="tl-link" href="${eventUrl(e)}"${linkAttrs}>${linkLabel} →</a>
            ${calMenuHtml(e, { compact: true })}
          </div>
        </div>
      </div>`;
    }).join("");
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

// One-time gift: single fixed-$100 Stripe link (not pay-what-you-want).
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

/* ---------- DONATION WIDGET (partnership.html) ----------
   Terri-style box: Give once / Monthly toggle + amount presets + custom.
   "Monthly" routes to the fixed monthly link nearest the amount (see
   CONFIG.payments notes on why monthly can't be fully flexible). "Give
   once" routes to a flexible Stripe link where the giver enters their own
   amount, so the amount picker + fee-coverage estimate (which needs a
   known amount) are both hidden on that tab; the button just says "Give
   securely" rather than implying a specific amount is honored. */
const DONATE_AMOUNTS = [25, 50, 75, 100, 250, 500, 750, 1000, 2500];

function initDonateWidget() {
  const box = $("#donateBox");
  if (!box) return;
  const amountsWrap = $("#donateAmounts", box);
  const customLabel = $(".donate-custom", box);
  const customInput = $("#donateCustom", box);
  const onceNote = $("#donateOnceNote", box);
  const onceEmbed = $("#donateOnceEmbed", box);
  const goBtn = $("#donateGo", box);
  const methodsWrap = $("#donateMethods", box);
  const status = $("#donateStatus", box);
  const feeCheck = $("#donateFee", box);
  const feeLabel = feeCheck ? feeCheck.closest(".donate-fee") : null;
  const feeAmtLabel = $("#donateFeeAmt", box);
  const totalLine = $("#donateTotal", box);

  let freq = "monthly";            // matches the default-active toggle
  let amount = 100;                // matches the default-active preset
  let method = "card";             // card | bank

  const feeFor = (base) => base * CONFIG.payments.feePercent + CONFIG.payments.feeFixed;
  const fmt = (n) => n.toLocaleString("en-US");

  amountsWrap.innerHTML = DONATE_AMOUNTS.map(a =>
    `<button type="button" class="donate-amt${a === amount ? " is-active" : ""}" data-amount="${a}">$${fmt(a)}</button>`
  ).join("");

  const paintAmounts = () => $$(".donate-amt", box).forEach(b =>
    b.classList.toggle("is-active", Number(b.dataset.amount) === amount && !customInput.value));

  const refresh = () => {
    const isOnce = freq === "once";
    amountsWrap.hidden = isOnce;
    if (customLabel) customLabel.hidden = isOnce;
    if (onceNote) onceNote.hidden = !isOnce;
    // One-time gifts render as the embedded Stripe Buy Button (handles its
    // own amount entry + payment method choice, ACH included), so the
    // custom Donate button and card/bank toggle only apply to monthly.
    if (onceEmbed) onceEmbed.hidden = !isOnce;
    goBtn.hidden = isOnce;
    if (methodsWrap) methodsWrap.hidden = isOnce;
    // Fee-coverage estimate needs a known amount; one-time gifts are entered
    // on Stripe's own page, so there's nothing accurate to show here.
    if (feeLabel) feeLabel.hidden = isOnce;
    if (totalLine && isOnce) totalLine.hidden = true;

    if (!isOnce) {
      const fee = feeFor(amount);
      if (feeAmtLabel) feeAmtLabel.textContent = `$${fee.toFixed(2)} (fee)`;
      const cover = feeCheck && feeCheck.checked;
      if (totalLine) {
        totalLine.hidden = !cover;
        totalLine.textContent = cover
          ? `With fees covered, your monthly gift is $${(amount + fee).toFixed(2)}.`
          : "";
      }

      // Payment method: "card" and "bank" both route through the SAME
      // Payment Link — ACH Direct Debit is enabled account-wide in Stripe,
      // so it shows automatically on Stripe's checkout page alongside
      // card. This toggle only changes the button copy beforehand.
      goBtn.textContent = method === "bank" ? "Continue to bank transfer" : "Donate monthly";
      goBtn.href = paymentsConfigured() ? monthlyLink(amount) : "#";
    }
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

  // Cover-the-fees toggle
  if (feeCheck) feeCheck.addEventListener("change", refresh);

  // Payment method toggle (card vs bank transfer)
  $$(".donate-method", box).forEach(btn => {
    btn.addEventListener("click", () => {
      method = btn.dataset.method;
      $$(".donate-method", box).forEach(b => b.classList.toggle("is-active", b === btn));
      refresh();
    });
  });

  // Demo mode: don't navigate to a "#" placeholder, explain instead.
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

/* ---------- FORMS (wired to systeme.io) ---------- */
// Every form funnels its contact into the systeme.io CRM via the opt-in
// endpoint above. systeme.io's opt-in only stores contact fields, so first
// name + email are what lands in the CRM; extra fields a form collects
// (newsletter track, booking message, event slug, …) are logged locally for
// now and will need the systeme.io API (server-side) to be stored per-contact.
async function sendToCrm(formId, data) {
  if (!CONFIG.crm.endpoint) {
    // Demo mode: no CRM endpoint configured yet.
    console.log(`[${formId}] submission (demo, no CRM endpoint set)`, data);
    return true;
  }
  const payload = {
    optin: {
      fields: {
        first_name: { value: data.firstName || data.name || "" },
        email: { value: data.email || "" },
      },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      popupId: null,
      isDesktop: !window.matchMedia("(max-width: 900px)").matches,
      surveysResults: [],
      entityId: CONFIG.crm.optinEntityId,
      checkBoxIds: [],
    },
  };
  try {
    // mode "no-cors": systeme.io sends no CORS headers, so the response is
    // opaque, but the submission itself lands. The body stays text/plain so
    // the browser doesn't require a preflight the endpoint won't answer.
    await fetch(CONFIG.crm.endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
    console.log(`[${formId}] contact sent to systeme.io CRM`, { form: formId, ...data });
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

/* ---------- ADD-TO-CALENDAR DROPDOWN (delegated) ---------- */
function closeCalMenus(except) {
  $$(".add-cal-menu:not([hidden])").forEach(m => {
    if (m === except) return;
    m.hidden = true;
    const btn = m.previousElementSibling;
    if (btn) btn.setAttribute("aria-expanded", "false");
  });
}
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-cal-btn");
  if (btn) {
    e.preventDefault();
    const menu = btn.parentElement.querySelector(".add-cal-menu");
    const willOpen = menu.hidden;
    closeCalMenus(willOpen ? menu : null);
    menu.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
    return;
  }
  // A menu choice was clicked, let the download/link happen, then close.
  if (e.target.closest(".add-cal-menu")) { setTimeout(closeCalMenus, 0); return; }
  closeCalMenus();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCalMenus(); });

/* ---------- PARTNER SIGN-UP → STRIPE ----------
   Captures partner contact details (name, email, address, phone) and
   records them to the CRM (systeme.io) BEFORE handing the partner off to
   Stripe for payment. Stripe Payment Links are set and the CRM endpoint is
   wired (see CONFIG.crm — live once the newsletter subdomain's DNS record
   exists). */
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

/* ---------- MULTI-STEP FORM STEPPER ----------
   Progressive enhancement for any <form> whose fields are grouped into
   <fieldset class="form-step"> sections. Adds a progress bar, step dots,
   and Back/Next navigation, validating each step before advancing. Works
   for the event registration form and any future multi-step flow. */
function initStepper(form) {
  if (!form) return;
  const steps = $$(".form-step", form);
  if (steps.length < 2) return;

  let current = 0;

  // Progress bar + step counter, injected at the top of the form.
  const labels = steps.map(s => s.dataset.stepLabel || "");
  const header = document.createElement("div");
  header.className = "stepper-head";
  header.innerHTML = `
    <div class="stepper-bar"><span class="stepper-bar-fill"></span></div>
    <p class="stepper-count" aria-live="polite"></p>`;
  form.prepend(header);
  const fill = $(".stepper-bar-fill", header);
  const count = $(".stepper-count", header);

  // Navigation buttons.
  const nav = document.createElement("div");
  nav.className = "stepper-nav";
  nav.innerHTML = `
    <button type="button" class="button ghost stepper-back">← Back</button>
    <button type="button" class="button primary stepper-next">Continue →</button>`;
  // The form's real submit button is a form-level child, revealed on the last
  // step; the Back/Next nav sits just before it.
  const submitBtn = form.querySelector('[type="submit"]');
  form.insertBefore(nav, submitBtn || null);
  const backBtn = $(".stepper-back", nav);
  const nextBtn = $(".stepper-next", nav);

  const show = (i) => {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach((s, idx) => { s.hidden = idx !== current; });
    const pct = ((current + 1) / steps.length) * 100;
    fill.style.width = pct + "%";
    count.textContent = `Step ${current + 1} of ${steps.length}${labels[current] ? " · " + labels[current] : ""}`;
    backBtn.hidden = current === 0;
    const last = current === steps.length - 1;
    nextBtn.hidden = last;
    if (submitBtn) submitBtn.hidden = !last;
    const firstField = steps[current].querySelector("input, select, textarea");
    if (firstField) firstField.focus({ preventScroll: true });
  };

  const stepValid = () => {
    const fields = $$("input, select, textarea", steps[current]);
    for (const f of fields) {
      if (!f.checkValidity()) { f.reportValidity(); return false; }
    }
    return true;
  };

  nextBtn.addEventListener("click", () => { if (stepValid()) show(current + 1); });
  backBtn.addEventListener("click", () => show(current - 1));
  // Enter advances instead of submitting, except on the final step.
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && current < steps.length - 1 && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      if (stepValid()) show(current + 1);
    }
  });

  show(0);
}

/* ---------- EVENT DETAIL PAGE (event.html?slug=...) ----------
   One template renders any event from the EVENTS data, with full details and
   an on-site multi-step registration form, so registrations live on the site
   instead of external Google Forms. */
function renderEventDetail() {
  const root = $("#eventDetail");
  if (!root) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const e = slug ? findEvent(slug) : null;

  if (!e) {
    root.innerHTML = `
      <section class="page-hero section-shell">
        <p class="eyebrow">Event</p>
        <h1>We couldn't find that event.</h1>
        <p>It may have wrapped up, or the link is out of date.</p>
        <div class="hero-actions" style="justify-content:center">
          <a class="button primary" href="events.html">See all events</a>
        </div>
      </section>`;
    return;
  }

  document.title = `${e.title} | Dear Pastor's Wife`;
  const past = isPastEvent(e);
  const statusLabel = { open: "Registration open", soon: "Save the date", past: "Past event" };
  const cat = EVENT_CAT_LABEL[e.category] || "";
  const closed = past;
  // Guest engagements are hosted elsewhere: no on-site registration, just a
  // link out to the host's own page.
  const external = !closed && (e.guest || isExternal(e.link));

  root.innerHTML = `
    <section class="event-page section-shell page-section">
      <a class="event-back" href="events.html">← All events</a>
      <div class="event-page-grid">
        <div class="event-page-main">
          <span class="tl-cat tl-cat-${e.category}">${cat}</span>
          <h1>${escapeHtml(e.title)}</h1>
          <p class="event-page-meta">
            <span>📅 ${escapeHtml(e.date)}</span>
            <span>📍 ${escapeHtml(e.location)}</span>
            <span class="tl-status status-${closed ? "past" : e.status}">${statusLabel[closed ? "past" : e.status] || ""}</span>
          </p>
          ${!closed ? `<div class="event-cal-row">${calMenuHtml(e)}</div>` : ""}
          <p class="event-page-lead">${escapeHtml(e.desc)}</p>
          ${e.details ? `<h2 class="event-h2">What to expect</h2><p>${escapeHtml(e.details)}</p>` : ""}
          <h2 class="event-h2">Location</h2>
          <p>${escapeHtml(e.venue || e.location)}</p>
          ${e.requirements ? `<h2 class="event-h2">Who it's for & registration</h2><p>${escapeHtml(e.requirements)}</p>` : ""}
        </div>

        <aside class="event-page-side">
          <div class="event-reg-card" id="eventRegCard">
            ${closed ? `
              <h3>This event has ended</h3>
              <p class="give-sub">Thank you to everyone who joined us. Explore what's coming up next.</p>
              <a class="button primary" href="events.html">See upcoming events</a>
            ` : external ? `
              <h3>Guest speaking engagement</h3>
              <p class="give-sub">May is a guest speaker at this event. Registration and full details are handled by the host.</p>
              <a class="button primary" href="${escapeHtml(e.link)}" target="_blank" rel="noopener">Register on the host's site →</a>
              <a class="button ghost" href="events.html">Back to all events</a>
            ` : `
              <h3>${e.status === "open" ? "Register" : "Save my spot"}</h3>
              <p class="give-sub">${e.status === "open" ? "Complete the steps below to register. It only takes a minute." : "Register your interest and we'll send details and confirm your place."}</p>
              <form id="eventRegForm" class="stepper-form" novalidate>
                <fieldset class="form-step" data-step-label="About you">
                  <div class="field-row">
                    <label><span>First name</span><input type="text" name="firstName" required autocomplete="given-name" /></label>
                    <label><span>Last name</span><input type="text" name="lastName" required autocomplete="family-name" /></label>
                  </div>
                  <label><span>Email</span><input type="email" name="email" required autocomplete="email" placeholder="you@example.com" /></label>
                  <label><span>Phone</span><input type="tel" name="phone" required autocomplete="tel" placeholder="(555) 000-0000" /></label>
                </fieldset>
                <fieldset class="form-step" data-step-label="Where you serve" hidden>
                  <label><span>Street address</span><input type="text" name="address" autocomplete="street-address" placeholder="Address (optional)" /></label>
                  <div class="field-row">
                    <label><span>City</span><input type="text" name="city" autocomplete="address-level2" /></label>
                    <label><span>Country</span><input type="text" name="country" autocomplete="country-name" /></label>
                  </div>
                  <label><span>Your ministry / church role</span><input type="text" name="role" placeholder="e.g. Pastor's wife, women's pastor" /></label>
                </fieldset>
                <fieldset class="form-step" data-step-label="Confirm" hidden>
                  <label><span>Anything we should know? (optional)</span><textarea name="notes" rows="3" placeholder="Dietary needs, accessibility, questions…"></textarea></label>
                  <label class="check-row"><input type="checkbox" name="consent" required /> <span>Please keep me updated about this event and DPW resources.</span></label>
                </fieldset>
                <button class="button primary" type="submit" hidden>${e.status === "open" ? "Complete registration" : "Save my spot"}</button>
                <p class="form-status" id="eventRegStatus" role="status" aria-live="polite"></p>
              </form>
            `}
          </div>
        </aside>
      </div>
    </section>`;

  if (closed || external) return;

  const form = $("#eventRegForm");
  initStepper(form);
  const status = $("#eventRegStatus");
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    data.event = e.title;
    data.eventSlug = e.slug;
    if (status) status.textContent = "Sending…";
    const ok = await sendToCrm("eventRegistration", data);
    if (ok) {
      $("#eventRegCard").innerHTML = `
        <h3>You're registered! 🎉</h3>
        <p class="give-sub">Thank you, ${escapeHtml(data.firstName)}. We've saved your details for <strong>${escapeHtml(e.title)}</strong> and will email you at ${escapeHtml(data.email)} with everything you need.</p>
        <a class="button ghost" href="events.html">Back to all events</a>`;
    } else if (status) {
      status.textContent = "Something went wrong. Please email connect@dearpastorswife.org.";
    }
  });
}
renderEventDetail();

/* ---------- COMMUNITY FORUM PREVIEW (community.html) ----------
   Renders the topic-based forum shell from mock data. The composer is
   intentionally disabled ("opens at launch"); topic chips filter the preview
   thread feed so the experience feels real. Wire to a backend by replacing
   COMMUNITY_TOPICS/THREADS with fetched data and enabling the composer. */
function renderCommunity() {
  const app = $("#communityApp");
  if (!app) return;

  let activeTopic = "all";

  app.innerHTML = `
    <div class="community-composer" aria-disabled="true">
      <div class="community-avatar" aria-hidden="true">＋</div>
      <button class="community-composer-fake" type="button" disabled>Start a conversation… <span>(opens at launch)</span></button>
    </div>
    <div class="community-layout">
      <aside class="community-topics" aria-label="Topics">
        <p class="community-aside-title">Topics</p>
        <div class="community-topic-list" id="communityTopics"></div>
      </aside>
      <div class="community-feed" id="communityFeed"></div>
    </div>`;

  const topicsWrap = $("#communityTopics", app);
  const feed = $("#communityFeed", app);
  const topicName = (id) => (COMMUNITY_TOPICS.find(t => t.id === id) || {}).name || "";

  const paintTopics = () => {
    topicsWrap.innerHTML = `
      <button class="community-topic${activeTopic === "all" ? " is-active" : ""}" data-topic="all">
        <span class="ct-icon">✺</span><span class="ct-body"><strong>All conversations</strong><small>Everything, newest first</small></span>
      </button>` +
      COMMUNITY_TOPICS.map(t => `
        <button class="community-topic${activeTopic === t.id ? " is-active" : ""}" data-topic="${t.id}">
          <span class="ct-icon">${t.icon}</span>
          <span class="ct-body"><strong>${escapeHtml(t.name)}</strong><small>${escapeHtml(t.desc)}</small></span>
        </button>`).join("");
  };

  const paintFeed = () => {
    const list = COMMUNITY_THREADS.filter(t => activeTopic === "all" || t.topic === activeTopic);
    feed.innerHTML = list.map(t => `
      <article class="community-thread">
        <div class="community-thread-head">
          <span class="community-thread-avatar" aria-hidden="true">${escapeHtml(t.author.charAt(0))}</span>
          <div>
            <strong>${escapeHtml(t.author)}</strong>
            <span class="community-thread-meta">${escapeHtml(t.role)} · ${escapeHtml(t.ago)} ago</span>
          </div>
          <span class="community-thread-topic">${escapeHtml(topicName(t.topic))}</span>
        </div>
        <h3 class="community-thread-title">${escapeHtml(t.title)}</h3>
        <p class="community-thread-excerpt">${escapeHtml(t.excerpt)}</p>
        <div class="community-thread-foot">
          <span>♥ ${t.likes}</span>
          <button type="button" class="community-thread-open" disabled>Open at launch →</button>
        </div>
      </article>`).join("") ||
      `<p class="resource-empty">No conversations in this topic yet.</p>`;
  };

  topicsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".community-topic");
    if (!btn) return;
    activeTopic = btn.dataset.topic;
    paintTopics();
    paintFeed();
  });

  paintTopics();
  paintFeed();
}
renderCommunity();

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
   systeme.io pipeline as the other forms (see CONFIG.crm).*/
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
  // Exclude the dropdown toggle itself: on mobile its own handler above
  // opens/closes the Events submenu, so closing the whole mobile nav here
  // too would immediately undo that toggle (tapping "Events" looked like
  // it did nothing, or closed the menu instead of revealing the submenu).
  navLinks.querySelectorAll("a:not(.nav-dropdown-toggle)").forEach(link => {
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
   unconditionally as a final guarantee. (reduceMotion and
   revealListenerAttached are declared near the top of the file, see the
   comment there for why.) */

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

/* ---------- "BECAUSE OF YOU" COLLAPSE (mobile) ----------
   On phones the partnership "Because of you" list is long, so we collapse it
   to the first two items behind a Show more toggle. Desktop always shows all
   (the CSS only hides items inside .is-collapsed under the 900px breakpoint). */
function initBecauseCollapse() {
  const wrap = $(".because-wrap");
  if (!wrap) return;
  const items = $$(".because-item", wrap);
  if (items.length <= 2) return;

  items.forEach((item, i) => { if (i >= 2) item.classList.add("is-hidden"); });

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "because-toggle";
  const setLabel = () => {
    const collapsed = wrap.classList.contains("is-collapsed");
    toggle.innerHTML = `${collapsed ? "Show more" : "Show less"} <span class="chev" aria-hidden="true">▾</span>`;
    toggle.setAttribute("aria-expanded", String(!collapsed));
  };
  wrap.classList.add("is-collapsed");
  const closing = $(".because-close", wrap);
  (closing || wrap).insertAdjacentElement(closing ? "beforebegin" : "beforeend", toggle);
  setLabel();
  toggle.addEventListener("click", () => {
    wrap.classList.toggle("is-collapsed");
    items.forEach((item, i) => { if (i >= 2) item.classList.toggle("is-hidden", wrap.classList.contains("is-collapsed")); });
    setLabel();
  });
}

/* ---------- INIT ---------- */
renderResources();
renderFeaturedEvents();
renderEvents();
renderTiers();
animateCounters();
initBecauseCollapse();
updateAnnounceBar();

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
