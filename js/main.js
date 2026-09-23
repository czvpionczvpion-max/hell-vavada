(function () {
  'use strict';

  if (localStorage.getItem('langDefault') !== 'pl') {
    localStorage.setItem('lang', 'pl');
    localStorage.setItem('langDefault', 'pl');
  }
  let lang = localStorage.getItem('lang') === 'en' ? 'en' : 'pl';
  let copiedPromo = false;
  let copyPromoTimeout = null;

  function t() {
    return translations[lang];
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem('lang', next);
    document.documentElement.lang = next;
    render();
    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function renderText() {
    const tr = t();
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (tr[key] != null) el.textContent = tr[key];
    });

    const pills = document.getElementById('hero-pills');
    if (pills) {
      pills.innerHTML = tr.quickPills.map((pill) => `<span class="pill">${pill}</span>`).join('');
    }

    const statsStrip = document.getElementById('stats-strip');
    if (statsStrip) {
      statsStrip.innerHTML = tr.stats
        .map(
          (stat, i) => `
        <div class="strip-cell reveal" style="transition-delay: ${i * 80}ms">
          <div class="strip-label">${stat.label}</div>
          <div class="strip-value${/FS|%/.test(stat.value) ? ' accent' : ''}">${stat.value}</div>
        </div>
      `,
        )
        .join('');
    }

    const promoDetails = document.getElementById('promo-details');
    if (promoDetails) {
      promoDetails.innerHTML = tr.promoDetails
        .map(
          (item, i) => `
        <div class="promo-detail reveal${item.value === CONFIG.partner.promoCode || /FS|%/.test(item.value) ? ' promo-detail-highlight' : ''}" style="transition-delay: ${i * 60}ms">
          <div class="promo-detail-label">${item.label}</div>
          <div class="promo-detail-value">${item.value}</div>
        </div>
      `,
        )
        .join('');
    }

    const benefitsGrid = document.getElementById('benefits-grid');
    if (benefitsGrid) {
      benefitsGrid.innerHTML = tr.benefits
        .map(
          (benefit, i) => `
        <div class="benefit-card reveal" style="transition-delay: ${i * 70}ms">
          <span class="benefit-icon" aria-hidden="true"></span>
          <h3 class="benefit-title">${benefit.title}</h3>
          <p class="benefit-text">${benefit.text}</p>
        </div>
      `,
        )
        .join('');
    }

    const timeline = document.getElementById('steps-timeline');
    if (timeline) {
      const stepsHtml = tr.steps
        .map(
          (step, i) => `
        <div class="tstep reveal" style="transition-delay: ${i * 90}ms">
          <span class="tstep-n">${i + 1}</span>
          <p>${step}</p>
        </div>
      `,
        )
        .join('');
      timeline.innerHTML = stepsHtml;
    }

    updateCopyButtons();
    initScrollReveal();
  }

  function updateCopyButtons() {
    const tr = t();
    document.querySelectorAll('[data-copy-promo]').forEach((btn) => {
      const key = btn.getAttribute('data-i18n');
      const label = key && tr[key] ? tr[key] : tr.copyPromo;
      btn.textContent = copiedPromo ? tr.copiedPromo : label;
    });
    document.querySelectorAll('.promo-code-box').forEach((box) => {
      box.classList.toggle('is-copied', copiedPromo);
    });
  }

  async function handleCopyPromo() {
    try {
      await navigator.clipboard.writeText(CONFIG.partner.promoCode);
      copiedPromo = true;
      updateCopyButtons();
      clearTimeout(copyPromoTimeout);
      copyPromoTimeout = setTimeout(() => {
        copiedPromo = false;
        updateCopyButtons();
      }, 1600);
    } catch {
      /* noop */
    }
  }

  function initScrollReveal() {
    const els = Array.from(document.querySelectorAll('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
  }

  function applyConfig() {
    document.querySelectorAll('[data-brand]').forEach((el) => {
      el.textContent = CONFIG.brand;
    });
    document.querySelectorAll('[data-partner-name]').forEach((el) => {
      el.textContent = CONFIG.partner.name;
    });
    document.querySelectorAll('[data-partner-link]').forEach((el) => {
      el.href = CONFIG.partner.siteUrl;
    });
    document.querySelectorAll('[data-promo-code]').forEach((el) => {
      el.textContent = CONFIG.partner.promoCode;
    });

    document.querySelectorAll('[data-partner-logo]').forEach((el) => {
      el.src = CONFIG.partner.logoPath;
      el.alt = CONFIG.partner.name;
    });

    const heroPhoto = document.getElementById('hero-photo');
    if (heroPhoto) {
      heroPhoto.src = CONFIG.photoPath;
      heroPhoto.alt = CONFIG.brand;
    }

    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function render() {
    applyConfig();
    renderText();
  }

  function bindStage() {
    const stage = document.querySelector('.hero-stage');
    if (!stage || !window.matchMedia('(pointer:fine)').matches) return;
    stage.addEventListener('mousemove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      stage.style.setProperty('--px', `${(x * 18).toFixed(1)}px`);
      stage.style.setProperty('--py', `${(y * 12).toFixed(1)}px`);
    });
    stage.addEventListener('mouseleave', () => {
      stage.style.setProperty('--px', '0px');
      stage.style.setProperty('--py', '0px');
    });
  }

  function initFire() {
    const canvas = document.getElementById('fire-field');
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sparks = [];
    const count = Math.max(28, Math.min(52, Math.floor(window.innerWidth / 28)));

    function makeSpark(fromBottom) {
      const hot = Math.random();
      return {
        x: Math.random() * window.innerWidth,
        y: fromBottom ? window.innerHeight + Math.random() * 40 : Math.random() * window.innerHeight,
        r: hot > 0.88 ? 1.8 + Math.random() * 1.2 : 0.6 + Math.random() * 0.9,
        vy: 0.22 + Math.random() * 0.55,
        vx: (Math.random() - 0.5) * 0.4,
        life: 0.35 + Math.random() * 0.65,
        wobble: Math.random() * Math.PI * 2,
        color: hot > 0.9 ? '255,248,230' : hot > 0.45 ? '255,166,54' : '255,72,24',
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    for (let i = 0; i < count; i += 1) sparks.push(makeSpark(false));
    resize();
    window.addEventListener('resize', resize);

    function frame() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      sparks.forEach((spark) => {
        spark.wobble += 0.03;
        spark.x += Math.sin(spark.wobble) * 0.45 + spark.vx;
        spark.y -= spark.vy;
        spark.life -= 0.003;
        if (spark.y < -12 || spark.life <= 0) Object.assign(spark, makeSpark(true));
        const alpha = Math.max(0, Math.min(1, spark.life));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${spark.color},${alpha})`;
        ctx.arc(spark.x, spark.y, spark.r, 0, Math.PI * 2);
        ctx.fill();
        if (spark.r > 1.6) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,252,244,${alpha})`;
          ctx.arc(spark.x, spark.y, spark.r * 0.38, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function bindEvents() {
    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    document.querySelectorAll('[data-copy-promo]').forEach((btn) => {
      btn.addEventListener('click', handleCopyPromo);
    });
    bindStage();
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initFire();
    setLang(lang);
  });
})();
