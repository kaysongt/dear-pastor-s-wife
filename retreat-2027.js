(() => {
  // Registration is at the £300 advance rate until midnight UTC on
  // 1 November 2026; after that, it is by enquiry.
  const advanceEnds = Date.parse('2026-11-01T00:00:00Z');
  const checkout = document.getElementById('retreat27-checkout');
  if (!checkout) return;
  function updateRate() {
    if (Date.now() < advanceEnds) return;
    checkout.href = 'mailto:admin@dearpastorswife.org?subject=Europe%20Retreat%202027%20registration';
    checkout.textContent = 'Enquire about registration →';
    document.getElementById('retreat27-rate-intro').textContent = 'Join us for the Europe Retreat 2027. Contact the DPW team for current registration details.';
    document.getElementById('retreat27-rate-note').textContent = 'The advance registration offer ended on 31 October 2026.';
    document.querySelector('.retreat27-registration .eyebrow').textContent = 'The next gathering';
  }
  updateRate();
  checkout.addEventListener('click', updateRate);
  window.addEventListener('pageshow', updateRate);
  document.addEventListener('visibilitychange', updateRate);
  window.setInterval(updateRate, 30000);
})();
