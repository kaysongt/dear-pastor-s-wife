(() => {
  // Midnight at the start of 18 October in London (BST). Stripe also enforces
  // this deadline through the product-restricted coupon's redemption expiry.
  const earlyBirdEnds = Date.parse('2026-10-18T00:00:00+01:00');
  const checkout = document.getElementById('retreat27-checkout');
  if (!checkout) return;
  const baseUrl = 'https://buy.stripe.com/9B6aEXfmo9bz5ce5it6Vq0l';
  function updateRate() {
    const early = Date.now() < earlyBirdEnds;
    checkout.href = baseUrl + (early ? '?prefilled_promo_code=DPWEARLY2027' : '');
    checkout.textContent = early ? 'Register for £250 →' : 'Register for £300 →';
    document.getElementById('retreat27-rate-intro').textContent = early
      ? 'Book at the full early-bird price of £250 through 17 October 2026. Dates, venue, and package details will be announced as plans are confirmed.'
      : 'Register at the £300 interim rate. Dates, venue, and package details will be announced as plans are confirmed.';
    document.getElementById('retreat27-rate-note').textContent = early
      ? 'Your early-bird offer is applied automatically at checkout. Check that the total is £250 before paying. This is the full early-bird price, not a deposit. Offer ends at midnight UK time going into 18 October.'
      : 'Early-bird registration has closed. The £300 interim rate is available until the next pricing review; no fixed closing date has been announced.';
  }
  updateRate();
  checkout.addEventListener('click', updateRate);
  window.addEventListener('pageshow', updateRate);
  document.addEventListener('visibilitychange', updateRate);
  window.setInterval(updateRate, 30000);
})();
