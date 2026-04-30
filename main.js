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

(function initSeason() {

  if (document.documentElement.getAttribute('data-testor') === 'true') return;

  var now = new Date();
  var month = now.getMonth();
  var day = now.getDate();


  var event = null;


  if (month === 0 && day === 1) event = 'new-year';
  if (month === 1 && day >= 13 && day <= 15) event = 'valentines';
  if (month === 3 && day === 1) event = 'april-fools';
  if (month === 5 && day === 21) event = 'fete-musique';
  if (month === 6 && day === 14) event = 'national-day';
  if (month === 9 && day >= 30 && day <= 31) event = 'halloween';
  if (month === 11 && day >= 24 && day <= 26) event = 'christmas';


  if (month === 0 && day >= 2 && day <= 3) event = 'hatsumode';
  if (month === 1 && day === 3) event = 'setsubun';
  if (month === 2 && day === 3) event = 'hinamatsuri';
  if (month === 6 && day === 7) event = 'tanabata';
  if (month === 7 && day >= 13 && day <= 15) event = 'obon';


  if (month === 4 && day === 4) event = 'star-wars';
  if (month === 3 && day === 5) event = 'star-trek';
  if (month === 4 && day === 25) event = 'towel-day';
  if (month === 9 && day === 21) event = 'back-to-future';


  if (month === 8 && day === 24) event = 'anniversary';

  if (event) {
    document.documentElement.setAttribute('data-event', event);
  }


  var season = null;
  if (month >= 2 && month <= 4) season = 'spring';
  if (month >= 5 && month <= 7) season = 'summer';
  if (month >= 8 && month <= 10) season = 'autumn';
  if (month === 11 || month <= 1) season = 'winter';
  if (season) {
    document.documentElement.setAttribute('data-season', season);
  }
})();

