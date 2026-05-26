const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const filterButtons = document.querySelectorAll('.filter-chip');
const resourceCards = document.querySelectorAll('.resource-card[data-topic]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';

    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    resourceCards.forEach((card) => {
      const shouldShow = filter === 'all' || card.dataset.topic === filter;
      card.classList.toggle('hidden', !shouldShow);
    });
  });
});
