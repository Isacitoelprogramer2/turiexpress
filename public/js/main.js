/* ============================================
   Turiexpress — Interacciones y animaciones
   ============================================ */

(function () {
  'use strict';

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 400);
    }
  });

  /* ---------- Navbar scroll ---------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menú móvil ---------- */
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Contadores animados ---------- */
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            if (isNaN(target)) return;
            const duration = 1500;
            const startTime = performance.now();
            const animate = (now) => {
              const progress = Math.min((now - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
              el.textContent = Math.floor(eased * target);
              if (progress < 1) requestAnimationFrame(animate);
              else el.textContent = target;
            };
            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ---------- Smooth anchor scroll (con offset del navbar) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = navbar ? navbar.offsetHeight - 10 : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  /* ---------- Formulario de reserva ---------- */
  const form = document.getElementById('reserveForm');
  const status = document.getElementById('formStatus');

  async function sendReserva(data) {
    try {
      const app = firebase.app();
      const functions = firebase.functions();
      const enviarReserva = functions.httpsCallable('enviarReserva');
      const result = await enviarReserva(data);
      return result.data;
    } catch (err) {
      console.error('Error enviando reserva:', err);
      throw err;
    }
  }

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      // Validación simple con mensajes específicos
      if (!data.name || !String(data.name).trim()) {
        status.textContent = '⚠ Ingresa tu nombre.';
        status.className = 'form-status error';
        return;
      }
      if (!data.email || !String(data.email).trim()) {
        status.textContent = '⚠ Ingresa tu correo electrónico.';
        status.className = 'form-status error';
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email));
      if (!emailOk) {
        status.textContent = '⚠ Ingresa un correo válido.';
        status.className = 'form-status error';
        return;
      }
      if (!data.phone || !String(data.phone).trim()) {
        status.textContent = '⚠ Ingresa tu teléfono.';
        status.className = 'form-status error';
        return;
      }
      if (!data.tour || !String(data.tour).trim()) {
        status.textContent = '⚠ Selecciona un tour.';
        status.className = 'form-status error';
        return;
      }

      status.textContent = '⏳ Enviando tu reserva...';
      status.className = 'form-status';

      try {
        const response = await sendReserva({
          name: data.name,
          email: data.email,
          phone: data.phone,
          tour: data.tour,
        });

        status.textContent = `✅ ${response.message || '¡Reserva enviada! Te contactaremos pronto.'}`;
        status.className = 'form-status success';
        form.reset();
      } catch (err) {
        const message = err?.message || 'No se pudo enviar la reserva. Inténtalo de nuevo.';
        status.textContent = `⚠ ${message}`;
        status.className = 'form-status error';
      }
    });
  }

  /* ---------- Parallax sutil en hero ---------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        if (y < 800) {
          heroBg.style.transform = `translateY(${y * 0.25}px)`;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Lightbox de galería ---------- */
  const lightboxItems = Array.from(
    document.querySelectorAll('.gallery .gallery-item')
  ).filter((item) => item.querySelector('img'));

  if (lightboxItems.length) {
    const slides = lightboxItems.map((item) => {
      const img = item.querySelector('img');
      const cap = item.querySelector('figcaption');
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        caption: (cap && cap.textContent.trim()) || img.getAttribute('alt') || '',
      };
    });

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Visor de imagen');
    overlay.innerHTML = `
      <button class="lightbox-btn lightbox-close" type="button" aria-label="Cerrar (Esc)">✕</button>
      <button class="lightbox-btn lightbox-prev" type="button" aria-label="Anterior (←)">‹</button>
      <button class="lightbox-btn lightbox-next" type="button" aria-label="Siguiente (→)">›</button>
      <span class="lightbox-counter" aria-live="polite"></span>
      <img class="lightbox-image" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    `;
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector('.lightbox-image');
    const capEl = overlay.querySelector('.lightbox-caption');
    const counterEl = overlay.querySelector('.lightbox-counter');
    const btnClose = overlay.querySelector('.lightbox-close');
    const btnPrev = overlay.querySelector('.lightbox-prev');
    const btnNext = overlay.querySelector('.lightbox-next');

    let current = 0;

    const render = () => {
      const slide = slides[current];
      imgEl.src = slide.src;
      imgEl.alt = slide.alt;
      capEl.textContent = slide.caption;
      counterEl.textContent = `${current + 1} / ${slides.length}`;
    };

    const open = (index) => {
      current = index;
      render();
      overlay.classList.add('open');
      document.body.classList.add('lightbox-open');
    };

    const close = () => {
      overlay.classList.remove('open');
      document.body.classList.remove('lightbox-open');
    };

    const next = () => {
      current = (current + 1) % slides.length;
      render();
    };

    const prev = () => {
      current = (current - 1 + slides.length) % slides.length;
      render();
    };

    lightboxItems.forEach((item, i) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        open(i);
      });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  }
})();
