/* ═══════════════════════════════════════
   VentiStudio Gold Dashboard — Script
   ═══════════════════════════════════════ */

(function () {
  'use strict';

  // ── Protection d'accès ──
  const gate = document.getElementById('access-gate');
  if (sessionStorage.getItem('gold-access') !== 'true') {
    if (gate) gate.style.display = 'flex';
    return;
  }
  if (gate) gate.remove();

  // ── Particules dorées (Canvas) ──
  const canvas = document.getElementById('gold-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 50;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        opacity: Math.random() * 0.6 + 0.2
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
        ctx.fill();
      }
    }

    function updateParticles() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) {
          Object.assign(p, createParticle());
          p.y = canvas.height + 5;
        }
      }
    }

    let animId;
    function animate() {
      updateParticles();
      drawParticles();
      animId = requestAnimationFrame(animate);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(animate);
      }
    });

    window.addEventListener('resize', resize);

    resize();
    initParticles();
    animate();
  }

  // ── CountUp Animation ──
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCount(el, target);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => countObserver.observe(el));
  }

  function animateCount(el, target) {
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ── Filtrage par catégorie ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('gold-search');
  const contentGrid = document.getElementById('content-grid');
  let currentFilter = 'all';
  let searchTerm = '';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      renderContent();
    });
  });

  // ── Recherche live (debounce) ──
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderContent();
      }, 250);
    });
  }

  // ── Rendu du contenu ──
  function renderContent() {
    if (!contentGrid) return;

    let items = goldContent;

    if (currentFilter !== 'all') {
      items = items.filter(item => item.category === currentFilter);
    }

    if (searchTerm) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(t => t.toLowerCase().includes(searchTerm))
      );
    }

    if (items.length === 0) {
      contentGrid.innerHTML = `
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          Aucun contenu trouvé pour cette recherche.
        </div>
      `;
      return;
    }

    contentGrid.innerHTML = items.map(item => {
      const isNew = isRecent(item.date, 7);
      const escapedTitle = escapeHtml(item.title);
      const escapedDesc = escapeHtml(item.description);
      const tagsHtml = item.tags.map(t => `<span class="card-tag">${escapeHtml(t)}</span>`).join('');

      return `
        <article class="content-card" data-category="${item.category}">
          <div class="card-header">
            <span class="card-icon" aria-hidden="true">${item.icon}</span>
            ${isNew ? '<span class="new-badge">Nouveau</span>' : ''}
          </div>
          <h3>${escapedTitle}</h3>
          <p class="card-desc">${escapedDesc}</p>
          <div class="card-meta">${tagsHtml}</div>
          <div class="card-footer">
            <span class="card-info">v${escapeHtml(item.version)} · ${escapeHtml(item.size)}</span>
            <a href="${encodeURI(item.downloadUrl)}" class="btn-download" aria-label="Télécharger ${escapedTitle}">
              ⬇ Télécharger
            </a>
          </div>
        </article>
      `;
    }).join('');

    observeCards();
  }

  // ── IntersectionObserver pour fadeInUp ──
  function observeCards() {
    const cards = contentGrid.querySelectorAll('.content-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
  }

  // ── Changelog ──
  const timelineContainer = document.getElementById('timeline');
  if (timelineContainer && typeof goldChangelog !== 'undefined') {
    timelineContainer.innerHTML = goldChangelog.map(entry => `
      <div class="timeline-item">
        <span class="tl-date">${formatDate(entry.date)}</span>
        <h4 class="tl-title">${escapeHtml(entry.title)}</h4>
        <p class="tl-desc">${escapeHtml(entry.description)}</p>
      </div>
    `).join('');

    const tlItems = timelineContainer.querySelectorAll('.timeline-item');
    const tlObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 100);
          tlObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    tlItems.forEach(item => tlObserver.observe(item));
  }

  // ── Smooth scroll navigation ──
  document.querySelectorAll('.gold-nav .nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Helpers ──
  function isRecent(dateStr, days) {
    const itemDate = new Date(dateStr);
    const now = new Date();
    const diff = (now - itemDate) / (1000 * 60 * 60 * 24);
    return diff <= days;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Init ──
  renderContent();

  // ═══════════════════════════════════════
  //  GOLD TOOLBOX — Outils interactifs
  // ═══════════════════════════════════════

  // ── 1. Encodeur / Décodeur ──
  (function initEncoder() {
    const mode = document.getElementById('enc-mode');
    const input = document.getElementById('enc-input');
    const output = document.getElementById('enc-output');
    const btnEncode = document.getElementById('enc-encode');
    const btnDecode = document.getElementById('enc-decode');
    const btnCopy = document.getElementById('enc-copy');
    if (!mode || !input || !output) return;

    const codecs = {
      base64: {
        encode: (t) => btoa(unescape(encodeURIComponent(t))),
        decode: (t) => decodeURIComponent(escape(atob(t)))
      },
      rot13: {
        encode: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13))),
        decode: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)))
      },
      hex: {
        encode: (t) => Array.from(new TextEncoder().encode(t)).map(b => b.toString(16).padStart(2, '0')).join(' '),
        decode: (t) => new TextDecoder().decode(new Uint8Array(t.trim().split(/\s+/).map(h => parseInt(h, 16))))
      },
      binary: {
        encode: (t) => Array.from(new TextEncoder().encode(t)).map(b => b.toString(2).padStart(8, '0')).join(' '),
        decode: (t) => new TextDecoder().decode(new Uint8Array(t.trim().split(/\s+/).map(b => parseInt(b, 2))))
      }
    };

    btnEncode.addEventListener('click', () => {
      try { output.value = codecs[mode.value].encode(input.value); }
      catch { output.value = '⚠ Erreur d\'encodage'; }
    });
    btnDecode.addEventListener('click', () => {
      try { output.value = codecs[mode.value].decode(input.value); }
      catch { output.value = '⚠ Erreur de décodage'; }
    });
    btnCopy.addEventListener('click', () => copyText(output.value, btnCopy));
  })();

  // ── 2. Générateur de mots de passe ──
  (function initPwdGen() {
    const lenRange = document.getElementById('pwd-length');
    const lenVal = document.getElementById('pwd-len-val');
    const result = document.getElementById('pwd-result');
    const btnGen = document.getElementById('pwd-generate');
    const btnCopy = document.getElementById('pwd-copy');
    const strengthBar = document.getElementById('pwd-strength');
    if (!lenRange || !result || !btnGen) return;

    const charSets = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      digits: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    lenRange.addEventListener('input', () => { lenVal.textContent = lenRange.value; });

    btnGen.addEventListener('click', () => {
      let pool = '';
      if (document.getElementById('pwd-upper').checked) pool += charSets.upper;
      if (document.getElementById('pwd-lower').checked) pool += charSets.lower;
      if (document.getElementById('pwd-digits').checked) pool += charSets.digits;
      if (document.getElementById('pwd-symbols').checked) pool += charSets.symbols;
      if (!pool) { result.textContent = '⚠ Cochez au moins une option'; return; }

      const len = parseInt(lenRange.value, 10);
      const arr = new Uint32Array(len);
      crypto.getRandomValues(arr);
      const pwd = Array.from(arr, v => pool[v % pool.length]).join('');
      result.textContent = pwd;

      // Strength indicator
      let score = 0;
      if (len >= 12) score++;
      if (len >= 20) score++;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
      if (/\d/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      strengthBar.className = 'pwd-strength ' +
        (score <= 1 ? 'weak' : score <= 2 ? 'medium' : score <= 3 ? 'strong' : 'very-strong');
    });

    btnCopy.addEventListener('click', () => copyText(result.textContent, btnCopy));
  })();

  // ── 3. Compteur de texte ──
  (function initWordCount() {
    const input = document.getElementById('count-input');
    const chars = document.getElementById('count-chars');
    const words = document.getElementById('count-words');
    const sentences = document.getElementById('count-sentences');
    const reading = document.getElementById('count-reading');
    if (!input) return;

    input.addEventListener('input', () => {
      const text = input.value;
      chars.textContent = text.length;
      const w = text.trim() ? text.trim().split(/\s+/).length : 0;
      words.textContent = w;
      sentences.textContent = text.trim() ? (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0) : 0;
      const sec = Math.ceil(w / 3.5); // ~200 mots/min
      reading.textContent = sec >= 60 ? Math.floor(sec / 60) + 'm' + (sec % 60 ? (sec % 60) + 's' : '') : sec + 's';
    });
  })();

  // ── 4. Convertisseur de couleurs ──
  (function initColorConvert() {
    const preview = document.getElementById('color-preview');
    const hexInput = document.getElementById('color-hex');
    const rgbInput = document.getElementById('color-rgb');
    const hslInput = document.getElementById('color-hsl');
    const picker = document.getElementById('color-picker');
    if (!preview || !hexInput) return;

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }

    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function updateFromHex(hex) {
      if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
      preview.style.background = hex;
      picker.value = hex;
      const [r, g, b] = hexToRgb(hex);
      rgbInput.value = `rgb(${r}, ${g}, ${b})`;
      const [h, s, l] = rgbToHsl(r, g, b);
      hslInput.value = `hsl(${h}, ${s}%, ${l}%)`;
    }

    hexInput.addEventListener('input', () => {
      let v = hexInput.value;
      if (v.length === 4 && v[0] === '#') v = '#' + v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
      updateFromHex(v);
    });

    picker.addEventListener('input', () => {
      hexInput.value = picker.value;
      updateFromHex(picker.value);
    });
  })();

  // ── 5. Minuteur Focus (Pomodoro) ──
  (function initTimer() {
    const display = document.getElementById('timer-display');
    const label = document.getElementById('timer-label');
    const btnStart = document.getElementById('timer-start');
    const btnReset = document.getElementById('timer-reset');
    const countEl = document.getElementById('timer-count');
    if (!display || !btnStart) return;

    const FOCUS = 25 * 60;
    const BREAK = 5 * 60;
    let remaining = FOCUS;
    let running = false;
    let interval = null;
    let isBreak = false;
    let sessions = 0;

    function fmt(s) {
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }

    function render() { display.textContent = fmt(remaining); }

    function tick() {
      remaining--;
      render();
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        if (!isBreak) {
          sessions++;
          countEl.textContent = sessions;
          isBreak = true;
          remaining = BREAK;
          label.textContent = '☕ Pause';
          btnStart.textContent = '▶ Pause';
        } else {
          isBreak = false;
          remaining = FOCUS;
          label.textContent = '🍅 Focus';
          btnStart.textContent = '▶ Démarrer';
        }
        render();
      }
    }

    btnStart.addEventListener('click', () => {
      if (running) {
        clearInterval(interval);
        running = false;
        btnStart.textContent = '▶ Reprendre';
      } else {
        running = true;
        btnStart.textContent = '⏸ Pause';
        interval = setInterval(tick, 1000);
      }
    });

    btnReset.addEventListener('click', () => {
      clearInterval(interval);
      running = false;
      isBreak = false;
      remaining = FOCUS;
      label.textContent = '🍅 Focus';
      btnStart.textContent = '▶ Démarrer';
      render();
    });

    render();
  })();

  // ── Utilitaire : copier dans le presse-papiers ──
  function copyText(text, btn) {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✅ Copié !';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }

})();