document.addEventListener('DOMContentLoaded', () => {


  (function initAprilFools() {
    if (document.documentElement.getAttribute('data-event') !== 'april-fools') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var chaosColors = [
      '#ff006e', '#fb5607', '#ffbe0b', '#3a86ff', '#8338ec',
      '#06d6a0', '#ef476f', '#ffd166', '#118ab2', '#073b4c',
      '#e63946', '#a8dadc', '#457b9d', '#f72585', '#7209b7',
      '#4cc9f0', '#80ed99', '#c77dff', '#ff595e', '#ffca3a'
    ];

    function randColor() {
      return chaosColors[Math.floor(Math.random() * chaosColors.length)];
    }
    function randRange(min, max) {
      return min + Math.random() * (max - min);
    }

    function applyRandomCSSVars() {
      var root = document.documentElement;
      root.style.setProperty('--chaos-color-1', randColor());
      root.style.setProperty('--chaos-color-2', randColor());
      root.style.setProperty('--chaos-color-3', randColor());
      root.style.setProperty('--chaos-hue', Math.floor(Math.random() * 360) + 'deg');
    }
    applyRandomCSSVars();
    setInterval(applyRandomCSSVars, 4000);

    var fishContainer = document.createElement('div');
    fishContainer.id = 'april-fools-fish';
    document.body.appendChild(fishContainer);

    var fishEmojis = ['🐟', '🐠', '🐡', '🎣', '🐟', '🐠'];
    for (var i = 0; i < 12; i++) {
      var fish = document.createElement('span');
      fish.className = 'chaos-fish';
      fish.textContent = fishEmojis[i % fishEmojis.length];
      fish.style.top = randRange(5, 90) + '%';
      fish.style.animationDuration = randRange(8, 18) + 's';
      fish.style.animationDelay = randRange(0, 12) + 's';
      fish.style.fontSize = randRange(1.2, 3) + 'rem';
      if (Math.random() > 0.5) fish.classList.add('chaos-fish-reverse');
      fishContainer.appendChild(fish);
    }

    document.body.classList.add('april-fools-cursor');

    var banner = document.createElement('div');
    banner.id = 'april-fools-banner';
    banner.innerHTML = '🐟 Poisson d\'Avril ! 🐠 Ne faites confiance à rien aujourd\'hui... 🎣';
    document.body.prepend(banner);
  })();


  (function initEventParticles() {
    var ev = document.documentElement.getAttribute('data-event');
    if (!ev || ev === 'april-fools') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var container = document.createElement('div');
    container.id = 'event-particles';
    document.body.appendChild(container);

    var config = {
      'halloween':       { emojis: ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️'], count: 20, cls: 'halloween-particle' },
      'christmas':       { emojis: ['❄️', '🎄', '⭐', '🎁', '🔔', '✨'], count: 25, cls: 'christmas-particle' },
      'new-year':        { emojis: ['🎆', '🎇', '✨', '🥂', '🎊', '🎉'], count: 25, cls: 'newyear-particle' },
      'valentines':      { emojis: ['❤️', '💕', '💖', '💗', '💝', '🌹'], count: 22, cls: 'valentine-particle' },
      'national-day':    { emojis: ['🇫🇷', '🎆', '✨', '🔵', '⚪', '🔴'], count: 20, cls: 'national-particle' },
      'fete-musique':    { emojis: ['🎵', '🎶', '🎸', '🎹', '🎷', '🎺'], count: 22, cls: 'musique-particle' },
      'hatsumode':       { emojis: ['⛩️', '🎍', '🌅', '🎌', '🔔', '✨'], count: 18, cls: 'hatsumode-particle' },
      'setsubun':        { emojis: ['👹', '🫘', '🎭', '✨', '🏯', '🎋'], count: 18, cls: 'setsubun-particle' },
      'hinamatsuri':     { emojis: ['🎎', '🌸', '🎀', '🍡', '✨', '💮'], count: 22, cls: 'hinamatsuri-particle' },
      'tanabata':        { emojis: ['🎋', '⭐', '🌌', '💫', '✨', '🎆'], count: 25, cls: 'tanabata-particle' },
      'obon':            { emojis: ['🏮', '🎐', '✨', '🌺', '🕯️', '💫'], count: 20, cls: 'obon-particle' },
      'towel-day':       { emojis: ['🐬', '🌍', '42', '🚀', '🐋', '🤖'], count: 15, cls: 'towel-particle' },
      'back-to-future':  { emojis: ['⚡', '🕐', '🚗', '🔥', '⏰', '💥'], count: 18, cls: 'bttf-particle' },
      'anniversary':     { emojis: ['🎉', '🎂', '🥳', '✨', '🎊', '💜'], count: 25, cls: 'anniversary-particle' }
    };


    if (ev === 'star-wars') {
      container.classList.add('star-wars-hyperspace');
      for (var i = 0; i < 80; i++) {
        var star = document.createElement('span');
        star.className = 'hyperspace-star';
        star.style.left = (Math.random() * 100) + '%';
        star.style.top = (Math.random() * 100) + '%';
        star.style.animationDelay = (Math.random() * 3) + 's';
        star.style.animationDuration = (0.8 + Math.random() * 1.2) + 's';
        container.appendChild(star);
      }
    }


    if (ev === 'star-trek') {
      container.classList.add('star-trek-warp');
      for (var i = 0; i < 60; i++) {
        var star = document.createElement('span');
        star.className = 'warp-star';
        star.style.left = (50 + (Math.random() - 0.5) * 10) + '%';
        star.style.top = (50 + (Math.random() - 0.5) * 10) + '%';
        star.style.animationDelay = (Math.random() * 4) + 's';
        star.style.animationDuration = (1 + Math.random() * 2) + 's';
        var angle = Math.random() * 360;
        star.style.setProperty('--warp-angle', angle + 'deg');
        container.appendChild(star);
      }
    }


    if (ev === 'back-to-future') {
      setInterval(function() {
        var flash = document.createElement('div');
        flash.className = 'bttf-flash';
        container.appendChild(flash);
        setTimeout(function() { flash.remove(); }, 800);
      }, 8000);
    }

    var c = config[ev];
    if (c) {
      for (var i = 0; i < c.count; i++) {
        var el = document.createElement('span');
        el.className = 'event-particle ' + c.cls;
        el.textContent = c.emojis[i % c.emojis.length];
        el.style.left = (Math.random() * 100) + '%';
        el.style.animationDelay = (Math.random() * 12) + 's';
        el.style.animationDuration = (7 + Math.random() * 8) + 's';
        el.style.fontSize = (0.9 + Math.random() * 1.2) + 'rem';
        container.appendChild(el);
      }
    }


    var bannerTexts = {
      'halloween':      '🎃 Happy Halloween ! 👻 Boo ! 🦇',
      'christmas':      '🎄 Joyeux Noël ! 🎁 Ho Ho Ho ! ⭐',
      'new-year':       '🎆 Bonne Année ! 🥂 Meilleurs vœux ! 🎉',
      'valentines':     '💕 Joyeuse Saint-Valentin ! 💖 Love is in the air 🌹',
      'national-day':   '🇫🇷 Vive la France ! 🎆 Bonne Fête Nationale ! 🇫🇷',
      'fete-musique':   '🎵 Fête de la Musique ! 🎸 Faites du bruit ! 🎶',
      'hatsumode':      '⛩️ あけましておめでとう！ 🎍 Hatsumode — Premier temple de l\'année 🌅',
      'setsubun':       '👹 鬼は外！福は内！ 🫘 Setsubun — Chassez les démons ! 🎭',
      'hinamatsuri':    '🎎 ひな祭り 🌸 Hinamatsuri — Fête des poupées ! 🎀',
      'tanabata':       '🎋 七夕 ⭐ Tanabata — Faites un vœu aux étoiles ! 🌌',
      'obon':           '🏮 お盆 🎐 Obon — En mémoire des ancêtres 🕯️',
      'star-wars':      '⚔️ May the 4th be with you ! 🌌 Star Wars Day ✨',
      'star-trek':      '🖖 Live long and prosper ! 🚀 First Contact Day — Star Trek 🌌',
      'towel-day':      '🐬 Don\'t Panic ! 🌍 Towel Day — La réponse est 42 🚀',
      'back-to-future': '⚡ 1.21 Gigawatts ! 🚗 Retour vers le Futur Day ⏰',
      'anniversary':    '🎉 Joyeux Anniversaire VentiStudio ! 🥳 Merci à tous ! 💜'
    };
    if (bannerTexts[ev]) {
      var banner = document.createElement('div');
      banner.id = 'event-banner';
      banner.setAttribute('data-event-type', ev);
      banner.innerHTML = bannerTexts[ev];
      document.body.prepend(banner);
    }
  })();


  (function initEventEffects() {
    var ev = document.documentElement.getAttribute('data-event');
    if (!ev || ev === 'april-fools') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var old = document.getElementById('event-fx-canvas');
    if (old) old.remove();

    var canvas = document.createElement('canvas');
    canvas.id = 'event-fx-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    var W = function() { return canvas.width / dpr; };
    var H = function() { return canvas.height / dpr; };


    if (ev === 'national-day' || ev === 'new-year') {
      var palettes = {
        'national-day': ['#002395', '#ffffff', '#ED2939'],
        'new-year':     ['#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7', '#ff69b4', '#00d4ff']
      };
      var colors = palettes[ev];
      var rockets = [];
      var sparks = [];

      function launchRocket() {
        rockets.push({
          x: Math.random() * W(), y: H(),
          targetY: 60 + Math.random() * (H() * 0.35),
          speed: 4 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          trail: []
        });
      }

      function explode(r) {
        var count = 60 + Math.floor(Math.random() * 60);
        for (var i = 0; i < count; i++) {
          var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
          var speed = 2 + Math.random() * 5;
          sparks.push({
            x: r.x, y: r.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1, decay: 0.006 + Math.random() * 0.01,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2.5 + Math.random() * 3
          });
        }
      }

      function tickFireworks() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        for (var i = rockets.length - 1; i >= 0; i--) {
          var r = rockets[i];
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 12) r.trail.shift();
          r.y -= r.speed;
          r.x += (Math.random() - 0.5) * 0.8;
          for (var t = 0; t < r.trail.length; t++) {
            ctx.globalAlpha = (t / r.trail.length) * 0.7;
            ctx.beginPath(); ctx.arc(r.trail[t].x, r.trail[t].y, 2, 0, Math.PI * 2);
            ctx.fillStyle = r.color; ctx.fill();
          }
          ctx.globalAlpha = 1; ctx.beginPath();
          ctx.arc(r.x, r.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.fill();
          if (r.y <= r.targetY) { explode(r); rockets.splice(i, 1); }
        }
        for (var i = sparks.length - 1; i >= 0; i--) {
          var s = sparks[i];
          s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.vx *= 0.99; s.life -= s.decay;
          if (s.life <= 0) { sparks.splice(i, 1); continue; }
          ctx.globalAlpha = s.life;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
          ctx.fillStyle = s.color; ctx.fill();
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size * s.life * 3, 0, Math.PI * 2);
          ctx.globalAlpha = s.life * 0.25; ctx.fillStyle = s.color; ctx.fill();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickFireworks);
      }
      launchRocket(); launchRocket();
      window._fxIntervals = window._fxIntervals || [];
      window._fxIntervals.push(setInterval(function() {
        var burst = 1 + Math.floor(Math.random() * 3);
        for (var i = 0; i < burst; i++) setTimeout(launchRocket, i * 250);
      }, 1800));
      tickFireworks();
      return;
    }


    if (ev === 'halloween') {
      var fogOffset = 0;
      function tickFog() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        fogOffset += 0.004;
        for (var layer = 0; layer < 5; layer++) {
          var baseY = H() - 40 - layer * 50;
          ctx.beginPath(); ctx.moveTo(0, H());
          for (var x = 0; x <= W(); x += 6) {
            ctx.lineTo(x, baseY + Math.sin(x * 0.004 + fogOffset + layer * 1.5) * 40 +
              Math.sin(x * 0.008 + fogOffset * 2) * 20);
          }
          ctx.lineTo(W(), H()); ctx.closePath();
          ctx.fillStyle = 'rgba(100,60,160,' + (0.18 - layer * 0.03) + ')';
          ctx.fill();
        }
        window._fxRAF = requestAnimationFrame(tickFog);
      }
      tickFog();
      return;
    }


    if (ev === 'christmas') {
      var lights = [];
      var xmasColors = ['#ff0000', '#00cc00', '#ffd700', '#ff4444', '#44ff44', '#ff6600'];
      var lightCount = Math.floor(W() / 40);
      var baseGY = 90;
      for (var i = 0; i < lightCount; i++) {
        lights.push({
          x: (i + 0.5) * (W() / lightCount),
          y: baseGY + Math.sin(i * 0.6) * 20,
          color: xmasColors[i % xmasColors.length],
          phase: Math.random() * Math.PI * 2
        });
      }
      function tickLights() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        var t = Date.now() * 0.002;
        ctx.beginPath(); ctx.moveTo(0, baseGY);
        for (var i = 0; i < lights.length; i++) ctx.lineTo(lights[i].x, lights[i].y);
        ctx.lineTo(W(), baseGY);
        ctx.strokeStyle = 'rgba(50,120,50,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        for (var i = 0; i < lights.length; i++) {
          var l = lights[i], br = 0.5 + Math.sin(t + l.phase) * 0.5;
          ctx.beginPath(); ctx.arc(l.x, l.y + 8, 6, 0, Math.PI * 2);
          ctx.fillStyle = l.color; ctx.globalAlpha = 0.6 + br * 0.4; ctx.fill();
          ctx.beginPath(); ctx.arc(l.x, l.y + 8, 20, 0, Math.PI * 2);
          ctx.globalAlpha = br * 0.2; ctx.fill();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickLights);
      }
      tickLights();
      return;
    }


    if (ev === 'valentines') {
      var hearts = [];
      function spawnHeart() {
        hearts.push({
          x: Math.random() * W(), y: H() + 20,
          size: 12 + Math.random() * 22, speed: 0.4 + Math.random() * 1.2,
          drift: (Math.random() - 0.5) * 0.6,
          alpha: 0.3 + Math.random() * 0.45,
          color: ['#ff69b4', '#ff1493', '#ff6b9d', '#e91e63'][Math.floor(Math.random() * 4)]
        });
      }
      for (var i = 0; i < 15; i++) { spawnHeart(); hearts[i].y = Math.random() * H(); }

      function drawHeart(x, y, size) {
        ctx.beginPath(); ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
        ctx.bezierCurveTo(x - size, y + size * 0.7, x, y + size, x, y + size * 1.2);
        ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.7, x + size, y + size * 0.3);
        ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
        ctx.closePath(); ctx.fill();
      }

      function tickHearts() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        for (var i = hearts.length - 1; i >= 0; i--) {
          var h = hearts[i]; h.y -= h.speed;
          h.x += h.drift + Math.sin(Date.now() * 0.001 + i) * 0.4;
          if (h.y < -40) { hearts.splice(i, 1); spawnHeart(); continue; }
          ctx.globalAlpha = h.alpha; ctx.fillStyle = h.color;
          drawHeart(h.x, h.y, h.size);
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickHearts);
      }
      tickHearts();
      return;
    }


    if (ev === 'fete-musique') {
      var barCount = 40;
      var barHeights = new Array(barCount).fill(0);
      var barTargets = new Array(barCount).fill(0);
      var eqColors = ['#ec4899', '#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6'];

      function tickEQ() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        var barW = W() / barCount, maxH = 120, t = Date.now() * 0.001;
        for (var i = 0; i < barCount; i++) {
          barTargets[i] = (Math.sin(t * 2.5 + i * 0.4) * 0.5 + 0.5) *
                          (Math.sin(t * 4 + i * 0.25) * 0.3 + 0.7) * maxH;
          barHeights[i] += (barTargets[i] - barHeights[i]) * 0.12;
          var grad = ctx.createLinearGradient(0, H(), 0, H() - barHeights[i]);
          grad.addColorStop(0, eqColors[i % eqColors.length]);
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad; ctx.globalAlpha = 0.45;
          ctx.fillRect(i * barW + 1, H() - barHeights[i], barW - 2, barHeights[i]);
          ctx.globalAlpha = 0.8; ctx.fillStyle = eqColors[i % eqColors.length];
          ctx.fillRect(i * barW + 1, H() - barHeights[i] - 4, barW - 2, 3);
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickEQ);
      }
      tickEQ();
      return;
    }


    if (ev === 'tanabata') {
      var shootingStars = [];
      function spawnStar() {
        shootingStars.push({
          x: Math.random() * W() * 1.5, y: -10,
          len: 60 + Math.random() * 120, speed: 5 + Math.random() * 8,
          angle: Math.PI * 0.2 + Math.random() * 0.15,
          alpha: 0.7 + Math.random() * 0.3,
          color: ['#fff', '#c8e6ff', '#ffe4b5', '#e0ccff'][Math.floor(Math.random() * 4)]
        });
      }

      function tickShootingStars() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        var t = Date.now() * 0.001;
        for (var i = 0; i < 60; i++) {
          var sx = (i * 97.3 + 13) % W(), sy = (i * 53.7 + 29) % (H() * 0.7);
          ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.25 + Math.sin(t * 2 + i * 1.5) * 0.2;
          ctx.fill();
        }
        for (var i = shootingStars.length - 1; i >= 0; i--) {
          var s = shootingStars[i];
          s.x -= Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.alpha -= 0.004;
          if (s.alpha <= 0 || s.y > H() + 20) { shootingStars.splice(i, 1); continue; }
          var tx = s.x + Math.cos(s.angle) * s.len, ty = s.y - Math.sin(s.angle) * s.len;
          var grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
          grad.addColorStop(0, s.color); grad.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty);
          ctx.strokeStyle = grad; ctx.lineWidth = 3; ctx.globalAlpha = s.alpha; ctx.stroke();
          ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.globalAlpha = s.alpha; ctx.fill();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickShootingStars);
      }
      window._fxIntervals = window._fxIntervals || [];
      window._fxIntervals.push(setInterval(spawnStar, 800));
      spawnStar(); spawnStar();
      tickShootingStars();
      return;
    }


    if (ev === 'obon' || ev === 'hatsumode') {
      var lanterns = [];
      var lanternColor = ev === 'obon' ? '#ff6b35' : '#c41e3a';

      function spawnLantern() {
        lanterns.push({
          x: Math.random() * W(), y: H() + 30,
          size: 10 + Math.random() * 14, speed: 0.3 + Math.random() * 0.6,
          drift: (Math.random() - 0.5) * 0.4,
          flicker: Math.random() * Math.PI * 2,
          alpha: 0.5 + Math.random() * 0.4
        });
      }
      for (var i = 0; i < 12; i++) { spawnLantern(); lanterns[i].y = Math.random() * H(); }

      function tickLanterns() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        var t = Date.now() * 0.002;
        for (var i = lanterns.length - 1; i >= 0; i--) {
          var l = lanterns[i];
          l.y -= l.speed; l.x += l.drift + Math.sin(t + l.flicker) * 0.3;
          if (l.y < -40) { lanterns.splice(i, 1); spawnLantern(); continue; }
          var flick = 0.7 + Math.sin(t * 3 + l.flicker) * 0.3;
          var grd = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.size * 5);
          grd.addColorStop(0, lanternColor); grd.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(l.x, l.y, l.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.globalAlpha = l.alpha * flick * 0.35; ctx.fill();
          ctx.beginPath(); ctx.arc(l.x, l.y, l.size, 0, Math.PI * 2);
          ctx.fillStyle = lanternColor; ctx.globalAlpha = l.alpha * flick; ctx.fill();
          ctx.beginPath(); ctx.arc(l.x, l.y, l.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.globalAlpha = l.alpha * flick * 0.7; ctx.fill();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickLanterns);
      }
      tickLanterns();
      return;
    }


    if (ev === 'anniversary') {
      var confetti = [];
      var confettiColors = ['#a855f7', '#6366f1', '#ec4899', '#fbbf24', '#34d399', '#60a5fa', '#f43f5e', '#fcd34d'];

      function burstConfetti() {
        var cx = Math.random() * W();
        for (var i = 0; i < 50; i++) {
          var angle = Math.random() * Math.PI * 2;
          var speed = 3 + Math.random() * 7;
          confetti.push({
            x: cx, y: H() * 0.2 + Math.random() * H() * 0.4,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
            size: 6 + Math.random() * 10, rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            life: 1, decay: 0.003 + Math.random() * 0.005,
            shape: Math.random() > 0.5 ? 'r' : 'c'
          });
        }
      }

      function tickConfetti() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        for (var i = confetti.length - 1; i >= 0; i--) {
          var c = confetti[i];
          c.x += c.vx; c.y += c.vy; c.vy += 0.05; c.vx *= 0.99;
          c.rotation += c.rotSpeed; c.life -= c.decay;
          if (c.life <= 0) { confetti.splice(i, 1); continue; }
          ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rotation);
          ctx.globalAlpha = c.life; ctx.fillStyle = c.color;
          if (c.shape === 'r') ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
          else { ctx.beginPath(); ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickConfetti);
      }
      burstConfetti();
      window._fxIntervals = window._fxIntervals || [];
      window._fxIntervals.push(setInterval(burstConfetti, 2200));
      tickConfetti();
      return;
    }


    if (ev === 'hinamatsuri') {
      var blossoms = [];
      for (var i = 0; i < 70; i++) {
        blossoms.push({
          x: Math.random() * W(), y: Math.random() * H(),
          size: 5 + Math.random() * 8, speed: 0.5 + Math.random() * 1,
          drift: (Math.random() - 0.5) * 1, rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.03,
          alpha: 0.3 + Math.random() * 0.4,
          color: ['#ffb7c5', '#ff69b4', '#ffc0cb', '#ff91a4'][Math.floor(Math.random() * 4)]
        });
      }

      function tickBlossoms() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        for (var i = 0; i < blossoms.length; i++) {
          var b = blossoms[i];
          b.y += b.speed; b.x += b.drift + Math.sin(Date.now() * 0.001 + i) * 0.4;
          b.rotation += b.rotSpeed;
          if (b.y > H() + 10) { b.y = -10; b.x = Math.random() * W(); }
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rotation);
          ctx.globalAlpha = b.alpha; ctx.fillStyle = b.color;
          for (var p = 0; p < 5; p++) {
            var angle = (Math.PI * 2 / 5) * p;
            var px = Math.cos(angle) * b.size * 0.5, py = Math.sin(angle) * b.size * 0.5;
            ctx.beginPath(); ctx.ellipse(px, py, b.size * 0.5, b.size * 0.3, angle, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.beginPath(); ctx.arc(0, 0, b.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.globalAlpha = b.alpha * 0.9; ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickBlossoms);
      }
      tickBlossoms();
      return;
    }


    if (ev === 'setsubun') {
      var beans = [];
      function throwBeans() {
        var startX = Math.random() > 0.5 ? -10 : W() + 10;
        var dir = startX < 0 ? 1 : -1;
        for (var i = 0; i < 15; i++) {
          beans.push({
            x: startX, y: H() * 0.2 + Math.random() * H() * 0.5,
            vx: dir * (4 + Math.random() * 5), vy: -3 + Math.random() * 6,
            size: 5 + Math.random() * 5, rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.25,
            life: 1, decay: 0.004 + Math.random() * 0.004
          });
        }
      }

      function tickBeans() {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, W(), H());
        for (var i = beans.length - 1; i >= 0; i--) {
          var b = beans[i];
          b.x += b.vx; b.y += b.vy; b.vy += 0.06;
          b.rotation += b.rotSpeed; b.life -= b.decay;
          if (b.life <= 0) { beans.splice(i, 1); continue; }
          ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rotation);
          ctx.globalAlpha = b.life * 0.85;
          ctx.fillStyle = '#c4a35a';
          ctx.beginPath(); ctx.ellipse(0, 0, b.size, b.size * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#8b7640'; ctx.lineWidth = 1; ctx.stroke();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickBeans);
      }
      throwBeans();
      window._fxIntervals = window._fxIntervals || [];
      window._fxIntervals.push(setInterval(throwBeans, 2000));
      tickBeans();
      return;
    }


    if (ev === 'towel-day') {
      var columns = Math.floor(W() / 18);
      var drops = new Array(columns).fill(0);
      var chars = '42DONTPANICdontpanic42'.split('');

      function tickMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, W(), H());
        ctx.fillStyle = '#00e5a0'; ctx.font = 'bold 16px monospace';
        ctx.globalAlpha = 0.5;
        for (var i = 0; i < drops.length; i++) {
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, drops[i] * 18);
          if (drops[i] * 18 > H() && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
        ctx.globalAlpha = 1;
        window._fxRAF = requestAnimationFrame(tickMatrix);
      }
      tickMatrix();
      return;
    }

  })();


  (function initSeasonParticles() {
    var season = document.documentElement.getAttribute('data-season');
    if (!season) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var container = document.createElement('div');
    container.id = 'season-particles';
    document.body.appendChild(container);

    if (season === 'spring') {
      for (var i = 0; i < 30; i++) {
        var petal = document.createElement('span');
        petal.className = 'petal';
        petal.style.left = (Math.random() * 100) + '%';
        petal.style.animationDelay = (Math.random() * 10) + 's';
        petal.style.animationDuration = (8 + Math.random() * 7) + 's';
        var size = 10 + Math.random() * 12;
        petal.style.width = size + 'px';
        petal.style.height = (size * 0.6) + 'px';
        petal.style.opacity = (0.4 + Math.random() * 0.4).toString();
        container.appendChild(petal);
      }
    }

    if (season === 'summer') {
      for (var i = 0; i < 20; i++) {
        var firefly = document.createElement('span');
        firefly.className = 'firefly';
        firefly.style.left = (Math.random() * 100) + '%';
        firefly.style.top = (Math.random() * 100) + '%';
        firefly.style.animationDelay = (Math.random() * 8) + 's';
        firefly.style.animationDuration = (4 + Math.random() * 6) + 's';
        container.appendChild(firefly);
      }
    }

    if (season === 'autumn') {
      var leafColors = ['#d4770b', '#c1440e', '#8b4513', '#cd853f', '#b8860b'];
      for (var i = 0; i < 25; i++) {
        var leaf = document.createElement('span');
        leaf.className = 'leaf';
        leaf.style.left = (Math.random() * 100) + '%';
        leaf.style.animationDelay = (Math.random() * 10) + 's';
        leaf.style.animationDuration = (9 + Math.random() * 8) + 's';
        var lsize = 10 + Math.random() * 10;
        leaf.style.width = lsize + 'px';
        leaf.style.height = lsize + 'px';
        leaf.style.background = leafColors[Math.floor(Math.random() * leafColors.length)];
        leaf.style.opacity = (0.5 + Math.random() * 0.3).toString();
        container.appendChild(leaf);
      }
    }

    if (season === 'winter') {
      for (var i = 0; i < 35; i++) {
        var snow = document.createElement('span');
        snow.className = 'snowflake';
        snow.style.left = (Math.random() * 100) + '%';
        snow.style.animationDelay = (Math.random() * 12) + 's';
        snow.style.animationDuration = (6 + Math.random() * 10) + 's';
        var ssize = 4 + Math.random() * 8;
        snow.style.width = ssize + 'px';
        snow.style.height = ssize + 'px';
        snow.style.opacity = (0.4 + Math.random() * 0.5).toString();
        container.appendChild(snow);
      }
    }
  })();


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


  const nav = document.querySelector('nav');
  const header = document.querySelector('header');


  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav) {
      nav.style.display = 'flex';
    }
  });


  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = 'var(--neon-glow)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = 'none';
    });
  });


  document.querySelectorAll('.cta').forEach(cta => {
    cta.addEventListener('click', () => {
      cta.style.transform = 'scale(0.95)';
      setTimeout(() => {
        cta.style.transform = '';
      }, 150);
    });
  });


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


    const featured = evaluationData.filter(item => item.featured);
    const grouped = {};
    featured.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });


    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => b.rating - a.rating);
      grouped[type] = grouped[type].slice(0, 3);
    });


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


      const seeAll = document.createElement('div');
      seeAll.style.cssText = 'grid-column: 1 / -1; text-align: center; margin-top: 1rem;';
      seeAll.innerHTML = '<a href="/evaluation" class="cta" style="display:inline-block;padding:0.6rem 1.5rem;font-size:0.9rem;">Voir tout le catalogue évalué</a>';
      recoContainer.appendChild(seeAll);
    }
  }


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




  (function initEasterEggEngine() {
    var EE_KEY = 'vs-ee-unlocked';
    var TOTAL_EGGS = 49;

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
      'long-press': '🤝 Poignée Secrète',
      'speed-click': '🎯 Clic Frénétique',
      'circle-draw': '🌀 Cercle Magique',
      'zen-master': '⏳ Maître Zen',
      'double-secret': '🖱️ Double Secret',
      'shake': '🔀 Secousse',
      'drag-drop': '🧲 Drag Master',
      'tab-switch': '🔄 Alt-Tabeur',
      'resize-frenzy': '📐 Redimensionneur',
      'right-click': '🖱️ Clic Droit Fou',
      'select-all': '📋 Tout Sélectionner',
      'copy-cat': '📎 Copieur',
      'zoom-frenzy': '🔎 Zoom Fou',
      'scroll-bottom': '⬇️ Les Abysses',
      'triple-click': '3️⃣ Triple Clic',
      'hover-footer': '🫥 Le Survoleur',
      'keyboard-smash': '⌨️ Pianiste Fou',
      'highlight-text': '✏️ Surligneur',
      'devtools': '🔧 Inspecteur',
      'tab-navigator': '⇥ Tabulateur',
      'home-key': '🚀 Retour Fusée',
      'orientation': '📱 Tête en Bas',
      'print-page': '🖨️ Imprimeur',
      'fullscreen': '🖥️ Plein Écran',
      'offline-hero': '📡 Hors Ligne',
      'multi-key': '🎹 Accord Parfait',
      'corner-master': '🏁 Quatre Coins',
      'speed-nav': '⚡ Navigateur Rapide',
      'rage-click': '😤 Rage Click',
      'arrow-dance': '💃 Danse des Flèches',
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


    (function() {
      var typed = '';
      document.addEventListener('keydown', function(e) {
        if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
        typed += e.key.toLowerCase();
        if (typed.length > 30) typed = typed.slice(-30);


        if (typed.endsWith('circus')) {
          typed = '';
          unlockEgg('circus');
          var s = document.createElement('style');
          s.textContent = '@keyframes vsEeCircus{0%{transform:rotate(0) scale(1)}25%{transform:rotate(5deg) scale(1.02)}50%{transform:rotate(0) scale(0.98)}75%{transform:rotate(-5deg) scale(1.02)}100%{transform:rotate(0) scale(1)}}';
          document.head.appendChild(s);
          document.body.style.animation = 'vsEeCircus 0.5s ease 6';
          setTimeout(function() { document.body.style.animation = ''; s.remove(); }, 5000);
        }


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


    (function() {
      var hour = new Date().getHours();
      if (hour >= 0 && hour < 3) {
        unlockEgg('night-owl');
      }
    })();


    (function() {
      var now = new Date();
      if (now.getMonth() === 8 && now.getDate() === 24) {
        unlockEgg('anniversary');
      }
    })();


    (function() {
      if (new Date().getMinutes() === 42) {
        unlockEgg('perfect-hour');
      }
    })();


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


    (function() {
      var logoEl = document.querySelector('.logo');
      if (!logoEl) return;
      var logoClicks = [];
      logoEl.addEventListener('click', function(e) {
        if (e.target.closest('a[href]')) return;
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


    (function() {
      var copyright = document.querySelector('.copyright');
      if (!copyright) return;
      var timer = null;
      copyright.style.userSelect = 'none';
      copyright.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        timer = setTimeout(function() {
          unlockEgg('long-press');
          copyright.style.transition = 'all 0.5s ease';
          copyright.style.color = '#6366f1';
          copyright.style.textShadow = '0 0 20px rgba(99,102,241,.6)';
          copyright.style.transform = 'scale(1.1)';
          setTimeout(function() {
            copyright.style.color = '';
            copyright.style.textShadow = '';
            copyright.style.transform = '';
            setTimeout(function() { copyright.style.transition = ''; }, 500);
          }, 3000);
        }, 5000);
      });
      copyright.addEventListener('mouseup', function() { clearTimeout(timer); });
      copyright.addEventListener('mouseleave', function() { clearTimeout(timer); });

      copyright.addEventListener('touchstart', function(e) {
        timer = setTimeout(function() {
          unlockEgg('long-press');
          copyright.style.transition = 'all 0.5s ease';
          copyright.style.color = '#6366f1';
          copyright.style.textShadow = '0 0 20px rgba(99,102,241,.6)';
          copyright.style.transform = 'scale(1.1)';
          setTimeout(function() {
            copyright.style.color = '';
            copyright.style.textShadow = '';
            copyright.style.transform = '';
            setTimeout(function() { copyright.style.transition = ''; }, 500);
          }, 3000);
        }, 5000);
      }, { passive: true });
      copyright.addEventListener('touchend', function() { clearTimeout(timer); });
    })();


    (function() {
      var clicks = [];
      document.addEventListener('click', function() {
        clicks.push(Date.now());
        clicks = clicks.filter(function(t) { return Date.now() - t < 3000; });
        if (clicks.length >= 20) {
          clicks = [];
          unlockEgg('speed-click');

          for (var i = 0; i < 30; i++) {
            (function(idx) {
              var p = document.createElement('div');
              var x = Math.random() * window.innerWidth;
              var y = Math.random() * window.innerHeight;
              var colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#22c55e','#ef4444'];
              p.style.cssText = 'position:fixed;width:10px;height:10px;border-radius:50%;pointer-events:none;z-index:9999;left:' + x + 'px;top:' + y + 'px;background:' + colors[idx % colors.length] + ';transition:all 1s ease-out;opacity:1;';
              document.body.appendChild(p);
              requestAnimationFrame(function() {
                p.style.transform = 'translate(' + (Math.random() * 200 - 100) + 'px,' + (Math.random() * 200 - 100) + 'px) scale(0)';
                p.style.opacity = '0';
              });
              setTimeout(function() { p.remove(); }, 1200);
            })(i);
          }
        }
      });
    })();


    (function() {
      var points = [];
      var lastTime = 0;
      document.addEventListener('mousemove', function(e) {
        var now = Date.now();
        if (now - lastTime < 50) return;
        lastTime = now;
        points.push({ x: e.clientX, y: e.clientY, t: now });

        points = points.filter(function(p) { return now - p.t < 2000; });
        if (points.length < 12) return;

        var sumX = 0, sumY = 0;
        for (var i = 0; i < points.length; i++) { sumX += points[i].x; sumY += points[i].y; }
        var cx = sumX / points.length;
        var cy = sumY / points.length;
        var distances = points.map(function(p) {
          return Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy));
        });
        var avgR = distances.reduce(function(a, b) { return a + b; }, 0) / distances.length;
        if (avgR < 40) return;
        var variance = distances.reduce(function(a, d) { return a + (d - avgR) * (d - avgR); }, 0) / distances.length;
        var stdDev = Math.sqrt(variance);

        var start = points[0];
        var end = points[points.length - 1];
        var closeDist = Math.sqrt((start.x - end.x) * (start.x - end.x) + (start.y - end.y) * (start.y - end.y));
        if (stdDev / avgR < 0.3 && closeDist < avgR * 0.8) {
          points = [];
          unlockEgg('circle-draw');

          var ring = document.createElement('div');
          ring.style.cssText = 'position:fixed;border:3px solid #6366f1;border-radius:50%;pointer-events:none;z-index:9999;width:0;height:0;left:' + cx + 'px;top:' + cy + 'px;transform:translate(-50%,-50%);transition:all 1s ease-out;box-shadow:0 0 30px rgba(99,102,241,.5);';
          document.body.appendChild(ring);
          requestAnimationFrame(function() {
            ring.style.width = '300px';
            ring.style.height = '300px';
            ring.style.opacity = '0';
          });
          setTimeout(function() { ring.remove(); }, 1200);
        }
      });
    })();


    (function() {
      var zenTimer = null;
      var ZEN_DELAY = 120000;
      function resetZen() {
        clearTimeout(zenTimer);
        zenTimer = setTimeout(function() {
          unlockEgg('zen-master');
        }, ZEN_DELAY);
      }
      ['mousemove','mousedown','keydown','scroll','touchstart'].forEach(function(evt) {
        document.addEventListener(evt, resetZen, { passive: true });
      });
      resetZen();
    })();


    (function() {
      var footerLinks = document.querySelectorAll('footer a, footer h4');
      var footerTarget = null;
      footerLinks.forEach(function(el) {
        if (el.textContent.trim().toLowerCase().includes('ventistudio')) {
          footerTarget = el;
        }
      });

      if (!footerTarget) footerTarget = document.querySelector('.footer-bottom') || document.querySelector('footer');
      if (!footerTarget) return;
      footerTarget.addEventListener('dblclick', function(e) {
        unlockEgg('double-secret');

        var sGlitch = document.createElement('style');
        sGlitch.textContent = '@keyframes vsEeGlitch{0%{transform:translate(0)}10%{transform:translate(-3px,2px)}20%{transform:translate(3px,-2px)}30%{transform:translate(-2px,-1px)}40%{transform:translate(2px,3px)}50%{transform:translate(-1px,-3px)}60%{transform:translate(3px,1px)}70%{transform:translate(-3px,2px)}80%{transform:translate(1px,-2px)}90%{transform:translate(-2px,3px)}100%{transform:translate(0)}}.vs-ee-glitch{animation:vsEeGlitch .15s linear infinite}.vs-ee-glitch-overlay{position:fixed;inset:0;z-index:9999;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(0deg,rgba(0,255,0,0.03) 0px,rgba(0,255,0,0.03) 1px,transparent 1px,transparent 2px);}';
        document.head.appendChild(sGlitch);
        document.body.classList.add('vs-ee-glitch');
        var glitchOverlay = document.createElement('div');
        glitchOverlay.className = 'vs-ee-glitch-overlay';
        document.body.appendChild(glitchOverlay);
        setTimeout(function() {
          document.body.classList.remove('vs-ee-glitch');
          glitchOverlay.remove();
          sGlitch.remove();
        }, 3000);
      });
    })();


    (function() {
      var positions = [];
      var shakeCount = 0;
      document.addEventListener('mousemove', function(e) {
        var now = Date.now();
        positions.push({ x: e.clientX, t: now });
        positions = positions.filter(function(p) { return now - p.t < 1000; });
        if (positions.length < 4) return;

        var reversals = 0;
        for (var i = 2; i < positions.length; i++) {
          var dx1 = positions[i - 1].x - positions[i - 2].x;
          var dx2 = positions[i].x - positions[i - 1].x;
          if ((dx1 > 10 && dx2 < -10) || (dx1 < -10 && dx2 > 10)) {
            reversals++;
          }
        }
        if (reversals >= 6) {
          positions = [];
          unlockEgg('shake');

          var sShake = document.createElement('style');
          sShake.textContent = '@keyframes vsEeShake{0%,100%{transform:translateX(0)}10%{transform:translateX(-8px) rotate(-0.5deg)}20%{transform:translateX(8px) rotate(0.5deg)}30%{transform:translateX(-6px) rotate(-0.3deg)}40%{transform:translateX(6px) rotate(0.3deg)}50%{transform:translateX(-4px)}60%{transform:translateX(4px)}70%{transform:translateX(-2px)}80%{transform:translateX(2px)}}';
          document.head.appendChild(sShake);
          document.body.style.animation = 'vsEeShake 0.5s ease 4';

          var emojis = ['💥','⚡','🌟','✨','🔥'];
          for (var i = 0; i < 15; i++) {
            (function(idx) {
              var em = document.createElement('div');
              em.textContent = emojis[idx % emojis.length];
              em.style.cssText = 'position:fixed;top:-40px;font-size:1.5rem;pointer-events:none;z-index:9999;left:' + (Math.random() * 100) + 'vw;transition:transform 1.5s ease-in,opacity 1s ease;';
              document.body.appendChild(em);
              setTimeout(function() {
                em.style.transform = 'translateY(' + (window.innerHeight + 60) + 'px) rotate(' + (Math.random() * 360) + 'deg)';
                em.style.opacity = '0';
              }, idx * 80);
              setTimeout(function() { em.remove(); }, 2500);
            })(i);
          }
          setTimeout(function() { document.body.style.animation = ''; sShake.remove(); }, 2500);
        }
      });

      if (window.DeviceMotionEvent) {
        var lastShakeTime = 0;
        window.addEventListener('devicemotion', function(e) {
          var acc = e.accelerationIncludingGravity;
          if (!acc) return;
          var force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
          if (force > 35 && Date.now() - lastShakeTime > 3000) {
            lastShakeTime = Date.now();
            unlockEgg('shake');
          }
        }, { passive: true });
      }
    })();


    (function() {
      var dragging = false;
      var startX = 0, startY = 0;
      document.addEventListener('mousedown', function(e) {
        dragging = true; startX = e.clientX; startY = e.clientY;
      });
      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        var dist = Math.sqrt((e.clientX - startX) * (e.clientX - startX) + (e.clientY - startY) * (e.clientY - startY));
        if (dist > 500) {
          dragging = false;
          unlockEgg('drag-drop');
          var trail = document.createElement('div');
          trail.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);pointer-events:none;z-index:9999;transition:all 0.6s ease;';
          document.body.appendChild(trail);
          requestAnimationFrame(function() { trail.style.transform = 'scale(8)'; trail.style.opacity = '0'; });
          setTimeout(function() { trail.remove(); }, 700);
        }
      });
      document.addEventListener('mouseup', function() { dragging = false; });
    })();


    (function() {
      var switchCount = 0;
      var wasHidden = false;
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) { wasHidden = true; }
        else if (wasHidden) {
          wasHidden = false;
          switchCount++;
          if (switchCount >= 10) {
            switchCount = 0;
            unlockEgg('tab-switch');
            var msg = document.createElement('div');
            msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2rem;font-weight:700;color:#6366f1;z-index:9999;pointer-events:none;text-align:center;animation:eeBounce .8s ease;';
            msg.textContent = '👋 Vous revenez toujours !';
            document.body.appendChild(msg);
            setTimeout(function() { msg.remove(); }, 3000);
          }
        }
      });
    })();


    (function() {
      var resizes = [];
      window.addEventListener('resize', function() {
        resizes.push(Date.now());
        resizes = resizes.filter(function(t) { return Date.now() - t < 10000; });
        if (resizes.length >= 8) {
          resizes = [];
          unlockEgg('resize-frenzy');
          document.body.style.transition = 'border-radius 1s ease';
          document.body.style.borderRadius = '50px';
          document.body.style.overflow = 'hidden';
          setTimeout(function() {
            document.body.style.borderRadius = '';
            setTimeout(function() { document.body.style.transition = ''; document.body.style.overflow = ''; }, 1000);
          }, 3000);
        }
      });
    })();


    (function() {
      var rClicks = [];
      document.addEventListener('contextmenu', function() {
        rClicks.push(Date.now());
        rClicks = rClicks.filter(function(t) { return Date.now() - t < 10000; });
        if (rClicks.length >= 10) {
          rClicks = [];
          unlockEgg('right-click');
          var eyes = document.createElement('div');
          eyes.textContent = '👀';
          eyes.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:6rem;z-index:9999;pointer-events:none;animation:eeBounce .8s ease;';
          document.body.appendChild(eyes);
          setTimeout(function() { eyes.remove(); }, 3000);
        }
      });
    })();


    (function() {
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
          unlockEgg('select-all');
          var flash = document.createElement('div');
          flash.style.cssText = 'position:fixed;inset:0;background:rgba(99,102,241,0.15);z-index:9998;pointer-events:none;opacity:1;transition:opacity 0.5s;';
          document.body.appendChild(flash);
          setTimeout(function() { flash.style.opacity = '0'; }, 100);
          setTimeout(function() { flash.remove(); }, 600);
        }
      });
    })();


    (function() {
      var copies = [];
      document.addEventListener('copy', function() {
        copies.push(Date.now());
        copies = copies.filter(function(t) { return Date.now() - t < 15000; });
        if (copies.length >= 5) {
          copies = [];
          unlockEgg('copy-cat');
          var msg = document.createElement('div');
          msg.textContent = '📋 Tout est copié !';
          msg.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);font-size:1.5rem;font-weight:700;color:#8b5cf6;z-index:9999;pointer-events:none;animation:eeBounce .8s ease;text-shadow:0 0 20px rgba(139,92,246,.5);';
          document.body.appendChild(msg);
          setTimeout(function() { msg.remove(); }, 3000);
        }
      });
    })();


    (function() {
      var zooms = [];
      document.addEventListener('wheel', function(e) {
        if (!e.ctrlKey) return;
        zooms.push(Date.now());
        zooms = zooms.filter(function(t) { return Date.now() - t < 5000; });
        if (zooms.length >= 10) {
          zooms = [];
          unlockEgg('zoom-frenzy');
          var lens = document.createElement('div');
          lens.textContent = '🔍';
          lens.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:8rem;z-index:9999;pointer-events:none;animation:eeBounce .8s ease;';
          document.body.appendChild(lens);
          setTimeout(function() { lens.remove(); }, 3000);
        }
      }, { passive: true });
    })();


    (function() {
      window.addEventListener('scroll', function() {
        var scrollBottom = window.scrollY + window.innerHeight;
        var docHeight = document.documentElement.scrollHeight;
        if (docHeight > window.innerHeight * 2 && scrollBottom >= docHeight - 5) {
          unlockEgg('scroll-bottom');
        }
      });
    })();


    (function() {
      document.addEventListener('click', function(e) {
        if (e.detail >= 3) {
          unlockEgg('triple-click');
          var sp = document.createElement('div');
          sp.textContent = '✨';
          sp.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;font-size:2rem;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);animation:eeBounce .5s ease;';
          document.body.appendChild(sp);
          setTimeout(function() { sp.remove(); }, 800);
        }
      });
    })();


    (function() {
      var footer = document.querySelector('footer');
      if (!footer) return;
      var hoverTimer = null;
      footer.addEventListener('mouseenter', function() {
        hoverTimer = setTimeout(function() {
          unlockEgg('hover-footer');
          footer.style.transition = 'all 1s ease';
          footer.style.boxShadow = '0 -5px 40px rgba(99,102,241,.3)';
          setTimeout(function() {
            footer.style.boxShadow = '';
            setTimeout(function() { footer.style.transition = ''; }, 1000);
          }, 4000);
        }, 30000);
      });
      footer.addEventListener('mouseleave', function() { clearTimeout(hoverTimer); });
    })();


    (function() {
      var ksTimes = [];
      document.addEventListener('keydown', function() {
        ksTimes.push(Date.now());
        ksTimes = ksTimes.filter(function(t) { return Date.now() - t < 3000; });
        if (ksTimes.length >= 30) {
          ksTimes = [];
          unlockEgg('keyboard-smash');
          var sPiano = document.createElement('style');
          sPiano.textContent = '@keyframes vsEePiano{0%{transform:translateX(0)}25%{transform:translateX(-3px)}50%{transform:translateX(3px)}75%{transform:translateX(-1px)}100%{transform:translateX(0)}}';
          document.head.appendChild(sPiano);
          document.body.style.animation = 'vsEePiano 0.1s linear 10';
          var keyChars = '🎵♪♫🎶🎹';
          for (var k = 0; k < 20; k++) {
            (function(idx) {
              var n = document.createElement('div');
              n.textContent = keyChars[idx % keyChars.length];
              n.style.cssText = 'position:fixed;bottom:-40px;font-size:1.5rem;pointer-events:none;z-index:9999;left:' + (Math.random() * 100) + 'vw;transition:transform 2s ease-out,opacity 1.5s ease;';
              document.body.appendChild(n);
              setTimeout(function() { n.style.transform = 'translateY(-' + (window.innerHeight + 80) + 'px) rotate(' + (Math.random() * 360) + 'deg)'; n.style.opacity = '0'; }, idx * 60);
              setTimeout(function() { n.remove(); }, 2500);
            })(k);
          }
          setTimeout(function() { document.body.style.animation = ''; sPiano.remove(); }, 2000);
        }
      });
    })();


    (function() {
      document.addEventListener('mouseup', function() {

        if (isUnlocked('highlight-text')) return;
        var sel = window.getSelection();
        if (sel && sel.toString().length > 200) {
          unlockEgg('highlight-text');
          var flash = document.createElement('div');
          flash.style.cssText = 'position:fixed;inset:0;background:rgba(245,158,11,0.12);z-index:9998;pointer-events:none;opacity:1;transition:opacity 0.8s;';
          document.body.appendChild(flash);
          setTimeout(function() { flash.style.opacity = '0'; }, 200);
          setTimeout(function() { flash.remove(); }, 1000);
        }
      });
    })();


    (function() {
      document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
          unlockEgg('devtools');
        }
      });
    })();


    (function() {
      var tabCount = 0;
      var lastTab = 0;
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          var now = Date.now();
          if (now - lastTab > 30000) tabCount = 0;
          lastTab = now;
          tabCount++;
          if (tabCount >= 20) {
            tabCount = 0;
            unlockEgg('tab-navigator');
            var focusable = document.querySelectorAll('a, button, input, [tabindex]');
            focusable.forEach(function(el) { el.style.outline = '2px solid #6366f1'; el.style.outlineOffset = '2px'; });
            setTimeout(function() {
              focusable.forEach(function(el) { el.style.outline = ''; el.style.outlineOffset = ''; });
            }, 3000);
          }
        }
      });
    })();


    (function() {
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Home' && window.scrollY > 500) {
          unlockEgg('home-key');
          var rocket = document.createElement('div');
          rocket.textContent = '🚀';
          rocket.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);font-size:3rem;z-index:9999;pointer-events:none;transition:transform 1s ease-in,opacity 0.5s ease;';
          document.body.appendChild(rocket);
          requestAnimationFrame(function() {
            rocket.style.transform = 'translateX(-50%) translateY(-' + (window.innerHeight + 100) + 'px)';
            rocket.style.opacity = '0';
          });
          setTimeout(function() { rocket.remove(); }, 1200);
        }
      });
    })();


    (function() {
      var orientChanges = [];
      function onOrientChange() {
        orientChanges.push(Date.now());
        orientChanges = orientChanges.filter(function(t) { return Date.now() - t < 15000; });
        if (orientChanges.length >= 3) {
          orientChanges = [];
          unlockEgg('orientation');
        }
      }
      window.addEventListener('orientationchange', onOrientChange);
      if (screen.orientation) screen.orientation.addEventListener('change', onOrientChange);
    })();


    (function() {
      window.addEventListener('beforeprint', function() { unlockEgg('print-page'); });
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') unlockEgg('print-page');
      });
    })();


    (function() {
      document.addEventListener('fullscreenchange', function() {
        if (document.fullscreenElement) {
          unlockEgg('fullscreen');
          var msg = document.createElement('div');
          msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:4rem;z-index:9999;pointer-events:none;animation:eeBounce .8s ease;';
          msg.textContent = '🖥️';
          document.body.appendChild(msg);
          setTimeout(function() { msg.remove(); }, 2000);
        }
      });
    })();


    (function() {
      var wasOffline = false;
      window.addEventListener('offline', function() { wasOffline = true; });
      window.addEventListener('online', function() {
        if (wasOffline) {
          wasOffline = false;
          unlockEgg('offline-hero');
          var msg = document.createElement('div');
          msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:#22c55e;z-index:9999;pointer-events:none;animation:eeBounce .8s ease;text-shadow:0 0 20px rgba(34,197,94,.5);';
          msg.textContent = '📡 Connexion retrouvée !';
          document.body.appendChild(msg);
          setTimeout(function() { msg.remove(); }, 3000);
        }
      });
    })();


    (function() {
      var held = {};
      var heldCount = 0;
      document.addEventListener('keydown', function(e) {
        if (!held[e.key]) { held[e.key] = true; heldCount++; }
        if (heldCount >= 5) {
          unlockEgg('multi-key');
          document.body.style.outline = '4px solid #6366f1';
          document.body.style.transition = 'outline-color 0.3s';
          setTimeout(function() { document.body.style.outlineColor = '#ec4899'; }, 200);
          setTimeout(function() { document.body.style.outlineColor = '#f59e0b'; }, 400);
          setTimeout(function() { document.body.style.outlineColor = '#22c55e'; }, 600);
          setTimeout(function() { document.body.style.outline = ''; document.body.style.transition = ''; }, 1500);
        }
      });
      document.addEventListener('keyup', function(e) { if (held[e.key]) { delete held[e.key]; heldCount--; } });
      window.addEventListener('blur', function() { held = {}; heldCount = 0; });
    })();


    (function() {
      var corners = { tl: false, tr: false, bl: false, br: false };
      var MARGIN = 30;
      document.addEventListener('mousemove', function(e) {
        var w = window.innerWidth, h = window.innerHeight;
        if (e.clientX < MARGIN && e.clientY < MARGIN) corners.tl = true;
        if (e.clientX > w - MARGIN && e.clientY < MARGIN) corners.tr = true;
        if (e.clientX < MARGIN && e.clientY > h - MARGIN) corners.bl = true;
        if (e.clientX > w - MARGIN && e.clientY > h - MARGIN) corners.br = true;
        if (corners.tl && corners.tr && corners.bl && corners.br) {
          corners = { tl: false, tr: false, bl: false, br: false };
          unlockEgg('corner-master');
          [{t:'0',l:'0'},{t:'0',r:'0'},{b:'0',l:'0'},{b:'0',r:'0'}].forEach(function(pos) {
            var glow = document.createElement('div');
            var css = 'position:fixed;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.6),transparent);pointer-events:none;z-index:9999;transition:opacity 1s;';
            if (pos.t !== undefined) css += 'top:' + pos.t + ';';
            if (pos.b !== undefined) css += 'bottom:' + pos.b + ';';
            if (pos.l !== undefined) css += 'left:' + pos.l + ';';
            if (pos.r !== undefined) css += 'right:' + pos.r + ';';
            glow.style.cssText = css;
            document.body.appendChild(glow);
            setTimeout(function() { glow.style.opacity = '0'; }, 500);
            setTimeout(function() { glow.remove(); }, 1500);
          });
        }
      });
    })();


    (function() {
      var NAV_KEY = 'vs-ee-speed-nav';
      var navData;
      try { navData = JSON.parse(sessionStorage.getItem(NAV_KEY) || '[]'); } catch(e) { navData = []; }
      navData.push(Date.now());
      navData = navData.filter(function(t) { return Date.now() - t < 15000; });
      sessionStorage.setItem(NAV_KEY, JSON.stringify(navData));
      if (navData.length >= 5) unlockEgg('speed-nav');
    })();


    (function() {
      var rageClicks = [];
      document.addEventListener('click', function(e) {
        var now = Date.now();
        rageClicks.push({ x: e.clientX, y: e.clientY, t: now });
        rageClicks = rageClicks.filter(function(c) { return now - c.t < 2000; });
        if (rageClicks.length >= 10) {
          var cx = rageClicks[0].x, cy = rageClicks[0].y;
          var allNear = true;
          for (var j = 0; j < rageClicks.length; j++) {
            if (Math.abs(rageClicks[j].x - cx) > 30 || Math.abs(rageClicks[j].y - cy) > 30) { allNear = false; break; }
          }
          if (allNear) {
            rageClicks = [];
            unlockEgg('rage-click');
            var boom = document.createElement('div');
            boom.textContent = '💢';
            boom.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;font-size:5rem;z-index:9999;pointer-events:none;transform:translate(-50%,-50%) scale(0);transition:transform 0.4s ease-out,opacity 0.5s;';
            document.body.appendChild(boom);
            requestAnimationFrame(function() { boom.style.transform = 'translate(-50%,-50%) scale(1.5)'; });
            setTimeout(function() { boom.style.opacity = '0'; }, 600);
            setTimeout(function() { boom.remove(); }, 1100);
          }
        }
      });
    })();


    (function() {
      var arrowSeq = ['ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ArrowUp','ArrowDown'];
      var arrowPos = 0;
      document.addEventListener('keydown', function(e) {
        if (e.key === arrowSeq[arrowPos]) {
          arrowPos++;
          if (arrowPos >= arrowSeq.length) {
            arrowPos = 0;
            unlockEgg('arrow-dance');
            var sArrow = document.createElement('style');
            sArrow.textContent = '@keyframes vsEeDance{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(-20px) rotate(10deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(-15px) rotate(-10deg)}100%{transform:translateY(0) rotate(0)}}';
            document.head.appendChild(sArrow);
            var dancers = ['💃','🕺'];
            for (var d = 0; d < 6; d++) {
              (function(idx) {
                var el = document.createElement('div');
                el.textContent = dancers[idx % 2];
                el.style.cssText = 'position:fixed;bottom:0;font-size:3rem;z-index:9999;pointer-events:none;left:' + (10 + idx * 15) + '%;animation:vsEeDance 0.6s ease infinite;animation-delay:' + (idx * 0.1) + 's;';
                document.body.appendChild(el);
                setTimeout(function() { el.remove(); }, 4000);
              })(d);
            }
            setTimeout(function() { sArrow.remove(); }, 4100);
          }
        } else if (e.key.startsWith('Arrow')) {
          arrowPos = (e.key === arrowSeq[0]) ? 1 : 0;
        }
      });
    })();

  })();

});

const CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsudmVudGlzdHVkaW8uZXUk';

const userButtonContainer = document.getElementById('user-button');

(async function initClerk() {
  if (!userButtonContainer) return;


  var _host = window.location.hostname;
  if (_host !== 'ventistudio.eu' && !_host.endsWith('.ventistudio.eu')) {
    console.warn('Clerk: domaine non autorisé (' + _host + ') — fallback activé');
    showFallbackButton();
    return;
  }


  if (typeof window.Clerk === 'undefined') {

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

(function initAfkDetector() {
  var STORAGE_KEY = 'afk-disabled';
  var IDLE_DELAY  = 5 * 60 * 1000;
  var TICK        = 30 * 1000;

  if (localStorage.getItem(STORAGE_KEY) === '1') return;

  var lastActivity = Date.now();
  var overlay = null;
  var shown   = false;
  var graceTimer = null;
  var GRACE_DELAY = 5 * 1000;

  function activity() {
    lastActivity = Date.now();
    if (shown && graceTimer === null) {

      graceTimer = setTimeout(function() { graceTimer = null; hide(); }, GRACE_DELAY);
    }
  }

  function clearGrace() {
    if (graceTimer !== null) { clearTimeout(graceTimer); graceTimer = null; }
  }

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'afk-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', 'Vous êtes inactif');
    overlay.innerHTML =
      '<div class="afk-card">' +
        '<div class="afk-emoji" aria-hidden="true">💤</div>' +
        '<h2 class="afk-title">Toujours là ?</h2>' +
        '<p class="afk-text">Vous semblez inactif depuis un moment. Bougez la souris ou appuyez sur une touche pour reprendre.</p>' +
        '<div class="afk-actions">' +
          '<button type="button" class="afk-btn afk-btn-primary" id="afk-resume">Je suis là</button>' +
          '<button type="button" class="afk-btn afk-btn-ghost"  id="afk-disable">Ne plus me montrer ça</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#afk-resume').addEventListener('click', function() {
      clearGrace();
      lastActivity = Date.now();
      hide();
    });
    overlay.querySelector('#afk-disable').addEventListener('click', function() {
      clearGrace();
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      cleanup();
    });
    return overlay;
  }

  function show() {
    if (shown) return;
    build();
    overlay.classList.add('is-visible');
    shown = true;
  }
  function hide() {
    if (!shown || !overlay) return;
    clearGrace();
    overlay.classList.remove('is-visible');
    shown = false;
  }
  function cleanup() {
    clearGrace();
    hide();
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
    ['mousemove','mousedown','keydown','touchstart','scroll','wheel','focus'].forEach(function(ev) {
      window.removeEventListener(ev, activity, true);
    });
    document.removeEventListener('visibilitychange', onVisibility);
    clearInterval(timerId);
  }

  function check() {
    if (document.hidden) return;
    if (Date.now() - lastActivity >= IDLE_DELAY) show();
  }

  function onVisibility() { if (!document.hidden) activity(); }

  ['mousemove','mousedown','keydown','touchstart','scroll','wheel','focus'].forEach(function(ev) {
    window.addEventListener(ev, activity, { capture: true, passive: true });
  });
  document.addEventListener('visibilitychange', onVisibility);


  if (!document.getElementById('afk-style')) {
    var st = document.createElement('style');
    st.id = 'afk-style';
    st.textContent = [
      '#afk-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,10,18,0.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);z-index:99998;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s ease;padding:1rem}',
      '#afk-overlay.is-visible{opacity:1;visibility:visible}',
      '#afk-overlay .afk-card{max-width:420px;width:100%;text-align:center;padding:2rem 1.75rem;border-radius:1.25rem;background:var(--glass-bg,rgba(255,255,255,0.08));border:1px solid var(--glass-border,rgba(255,255,255,0.18));box-shadow:0 20px 60px rgba(0,0,0,.45);color:var(--text-primary,#fff);transform:translateY(8px) scale(.98);transition:transform .35s ease}',
      '#afk-overlay.is-visible .afk-card{transform:translateY(0) scale(1)}',
      '#afk-overlay .afk-emoji{font-size:3rem;line-height:1;margin-bottom:.5rem;animation:afkPulse 2.4s ease-in-out infinite}',
      '#afk-overlay .afk-title{font-size:1.4rem;margin:0 0 .5rem}',
      '#afk-overlay .afk-text{margin:0 0 1.25rem;color:var(--text-secondary,rgba(255,255,255,.78));font-size:.95rem;line-height:1.55}',
      '#afk-overlay .afk-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:.6rem}',
      '#afk-overlay .afk-btn{font:inherit;cursor:pointer;padding:.6rem 1.1rem;border-radius:.7rem;border:1px solid transparent;transition:transform .15s,filter .2s,background .2s,color .2s}',
      '#afk-overlay .afk-btn-primary{background:linear-gradient(135deg,var(--accent,#6366f1),#8b5cf6);color:#fff;font-weight:600}',
      '#afk-overlay .afk-btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px)}',
      '#afk-overlay .afk-btn-ghost{background:transparent;color:var(--text-secondary,rgba(255,255,255,.7));border-color:var(--glass-border,rgba(255,255,255,.18))}',
      '#afk-overlay .afk-btn-ghost:hover{color:var(--text-primary,#fff);border-color:rgba(255,255,255,.4)}',
      '@keyframes afkPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.75}}',
      '@media (prefers-reduced-motion: reduce){#afk-overlay,#afk-overlay .afk-card,#afk-overlay .afk-emoji{transition:none;animation:none}}'
    ].join('\n');
    document.head.appendChild(st);
  }

  var timerId = setInterval(check, TICK);


  window.VentiAfk = {
    reset: function() { try { localStorage.removeItem(STORAGE_KEY); } catch(_) {} },
    trigger: show,
    dismiss: hide
  };
})();
