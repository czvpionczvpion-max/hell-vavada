(function () {
  'use strict';

  let lang = localStorage.getItem('lang') || 'en';
  let copiedLink = false;
  let copiedPromo = false;
  let copyLinkTimeout = null;
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
          <div class="strip-value${i === 0 ? ' accent' : ''}">${stat.value}</div>
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
        <div class="promo-detail reveal${item.value === CONFIG.partner.promoCode ? ' promo-detail-highlight' : ''}" style="transition-delay: ${i * 60}ms">
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
          <span class="benefit-icon" aria-hidden="true">${benefit.icon}</span>
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
      timeline.innerHTML =
        stepsHtml +
        `<div class="tstep reveal"><span class="tstep-n">!</span><p style="color: var(--accent-2)">${tr.promoCodeNote}</p></div>`;
    }

    updateCopyButtons();
    initScrollReveal();
  }

  function updateCopyButtons() {
    const tr = t();
    document.querySelectorAll('[data-copy-link]').forEach((btn) => {
      const key = btn.getAttribute('data-i18n');
      const label = key && tr[key] ? tr[key] : tr.copyCode;
      btn.textContent = copiedLink ? tr.copiedCode : label;
    });
    document.querySelectorAll('[data-copy-promo]').forEach((btn) => {
      const key = btn.getAttribute('data-i18n');
      const label = key && tr[key] ? tr[key] : tr.copyPromo;
      btn.textContent = copiedPromo ? tr.copiedPromo : label;
    });
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(CONFIG.partner.siteUrl);
      copiedLink = true;
      updateCopyButtons();
      clearTimeout(copyLinkTimeout);
      copyLinkTimeout = setTimeout(() => {
        copiedLink = false;
        updateCopyButtons();
      }, 1600);
    } catch {
      /* noop */
    }
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
    const els = Array.from(document.querySelectorAll('.reveal'));
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
    document.querySelectorAll('[data-ref-url]').forEach((el) => {
      el.textContent = CONFIG.partner.siteUrl;
    });
    document.querySelectorAll('[data-partner-link]').forEach((el) => {
      el.href = CONFIG.partner.siteUrl;
    });
    document.querySelectorAll('[data-promo-code]').forEach((el) => {
      el.textContent = CONFIG.partner.promoCode;
    });

    const partnerLogo = document.getElementById('partner-logo');
    if (partnerLogo) {
      partnerLogo.src = CONFIG.partner.logoPath;
      partnerLogo.alt = CONFIG.partner.name;
    }

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

  function bindEvents() {
    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
    document.querySelectorAll('[data-copy-link]').forEach((btn) => {
      btn.addEventListener('click', handleCopyLink);
    });
    document.querySelectorAll('[data-copy-promo]').forEach((btn) => {
      btn.addEventListener('click', handleCopyPromo);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    setLang(lang);
  });
})();
