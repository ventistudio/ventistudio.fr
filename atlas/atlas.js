(function () {
  if (typeof atlasData === 'undefined') return;

  var tbody = document.getElementById('atlas-tbody');
  var grid = document.getElementById('atlas-grid');
  var tableWrapper = document.getElementById('atlas-table-wrapper');
  var noResults = document.getElementById('no-results');
  var resultsCount = document.getElementById('results-count');

  var searchInput = document.getElementById('search-input');
  var sortSelect = document.getElementById('sort-select');
  var continentSelect = document.getElementById('continent-select');
  var levelSelect = document.getElementById('level-select');
  var viewButtons = document.querySelectorAll('.view-toggle button');

  if (!tbody || !grid) return;

  var levelLabels = { 5: 'Excellent', 4: 'Bon', 3: 'Modéré', 2: 'Préoccupant', 1: 'Critique' };
  var criteriaLabels = {
    freedom: 'Liberté',
    hostility: 'Pacifisme',
    security: 'Sécurité',
    rights: 'Droits humains',
    stability: 'Stabilité'
  };
  var continentLabels = {
    'europe': 'Europe',
    'asia': 'Asie',
    'africa': 'Afrique',
    'north-america': 'Amér. du Nord',
    'south-america': 'Amér. du Sud',
    'oceania': 'Océanie'
  };

  var REASONS = (typeof atlasReasons !== 'undefined') ? atlasReasons : {};
  var CRITERIA_REASONS = (typeof atlasCriteriaReasons !== 'undefined') ? atlasCriteriaReasons : {};
  var CRITERIA_KEYS = ['freedom', 'hostility', 'security', 'rights', 'stability'];

  var currentView = (function () {
    try { return localStorage.getItem('atlas-view') || 'cards'; }
    catch (e) { return 'cards'; }
  })();

  function getOverall(c) {
    return (c.freedom + c.hostility + c.security + c.rights + c.stability) / 5;
  }
  function getOverallLevel(c) {
    return Math.round(getOverall(c));
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getFlagEmoji(code) {
    if (!code || code.length < 2) return '🏳️';
    if (code === 'XK') return '🏳️';
    var pts = code.toUpperCase().split('').map(function (c) {
      return 0x1F1E6 + c.charCodeAt(0) - 65;
    });
    return String.fromCodePoint.apply(null, pts);
  }

  function createLevelBadge(level) {
    var s = document.createElement('span');
    s.className = 'level-badge level-' + level;
    s.textContent = level + '/5';
    s.title = levelLabels[level] || '';
    return s;
  }

  function updateQuickStats() {
    var total = atlasData.length;
    var excellent = atlasData.filter(function (c) { return getOverallLevel(c) === 5; }).length;
    var critical = atlasData.filter(function (c) { return getOverallLevel(c) === 1; }).length;
    var avg = total ? (atlasData.reduce(function (s, c) { return s + getOverall(c); }, 0) / total) : 0;

    setText('qs-total', total);
    setText('qs-excellent', excellent);
    setText('qs-critical', critical);
    setText('qs-avg', avg.toFixed(2) + '/5');
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderTable(data) {
    tbody.innerHTML = '';
    var frag = document.createDocumentFragment();

    data.forEach(function (c, i) {
      var tr = document.createElement('tr');
      var overall = getOverall(c);
      var overallLevel = Math.round(overall);

      tr.innerHTML =
        '<td class="country-rank">' + (i + 1) + '</td>' +
        '<td class="country-name"><span class="country-flag" aria-hidden="true">' + getFlagEmoji(c.code) + '</span>' + escapeHtml(c.name) + '</td>' +
        '<td>' + (continentLabels[c.continent] || c.continent) + '</td>' +
        '<td></td><td></td><td></td><td></td><td></td>' +
        '<td class="overall-cell"></td>';

      var cells = tr.children;
      cells[3].appendChild(createLevelBadge(c.freedom));
      cells[4].appendChild(createLevelBadge(c.hostility));
      cells[5].appendChild(createLevelBadge(c.security));
      cells[6].appendChild(createLevelBadge(c.rights));
      cells[7].appendChild(createLevelBadge(c.stability));

      var ob = document.createElement('span');
      ob.className = 'level-badge level-' + overallLevel + ' overall-badge';
      ob.textContent = overall.toFixed(1) + '/5';
      ob.title = levelLabels[overallLevel] || '';
      cells[8].appendChild(ob);

      tr.tabIndex = 0;
      tr.setAttribute('role', 'button');
      tr.setAttribute('aria-label', 'Voir les détails  ' + c.name);
      tr.addEventListener('click', function () { openCountryModal(c); });
      tr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCountryModal(c);
        }
      });

      frag.appendChild(tr);
    });

    tbody.appendChild(frag);
  }

  function renderCards(data) {
    grid.innerHTML = '';
    var frag = document.createDocumentFragment();

    data.forEach(function (c, i) {
      var overall = getOverall(c);
      var overallLevel = Math.round(overall);

      var card = document.createElement('article');
      card.className = 'atlas-card lvl-' + overallLevel;

      var bars = ['freedom', 'hostility', 'security', 'rights', 'stability'].map(function (k) {
        var v = c[k];
        var pct = (v / 5) * 100;
        return '' +
          '<div class="card-bar">' +
            '<span class="card-bar-label">' + criteriaLabels[k] + '</span>' +
            '<span class="card-bar-track"><span class="card-bar-fill f-' + v + '" style="width:' + pct + '%"></span></span>' +
            '<span class="card-bar-value">' + v + '/5</span>' +
          '</div>';
      }).join('');

      card.innerHTML =
        '<div class="card-head">' +
          '<span class="card-flag" aria-hidden="true">' + getFlagEmoji(c.code) + '</span>' +
          '<div class="card-name">' +
            '<h3>' + escapeHtml(c.name) + '</h3>' +
            '<div class="card-meta">' +
              '<span class="rank">#' + (i + 1) + '</span>' +
              '<span aria-hidden="true">·</span>' +
              '<span class="continent">' + (continentLabels[c.continent] || c.continent) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="card-overall" title="' + (levelLabels[overallLevel] || '') + '">' +
            '<span class="card-overall-value">' + overall.toFixed(1) + '</span>' +
            '<span class="card-overall-label">/5 global</span>' +
          '</div>' +
        '</div>' +
        '<div class="card-bars">' + bars + '</div>' +
        '<div class="card-hint" aria-hidden="true">Cliquer pour voir le détail des notes →</div>';

      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Voir les détails  ' + c.name);
      card.addEventListener('click', function () { openCountryModal(c); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCountryModal(c);
        }
      });

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  function getFilteredAndSorted() {
    var search = (searchInput.value || '').trim().toLowerCase();
    var continent = continentSelect.value;
    var level = levelSelect.value;
    var sort = sortSelect.value;

    var filtered = atlasData.filter(function (c) {
      if (search && c.name.toLowerCase().indexOf(search) === -1) return false;
      if (continent !== 'all' && c.continent !== continent) return false;
      if (level !== 'all' && getOverallLevel(c) !== parseInt(level, 10)) return false;
      return true;
    });

    var byName = function (a, b) { return a.name.localeCompare(b.name, 'fr'); };
    filtered.sort(function (a, b) {
      switch (sort) {
        case 'name': return byName(a, b);
        case 'name-desc': return byName(b, a);
        case 'overall-desc': return getOverall(b) - getOverall(a) || byName(a, b);
        case 'overall-asc': return getOverall(a) - getOverall(b) || byName(a, b);
        case 'freedom-desc': return b.freedom - a.freedom || byName(a, b);
        case 'freedom-asc': return a.freedom - b.freedom || byName(a, b);
        case 'hostility-desc': return b.hostility - a.hostility || byName(a, b);
        case 'hostility-asc': return a.hostility - b.hostility || byName(a, b);
        case 'security-desc': return b.security - a.security || byName(a, b);
        case 'security-asc': return a.security - b.security || byName(a, b);
        case 'rights-desc': return b.rights - a.rights || byName(a, b);
        case 'rights-asc': return a.rights - b.rights || byName(a, b);
        case 'stability-desc': return b.stability - a.stability || byName(a, b);
        case 'stability-asc': return a.stability - b.stability || byName(a, b);
        default: return 0;
      }
    });

    return filtered;
  }

  function applyView() {
    viewButtons.forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === currentView);
      b.setAttribute('aria-pressed', b.dataset.view === currentView ? 'true' : 'false');
    });
    if (currentView === 'cards') {
      grid.hidden = false;
      tableWrapper.hidden = true;
    } else {
      grid.hidden = true;
      tableWrapper.hidden = false;
    }
  }

  function refresh() {
    var data = getFilteredAndSorted();
    var total = atlasData.length;

    if (resultsCount) {
      resultsCount.textContent = data.length === total
        ? data.length + ' pays'
        : data.length + ' / ' + total + ' pays';
    }

    if (data.length === 0) {
      grid.hidden = true;
      tableWrapper.hidden = true;
      noResults.hidden = false;
      return;
    }
    noResults.hidden = true;
    applyView();

    if (currentView === 'cards') renderCards(data);
    else renderTable(data);
  }

  searchInput.addEventListener('input', refresh);
  sortSelect.addEventListener('change', refresh);
  continentSelect.addEventListener('change', refresh);
  levelSelect.addEventListener('change', refresh);

  viewButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      currentView = b.dataset.view;
      try { localStorage.setItem('atlas-view', currentView); } catch (e) {}
      refresh();
    });
  });

  var modal = document.getElementById('country-modal');
  var modalClose = document.getElementById('country-modal-close');
  var modalFlag = document.getElementById('country-modal-flag');
  var modalTitle = document.getElementById('country-modal-title');
  var modalContinent = document.getElementById('country-modal-continent');
  var modalOverall = document.getElementById('country-modal-overall');
  var modalSummary = document.getElementById('country-modal-summary');
  var modalCriteria = document.getElementById('country-modal-criteria');
  var lastFocus = null;

  function getDefaultSummary(c, overall, overallLevel) {
    var label = (levelLabels[overallLevel] || '').toLowerCase();
    return 'Score global de ' + overall.toFixed(1) + '/5 (' + label + '). ' +
      'Cette note synthétise la liberté d\'expression, le pacifisme, la sécurité, ' +
      'les droits humains et la stabilité institutionnelle.';
  }

  function getCriterionText(c, key) {
    var specific = REASONS[c.code];
    if (specific && specific[key]) return specific[key];
    var generic = CRITERIA_REASONS[key];
    if (generic && generic[c[key]]) return generic[c[key]];
    return '';
  }

  function openCountryModal(c) {
    if (!modal) return;
    var overall = getOverall(c);
    var overallLevel = Math.round(overall);
    var specific = REASONS[c.code];

    modalFlag.textContent = getFlagEmoji(c.code);
    modalTitle.textContent = c.name;
    modalContinent.textContent = continentLabels[c.continent] || c.continent;
    modalOverall.textContent = overall.toFixed(1) + '/5  ' + (levelLabels[overallLevel] || '');
    modalOverall.className = 'atlas-modal-overall level-badge level-' + overallLevel;

    modalSummary.textContent = (specific && specific.summary)
      ? specific.summary
      : getDefaultSummary(c, overall, overallLevel);

    modalCriteria.innerHTML = '';
    CRITERIA_KEYS.forEach(function (key) {
      var v = c[key];
      var row = document.createElement('div');
      row.className = 'atlas-criterion lvl-' + v;
      row.innerHTML =
        '<span class="atlas-criterion-label">' + criteriaLabels[key] + '</span>' +
        '<span class="atlas-criterion-badge"></span>' +
        '<p class="atlas-criterion-text">' + escapeHtml(getCriterionText(c, key)) + '</p>';
      row.querySelector('.atlas-criterion-badge').appendChild(createLevelBadge(v));
      modalCriteria.appendChild(row);
    });

    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { modalClose && modalClose.focus(); }, 0);
  }

  function closeCountryModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (e) {}
    }
  }

  if (modal) {
    modalClose && modalClose.addEventListener('click', closeCountryModal);
    modal.addEventListener('click', function (e) {
      if (e.target && e.target.dataset && e.target.dataset.close === 'true') closeCountryModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeCountryModal();
    });
  }

  updateQuickStats();
  refresh();
})();
