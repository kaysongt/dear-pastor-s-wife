/* ============================================================
   Dear Pastor's Wife — site logic
   Data-driven sections (resources, events, speaking, giving)
   are defined here so they're easy to update and ready to be
   wired to a CMS / CRM later.
   ============================================================ */

/* ---------- DATA ---------- */

// Resource library. type: book | download | video | article. status: current | archived.
const RESOURCES = [
  { type: "book", status: "current", title: "Dear Pastor's Wife (The Book)", desc: "Biblical wisdom and honest encouragement for women in ministry life.", cta: "Get it on Amazon", link: "https://www.amazon.com/Dear-Pastors-Wife-May-Ijisesan-ebook/dp/B09TQ2G8PJ" },
  { type: "video", status: "current", title: "Weekly Encouragement on YouTube", desc: "New teaching, Q&A, and real talk for ministry women every week.", cta: "Watch on YouTube", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "download", status: "current", title: "The Soul-Care Reset (PDF)", desc: "A 7-day guided reset to refill your cup when ministry runs you dry.", cta: "Download free", link: "#newsletter" },
  { type: "download", status: "current", title: "Boundaries for the Fishbowl", desc: "A practical worksheet for protecting your family and identity in ministry.", cta: "Download free", link: "#newsletter" },
  { type: "article", status: "current", title: "When You Feel Invisible in Ministry", desc: "Encouragement for the seasons no one sees — and why they matter.", cta: "Read the article", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "video", status: "current", title: "Leading Without Losing Yourself", desc: "A teaching session on staying rooted while you serve and lead.", cta: "Watch now", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "download", status: "current", title: "Ministry Finances Starter Kit", desc: "Simple tools to steward personal and ministry finances with wisdom.", cta: "Download free", link: "#newsletter" },
  { type: "article", status: "archived", title: "Surviving the Holiday Ministry Rush", desc: "A seasonal guide first shared in 2024 — still full of practical help.", cta: "Read the archive", link: "https://www.youtube.com/@DearPastorsWife" },
  { type: "video", status: "archived", title: "2024 Conference Replay: Thrive", desc: "The full replay of our first leadership conference for ministry women.", cta: "Watch replay", link: "https://www.youtube.com/@DearPastorsWife" },
];

// Event timeline (retreats). status: open | soon | past.
const EVENTS = [
  { year: 2026, date: "June 5–7, 2026", location: "United Kingdom", desc: "A restorative weekend retreat for women in ministry.", status: "soon", link: "#newsletter" },
  { year: 2026, date: "Fall 2026", location: "Lagos, Nigeria", desc: "A restorative retreat for women in ministry.", status: "soon", link: "#newsletter" },
  { year: 2026, date: "Winter 2026", location: "Abuja, Nigeria", desc: "A peaceful space for renewal and connection.", status: "soon", link: "#newsletter" },
  { year: 2027, date: "Spring 2027", location: "North America", desc: "Our first North American retreat — dates being finalized.", status: "soon", link: "#newsletter" },
  { year: 2027, date: "Summer 2027", location: "Ibadan, Nigeria", desc: "A 3-day retreat for rest, reflection, and sisterhood.", status: "soon", link: "#newsletter" },
  { year: 2025, date: "October 2025", location: "London, U.K.", desc: "Our sold-out gathering of 120 ministry women.", status: "past", link: "" },
];

// Global speaking schedule. status: upcoming | past.
const SPEAKING = [
  { date: "Jul 12, 2026", event: "Women in Leadership Summit", place: "Houston, USA", status: "upcoming", link: "#contact" },
  { date: "Aug 23, 2026", event: "Grace Conference (Keynote)", place: "London, UK", status: "upcoming", link: "#contact" },
  { date: "Sep 14, 2026", event: "Ministry Wives Fellowship", place: "Lagos, Nigeria", status: "upcoming", link: "#contact" },
  { date: "Oct 5, 2026", event: "Thrive Online Conference", place: "Virtual", status: "upcoming", link: "#newsletter" },
  { date: "Mar 2026", event: "Sisterhood Brunch (Guest)", place: "Atlanta, USA", status: "past", link: "" },
];

