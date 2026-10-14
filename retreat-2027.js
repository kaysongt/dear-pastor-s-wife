(() => {
  // Midnight at the start of 18 October in London (BST). Stripe also enforces
  // this deadline through the product-restricted coupon's redemption expiry.
  const earlyBirdEnds = Date.parse('2026-10-18T00:00:00+01:00');
  const advanceEnds = Date.parse('2026-11-01T00:00:00Z');
  const checkout = document.getElementById('retreat27-checkout');
  if (!checkout) return;
  const baseUrl = 'https://buy.stripe.com/9B6aEXfmo9bz5ce5it6Vq0l';
  function updateRate() {
    const early = Date.now() < earlyBirdEnds;
    if (Date.now() >= advanceEnds) {
      checkout.href = 'mailto:admin@dearpastorswife.org?subject=Europe%20Retreat%202027%20registration';
      checkout.textContent = 'Enquire about registration →';
      document.getElementById('retreat27-rate-intro').textContent = 'Join us for the Europe Retreat 2027. Contact the DPW team for current registration details.';
      document.getElementById('retreat27-rate-note').textContent = 'The advance registration offer ended on 31 October 2026.';
      document.querySelector('.retreat27-registration .eyebrow').textContent = 'The next gathering';
      return;
    }
    checkout.href = baseUrl + (early ? '?prefilled_promo_code=DPWEARLY2027' : '');
    checkout.textContent = early ? 'Register for £250 →' : 'Register for £300 →';
    document.getElementById('retreat27-rate-intro').textContent = early
      ? 'Book at the full early-bird price of £250 through 17 October 2026. Dates, venue, and package details will be announced as plans are confirmed.'
      : 'Advance Registration Rate: £300 from 18 October till 31 October 2026. Dates and venue will be announced.';
    document.getElementById('retreat27-rate-note').textContent = early
      ? 'Early Bird Rate: £250 until Saturday, 17 October 2026. Your early-bird offer is applied automatically at checkout.'
      : 'Early-bird registration has closed. Advance Registration Rate: £300 until 31 October 2026.';
  }
  updateRate();
  checkout.addEventListener('click', updateRate);
  window.addEventListener('pageshow', updateRate);
  document.addEventListener('visibilitychange', updateRate);
  window.setInterval(updateRate, 30000);
})();
