// Mobile Menu Toggle
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? 'Close' : 'Menu';
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'Menu';
    });
  });
}

// Smooth scroll with offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#top') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Scroll-based header shadow
const header = document.querySelector('.site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 50) {
    header.style.boxShadow = '0 8px 30px rgba(60, 37, 30, 0.12)';
  } else {
    header.style.boxShadow = 'none';
  }

  lastScroll = currentScroll;
});

// Parallax effect for hero card
const heroCard = document.querySelector('.hero-card');

if (heroCard) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    if (scrolled < window.innerHeight) {
      heroCard.style.transform = `rotate(2deg) translateY(${rate}px)`;
    }
  });
}

// 3D tilt effect for book cover
const bookCover = document.querySelector('.book-cover');
const bookWrapper = document.querySelector('.book-cover-wrapper');

if (bookCover && bookWrapper) {
  bookWrapper.addEventListener('mousemove', (e) => {
    const rect = bookWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    bookCover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY - 15}deg) translateZ(20px)`;
  });

  bookWrapper.addEventListener('mouseleave', () => {
    bookCover.style.transform = 'rotateY(-15deg) translateZ(0)';
  });
}

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.stats div, .feature-card, .quote-card, .retreat-list article, .gallery img').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Counter animation for stats
const animateCounter = (element, target) => {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + (target === 300 ? '+' : '');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + (target === 300 ? '+' : '');
    }
  }, 30);
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const strong = entry.target.querySelector('strong');
      const text = strong.textContent;
      if (text.includes('+')) {
        const num = parseInt(text);
        strong.textContent = '0+';
        setTimeout(() => animateCounter(strong, num), 200);
      }
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stats div').forEach(stat => {
  statsObserver.observe(stat);
});

// Enhanced hover effects for buttons
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('mouseenter', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

// Floating animation for the hero card note
const floatingNote = document.querySelector('.floating-note');
if (floatingNote) {
  let floatY = 0;
  let direction = 1;

  setInterval(() => {
    floatY += 0.5 * direction;
    if (floatY > 10 || floatY < -10) direction *= -1;
    floatingNote.style.transform = `translateY(${floatY}px)`;
  }, 50);
}

// Lazy loading for images
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[src]');
  images.forEach(img => {
    img.loading = 'lazy';
  });
}

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinksAll.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'var(--wine)';
    }
  });
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debounce to scroll-heavy functions
const debouncedScroll = debounce(() => {
  // Any heavy scroll operations can go here
}, 10);

window.addEventListener('scroll', debouncedScroll);

console.log('✨ Dear Pastor\'s Wife - Website loaded successfully');