// Giving
const ONE_TIME_AMOUNTS = [25, 50, 100, 250];

// Fundraising Partnership Program — multi-tier structure.
// `min` is the lower bound of each monthly range, used as the default
// amount passed to the donation link.
const TIERS = [
  {
    tier: "Tier 1",
    name: "Friend of the Ministry",
    min: 25,
    monthly: "$25–$50",
    annual: "$300–$600",
    idealFor: "Individual supporters & small donors",
    benefits: [
      "Monthly email impact updates",
      "Quarterly prayer guide for pastors' wives",
      "Early access to select digital resources",
    ],
    featured: false,
  },
  {
    tier: "Tier 2",
    name: "Ministry Partner",
    min: 51,
    monthly: "$51–$99",
    annual: "$600–$1,200",
    idealFor: "Committed individuals, small churches & businesses",
    benefits: [
      "Everything in Friend of the Ministry",
      "Annual digital resource bundle (devotionals, guides & courses)",
      "Invitation to the annual Partner Prayer & Vision Call",
      "Newsletter acknowledgment (optional)",
    ],
    featured: true,
  },
  {
    tier: "Tier 3",
    name: "Impact Partner",
    min: 100,
    monthly: "$100–$249",
    annual: "$1,200–$3,000",
    idealFor: "Churches, ministry organizations & faith-based brands",
    benefits: [
      "Everything in Ministry Partner",
      "Co-branded acknowledgment (logo on our website)",
      "Opportunity to sponsor a DPW resource or initiative",
      "Annual impact report with testimonials & stories",
    ],
    featured: false,
  },
  {
    tier: "Tier 4",
    name: "Legacy Partner",
    min: 250,
    monthly: "$250–$499",
    annual: "$3,000–$6,000",
    idealFor: "Major donors, foundations, large churches & corporate sponsors",
    benefits: [
      "Everything in Impact Partner",
      "Dedicated relationship manager",
      "Custom impact opportunities (retreat & content underwriting)",
      "Private annual vision briefing with leadership",
      "Prominent recognition (optional)",
    ],
    featured: false,
  },
];

// Integration endpoints — replace with live services when ready.
const GIVE_BASE_URL = "https://donate.dearpastorswife.org"; // e.g. Donorbox / Stripe payment page

