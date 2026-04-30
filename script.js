// ═══ Theme Toggle ═══
(function initTheme() {
  var saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (!document.documentElement.getAttribute('data-theme')) {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // ═══ Easter Egg Gold ═══
  (function initGoldEasterEgg() {
    const statusDot = document.querySelector('.status-dot');
    if (!statusDot) return;

    const REQUIRED_CLICKS = 7;
    const CLICK_WINDOW = 3000;
    const VALID_KEY = 'VSGOLD-8F2K-XN47-QW9R-JMPL';
    const GOLD_URL = '/gold/goldforventistudiofr/';
    let clicks = [];

    statusDot.style.cursor = 'pointer';

    statusDot.addEventListener('click', (e) => {
      e.stopPropagation();
      const now = Date.now();
      clicks.push(now);
      clicks = clicks.filter(t => now - t < CLICK_WINDOW);

      // Feedback visuel subtil
      statusDot.style.boxShadow = '0 0 8px #f59e0b';
      statusDot.style.background = '#f59e0b';
      setTimeout(() => {
        statusDot.style.boxShadow = '';
        statusDot.style.background = '#4ade80';
      }, 200);

      if (clicks.length >= REQUIRED_CLICKS) {
        clicks = [];
        if (window.vsUnlockEgg) window.vsUnlockEgg('gold-vip');
        showGoldPanel();
      }
    });

    function showGoldPanel() {
      if (document.getElementById('gold-secret-panel')) return;

      const overlay = document.createElement('div');
      overlay.id = 'gold-secret-panel';
      overlay.className = 'gold-secret-overlay';
      overlay.innerHTML = `
        <div class="gold-secret-box">
          <button class="gold-secret-close" aria-label="Fermer">&times;</button>
          <span class="gold-secret-icon">👑</span>
          <h3>Accès Gold</h3>
          <p>Vous avez trouvé l'entrée secrète.</p>
          <input type="text" id="gold-secret-key" placeholder="Clé d'accès Gold..." autocomplete="off" spellcheck="false">
          <button id="gold-secret-btn" class="gold-secret-submit">Entrer</button>
          <div id="gold-secret-error" class="gold-secret-error"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Animer l'apparition
      requestAnimationFrame(() => overlay.classList.add('visible'));

      const keyInput = document.getElementById('gold-secret-key');
      const submitBtn = document.getElementById('gold-secret-btn');
      const errorEl = document.getElementById('gold-secret-error');
      const closeBtn = overlay.querySelector('.gold-secret-close');

      function tryValidate() {
        const val = keyInput.value.trim();
        if (val === VALID_KEY) {
          sessionStorage.setItem('gold-access', 'true');
          overlay.classList.add('gold-success');
          setTimeout(() => { window.location.href = GOLD_URL; }, 600);
        } else {
          errorEl.textContent = 'Clé invalide.';
          keyInput.style.borderColor = '#ef4444';
          setTimeout(() => {
            errorEl.textContent = '';
            keyInput.style.borderColor = '';
          }, 2500);
        }
      }

      submitBtn.addEventListener('click', tryValidate);
      keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryValidate(); });

      closeBtn.addEventListener('click', () => {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('visible');
          setTimeout(() => overlay.remove(), 300);
        }
      });

      setTimeout(() => keyInput.focus(), 100);
    }
  })();

  // Mobile menu toggle (if nav gets too long)
  const nav = document.querySelector('nav');
  const header = document.querySelector('header');
  
  // Ensure proper responsive behavior
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav) {
      nav.style.display = 'flex';
    }
  });

  // Card hover effects
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = 'var(--neon-glow)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = 'none';
    });
  });

  // CTA button animation
  document.querySelectorAll('.cta').forEach(cta => {
    cta.addEventListener('click', () => {
      cta.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cta.style.transform = '';
      }, 150);
    });
  });

  // ═══ Recommandations dynamiques depuis les données d'évaluation ═══
  const recoContainer = document.getElementById('recommendations-container');
  if (recoContainer && typeof evaluationData !== 'undefined') {
    const typeLabels = {
      'series': '🎥 Séries',
      'animations': '🎬 Films Animés',
      'series-animations': '🌟 Séries Animées',
      'films': '🎬 Films',
      'musique': '🎵 Musique',
      'jeux': '🎮 Jeux',
      'manga': '📚 Manga',
      'applications': '💻 Applications',
    };

    // Grouper les items featured par type
    const featured = evaluationData.filter(item => item.featured);
    const grouped = {};
    featured.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });

    // Trier par note décroissante dans chaque groupe, garder les 3 meilleurs
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => b.rating - a.rating);
      grouped[type] = grouped[type].slice(0, 3);
    });

    // Ne garder que les catégories avec au moins 1 item
    const types = Object.keys(grouped).filter(t => grouped[t].length > 0);

    if (types.length > 0) {
      recoContainer.innerHTML = '';
      types.forEach(type => {
        const section = document.createElement('div');
        section.className = 'recommendation-section';

        const title = document.createElement('h3');
        title.textContent = typeLabels[type] || type;
        section.appendChild(title);

        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'recommendation-cards';
        cardsDiv.setAttribute('role', 'region');
        cardsDiv.setAttribute('aria-label', `Recommandations ${typeLabels[type] || type}`);

        grouped[type].forEach(item => {
          const card = document.createElement('a');
          card.href = `/evaluation/content/?id=${item.id}`;
          card.className = 'card reco-card';
          card.style.textDecoration = 'none';
          card.style.color = 'inherit';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.overflow = 'hidden';

          const stars = '★'.repeat(Math.floor(item.rating)) + (item.rating % 1 >= 0.5 ? '⯪' : '');

          card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" loading="lazy" style="width:100%;height:140px;object-fit:cover;border-radius:0.5rem 0.5rem 0 0;">
            <div style="padding:0.75rem;flex:1;display:flex;flex-direction:column;">
              <h4 style="font-size:0.9rem;margin:0 0 0.25rem;">${item.title}</h4>
              <p style="font-size:0.8rem;color:var(--text-secondary);margin:0 0 0.5rem;">${item.creator}</p>
              <span style="font-size:0.8rem;color:#eab308;margin-top:auto;">${stars} ${item.rating}</span>
            </div>
          `;

          cardsDiv.appendChild(card);
        });

        section.appendChild(cardsDiv);
        recoContainer.appendChild(section);
      });

      // Lien "Voir tout"
      const seeAll = document.createElement('div');
      seeAll.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-top: 1rem;';
      seeAll.innerHTML = '<a href="/evaluation" class="cta" style="display:inline-block;padding:0.6rem 1.5rem;font-size:0.9rem;">Voir tout le catalogue évalué</a>';
      recoContainer.appendChild(seeAll);
    }
  }

  // ═══ Dernières nouvelles dynamiques ═══
  const newsContainer = document.getElementById('latest-news-container');
  if (newsContainer && typeof newsData !== 'undefined' && newsData.length > 0) {
    const latest = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    newsContainer.innerHTML = '';
    latest.forEach(item => {
      const card = document.createElement('a');
      card.href = `/news/?article=${encodeURIComponent(item.id)}`;
      card.className = 'news-teaser';
      const dateStr = new Date(item.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
      card.innerHTML = `
        <span class="news-teaser-date">${dateStr}</span>
        <h3>${item.title}</h3>
        <p>${item.excerpt}</p>
      `;
      newsContainer.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════════════════
  //  EASTER EGGS ENGINE — Succès débloquables sur le site
  // ═══════════════════════════════════════════════════════
  (function initEasterEggEngine() {
    var EE_KEY = 'vs-ee-unlocked';
    var TOTAL_EGGS = 19; // hors "completionist"

    var eggNames = {
      'konami': '🎮 Konami Code',
      'circus': '🎪 Le Cirque',
      'anniversary': '🎂 Anniversaire',
      'explorer': '🧭 Explorateur',
      'night-owl': '🦉 Nuit Profonde',
      'perfect-hour': '⏰ Heure Parfaite',
      'flip': '🙃 Le Retourné',
      'matrix': '💊 Matrix',
      'double-face': '🌓 Double Face',
      'gold-vip': '👑 Gold VIP',
      'hidden-pixel': '💎 Diamant Caché',
      'disco': '🪩 Disco Fever',
      'neko': '🐱 Neko Walk',
      'gravity': '🌍 Gravité Zéro',
      'retro': '📺 Mode Rétro',
      'logo-spin': '🌀 Logo Maniaque',
      'scroll-king': '📜 Roi du Scroll',
      'ghost': '👻 Fantôme',
      'pirate': '🏴‍☠️ Pirate',
      'completionist': '🏆 Complémentiste'
    };

    function getUnlocked() {
      try { return JSON.parse(localStorage.getItem(EE_KEY) || '[]'); }
      catch (e) { return []; }
    }

    function isUnlocked(id) {
      return getUnlocked().indexOf(id) !== -1;
    }

    function unlockEgg(id) {
      if (isUnlocked(id)) return false;
      var unlocked = getUnlocked();
      unlocked.push(id);
      localStorage.setItem(EE_KEY, JSON.stringify(unlocked));
      showToast(id);
      window.dispatchEvent(new CustomEvent('vs-ee-unlock', { detail: { id: id } }));
      // Check completionist (all 11 others unlocked)
      if (id !== 'completionist') {
        var count = unlocked.filter(function(x) { return x !== 'completionist'; }).length;
        if (count >= TOTAL_EGGS) {
          setTimeout(function() { unlockEgg('completionist'); }, 2500);
        }
      }
      return true;
    }

    window.vsUnlockEgg = unlockEgg;
    window.vsIsEggUnlocked = isUnlocked;

    // ── Toast Notification ──
    function showToast(id) {
      var toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:1rem 1.5rem;border-radius:12px;font-family:inherit;font-size:0.95rem;z-index:10000;box-shadow:0 8px 32px rgba(99,102,241,.4);transform:translateY(100px);opacity:0;transition:all .4s cubic-bezier(.4,0,.2,1);max-width:320px;';
      toast.innerHTML = '<div style="font-weight:700;margin-bottom:.25rem;">🏅 Succès débloqué !</div><div>' + (eggNames[id] || id) + '</div>';
      document.body.appendChild(toast);

      requestAnimationFrame(function() {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
      });

      setTimeout(function() {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 400);
      }, 3500);
    }

    // ── Trigger: Konami Code (toutes pages) ──
    (function() {
      var sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
      var pos = 0;
      document.addEventListener('keydown', function(e) {
        var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === sequence[pos]) {
          pos++;
          if (pos >= sequence.length) {
            pos = 0;
            unlockEgg('konami');
            // Rainbow flash
            var s = document.createElement('style');
            s.textContent = '@keyframes vsEeRainbow{0%{opacity:0}20%{opacity:.3}100%{opacity:0}}';
            document.head.appendChild(s);
            var flash = document.createElement('div');
            flash.style.cssText = 'position:fixed;inset:0;background:linear-gradient(45deg,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff,#8b00ff);opacity:0;z-index:9999;pointer-events:none;animation:vsEeRainbow 1.5s ease forwards;';
            document.body.appendChild(flash);
            setTimeout(function() { flash.remove(); s.remove(); }, 1600);
          }
        } else {
          pos = (key === sequence[0]) ? 1 : 0;
        }
      });
    })();

    // ── Trigger: Word detection (circus, flip, matrix) ──
    (function() {
      var typed = '';
      document.addEventListener('keydown', function(e) {
        if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
        typed += e.key.toLowerCase();
        if (typed.length > 30) typed = typed.slice(-30);

        // Circus
        if (typed.endsWith('circus')) {
          typed = '';
          unlockEgg('circus');
          var s = document.createElement('style');
          s.textContent = '@keyframes vsEeCircus{0%{transform:rotate(0) scale(1)}25%{transform:rotate(5deg) scale(1.02)}50%{transform:rotate(0) scale(0.98)}75%{transform:rotate(-5deg) scale(1.02)}100%{transform:rotate(0) scale(1)}}';
          document.head.appendChild(s);
          document.body.style.animation = 'vsEeCircus 0.5s ease 6';
          setTimeout(function() { document.body.style.animation = ''; s.remove(); }, 5000);
        }

        // Flip
        if (typed.endsWith('flip')) {
          typed = '';
          unlockEgg('flip');
          document.body.style.transition = 'transform 1s ease';
          document.body.style.transform = 'scaleY(-1)';
          setTimeout(function() {
            document.body.style.transform = '';
            setTimeout(function() { document.body.style.transition = ''; }, 1000);
          }, 3000);
        }

        // Disco
        if (typed.endsWith('disco')) {
          typed = '';
          unlockEgg('disco');
          var sDisco = document.createElement('style');
          sDisco.textContent = '@keyframes vsEeDisco{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
            '.vs-ee-disco-ball{position:fixed;top:-30px;left:50%;transform:translateX(-50%);width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,#fff 20%,#ccc 40%,#999 60%,#666);z-index:9999;pointer-events:none;box-shadow:0 0 60px rgba(255,255,255,.6),0 0 120px rgba(255,255,0,.3);animation:vsEeDiscoDrop .6s ease forwards}' +
            '@keyframes vsEeDiscoDrop{to{top:20px}}' +
            '.vs-ee-disco-light{position:fixed;inset:0;z-index:9998;pointer-events:none;background:linear-gradient(45deg,#ff006620,#00ff6620,#0066ff20,#ff00ff20);background-size:400% 400%;animation:vsEeDisco 1s ease infinite;mix-blend-mode:screen}';
          document.head.appendChild(sDisco);
          var ball = document.createElement('div'); ball.className = 'vs-ee-disco-ball';
          var light = document.createElement('div'); light.className = 'vs-ee-disco-light';
          document.body.appendChild(ball); document.body.appendChild(light);
          setTimeout(function() { ball.remove(); light.remove(); sDisco.remove(); }, 6000);
        }

        // Neko (cat walk)
        if (typed.endsWith('neko') || typed.endsWith('cat')) {
          typed = '';
          unlockEgg('neko');
          var cat = document.createElement('div');
          cat.textContent = '🐱';
          cat.style.cssText = 'position:fixed;bottom:0;font-size:2.5rem;z-index:9999;pointer-events:none;transition:none;';
          cat.style.left = '-50px';
          document.body.appendChild(cat);
          var catX = -50;
          var catInterval = setInterval(function() {
            catX += 3;
            cat.style.left = catX + 'px';
            if (catX > window.innerWidth + 50) { clearInterval(catInterval); cat.remove(); }
          }, 20);
        }

        // Gravity
        if (typed.endsWith('gravity')) {
          typed = '';
          unlockEgg('gravity');
          var allEls = document.querySelectorAll('main *');
          var sGrav = document.createElement('style');
          sGrav.textContent = '@keyframes vsEeFloat{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(-15px) rotate(1deg)}50%{transform:translateY(-8px) rotate(-1deg)}75%{transform:translateY(-20px) rotate(0.5deg)}100%{transform:translateY(0) rotate(0)}}';
          document.head.appendChild(sGrav);
          allEls.forEach(function(el) {
            el.style.animation = 'vsEeFloat ' + (2 + Math.random() * 3).toFixed(1) + 's ease infinite';
            el.style.animationDelay = (Math.random() * 2).toFixed(1) + 's';
          });
          setTimeout(function() {
            allEls.forEach(function(el) { el.style.animation = ''; el.style.animationDelay = ''; });
            sGrav.remove();
          }, 8000);
        }

        // Retro
        if (typed.endsWith('retro')) {
          typed = '';
          unlockEgg('retro');
          var sRetro = document.createElement('style');
          sRetro.textContent = '.vs-ee-retro{font-family:"Comic Sans MS","Courier New",monospace!important;image-rendering:pixelated;}.vs-ee-retro *{font-family:inherit!important;border-radius:0!important;}.vs-ee-retro header,.vs-ee-retro footer,.vs-ee-retro .card,.vs-ee-retro main{background:navy!important;color:lime!important;border:3px solid yellow!important;}.vs-ee-retro a{color:magenta!important;}.vs-ee-retro-badge{position:fixed;top:10px;left:50%;transform:translateX(-50%);background:yellow;color:red;font-family:"Comic Sans MS",cursive;font-size:1.2rem;padding:.5rem 1rem;z-index:9999;font-weight:bold;border:3px dashed red;animation:vsEeBlink 0.5s linear infinite;}@keyframes vsEeBlink{50%{opacity:0}}';
          document.head.appendChild(sRetro);
          document.body.classList.add('vs-ee-retro');
          var badge = document.createElement('div');
          badge.className = 'vs-ee-retro-badge';
          badge.textContent = '~ Bienvenue en 1999 ~';
          document.body.appendChild(badge);
          setTimeout(function() {
            document.body.classList.remove('vs-ee-retro');
            badge.remove();
            sRetro.remove();
          }, 7000);
        }

        // Ghost
        if (typed.endsWith('ghost')) {
          typed = '';
          unlockEgg('ghost');
          document.body.style.transition = 'opacity 1s ease';
          document.body.style.opacity = '0.15';
          var ghostEl = document.createElement('div');
          ghostEl.textContent = '👻';
          ghostEl.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:8rem;z-index:9999;pointer-events:none;animation:eeBounce .8s ease;';
          document.body.appendChild(ghostEl);
          setTimeout(function() {
            document.body.style.opacity = '1';
            ghostEl.remove();
            setTimeout(function() { document.body.style.transition = ''; }, 1000);
          }, 4000);
        }

        // Pirate
        if (typed.endsWith('pirate')) {
          typed = '';
          unlockEgg('pirate');
          var sPirate = document.createElement('style');
          sPirate.textContent = '.vs-ee-pirate{background:#2a1a0e!important;color:#daa520!important;}.vs-ee-pirate *{color:#daa520!important;border-color:#8b6914!important;}.vs-ee-pirate a{color:#ff6347!important;}.vs-ee-pirate header,.vs-ee-pirate footer{background:#1a0f06!important;}.vs-ee-pirate-flag{position:fixed;top:1rem;right:1rem;font-size:3rem;z-index:9999;pointer-events:none;animation:vsEePirateSwing 1s ease infinite alternate}@keyframes vsEePirateSwing{0%{transform:rotate(-10deg)}100%{transform:rotate(10deg)}}';
          document.head.appendChild(sPirate);
          document.body.classList.add('vs-ee-pirate');
          var flag = document.createElement('div');
          flag.className = 'vs-ee-pirate-flag';
          flag.textContent = '🏴\u200d☠️';
          document.body.appendChild(flag);
          setTimeout(function() {
            document.body.classList.remove('vs-ee-pirate');
            flag.remove();
            sPirate.remove();
          }, 7000);
        }

        // Matrix
        if (typed.endsWith('matrix')) {
          typed = '';
          unlockEgg('matrix');
          var canvas = document.createElement('canvas');
          canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0.7;';
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          document.body.appendChild(canvas);
          var ctx = canvas.getContext('2d');
          var cols = Math.floor(canvas.width / 20);
          var drops = [];
          for (var c = 0; c < cols; c++) drops[c] = Math.floor(Math.random() * -20);
          var chars = 'ヴェンティスタジオ01アオキユニバース'.split('');

          var interval = setInterval(function() {
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = '16px monospace';
            for (var i = 0; i < drops.length; i++) {
              var ch = chars[Math.floor(Math.random() * chars.length)];
              ctx.fillText(ch, i * 20, drops[i] * 20);
              if (drops[i] * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
              drops[i]++;
            }
          }, 50);

          setTimeout(function() {
            clearInterval(interval);
            canvas.style.transition = 'opacity 1s';
            canvas.style.opacity = '0';
            setTimeout(function() { canvas.remove(); }, 1000);
          }, 6000);
        }
      });
    })();

    // ── Trigger: Double Face (10 theme toggles in 5s) ──
    (function() {
      var toggle = document.getElementById('theme-toggle');
      if (!toggle) return;
      var times = [];
      toggle.addEventListener('click', function() {
        times.push(Date.now());
        times = times.filter(function(t) { return Date.now() - t < 5000; });
        if (times.length >= 10) {
          times = [];
          unlockEgg('double-face');
          var s = document.createElement('style');
          s.textContent = '@keyframes vsEeHueRotate{0%{filter:hue-rotate(0)}100%{filter:hue-rotate(360deg)}}';
          document.head.appendChild(s);
          document.body.style.animation = 'vsEeHueRotate 2s linear 3';
          setTimeout(function() { document.body.style.animation = ''; s.remove(); }, 6000);
        }
      });
    })();

    // ── Trigger: Night Owl (visit between midnight and 3am) ──
    (function() {
      var hour = new Date().getHours();
      if (hour >= 0 && hour < 3) {
        unlockEgg('night-owl');
      }
    })();

    // ── Trigger: Anniversary (September 24) ──
    (function() {
      var now = new Date();
      if (now.getMonth() === 8 && now.getDate() === 24) {
        unlockEgg('anniversary');
      }
    })();

    // ── Trigger: Perfect Hour (minute === 42) ──
    (function() {
      if (new Date().getMinutes() === 42) {
        unlockEgg('perfect-hour');
      }
    })();

    // ── Trigger: Explorer (visit 8+ different pages) ──
    (function() {
      var PAGES_KEY = 'vs-ee-pages';
      var pages;
      try { pages = JSON.parse(localStorage.getItem(PAGES_KEY) || '[]'); }
      catch (e) { pages = []; }
      var current = location.pathname.replace(/\/+$/, '') || '/';
      if (pages.indexOf(current) === -1) {
        pages.push(current);
        localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
      }
      if (pages.length >= 8) {
        unlockEgg('explorer');
      }
    })();

    // ── Trigger: Hidden Pixel (homepage only) ──
    (function() {
      var path = location.pathname.replace(/\/+$/, '') || '/';
      if (path !== '/' && path !== '/index.html') return;
      var hero = document.querySelector('.hero') || document.querySelector('main');
      if (!hero) return;
      hero.style.position = hero.style.position || 'relative';
      var pixel = document.createElement('div');
      pixel.style.cssText = 'position:absolute;width:6px;height:6px;background:rgba(99,102,241,0.12);border-radius:50%;cursor:pointer;z-index:50;bottom:18px;right:42px;transition:all .3s;';
      pixel.title = '';
      hero.appendChild(pixel);
      pixel.addEventListener('click', function() {
        unlockEgg('hidden-pixel');
        pixel.style.background = 'gold';
        pixel.style.width = '14px';
        pixel.style.height = '14px';
        pixel.style.boxShadow = '0 0 20px gold, 0 0 40px rgba(255,215,0,.5)';
        pixel.style.borderRadius = '50%';
      });
    })();

    // ── Trigger: Logo Maniaque (click logo 5 times in 3s) ──
    (function() {
      var logoEl = document.querySelector('.logo');
      if (!logoEl) return;
      var logoClicks = [];
      logoEl.addEventListener('click', function(e) {
        if (e.target.closest('a[href]')) return; // ne pas bloquer les liens
        logoClicks.push(Date.now());
        logoClicks = logoClicks.filter(function(t) { return Date.now() - t < 3000; });
        if (logoClicks.length >= 5) {
          logoClicks = [];
          unlockEgg('logo-spin');
          var logoImg = logoEl.querySelector('img');
          if (logoImg) {
            logoImg.style.transition = 'transform 2s cubic-bezier(.4,0,.2,1)';
            logoImg.style.transform = 'rotate(1440deg) scale(1.3)';
            setTimeout(function() {
              logoImg.style.transform = '';
              setTimeout(function() { logoImg.style.transition = ''; }, 2000);
            }, 2500);
          }
        }
      });
    })();

    // ── Trigger: Scroll King (scroll 15000px total on one page) ──
    (function() {
      var totalScroll = 0;
      var lastY = window.scrollY;
      window.addEventListener('scroll', function() {
        totalScroll += Math.abs(window.scrollY - lastY);
        lastY = window.scrollY;
        if (totalScroll >= 15000) {
          unlockEgg('scroll-king');
        }
      });
    })();

  })();
  // ═══ Fin Easter Eggs Engine ═══
});

// ═══════════════════════════════════════════════════════════
// CLERK AUTHENTICATION
// ═══════════════════════════════════════════════════════════

// Clé publique Clerk
const CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsudmVudGlzdHVkaW8uZXUk';

const userButtonContainer = document.getElementById('user-button');

(async function initClerk() {
  if (!userButtonContainer) return;

  // Attendre que le SDK Clerk soit chargé
  if (typeof window.Clerk === 'undefined') {
    // Fallback si le script CDN n'est pas encore chargé
    await new Promise((resolve, reject) => {
      const maxWait = setTimeout(() => reject(new Error('Clerk SDK timeout')), 10000);
      const check = setInterval(() => {
        if (typeof window.Clerk !== 'undefined') {
          clearInterval(check);
          clearTimeout(maxWait);
          resolve();
        }
      }, 100);
    }).catch(() => {
      console.warn('Clerk SDK non disponible — affichage du bouton de fallback');
      showFallbackButton();
    });

    if (typeof window.Clerk === 'undefined') return;
  }

  try {
    const clerk = window.Clerk;
    await clerk.load({
      appearance: {
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#1a1a2e',
          colorText: '#e2e8f0',
          colorInputBackground: '#0a0a0f',
          colorInputText: '#e2e8f0',
          borderRadius: '0.75rem',
        },
      },
    });

    // Écouter les changements d'état d'authentification
    renderAuthUI(clerk);
    clerk.addListener(() => renderAuthUI(clerk));
  } catch (err) {
    console.error('Erreur initialisation Clerk:', err);
    showFallbackButton();
  }
})();

