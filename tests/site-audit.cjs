// Run with Node and jsdom available through NODE_PATH. No external requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const errors = [];
function page(file, query = '', failCrm = false, now = null) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, file), 'utf8'), {
    url: `https://dearpastorswife.org/${file}${query}`, runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const w = dom.window;
  if (now) {
    const NativeDate = w.Date;
    w.Date = class extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return new NativeDate(now).getTime(); }
    };
  }
  const events = [], requests = [];
  w.matchMedia = q => ({ matches: q.includes('reduced-motion'), addEventListener() {}, removeEventListener() {} });
  w.IntersectionObserver = class { observe() {} disconnect() {} };
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.gtag = (...args) => events.push(args);
  w.console = { log() {}, error() {}, warn() {} };
  w.fetch = async (url, options) => {
    requests.push({ url, options });
    if (failCrm && options?.method === 'POST') throw new Error('Simulated connection failure');
    return { ok: true, json: async () => [] };
  };
  w.addEventListener('error', e => errors.push(e.error));
  w.eval(source);
  return { dom, w, events, requests };
}
async function main() {
  let pages = 0;
  for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
    const p = page(file);
    assert.ok(p.w.document.querySelector('#siteHeader'), `${file}: header rendered`);
    for (const el of p.w.document.querySelectorAll('a[href],img[src],link[href],script[src]')) {
      const value = el.getAttribute('href') || el.getAttribute('src');
      if (!value || /^(https?:|mailto:|tel:|data:|#)/.test(value)) continue;
      const url = new URL(value, p.w.location.href);
      const local = path.join(root, decodeURIComponent(url.pathname));
      assert.ok(fs.existsSync(local), `${file}: missing local target ${value}`);
    }
    p.dom.window.close(); pages++;
  }
  for (const query of ['', '?session_id=', '?session_id={CHECKOUT_SESSION_ID}', '?session_id=cs_test_example', '?session_id=garbage']) {
    const p = page('retreat-thank-you.html', query);
    assert.equal(p.events.filter(e => ['purchase', 'conversion'].includes(e[1])).length, 0, query);
    assert.ok(p.w.document.querySelector('.thanks-next').hidden);
    p.dom.window.close();
  }
  const purchase = page('retreat-thank-you.html', '?session_id=cs_live_LOCALTESTONLY');
  const ga = purchase.events.find(e => e[1] === 'purchase');
  const ads = purchase.events.find(e => e[1] === 'conversion');
  assert.equal(ga[2].transaction_id, 'cs_live_LOCALTESTONLY');
  assert.equal(ga[2].items[0].item_id, 'dpw-retreat-uk');
  assert.equal(ga[2].value, 300);
  assert.equal(ads[2].send_to, 'AW-18426236503/VWT9CIej3e0cENecqNJE');
  assert.equal(ads[2].transaction_id, ga[2].transaction_id);
  assert.equal(ads[2].currency, 'GBP');
  purchase.dom.window.close();
  for (const [failure, now] of [[false, '2026-09-30T22:59:00Z'], [false, '2026-09-30T23:01:00Z'], [true, '2026-09-11T12:00:00Z']]) {
    const p = page('event.html', '?slug=dpw-retreat-uk', failure, now);
    const form = p.w.document.querySelector('#eventRegForm');
    assert.ok(form);
    form.querySelector('.stepper-next').click();
    assert.equal(form.querySelectorAll('.form-step')[1].hidden, true, 'empty form cannot advance');
    for (const [name, value] of Object.entries({firstName:'Local',lastName:'Test',email:'local@example.test',phone:'0000000000'})) form.elements[name].value = value;
    form.querySelector('.stepper-next').click();
    assert.equal(form.querySelectorAll('.form-step')[1].hidden, false);
    form.querySelector('.stepper-next').click();
    form.elements.consent.checked = true;
    form.dispatchEvent(new p.w.Event('submit', { bubbles:true, cancelable:true }));
    await new Promise(resolve => setImmediate(resolve));
    if (failure) {
      assert.equal(form.querySelector('[type=submit]').disabled, false);
      assert.equal(p.w.document.querySelector('stripe-buy-button'), null);
    } else {
      const embed = p.w.document.querySelector('stripe-buy-button');
      assert.ok(embed);
      const fallback = new URL(p.w.document.querySelector('.reg-pay-alt a').href);
      assert.equal(fallback.searchParams.get('client_reference_id'), embed.getAttribute('client-reference-id'));
      assert.equal(fallback.searchParams.get('prefilled_email'), 'local@example.test');
      const installment = p.w.document.querySelector('a[href*="fZufZha24evT34626h6Vq0i"]');
      const londonToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(now));
      if (londonToday <= '2026-09-30') {
        assert.ok(installment, 'installment checkout offered before deposit deadline');
        const installmentUrl = new URL(installment.href);
        assert.equal(installmentUrl.searchParams.get('prefilled_email'), 'local@example.test');
        assert.equal(installmentUrl.searchParams.get('client_reference_id'), embed.getAttribute('client-reference-id'));
        assert.match(p.w.document.querySelector('.reg-pay').textContent, /remaining £150 is not charged automatically/);
      } else {
        assert.equal(installment, null, 'expired deposit offer hidden');
      }
      assert.equal(p.requests[0].url, 'https://svg.systeme.io/9d871f1f/');
      assert.ok(p.events.some(e => e[1] === 'begin_checkout'));
      assert.equal(p.events.some(e => e[1] === 'purchase'), false);
    }
    p.dom.window.close();
  }
  const redirect = fs.readFileSync(path.join(root, 'europe-retreat/index.html'), 'utf8');
  const redirectScript = [...redirect.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
  let destination;
  vm.runInNewContext(redirectScript, { URL, window:{location:{href:'https://dearpastorswife.org/europe-retreat/?gclid=sample&utm_source=google',search:'?gclid=sample&utm_source=google',hash:'#register',replace:u=>destination=new URL(u)}} });
  assert.equal(destination.searchParams.get('gclid'), 'sample');
  assert.equal(destination.searchParams.get('slug'), 'dpw-retreat-uk');
  assert.equal(destination.hash, '#register');
  assert.deepEqual(errors, []);
  console.log(`PASS: ${pages} pages, internal file targets, registration validation, CRM failure recovery, checkout handoff, purchase guards, analytics payloads, and attribution redirect. No live submissions.`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
