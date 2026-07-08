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
  const dateInput = document.getElementById('date');

  if (dateInput) {
    // Fecha mínima = hoy
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      // Validación simple
      if (!data.name || !data.email || !data.phone || !data.tour || !data.date) {
        status.textContent = '⚠ Por favor completa todos los campos.';
        status.className = 'form-status error';
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      if (!emailOk) {
        status.textContent = '⚠ Ingresa un correo válido.';
        status.className = 'form-status error';
        return;
      }

      status.textContent = '⏳ Enviando tu reserva...';
      status.className = 'form-status';

      // Simulación de envío. Para hacerlo real, conecta con Cloud Functions:
      //   import { getFunctions, httpsCallable } from 'firebase/app';
      //   const sendReserva = httpsCallable(functions, 'sendReserva');
      //   await sendReserva(data);
      setTimeout(() => {
        status.textContent = '✅ ¡Reserva recibida! Te contactaremos por WhatsApp en menos de 24h.';
        status.className = 'form-status success';
        form.reset();

        // Mensaje de WhatsApp precargado
        const tours = {
          rio: 'Paseo por el Río Piura',
          catacaos: 'Tour nocturno en Catacaos',
          gastro: 'Ruta gastronómica',
          glamping: 'Glamping en Sechura',
        };
        const tourName = tours[data.tour] || data.tour;
        const msg = encodeURIComponent(
          `Hola Turiexpress! 👋\n\nQuiero reservar:\n• Tour: ${tourName}\n• Fecha: ${data.date}\n• Nombre: ${data.name}\n• Tel: ${data.phone}\n• Correo: ${data.email}`
        );
        // No abrir automáticamente para no saturar. El usuario lo hace manual si quiere.
        // window.open(`https://wa.me/51999999999?text=${msg}`, '_blank');
      }, 900);
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