/* ---------- HELPERS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const TYPE_LABEL = { book: "Book", download: "Download", video: "Video", article: "Article" };

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

  resourceGrid.innerHTML = list.map(r => `
    <article class="resource-card reveal">
      <div class="resource-top">
        <span class="resource-type">${TYPE_LABEL[r.type] || r.type}</span>
        ${r.status === "archived" ? '<span class="resource-archived-tag">Archived</span>' : ""}
      </div>
      <h3>${r.title}</h3>
      <p>${r.desc}</p>
      <a href="${r.link}" ${r.link.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${r.cta} →</a>
    </article>
  `).join("");

  if (resourceEmpty) resourceEmpty.hidden = list.length !== 0;
  observeReveals();
}

$$(".filter-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    $$(".filter-chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeFilter = chip.dataset.filter;
    renderResources();
  });
});
resourceSearch?.addEventListener("input", renderResources);
archiveToggle?.addEventListener("change", renderResources);

/* ---------- EVENT TIMELINE ---------- */
function renderEvents() {
  const tl = $("#eventTimeline");
  if (!tl) return;

  // Upcoming years ascending first, then past years descending.
  const years = [...new Set(EVENTS.map(e => e.year))];
  const upcomingYears = years.filter(y => EVENTS.some(e => e.year === y && e.status !== "past")).sort((a, b) => a - b);
  const pastYears = years.filter(y => !upcomingYears.includes(y)).sort((a, b) => b - a);
  const orderedYears = [...upcomingYears, ...pastYears];

  const statusMap = {
    open: '<span class="tl-status status-open">Registration open</span>',
    soon: '<span class="tl-status status-soon">Coming soon</span>',
    past: '<span class="tl-status status-past">Past event</span>',
  };

  tl.innerHTML = orderedYears.map(year => {
    const items = EVENTS.filter(e => e.year === year).map(e => `
      <div class="timeline-item ${e.status === "past" ? "is-past" : ""} reveal">
        <div class="timeline-card">
          <div class="timeline-info">
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

/* ---------- SPEAKING SCHEDULE ---------- */
function renderSpeaking() {
  const list = $("#speakingList");
  if (!list) return;
  const ordered = [...SPEAKING].sort((a, b) => (a.status === b.status ? 0 : a.status === "upcoming" ? -1 : 1));
  list.innerHTML = ordered.map(s => `
    <div class="speaking-row reveal">
      <span class="sp-date">${s.date}</span>
      <div class="sp-main">
        <strong>${s.event}</strong>
        <span>${s.place}</span>
      </div>
      ${s.status === "upcoming"
        ? `<a class="sp-status sp-upcoming" href="${s.link}">Details →</a>`
        : '<span class="sp-status sp-past">Past</span>'}
    </div>
  `).join("");
  observeReveals();
}

/* ---------- GIVING ---------- */
const amountGrid = $("#amountGrid");
const customAmount = $("#customAmount");
const giveBtn = $("#giveOnceBtn");
let selectedAmount = ONE_TIME_AMOUNTS[2]; // default $100

function buildGiveLink(amount, recurring) {
  const base = giveBtn?.dataset.base || GIVE_BASE_URL;
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
    <article class="tier ${t.featured ? "is-featured" : ""} reveal">
      ${t.featured ? '<span class="tier-badge">Most chosen</span>' : ""}
      <span class="tier-label">${t.tier}</span>
      <h4 class="tier-name">${t.name}</h4>
      <div class="tier-price"><strong>${t.monthly}</strong><span>/month</span></div>
      <p class="tier-annual">or ${t.annual} annually</p>
      <p class="tier-ideal"><span>Ideal for</span>${t.idealFor}</p>
      <ul class="tier-benefits">
        ${t.benefits.map(b => `<li>${b}</li>`).join("")}
      </ul>
      <a class="tier-pick" href="${buildGiveLink(t.min, true)}" target="_blank" rel="noopener">Partner at this level →</a>
    </article>
  `).join("");
  observeReveals();
}

/* ---------- FORMS (integration-ready) ---------- */
function handleForm(formId, statusId, successMsg) {
  const form = $("#" + formId);
  const status = $("#" + statusId);
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = Object.fromEntries(new FormData(form).entries());
    // TODO: POST `data` to your CRM / email service (e.g. Mailchimp, HubSpot, Formspree).
    // The `track` field on the newsletter form segments ministry vs. partner audiences.
    console.log(`[${formId}] submission`, data);

    if (status) status.textContent = successMsg;
    form.reset();
    // Re-check default radio after reset (newsletter)
    const defaultRadio = $('input[name="track"][value="ministry"]', form);
    if (defaultRadio) defaultRadio.checked = true;
  });
}

handleForm("newsletterForm", "newsletterStatus", "You're in! Watch your inbox for a welcome note. 💛");
handleForm("contactForm", "contactStatus", "Thank you — your message is on its way. We'll be in touch soon.");

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
    // Safety net: nothing stays hidden longer than 4s no matter what.
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
renderSpeaking();
renderAmounts();
renderTiers();
animateCounters();

// Mark static sections for reveal
$$(".section-heading, .quote-card, .book-info, .story-copy").forEach(el => el.classList.add("reveal"));

// Staggered, directional reveals
stagger(".track-card", { dir: "zoom", step: 120 });
stagger(".resource-card");
stagger(".timeline-item");
stagger(".speaking-row", { dir: "from-left" });
stagger(".tier", { dir: "from-right" });
stagger(".quote-card", { step: 140 });
stagger(".vision-points li", { dir: "from-right", step: 90 });
stagger(".youtube-features li", { dir: "from-left", step: 80 });

// Interactive hover effects
enhanceCards(".resource-card, .tier, .track-card", { tilt: true });
enhanceCards(".speaking-row", { tilt: false });
magnetic(".hero-actions .button, .nav-give, .give-btn");

observeReveals();

console.log("✨ Dear Pastor's Wife — resource hub loaded");
