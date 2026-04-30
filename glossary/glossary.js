// ═══ Glossaire du Lore — Logique ═══
(function() {
  if (typeof glossaryData === 'undefined') return;

  var content = document.getElementById('glossary-content');
  var searchInput = document.getElementById('glossary-search');
  var categoryFilter = document.getElementById('filter-category');
  var universeFilter = document.getElementById('filter-universe');
  var azBar = document.getElementById('glossary-az');
  var noResults = document.getElementById('glossary-no-results');
  var statTotal = document.getElementById('stat-total');
  var statCategories = document.getElementById('stat-categories');
  var statUniverses = document.getElementById('stat-universes');

  if (!content) return;

  var categoryLabels = {
    character: 'Personnage',
    location: 'Lieu',
    organization: 'Organisation',
    technology: 'Technologie',
    concept: 'Concept',
    event: 'Événement'
  };

  var universeLabels = {
    'aoki-universe': 'Aoki Universe',
    'ventistudio': 'VentiStudio',
    'scp': 'SCP',
    'general': 'Général'
  };

  var activeLetter = null;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getFilteredData() {
    var search = (searchInput.value || '').toLowerCase().trim();
    var cat = categoryFilter.value;
    var uni = universeFilter.value;

    return glossaryData.filter(function(entry) {
      if (cat && entry.category !== cat) return false;
      if (uni && entry.universe !== uni) return false;
      if (search) {
        var haystack = (entry.term + ' ' + entry.definition + ' ' + (entry.aliases || []).join(' ')).toLowerCase();
        if (haystack.indexOf(search) === -1) return false;
      }
      if (activeLetter) {
        if (entry.term.charAt(0).toUpperCase() !== activeLetter) return false;
      }
      return true;
    });
  }

  function groupByLetter(data) {
    var sorted = data.slice().sort(function(a, b) {
      return a.term.localeCompare(b.term, 'fr');
    });
    var groups = {};
    sorted.forEach(function(entry) {
      var letter = entry.term.charAt(0).toUpperCase();
      if (!/[A-ZÀ-Ÿ]/.test(letter)) letter = '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(entry);
    });
    return groups;
  }

  function getAvailableLetters() {
    var letters = {};
    glossaryData.forEach(function(e) {
      var l = e.term.charAt(0).toUpperCase();
      letters[l] = true;
    });
    return letters;
  }

  function renderAZ() {
    var available = getAvailableLetters();
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    azBar.innerHTML = '';

    var allBtn = document.createElement('button');
    allBtn.className = 'az-btn' + (!activeLetter ? ' active' : '');
    allBtn.textContent = 'Tous';
    allBtn.addEventListener('click', function() {
      activeLetter = null;
      render();
    });
    azBar.appendChild(allBtn);

    letters.forEach(function(l) {
      var btn = document.createElement('button');
      btn.className = 'az-btn';
      btn.textContent = l;
      if (!available[l]) {
        btn.classList.add('disabled');
      } else {
        if (activeLetter === l) btn.classList.add('active');
        btn.addEventListener('click', function() {
          activeLetter = l;
          render();
        });
      }
      azBar.appendChild(btn);
    });
  }

  function renderEntries(data) {
    content.innerHTML = '';
    if (data.length === 0) {
      noResults.hidden = false;
      return;
    }
    noResults.hidden = true;

    var groups = groupByLetter(data);
    var sortedLetters = Object.keys(groups).sort(function(a, b) {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'fr');
    });

    sortedLetters.forEach(function(letter) {
      var group = document.createElement('div');
      group.className = 'glossary-letter-group';
      group.id = 'letter-' + letter;

      var letterEl = document.createElement('div');
      letterEl.className = 'glossary-letter';
      letterEl.textContent = letter;
      group.appendChild(letterEl);

      var entries = document.createElement('div');
      entries.className = 'glossary-entries';

      groups[letter].forEach(function(entry) {
        var el = document.createElement('div');
        el.className = 'glossary-entry';
        el.id = 'term-' + entry.id;

        var header = '<div class="glossary-entry-header">' +
          '<span class="glossary-term">' + escapeHtml(entry.term) + '</span>' +
          '<span class="glossary-badge cat-' + entry.category + '">' + (categoryLabels[entry.category] || entry.category) + '</span>' +
          '<span class="glossary-badge uni-' + entry.universe + '">' + (universeLabels[entry.universe] || entry.universe) + '</span>' +
          '<span class="glossary-expand-icon" aria-hidden="true">▼</span>' +
        '</div>';

        var def = '<div class="glossary-definition">' + escapeHtml(entry.definition) + '</div>';

        var aliasesHtml = '';
        if (entry.aliases && entry.aliases.length > 0) {
          aliasesHtml = '<div class="glossary-aliases">Aussi : ' + entry.aliases.map(escapeHtml).join(', ') + '</div>';
        }

        var relatedHtml = '';
        if (entry.related && entry.related.length > 0) {
          relatedHtml = '<div class="glossary-related">' +
            entry.related.map(function(rid) {
              var ref = glossaryData.find(function(e) { return e.id === rid; });
              var label = ref ? ref.term : rid;
              return '<span class="glossary-related-link" data-target="' + escapeHtml(rid) + '">' + escapeHtml(label) + '</span>';
            }).join('') +
          '</div>';
        }

        el.innerHTML = header + def + aliasesHtml + relatedHtml;

        el.addEventListener('click', function(e) {
          if (e.target.classList.contains('glossary-related-link')) {
            var target = e.target.getAttribute('data-target');
            scrollToTerm(target);
            return;
          }
          el.classList.toggle('expanded');
        });

        entries.appendChild(el);
      });

      group.appendChild(entries);
      content.appendChild(group);
    });
  }

  function scrollToTerm(id) {
    // Expand and scroll to a term
    var el = document.getElementById('term-' + id);
    if (!el) return;
    activeLetter = null;
    searchInput.value = '';
    categoryFilter.value = '';
    universeFilter.value = '';
    render();
    // wait for render
    setTimeout(function() {
      var target = document.getElementById('term-' + id);
      if (target) {
        target.classList.add('expanded');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.boxShadow = '0 0 0 2px var(--accent)';
        setTimeout(function() { target.style.boxShadow = ''; }, 2000);
      }
    }, 50);
  }

  function updateStats(data) {
    if (statTotal) statTotal.textContent = glossaryData.length;
    if (statCategories) {
      var cats = {};
      glossaryData.forEach(function(e) { cats[e.category] = true; });
      statCategories.textContent = Object.keys(cats).length;
    }
    if (statUniverses) {
      var unis = {};
      glossaryData.forEach(function(e) { unis[e.universe] = true; });
      statUniverses.textContent = Object.keys(unis).length;
    }
  }

  function render() {
    var data = getFilteredData();
    renderAZ();
    renderEntries(data);
    updateStats(data);
  }

  // Handle URL hash
  function checkHash() {
    var hash = window.location.hash;
    if (hash && hash.indexOf('#term-') === 0) {
      var id = hash.substring(6);
      setTimeout(function() { scrollToTerm(id); }, 200);
    }
  }

  // Events
  searchInput.addEventListener('input', function() { activeLetter = null; render(); });
  categoryFilter.addEventListener('change', render);
  universeFilter.addEventListener('change', render);

  // Initial render
  render();
  checkHash();
  window.addEventListener('hashchange', checkHash);
})();
