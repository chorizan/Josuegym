/**
 * Josue Gym — Landing interactions
 * Configurable WhatsApp base URL
 */
const CONFIG = {
  whatsappNumber: '51960929243',
  whatsappDefaultText: 'Hola Josue Gym, quiero información',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initHeader();
  initMobileNav();
  initSmoothNav();
  initRevealOnScroll();
  initCounters();
  initParallax();
  initContactForm();
  initPlanMembershipLinks();
});

function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/** Sticky header state */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 40);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/** Mobile hamburger menu */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !nav || !overlay) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    overlay.hidden = !open;
    overlay.classList.toggle('is-visible', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  overlay.addEventListener('click', () => setOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

/** Smooth scroll + active section + close mobile nav */
function initSmoothNav() {
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = ['nosotros', 'planes', 'membresias', 'contacto']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const closeMobileNav = () => {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    const overlay = document.getElementById('navOverlay');
    if (toggle?.getAttribute('aria-expanded') === 'true') {
      toggle.setAttribute('aria-expanded', 'false');
      nav?.classList.remove('is-open');
      if (overlay) {
        overlay.hidden = true;
        overlay.classList.remove('is-visible');
      }
      document.body.style.overflow = '';
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMobileNav();

      if (prefersReducedMotion) {
        target.scrollIntoView();
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('nav__link--active', active);
          });
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }
}

/** Scroll reveal */
function initRevealOnScroll() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/** Counter animation for pillar */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length || prefersReducedMotion) {
    counters.forEach((c) => {
      c.textContent = c.getAttribute('data-target') || '0';
    });
    return;
  }

  const animateCounter = (el) => {
    const target = Number(el.getAttribute('data-target')) || 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
}

/** Subtle parallax on nosotros shapes */
function initParallax() {
  if (prefersReducedMotion) return;

  const section = document.querySelector('.section--nosotros');
  const shapes = section?.querySelectorAll('.nosotros__orb');
  if (!section || !shapes?.length) return;

  let ticking = false;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) {
      ticking = false;
      return;
    }

    const progress = 1 - rect.top / viewH;
    const offset = (progress - 0.5) * 40;

    shapes.forEach((shape, i) => {
      const factor = i % 2 === 0 ? 1 : -0.65;
      shape.style.transform = `translateY(${offset * factor * 0.5}px)`;
    });

    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update();
}

/** Lightweight form → WhatsApp */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nombre = String(data.get('nombre') || '').trim();
    const interes = String(data.get('interes') || 'general');
    const mensaje = String(data.get('mensaje') || '').trim();

    if (!nombre) {
      const input = form.querySelector('[name="nombre"]');
      input?.focus();
      input?.classList.add('field__input--error');
      return;
    }

    const interesLabels = {
      general: 'Información general',
      'full-body': 'Plan Full Body',
      yoga: 'Plan Yoga',
      training: 'Plan Training',
      membresia: 'Membresía',
    };

    const text = [
      `Hola Josue Gym, soy ${nombre}.`,
      `Interés: ${interesLabels[interes] || interes}.`,
      mensaje ? mensaje : '',
    ]
      .filter(Boolean)
      .join(' ');

    const url = buildWhatsAppUrl(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  form.querySelector('[name="nombre"]')?.addEventListener('input', (e) => {
    e.target.classList.remove('field__input--error');
  });
}

function buildWhatsAppUrl(text) {
  const encoded = encodeURIComponent(text || CONFIG.whatsappDefaultText);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`;
}

/** Pre-fill WhatsApp when clicking plan/membership CTAs */
function initPlanMembershipLinks() {
  document.querySelectorAll('[data-plan], [data-membership]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const plan = link.getAttribute('data-plan');
      const membership = link.getAttribute('data-membership');
      const label = plan ? `plan ${plan}` : `membresía ${membership}`;
      const text = `Hola Josue Gym, me interesa la ${label}.`;

      if (link.getAttribute('href') === '#contacto') {
        e.preventDefault();
        const contacto = document.getElementById('contacto');
        contacto?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        const form = document.getElementById('contactForm');
        const select = form?.querySelector('[name="interes"]');
        if (select && plan) {
          const map = { 'Full Body': 'full-body', Yoga: 'yoga', Training: 'training' };
          select.value = map[plan] || 'general';
        } else if (select && membership) {
          select.value = 'membresia';
        }

        const mensaje = form?.querySelector('[name="mensaje"]');
        if (mensaje && !mensaje.value) {
          mensaje.value = `Quiero información sobre la ${label}.`;
        }
      }
    });
  });

  const btnContactar = document.getElementById('btnContactar');
  if (btnContactar && !btnContactar.href.includes('text=')) {
    btnContactar.href = buildWhatsAppUrl(CONFIG.whatsappDefaultText);
  }
}
