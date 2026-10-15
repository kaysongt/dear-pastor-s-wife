(() => {
  const gallery = document.getElementById('retreat-gallery');
  if (!gallery) return;
  const controls = document.querySelectorAll('[data-gallery-step]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function updateControls() {
    controls.forEach(button => {
      const previous = Number(button.dataset.galleryStep) < 0;
      button.disabled = previous ? gallery.scrollLeft <= 1 : gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
    });
  }
  controls.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      gallery.scrollBy({left: Number(button.dataset.galleryStep) * gallery.clientWidth * .85, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    });
  });
  gallery.addEventListener('scroll', updateControls, {passive: true});
  window.addEventListener('resize', updateControls);
  updateControls();
})();
