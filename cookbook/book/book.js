(function () {
  'use strict';

  const container = document.getElementById('recipe-content');
  const params = new URLSearchParams(window.location.search);
  const cookId = params.get('cook');


  if (!window.cookbookSystem) {
    container.innerHTML = errorHTML('Erreur système', 'Les données du livre de cuisine ne sont pas disponibles.');
    return;
  }
  if (!cookId) {
    container.innerHTML = errorHTML('Recette introuvable', 'Aucun identifiant de recette n\'a été fourni.');
    return;
  }

  const recipe = window.cookbookSystem.getById(cookId);
  if (!recipe) {
    container.innerHTML = errorHTML('Recette introuvable', `La recette \u00ab ${sanitize(cookId)} \u00bb n'existe pas dans notre livre.`);
    return;
  }


  document.title = `${recipe.title} | Le Livre de Cuisine`;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${recipe.title} Le Livre de Cuisine VentiStudio`;


  let servings = recipe.defaultServings;
  const stepsDone = new Array(recipe.steps.length).fill(false);
  let semiAuto = false;
  const timers = {};


  render();

  function render() {
    const allRecipes = window.cookbookSystem.getAll();
    const idx = allRecipes.findIndex(r => r.id === recipe.id);
    const prev = idx > 0 ? allRecipes[idx - 1] : null;
    const next = idx < allRecipes.length - 1 ? allRecipes[idx + 1] : null;

    container.innerHTML = `
      <!-- Breadcrumb -->
      <nav class="book-breadcrumb" aria-label="Fil d'Ariane">
        <a href="/cookbook/">🍳 Le Livre de Cuisine</a>
        <span>›</span>
        <a href="/cookbook/#${recipe.category}">${recipe.categoryLabel}</a>
        <span>›</span>
        <span>${recipe.title}</span>
      </nav>

      <!-- En-tête -->
      <section class="book-header">
        <div class="book-header-inner">
          <div class="book-title-row">
            <span class="book-emoji">${recipe.emoji}</span>
            <h1>${recipe.title}</h1>
          </div>
          <p class="book-description">${recipe.description}</p>
          <div class="book-meta">
            <span class="book-meta-item">⏱️ ${recipe.totalTime}</span>
            <span class="book-meta-item">👨‍🍳 ${recipe.difficulty}</span>
            <span class="book-meta-item">📂 ${recipe.categoryLabel}</span>
          </div>
        </div>
      </section>

      <!-- Portions -->
      <section class="book-servings" aria-label="Nombre de portions">
        <div class="servings-control">
          <label>🍽️ Pour</label>
          <button class="servings-btn" id="srv-minus" aria-label="Moins de portions">−</button>
          <span class="servings-value" id="srv-value">${servings}</span>
          <button class="servings-btn" id="srv-plus" aria-label="Plus de portions">+</button>
          <span class="servings-unit">${recipe.servingsUnit}</span>
        </div>
      </section>

      <!-- Semi-auto -->
      <section class="book-semiauto" aria-label="Mode minuteur">
        <div class="semiauto-bar">
          <label>
            <input type="checkbox" id="semiauto-toggle">
            ⏱️ Minuteur Semi-Auto
          </label>
          <span class="semiauto-info">Lance automatiquement le minuteur de l'étape suivante</span>
        </div>
      </section>

      <!-- Progression -->
      <section class="book-progress" aria-label="Progression">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progress-fill"></div>
        </div>
        <div class="progress-label" id="progress-label">0 / ${recipe.steps.length} étapes</div>
      </section>

      <!-- Corps -->
      <div class="book-body">
        <!-- Ingrédients -->
        <aside class="book-ingredients">
          <h2>🧾 Ingrédients</h2>
          <ul class="ingredient-list" id="ingredient-list">
            ${renderIngredients()}
          </ul>
        </aside>

        <!-- Étapes -->
        <section class="book-steps" aria-label="Étapes de la recette">
          <h2>📝 Préparation</h2>
          ${recipe.steps.map((s, i) => renderStep(s, i)).join('')}
        </section>
      </div>

      <!-- Navigation -->
      <nav class="book-nav" aria-label="Navigation recettes">
        ${prev ? `<a href="/cookbook/book/?cook=${prev.id}">← ${prev.title}</a>` : '<span></span>'}
        ${next ? `<a href="/cookbook/book/?cook=${next.id}">${next.title} →</a>` : '<span></span>'}
      </nav>
    `;


    if (!document.getElementById('timer-float')) {
      const float = document.createElement('div');
      float.className = 'book-timer-float';
      float.id = 'timer-float';
      float.innerHTML = `
        <div class="timer-float-header">
          <span class="timer-float-label" id="tf-label">Minuteur</span>
          <button class="timer-float-close" id="tf-close" aria-label="Fermer">✕</button>
        </div>
        <div class="timer-float-time" id="tf-time">00:00</div>
        <div class="timer-float-step" id="tf-step"></div>
        <div class="timer-float-actions">
          <button id="tf-pause">⏸ Pause</button>
          <button id="tf-reset">🔄 Reset</button>
        </div>
      `;
      document.body.appendChild(float);
    }

    bindEvents();
    updateProgress();
  }


  function renderIngredients() {
    const ratio = servings / recipe.defaultServings;
    return recipe.ingredients.map(ing => {
      const qty = ing.qty * ratio;
      const display = qty % 1 === 0 ? qty : qty.toFixed(1);
      return `<li><span class="ingredient-qty">${display}</span><span class="ingredient-unit">${ing.unit}</span> ${sanitize(ing.name)}</li>`;
    }).join('');
  }


  function renderStep(step, idx) {
    const timerHTML = step.timer ? `
      <div class="step-timer-row">
        <button class="step-timer-btn" data-step="${idx}" data-time="${step.timer}">
          ⏱️ ${formatTime(step.timer)}
        </button>
        <span class="step-timer-display" id="timer-display-${idx}"></span>
      </div>
    ` : '';

    return `
      <div class="step-card${stepsDone[idx] ? ' done' : ''}" data-step="${idx}">
        <div class="step-check">${stepsDone[idx] ? '✓' : idx + 1}</div>
        <div class="step-body">
          <div class="step-text">${sanitize(step.text)}</div>
          ${timerHTML}
        </div>
      </div>
    `;
  }


  function bindEvents() {

    document.getElementById('srv-minus').addEventListener('click', () => {
      if (servings > 1) { servings--; updateServings(); }
    });
    document.getElementById('srv-plus').addEventListener('click', () => {
      if (servings < 50) { servings++; updateServings(); }
    });


    document.getElementById('semiauto-toggle').addEventListener('change', function () {
      semiAuto = this.checked;
    });


    document.querySelectorAll('.step-card').forEach(card => {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.step-timer-btn')) return;
        const idx = parseInt(this.dataset.step);
        stepsDone[idx] = !stepsDone[idx];
        this.classList.toggle('done');
        this.querySelector('.step-check').textContent = stepsDone[idx] ? '✓' : (idx + 1);
        this.querySelector('.step-text').style.textDecoration = stepsDone[idx] ? 'line-through' : 'none';
        updateProgress();

        if (stepsDone[idx] && semiAuto) {
          autoStartNext(idx);
        }
      });
    });


    document.querySelectorAll('.step-timer-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const idx = parseInt(this.dataset.step);
        const time = parseInt(this.dataset.time);
        toggleTimer(idx, time, this);
      });
    });


    const tfClose = document.getElementById('tf-close');
    const tfPause = document.getElementById('tf-pause');
    const tfReset = document.getElementById('tf-reset');

    if (tfClose) tfClose.addEventListener('click', () => {
      stopAllTimers();
      document.getElementById('timer-float').classList.remove('visible');
    });

    if (tfPause) tfPause.addEventListener('click', () => {
      const active = getActiveTimer();
      if (active !== null) {
        const t = timers[active];
        if (t.paused) {
          t.paused = false;
          t.interval = setInterval(() => tickTimer(active), 1000);
          tfPause.textContent = '⏸ Pause';
        } else {
          t.paused = true;
          clearInterval(t.interval);
          tfPause.textContent = '▶ Reprendre';
        }
      }
    });

    if (tfReset) tfReset.addEventListener('click', () => {
      const active = getActiveTimer();
      if (active !== null) {
        const t = timers[active];
        clearInterval(t.interval);
        t.remaining = t.original;
        t.paused = false;
        t.interval = setInterval(() => tickTimer(active), 1000);
        updateTimerDisplays(active);
        const tfPauseBtn = document.getElementById('tf-pause');
        if (tfPauseBtn) tfPauseBtn.textContent = '⏸ Pause';
      }
    });
  }


  function updateServings() {
    document.getElementById('srv-value').textContent = servings;
    document.getElementById('srv-minus').disabled = servings <= 1;
    document.getElementById('srv-plus').disabled = servings >= 50;
    document.getElementById('ingredient-list').innerHTML = renderIngredients();
  }


  function updateProgress() {
    const done = stepsDone.filter(Boolean).length;
    const total = stepsDone.length;
    const pct = Math.round((done / total) * 100);
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-label').textContent = `${done} / ${total} étapes — ${pct}%`;
  }


  function toggleTimer(idx, time, btn) {
    if (timers[idx]) {
      clearInterval(timers[idx].interval);
      delete timers[idx];
      btn.classList.remove('active');
      btn.textContent = `⏱️ ${formatTime(time)}`;
      document.getElementById(`timer-display-${idx}`).textContent = '';
      if (getActiveTimer() === null) {
        document.getElementById('timer-float').classList.remove('visible');
      }
      return;
    }

    timers[idx] = {
      interval: setInterval(() => tickTimer(idx), 1000),
      remaining: time,
      original: time,
      paused: false
    };
    btn.classList.add('active');
    updateTimerDisplays(idx);
    showFloat(idx);
  }

  function tickTimer(idx) {
    const t = timers[idx];
    if (!t || t.paused) return;
    t.remaining--;

    updateTimerDisplays(idx);

    if (t.remaining <= 0) {
      clearInterval(t.interval);
      timerDone(idx);
    }
  }

  function updateTimerDisplays(idx) {
    const t = timers[idx];
    if (!t) return;
    const display = document.getElementById(`timer-display-${idx}`);
    if (display) {
      display.textContent = formatTime(t.remaining);
      display.classList.toggle('warning', t.remaining <= 10);
    }

    const floatEl = document.getElementById('timer-float');
    if (floatEl.classList.contains('visible')) {
      const active = getActiveTimer();
      if (active === idx) {
        document.getElementById('tf-time').textContent = formatTime(t.remaining);
        document.getElementById('tf-time').classList.toggle('warning', t.remaining <= 10);
      }
    }
  }

  function timerDone(idx) {
    const btn = document.querySelector(`.step-timer-btn[data-step="${idx}"]`);
    if (btn) {
      btn.classList.remove('active');
      btn.textContent = '✅ Terminé !';
    }
    const display = document.getElementById(`timer-display-${idx}`);
    if (display) {
      display.textContent = '✅';
      display.classList.remove('warning');
    }
    delete timers[idx];


    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 350);
    } catch (e) {  }

    if (getActiveTimer() === null) {
      document.getElementById('timer-float').classList.remove('visible');
    }


    if (semiAuto) {
      stepsDone[idx] = true;
      const card = document.querySelector(`.step-card[data-step="${idx}"]`);
      if (card) {
        card.classList.add('done');
        card.querySelector('.step-check').textContent = '✓';
        card.querySelector('.step-text').style.textDecoration = 'line-through';
      }
      updateProgress();
      autoStartNext(idx);
    }
  }

  function autoStartNext(fromIdx) {
    for (let i = fromIdx + 1; i < recipe.steps.length; i++) {
      if (!stepsDone[i] && recipe.steps[i].timer) {
        const btn = document.querySelector(`.step-timer-btn[data-step="${i}"]`);
        if (btn && !timers[i]) {
          toggleTimer(i, recipe.steps[i].timer, btn);
        }
        return;
      }
    }
  }

  function showFloat(idx) {
    const floatEl = document.getElementById('timer-float');
    const t = timers[idx];
    if (!t) return;
    document.getElementById('tf-label').textContent = `Étape ${idx + 1}`;
    document.getElementById('tf-time').textContent = formatTime(t.remaining);
    document.getElementById('tf-step').textContent = recipe.steps[idx].text.substring(0, 80) + (recipe.steps[idx].text.length > 80 ? '…' : '');
    const tfPause = document.getElementById('tf-pause');
    if (tfPause) tfPause.textContent = '⏸ Pause';
    floatEl.classList.add('visible');
  }

  function getActiveTimer() {
    const keys = Object.keys(timers);
    return keys.length > 0 ? parseInt(keys[keys.length - 1]) : null;
  }

  function stopAllTimers() {
    Object.keys(timers).forEach(idx => {
      clearInterval(timers[idx].interval);
      const btn = document.querySelector(`.step-timer-btn[data-step="${idx}"]`);
      if (btn) {
        btn.classList.remove('active');
        btn.textContent = `⏱️ ${formatTime(timers[idx].original)}`;
      }
      const display = document.getElementById(`timer-display-${idx}`);
      if (display) display.textContent = '';
      delete timers[idx];
    });
  }


  function formatTime(s) {
    if (s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function sanitize(str) {
    const el = document.createElement('div');
    el.textContent = str;
    return el.innerHTML;
  }

  function errorHTML(title, msg) {
    return `
      <div class="book-error">
        <div class="book-error-icon">😕</div>
        <h2>${title}</h2>
        <p>${msg}</p>
        <a href="/cookbook/" class="btn-cook">← Retour au Livre de Cuisine</a>
      </div>
    `;
  }
})();
