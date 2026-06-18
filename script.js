/* ============================================================
   Dear Pastor's Wife — site logic
   Data-driven sections (resources, events, giving, forum) live
   here so they're easy to update and ready to wire to live
   services (Stripe, systeme.io) later.
   ============================================================ */

/* ---------- CONFIG (fill in when live credentials are ready) ----------
   Everything that needs a real account/key is centralized here so the
   client (or a follow-up dev) can flip the site live without hunting
   through the code.

   PAYMENTS — Stripe:
     • Create a Stripe-hosted donation/checkout page that accepts an
       `amount` query param (e.g. Donorbox, a Payment Link, or a small
       Checkout endpoint). Put its URL in `payments.giveBaseUrl`.
     • Enable BOTH "Card" and "ACH Direct Debit (US bank account)" as
       payment methods in your Stripe Dashboard → Settings → Payment
       methods, so bank transfer shows up at checkout.

   CRM — systeme.io:
     • In systeme.io, create a form and copy its POST/submission endpoint
       (or use the systeme.io API via a serverless function) into
       `crm.endpoint`. When set, form submissions are POSTed there.
     • Leave it empty to keep forms in "demo" mode (logs + success msg).
*/
const CONFIG = {
  payments: {
    // Stripe-hosted page that accepts ?amount= & ?recurring=monthly
    giveBaseUrl: "https://donate.dearpastorswife.org",
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
const EVENTS = [
  { category: "conference", year: 2026, date: "Jul 30 – Aug 2, 2026", sort: "2026-07-30", title: "Summer Blast", location: "United States", desc: "Our summer gathering to open the season — worship, teaching, and connection.", status: "soon", link: "#newsletter" },
  { category: "tea-party", year: 2026, date: "Aug 15, 2026", sort: "2026-08-15", title: "Tea Party — A Day Out", location: "Chicago, USA", desc: "A relaxed day out together: tea, real conversation, and sisterhood.", status: "soon", link: "#newsletter" },
  { category: "conference", year: 2026, date: "September 2026", sort: "2026-09-01", title: "DPW at KingsWord", location: "Nigeria", desc: "Join us in Nigeria with KingsWord. Firm dates are being confirmed.", status: "soon", link: "#newsletter" },
  { category: "retreat", year: 2026, date: "Oct 9 – 11, 2026", sort: "2026-10-09", title: "DPW Retreat", location: "United Kingdom", desc: "A restorative weekend retreat for women in ministry.", status: "soon", link: "#newsletter" },
];

const EVENT_CAT_LABEL = { conference: "Conference", "tea-party": "Tea Party", retreat: "Retreat" };

// Giving
const ONE_TIME_AMOUNTS = [25, 50, 100, 250];

// Fundraising Partnership Program — names + suggested ranges only.
const TIERS = [
  { name: "Friend of the Ministry", min: 25, monthly: "$25–$50", annual: "$300–$600" },
  { name: "Ministry Partner", min: 51, monthly: "$51–$99", annual: "$600–$1,200" },
  { name: "Impact Partner", min: 100, monthly: "$100–$249", annual: "$1,200–$3,000" },
  { name: "Legacy Partner", min: 250, monthly: "$250–$499", annual: "$3,000–$6,000" },
];

// Community forum — seed topics.
const FORUM_TOPICS = [
  { id: "parenting", title: "Parenting in ministry", desc: "Raising kids in the fishbowl — the joys, the hard days, and everything in between." },
  { id: "relationships", title: "Relationship management in ministry", desc: "Marriage, boundaries, friendships, and leading people without losing yourself." },
];

/* ---------- HELPERS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const TYPE_LABEL = { book: "Book", download: "Download", video: "Video", article: "Article" };
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
  renderEvents();
}

// Filter chips inside the Events section
$$(".event-filters .filter-chip").forEach(chip => {
  chip.addEventListener("click", () => setEventFilter(chip.dataset.eventFilter));
});
// Dropdown links in the nav also drive the filter (and anchor-scroll to #events)
$$(".nav-dropdown-menu a[data-event-filter]").forEach(link => {
  link.addEventListener("click", () => setEventFilter(link.dataset.eventFilter));
});

/* ---------- GIVING ---------- */
const amountGrid = $("#amountGrid");
const customAmount = $("#customAmount");
const giveBtn = $("#giveOnceBtn");
let selectedAmount = ONE_TIME_AMOUNTS[2]; // default $100

function buildGiveLink(amount, recurring) {
  const base = giveBtn?.dataset.base || CONFIG.payments.giveBaseUrl;
  const params = new URLSearchParams({ amount: String(amount || 0) });
  if (recurring) params.set("recurring", "monthly");
  return `${base}?${params.toString()}`;
}

function updateGiveBtn() {
  if (giveBtn) giveBtn.href = buildGiveLink(selectedAmount, false);
}

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

function renderTiers() {
  const grid = $("#tierGrid");
  if (!grid) return;
  grid.innerHTML = TIERS.map(t => `
    <article class="tier reveal">
      <h4 class="tier-name">${t.name}</h4>
      <div class="tier-price"><strong>${t.monthly}</strong><span>/month</span></div>
      <p class="tier-annual">or ${t.annual} annually</p>
      <a class="tier-pick" href="${buildGiveLink(t.min, true)}" target="_blank" rel="noopener">Partner at this level →</a>
    </article>
  `).join("");
  observeReveals();
}

/* ---------- FORMS (integration-ready: systeme.io) ---------- */
async function sendToCrm(formId, data) {
  if (!CONFIG.crm.endpoint) {
    // Demo mode — no CRM endpoint configured yet.
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

    if (status) status.textContent = ok ? successMsg : "Something went wrong — please email us directly.";
    if (ok) {
      form.reset();
      const defaultRadio = $('input[name="track"][value="ministry"]', form);
      if (defaultRadio) defaultRadio.checked = true;
    }
  });
}

handleForm("newsletterForm", "newsletterStatus", "You're in! Watch your inbox for a welcome note. 💛");
handleForm("contactForm", "contactStatus", "Thank you — your message is on its way. We'll be in touch soon.");
handleForm("bookingForm", "bookingStatus", "Thank you! Your booking request is in — the team will follow up by email.");

/* ---------- COMMUNITY FORUM (localStorage MVP) ----------
   This is a front-end MVP so the community is functional from day one.
   Threads/replies persist in the visitor's browser. For shared,
   multi-user discussions in production, point these read/write
   functions at a backend (accounts + moderation). */
const FORUM_KEY = "dpwForum";
const FORUM_NAME_KEY = "dpwForumName";
let activeTopic = FORUM_TOPICS[0].id;

function seedForum() {
  const now = Date.now();
  return {
    parenting: [{
      id: uid(), title: "How do you protect your kids' privacy online?",
      body: "Our church loves to post photos of everything. I want to celebrate my kids without putting their whole lives on the internet. How do you handle this with your leadership?",
      author: "May (DPW)", ts: now - 1000 * 60 * 60 * 26, replies: [],
    }],
    relationships: [{
      id: uid(), title: "Boundaries with people who only see 'the pastor's wife'",
      body: "Some days it feels like everyone wants something. How do you stay warm and available without burning out? Looking for honest, practical wisdom.",
      author: "May (DPW)", ts: now - 1000 * 60 * 60 * 50, replies: [],
    }],
  };
}

function loadForum() {
  try {
    const raw = localStorage.getItem(FORUM_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const seeded = seedForum();
  saveForum(seeded);
  return seeded;
}

function saveForum(data) {
  try { localStorage.setItem(FORUM_KEY, JSON.stringify(data)); } catch (_) {}
}

function forumAuthor() {
  const input = $("#forumName");
  const name = (input?.value || "").trim();
  return name || "Anonymous sister";
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function renderForumTopics() {
  const list = $("#forumTopicList");
  if (!list) return;
  list.innerHTML = FORUM_TOPICS.map(t => `
    <button type="button" class="forum-topic ${t.id === activeTopic ? "is-active" : ""}" role="tab" data-topic="${t.id}">
      ${escapeHtml(t.title)}
    </button>
  `).join("");
  $$(".forum-topic", list).forEach(btn => {
    btn.addEventListener("click", () => {
      activeTopic = btn.dataset.topic;
      renderForumTopics();
      renderThreads();
      const form = $("#forumNewForm");
      if (form) form.hidden = true;
    });
  });
  const topic = FORUM_TOPICS.find(t => t.id === activeTopic);
  if (topic) {
    const title = $("#forumTopicTitle");
    const desc = $("#forumTopicDesc");
    if (title) title.textContent = topic.title;
    if (desc) desc.textContent = topic.desc;
  }
}

function renderThreads() {
  const wrap = $("#forumThreads");
  const empty = $("#forumEmpty");
  if (!wrap) return;
  const data = loadForum();
  const threads = (data[activeTopic] || []).slice().sort((a, b) => b.ts - a.ts);

  if (empty) empty.hidden = threads.length !== 0;

  wrap.innerHTML = threads.map(th => `
    <article class="forum-thread" data-thread="${th.id}">
      <div class="forum-thread-head">
        <h4>${escapeHtml(th.title)}</h4>
        <span class="forum-meta">${escapeHtml(th.author)} · ${timeAgo(th.ts)}</span>
      </div>
      <p class="forum-thread-body">${escapeHtml(th.body)}</p>
      <div class="forum-replies">
        ${(th.replies || []).map(r => `
          <div class="forum-reply">
            <p>${escapeHtml(r.body)}</p>
            <span class="forum-meta">${escapeHtml(r.author)} · ${timeAgo(r.ts)}</span>
          </div>
        `).join("")}
      </div>
      <form class="forum-reply-form" data-thread="${th.id}">
        <input type="text" placeholder="Write a reply…" aria-label="Reply" required />
        <button class="button ghost" type="submit">Reply</button>
      </form>
    </article>
  `).join("");

  $$(".forum-reply-form", wrap).forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      const store = loadForum();
      const thread = (store[activeTopic] || []).find(t => t.id === form.dataset.thread);
      if (!thread) return;
      thread.replies = thread.replies || [];
      thread.replies.push({ id: uid(), body: text, author: forumAuthor(), ts: Date.now() });
      saveForum(store);
      renderThreads();
    });
  });

  observeReveals();
}