function renderAuthUI(clerk) {
  if (!userButtonContainer) return;
  userButtonContainer.innerHTML = '';

  if (clerk.user) {
    // Utilisateur connecté → afficher le UserButton Clerk
    const userBtnDiv = document.createElement('div');
    userBtnDiv.id = 'clerk-user-button';
    userButtonContainer.appendChild(userBtnDiv);
    try {
      clerk.mountUserButton(userBtnDiv);
    } catch (e) {
      console.warn('Clerk UI components unavailable for UserButton:', e);
      userButtonContainer.innerHTML = '';
      const profileLink = document.createElement('a');
      profileLink.href = 'https://accounts.ventistudio.eu/user';
      profileLink.className = 'cta';
      profileLink.style.padding = '0.5rem 1.25rem';
      profileLink.style.fontSize = '0.9rem';
      profileLink.style.margin = '0';
      profileLink.innerHTML = '<span>Mon compte</span>';
      userButtonContainer.appendChild(profileLink);
    }
  } else {
    // Non connecté → bouton "Se connecter" qui ouvre la modale Clerk ou redirige
    const signInButton = document.createElement('button');
    signInButton.innerHTML = '<span>Se connecter</span>';
    signInButton.className = 'cta';
    signInButton.style.padding = '0.5rem 1.25rem';
    signInButton.style.fontSize = '0.9rem';
    signInButton.style.margin = '0';

    signInButton.addEventListener('click', () => {
      try {
        clerk.openSignIn({
          redirectUrl: window.location.href,
        });
      } catch (e) {
        console.warn('Clerk UI components unavailable, redirecting:', e);
        window.location.href = 'https://accounts.ventistudio.eu/sign-in?redirect_url=' + encodeURIComponent(window.location.href);
      }
    });

    userButtonContainer.appendChild(signInButton);
  }
}

function showFallbackButton() {
  if (!userButtonContainer || userButtonContainer.childElementCount > 0) return;
  const btn = document.createElement('button');
  btn.innerHTML = '<span>Se connecter</span>';
  btn.className = 'cta';
  btn.style.padding = '0.5rem 1.25rem';
  btn.style.fontSize = '0.9rem';
  btn.style.margin = '0';
  btn.addEventListener('click', () => {
    window.location.href = 'https://accounts.ventistudio.eu/sign-in';
  });
  userButtonContainer.appendChild(btn);
}
