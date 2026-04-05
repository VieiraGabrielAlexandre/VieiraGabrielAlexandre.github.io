
// === Carousel + Minor Bug Fixes (drop-in) ===
// This script expects the original HTML structure in index.html and can replace script.js entirely.

document.addEventListener('DOMContentLoaded', function () {
  // ---------- Helpers
  const addSwipeHandlers = (root, onLeft, onRight) => {
    let x0 = null, y0 = null, locked = false;
    const unify = e => e.changedTouches ? e.changedTouches[0] : e;
    root.addEventListener('touchstart', e => {
      const t = unify(e);
      x0 = t.clientX; y0 = t.clientY; locked = false;
    }, { passive: true });
    root.addEventListener('touchmove', e => {
      if (x0 === null || y0 === null || locked) return;
      const t = unify(e), dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dy) > Math.abs(dx)) { locked = true; return; } // vertical scroll wins
      if (Math.abs(dx) > 30) {
        dx < 0 ? onLeft() : onRight();
        x0 = y0 = null;
        locked = true;
      }
    }, { passive: true });
    root.addEventListener('touchend', () => { x0 = y0 = null; locked = false; });
  };

  // ---------- Features Carousel (header banners)
  (function initFeaturesCarousel() {
    const carousel = document.querySelector('.features-carousel');
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll('.features-slide'));
    const indicators = Array.from(carousel.querySelectorAll('.features-indicator'));
    const prevBtn = carousel.querySelector('.features-control.prev');
    const nextBtn = carousel.querySelector('.features-control.next');

    let i = 0, timer;

    const show = (idx) => {
      i = (idx + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('active', k === i));
      indicators.forEach((d, k) => d.classList.toggle('active', k === i));
    };

    const next = () => show(i + 1);
    const prev = () => show(i - 1);

    const start = () => { stop(); timer = setInterval(next, 5000); };
    const stop  = () => { if (timer) clearInterval(timer); };

    prevBtn?.addEventListener('click', e => { e.preventDefault(); prev(); stop(); start(); });
    nextBtn?.addEventListener('click', e => { e.preventDefault(); next(); stop(); start(); });
    indicators.forEach((dot, k) => dot.addEventListener('click', e => { e.preventDefault(); show(k); stop(); start(); }));

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    addSwipeHandlers(carousel, next, prev);

    show(0); start();
  })();

  // ---------- Entertainment Carousel
  (function initEntertainmentCarousel() {
    const carousel = document.querySelector('.entertainment-carousel');
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll('.entertainment-slide'));
    const prevBtn = carousel.querySelector('.entertainment-control.prev');
    const nextBtn = carousel.querySelector('.entertainment-control.next');

    let i = 0, timer;

    const show = (idx) => {
      i = (idx + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('active', k === i));
    };

    const next = () => show(i + 1);
    const prev = () => show(i - 1);
    const start = () => { stop(); timer = setInterval(next, 4000); };
    const stop  = () => { if (timer) clearInterval(timer); };

    prevBtn?.addEventListener('click', e => { e.preventDefault(); prev(); stop(); start(); });
    nextBtn?.addEventListener('click', e => { e.preventDefault(); next(); stop(); start(); });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    addSwipeHandlers(carousel, next, prev);

    show(0); start();
  })();

  // ---------- Mobile menu toggle (unchanged behavior; more robust guards)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuBtn && mobileMenu) {
    const menuIcon = mobileMenuBtn.querySelector('i');
    const toggleMenu = () => {
      mobileMenu.classList.toggle('active');
      if (menuIcon) menuIcon.className = mobileMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    };
    mobileMenuBtn.addEventListener('click', e => { e.preventDefault(); toggleMenu(); });
    mobileMenuBtn.addEventListener('touchstart', e => { e.preventDefault(); toggleMenu(); }, { passive: false });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        if (menuIcon) menuIcon.className = 'fas fa-bars';
      });
    });
  }

  // ---------- Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---------- Header on scroll
  window.addEventListener('scroll', function () {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    if (window.scrollY > 100) {
      nav.style.background = 'rgba(37, 99, 235, 0.95)';
      nav.style.backdropFilter = 'blur(10px)';
    } else {
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
    }
  });

  // ---------- Intersection animations (fixed buggy references)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.classList.contains('plan-card')) {
        el.classList.add('animated');
      } else if (el.classList.contains('animate-fade-up') ||
                 el.classList.contains('animate-fade-left') ||
                 el.classList.contains('animate-fade-right') ||
                 el.classList.contains('animate-scale')) {
        el.classList.add('animate-start');
      } else {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.advantage-card, .value-card, .plan-card, .section-title').forEach((el, idx) => {
    if (el.classList.contains('advantage-card') || el.classList.contains('value-card')) {
      el.classList.add('animate-scale');
      el.classList.add(['delay-100', 'delay-200', 'delay-300'][idx % 3]);
    }
    observer.observe(el);
  });

  // ---------- Parallax header background
  window.addEventListener('scroll', function () {
    const headerBg = document.querySelector('.header-bg');
    if (headerBg) headerBg.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
  });

  // ---------- Plan speed counters (simple + robust)
  const planSpeeds = document.querySelectorAll('.plan-speed');
  const plansSection = document.querySelector('.plans');
  if (plansSection && planSpeeds.length) {
    const speedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        planSpeeds.forEach(el => {
          const target = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
          let val = 0;
          const step = Math.max(1, Math.ceil(target / 60));
          const tick = () => {
            val = Math.min(target, val + step);
            el.textContent = String(val);
            if (val < target) requestAnimationFrame(tick);
          };
          tick();
        });
        speedObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    speedObserver.observe(plansSection);
  }

  // ---------- CEP Consultation (from original file)
  if (typeof initCepConsultation === 'function') {
    initCepConsultation();
  }
});