function initForum() {
  if (!$("#forum")) return;

  // Restore saved display name
  const nameInput = $("#forumName");
  if (nameInput) {
    try { nameInput.value = localStorage.getItem(FORUM_NAME_KEY) || ""; } catch (_) {}
    nameInput.addEventListener("input", () => {
      try { localStorage.setItem(FORUM_NAME_KEY, nameInput.value.trim()); } catch (_) {}
    });
  }

  const newBtn = $("#forumNewBtn");
  const newForm = $("#forumNewForm");
  const cancelBtn = $("#forumCancelBtn");

  newBtn?.addEventListener("click", () => {
    if (newForm) { newForm.hidden = !newForm.hidden; if (!newForm.hidden) $("#forumThreadTitle")?.focus(); }
  });
  cancelBtn?.addEventListener("click", () => { if (newForm) newForm.hidden = true; });

  newForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#forumThreadTitle").value.trim();
    const body = $("#forumThreadBody").value.trim();
    if (!title || !body) return;
    const store = loadForum();
    store[activeTopic] = store[activeTopic] || [];
    store[activeTopic].push({ id: uid(), title, body, author: forumAuthor(), ts: Date.now(), replies: [] });
    saveForum(store);
    newForm.reset();
    newForm.hidden = true;
    renderThreads();
  });

  renderForumTopics();
  renderThreads();
}

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

// Nav dropdown (Events) — click toggle on touch, hover handled by CSS
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

/* ---------- LAZY IMAGES ---------- */
$$("img[src]").forEach(img => { if (!img.loading) img.loading = "lazy"; });

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
renderEvents();
renderAmounts();
renderTiers();
initForum();
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

console.log("✨ Dear Pastor's Wife — resource hub loaded");
