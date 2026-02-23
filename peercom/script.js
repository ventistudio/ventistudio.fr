/**
 * PeerCom v2 - Moteur de recherche intelligent propulsé par DuckDuckGo
 * 
 * Fonctionnalités :
 * - Recherche via l'API DuckDuckGo Instant Answer
 * - Suggestions automatiques (historique + DuckDuckGo Autocomplete)
 * - Historique de recherche persistant (localStorage)
 * - Système de favoris/bookmarks
 * - Recherche vocale (Web Speech API)
 * - Onglets de type (Web, Images, Vidéos, Actus)
 * - SafeSearch toggle
 * - Détection des Bangs DuckDuckGo
 * - Raccourcis clavier complets
 * - Statistiques de recherche
 * - Partage de recherche
 * - Notifications toast
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── DOM References ─────────────────────────────
  const $ = id => document.getElementById(id);
  const searchForm = $('search-form');
  const searchInput = $('search-input');
  const clearBtn = $('clear-btn');
  const voiceBtn = $('voice-btn');
  const resultsSection = $('results-section');
  const resultsList = $('results-list');
  const resultsCount = $('results-count');
  const resultsTime = $('results-time');
  const resultsLoading = $('results-loading');
  const resultsEmpty = $('results-empty');
  const resultsError = $('results-error');
  const resultsErrorDetail = $('results-error-detail');
  const retryBtn = $('retry-btn');
  const hero = $('peercom-hero');
  const featuresSection = $('peercom-features');
  const suggestionsDropdown = $('suggestions-dropdown');
  const suggestionsList = $('suggestions-list');
  const bangIndicator = $('bang-indicator');
  const bangBadge = $('bang-badge');
  const bangDescription = $('bang-description');
  const quickHistory = $('quick-history');
  const quickHistoryItems = $('quick-history-items');
  const clearHistoryBtn = $('clear-history-btn');
  const bookmarkResultsBtn = $('bookmark-results-btn');
  const shareBtn = $('share-btn');
  const bookmarksPanel = $('bookmarks-panel');
  const bookmarksList = $('bookmarks-list');
  const bookmarksEmpty = $('bookmarks-empty');
  const bookmarksClose = $('bookmarks-close');
  const shortcutsModal = $('shortcuts-modal');
  const shortcutsOverlay = $('shortcuts-overlay');
  const shortcutsClose = $('shortcuts-close');
  const statsToggle = $('stats-toggle');
  const statsPanel = $('stats-panel');
  const toastContainer = $('toast-container');

  // ─── State ──────────────────────────────────────
  let currentQuery = '';
  let currentRegion = '';
  let currentType = 'web';
  let suggestionsIndex = -1;
  let suggestionsData = [];
  let debounceTimer = null;
  let lastSearchElapsed = 0;

  // ─── Storage Helpers ────────────────────────────
  const STORAGE_KEYS = {
    history: 'peercom_history',
    bookmarks: 'peercom_bookmarks',
    stats: 'peercom_stats',
    safeSearch: 'peercom_safesearch',
  };

  function getStorage(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
  }

  function setStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  // ─── History ────────────────────────────────────
  function getHistory() { return getStorage(STORAGE_KEYS.history, []); }

  function addToHistory(query) {
    let history = getHistory();
    history = history.filter(h => h.query !== query);
    history.unshift({ query, timestamp: Date.now() });
    if (history.length > 50) history = history.slice(0, 50);
    setStorage(STORAGE_KEYS.history, history);
    renderQuickHistory();
  }

  function removeFromHistory(query) {
    let history = getHistory().filter(h => h.query !== query);
    setStorage(STORAGE_KEYS.history, history);
    renderQuickHistory();
  }

  function clearHistory() {
    setStorage(STORAGE_KEYS.history, []);
    renderQuickHistory();
    toast('Historique effacé', 'success');
  }

  function renderQuickHistory() {
    const history = getHistory();
    if (history.length === 0) {
      quickHistory.hidden = true;
      return;
    }
    if (!hero.classList.contains('has-results')) {
      quickHistory.hidden = false;
    }
    quickHistoryItems.innerHTML = history.slice(0, 12).map(h => `
      <div class="history-chip" data-query="${escapeHTML(h.query)}">
        <span>${escapeHTML(h.query)}</span>
        <button class="history-chip-remove" data-remove="${escapeHTML(h.query)}" aria-label="Supprimer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    `).join('');

    // Events
    quickHistoryItems.querySelectorAll('.history-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.closest('.history-chip-remove')) return;
        const q = chip.dataset.query;
        searchInput.value = q;
        clearBtn.hidden = false;
        const region = document.querySelector('input[name="region"]:checked').value;
        performSearch(q, region);
      });
    });

    quickHistoryItems.querySelectorAll('.history-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromHistory(btn.dataset.remove);
      });
    });
  }

  // ─── Bookmarks ──────────────────────────────────
  function getBookmarks() { return getStorage(STORAGE_KEYS.bookmarks, []); }

  function addBookmark(query) {
    let bookmarks = getBookmarks();
    if (bookmarks.some(b => b.query === query)) {
      toast('Déjà dans les favoris', 'info');
      return;
    }
    bookmarks.unshift({ query, timestamp: Date.now() });
    setStorage(STORAGE_KEYS.bookmarks, bookmarks);
    updateBookmarkBtn();
    renderBookmarks();
    updateStats();
    toast('Recherche sauvegardée', 'success');
  }

  function removeBookmark(query) {
    let bookmarks = getBookmarks().filter(b => b.query !== query);
    setStorage(STORAGE_KEYS.bookmarks, bookmarks);
    updateBookmarkBtn();
    renderBookmarks();
    updateStats();
  }

  function isBookmarked(query) {
    return getBookmarks().some(b => b.query === query);
  }

  function updateBookmarkBtn() {
    if (!currentQuery) return;
    const bookmarked = isBookmarked(currentQuery);
    bookmarkResultsBtn.classList.toggle('bookmarked', bookmarked);
    bookmarkResultsBtn.title = bookmarked ? 'Retirer des favoris' : 'Sauvegarder cette recherche';
  }

  function renderBookmarks() {
    const bookmarks = getBookmarks();
    bookmarksEmpty.hidden = bookmarks.length > 0;
    bookmarksList.innerHTML = bookmarks.map(b => `
      <div class="bookmark-item" data-query="${escapeHTML(b.query)}">
        <span class="bookmark-query">${escapeHTML(b.query)}</span>
        <span class="bookmark-date">${formatRelativeTime(b.timestamp)}</span>
        <button class="bookmark-remove" data-remove="${escapeHTML(b.query)}" aria-label="Supprimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
    `).join('');

    bookmarksList.querySelectorAll('.bookmark-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.bookmark-remove')) return;
        const q = item.dataset.query;
        searchInput.value = q;
        clearBtn.hidden = false;
        closeBookmarksPanel();
        performSearch(q, document.querySelector('input[name="region"]:checked').value);
      });
    });

    bookmarksList.querySelectorAll('.bookmark-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeBookmark(btn.dataset.remove);
        toast('Favori supprimé', 'info');
      });
    });
  }

  function openBookmarksPanel() {
    renderBookmarks();
    bookmarksPanel.hidden = false;
    bookmarksPanel.classList.remove('closing');
  }

  function closeBookmarksPanel() {
    bookmarksPanel.classList.add('closing');
    setTimeout(() => {
      bookmarksPanel.hidden = true;
      bookmarksPanel.classList.remove('closing');
    }, 280);
  }

  // ─── Statistics ─────────────────────────────────
  function getStats() {
    return getStorage(STORAGE_KEYS.stats, { total: 0, times: [], daily: {} });
  }

  function recordSearch(elapsed) {
    const stats = getStats();
    stats.total++;
    stats.times.push(elapsed);
    if (stats.times.length > 200) stats.times = stats.times.slice(-200);
    const today = new Date().toISOString().split('T')[0];
    stats.daily[today] = (stats.daily[today] || 0) + 1;
    // Clean old daily entries (keep last 30 days)
    const keys = Object.keys(stats.daily).sort().reverse();
    if (keys.length > 30) {
      keys.slice(30).forEach(k => delete stats.daily[k]);
    }
    setStorage(STORAGE_KEYS.stats, stats);
    updateStats();
  }

  function updateStats() {
    const stats = getStats();
    const bookmarks = getBookmarks();
    const today = new Date().toISOString().split('T')[0];

    $('stat-total').textContent = stats.total;
    $('stat-today').textContent = stats.daily[today] || 0;
    const avgTime = stats.times.length > 0
      ? (stats.times.reduce((a, b) => a + b, 0) / stats.times.length).toFixed(2) + 's'
      : '0s';
    $('stat-avg-time').textContent = avgTime;
    $('stat-bookmarks').textContent = bookmarks.length;
  }

  // ─── Suggestions ────────────────────────────────
  async function fetchSuggestions(query) {
    if (!query || query.length < 2) {
      closeSuggestions();
      return;
    }

    // Build suggestions: history matches first, then DuckDuckGo autocomplete
    const history = getHistory();
    const historyMatches = history
      .filter(h => h.query.toLowerCase().includes(query.toLowerCase()) && h.query !== query)
      .slice(0, 3)
      .map(h => ({ text: h.query, type: 'history', icon: 'clock' }));

    let apiSuggestions = [];
    try {
      const res = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
          apiSuggestions = data[1]
            .filter(s => s.toLowerCase() !== query.toLowerCase())
            .slice(0, 5)
            .map(s => ({ text: s, type: 'suggestion', icon: 'search' }));
        }
      }
    } catch {}

    suggestionsData = [...historyMatches, ...apiSuggestions];

    // Remove duplicates
    const seen = new Set();
    suggestionsData = suggestionsData.filter(s => {
      const key = s.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (suggestionsData.length === 0) {
      closeSuggestions();
      return;
    }

    suggestionsIndex = -1;
    renderSuggestions();
  }

  function renderSuggestions() {
    const iconMap = {
      clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    };

    suggestionsList.innerHTML = suggestionsData.map((s, i) => `
      <div class="suggestion-item${i === suggestionsIndex ? ' active' : ''}" data-index="${i}" role="option">
        <span class="suggestion-icon">${iconMap[s.icon] || iconMap.search}</span>
        <span class="suggestion-text">${escapeHTML(s.text)}</span>
        <span class="suggestion-type">${s.type === 'history' ? 'Historique' : 'Suggestion'}</span>
      </div>
    `).join('');

    suggestionsDropdown.hidden = false;

    suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const idx = parseInt(item.dataset.index);
        selectSuggestion(idx);
      });
      item.addEventListener('mouseenter', () => {
        suggestionsIndex = parseInt(item.dataset.index);
        highlightSuggestion();
      });
    });
  }

  function highlightSuggestion() {
    suggestionsList.querySelectorAll('.suggestion-item').forEach((item, i) => {
      item.classList.toggle('active', i === suggestionsIndex);
    });
  }

  function selectSuggestion(index) {
    if (index >= 0 && index < suggestionsData.length) {
      searchInput.value = suggestionsData[index].text;
      clearBtn.hidden = false;
      closeSuggestions();
      const region = document.querySelector('input[name="region"]:checked').value;
      performSearch(suggestionsData[index].text, region);
    }
  }

  function closeSuggestions() {
    suggestionsDropdown.hidden = true;
    suggestionsIndex = -1;
    suggestionsData = [];
  }

  // ─── Bangs Detection ────────────────────────────
  const BANGS_MAP = {
    '!w': 'Wikipedia', '!g': 'Google', '!yt': 'YouTube', '!gh': 'GitHub',
    '!a': 'Amazon', '!mdn': 'MDN Web Docs', '!so': 'Stack Overflow',
    '!r': 'Reddit', '!tw': 'Twitter/X', '!npm': 'npm', '!gi': 'Google Images',
    '!maps': 'Google Maps', '!gm': 'Google Maps', '!wa': 'Wolfram Alpha',
    '!imdb': 'IMDb', '!sp': 'Spotify', '!steam': 'Steam',
  };

  function detectBang(query) {
    const match = query.match(/(![\w]+)/);
    if (match && BANGS_MAP[match[1]]) {
      bangIndicator.hidden = false;
      bangBadge.textContent = match[1];
      bangDescription.textContent = `→ Redirection vers ${BANGS_MAP[match[1]]}`;
    } else {
      bangIndicator.hidden = true;
    }
  }

  // ─── Voice Search ───────────────────────────────
  let recognition = null;
  function initVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    voiceBtn.hidden = false;
    recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      searchInput.value = transcript;
      clearBtn.hidden = false;
      voiceBtn.classList.remove('listening');
      toast('Recherche vocale : "' + transcript + '"', 'info');
      const region = document.querySelector('input[name="region"]:checked').value;
      performSearch(transcript, region);
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove('listening');
      toast('Erreur de reconnaissance vocale', 'error');
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
    };
  }

  function startVoiceSearch() {
    if (!recognition) return;
    if (voiceBtn.classList.contains('listening')) {
      recognition.stop();
      return;
    }
    voiceBtn.classList.add('listening');
    recognition.start();
    toast('Parlez maintenant...', 'info');
  }

  // ─── Toast Notifications ────────────────────────
  function toast(message, type = 'info') {
    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHTML(message)}</span>`;
    toastContainer.appendChild(el);

    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ─── Share ──────────────────────────────────────
  async function shareSearch() {
    if (!currentQuery) return;
    const url = `${window.location.origin}${window.location.pathname}?q=${encodeURIComponent(currentQuery)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `PeerCom: ${currentQuery}`, url });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      toast('Lien copié dans le presse-papier', 'success');
    } catch {
      toast('Impossible de copier le lien', 'error');
    }
  }

  // ─── Search Logic ───────────────────────────────
  async function performSearch(query, region = '') {
    currentQuery = query.trim();
    if (!currentQuery) return;

    currentRegion = region;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('q', currentQuery);
    if (region) url.searchParams.set('r', region);
    else url.searchParams.delete('r');
    if (currentType !== 'web') url.searchParams.set('t', currentType);
    else url.searchParams.delete('t');
    window.history.pushState({}, '', url);

    // UI transitions
    showState('loading');
    hero.classList.add('has-results');
    if (featuresSection) featuresSection.hidden = true;
    quickHistory.hidden = true;
    closeSuggestions();

    addToHistory(currentQuery);
    updateBookmarkBtn();

    const startTime = performance.now();
    const safeSearch = $('safe-search').checked;

    try {
      // For non-web types, redirect to DuckDuckGo directly
      if (currentType !== 'web') {
        const ddgTypeMap = { images: 'iax=images&ia=images', videos: 'iax=videos&ia=videos', news: 'iar=news&ia=news' };
        const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(currentQuery)}&${ddgTypeMap[currentType] || ''}${region ? `&kl=${region}` : ''}${safeSearch ? '&kp=1' : '&kp=-2'}`;
        window.open(ddgUrl, '_blank', 'noopener');

        // Also show instant answer results
        const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(currentQuery)}&format=json&no_html=0&skip_disambig=0&no_redirect=1${region ? `&kl=${region}` : ''}`;
        const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const data = await response.json();
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        lastSearchElapsed = parseFloat(elapsed);
        recordSearch(lastSearchElapsed);
        renderResults(data, currentQuery, elapsed);
        return;
      }

      // Web search: Instant Answer API
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(currentQuery)}&format=json&no_html=0&skip_disambig=0&no_redirect=1${region ? `&kl=${region}` : ''}${safeSearch ? '&kp=1' : '&kp=-2'}`;
      const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      lastSearchElapsed = parseFloat(elapsed);
      recordSearch(lastSearchElapsed);
      renderResults(data, currentQuery, elapsed);
    } catch (error) {
      console.error('PeerCom search error:', error);
      showState('error');
      resultsErrorDetail.textContent = error.message || 'Impossible de contacter le serveur DuckDuckGo.';
    }
  }

  function renderResults(data, query, elapsed) {
    resultsList.innerHTML = '';
    let totalResults = 0;
    let animDelay = 0;

    // Instant Answer / Abstract
    if (data.Abstract) {
      totalResults++;
      const el = createResultElement('instant-answer', animDelay);
      let imageHtml = '';
      if (data.Image) {
        const imgSrc = data.Image.startsWith('http') ? data.Image : `https://duckduckgo.com${data.Image}`;
        imageHtml = `<img class="instant-answer-image" src="${imgSrc}" alt="${escapeHTML(data.Heading || query)}" loading="lazy">`;
      }
      el.innerHTML = `
        ${imageHtml}
        <div class="instant-answer-heading">${escapeHTML(data.Heading || query)}</div>
        <div class="instant-answer-text">${data.Abstract}</div>
        ${data.AbstractSource ? `<div class="instant-answer-source">Source : <a href="${escapeHTML(data.AbstractURL)}" target="_blank" rel="noopener">${escapeHTML(data.AbstractSource)}</a></div>` : ''}
      `;
      resultsList.appendChild(el);
      animDelay += 60;
    }

    // Answer
    if (data.Answer) {
      totalResults++;
      const el = createResultElement('instant-answer', animDelay);
      el.innerHTML = `
        <div class="instant-answer-heading">Réponse instantanée</div>
        <div class="instant-answer-text">${data.Answer}</div>
        ${data.AnswerType ? `<div class="instant-answer-source">Type : ${escapeHTML(data.AnswerType)}</div>` : ''}
      `;
      resultsList.appendChild(el);
      animDelay += 60;
    }

    // Definition
    if (data.Definition) {
      totalResults++;
      const el = createResultElement('instant-answer', animDelay);
      el.innerHTML = `
        <div class="instant-answer-heading">Définition</div>
        <div class="instant-answer-text">${escapeHTML(data.Definition)}</div>
        ${data.DefinitionSource ? `<div class="instant-answer-source">Source : <a href="${escapeHTML(data.DefinitionURL)}" target="_blank" rel="noopener">${escapeHTML(data.DefinitionSource)}</a></div>` : ''}
      `;
      resultsList.appendChild(el);
      animDelay += 60;
    }

    // Infobox
    if (data.Infobox && data.Infobox.content && data.Infobox.content.length > 0) {
      totalResults++;
      const el = createResultElement('instant-answer', animDelay);
      const infoItems = data.Infobox.content.slice(0, 8).map(item =>
        `<div style="display:flex;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid var(--glass-border);">
          <span style="color:var(--text-secondary);font-size:0.82rem;">${escapeHTML(item.label)}</span>
          <span style="color:var(--text-primary);font-size:0.82rem;font-weight:500;text-align:right;">${escapeHTML(String(item.value))}</span>
        </div>`
      ).join('');
      el.innerHTML = `
        <div class="instant-answer-heading">${escapeHTML(data.Heading || 'Informations')}</div>
        <div style="margin-top:0.5rem">${infoItems}</div>
      `;
      resultsList.appendChild(el);
      animDelay += 60;
    }

    // Related Topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.forEach(topic => {
        if (topic.Result) {
          totalResults++;
          const el = createResultElement('result-item', animDelay);
          const topicUrl = topic.FirstURL || '#';
          const topicText = topic.Text || '';
          const topicTitle = extractTitle(topic.Result) || topicText.substring(0, 80);

          let iconHtml = '';
          if (topic.Icon && topic.Icon.URL) {
            const iconSrc = topic.Icon.URL.startsWith('http') ? topic.Icon.URL : `https://duckduckgo.com${topic.Icon.URL}`;
            iconHtml = `<img src="${iconSrc}" alt="" width="16" height="16" style="vertical-align:middle;margin-right:0.4rem;border-radius:3px;" loading="lazy">`;
          }

          el.innerHTML = `
            <div class="result-url"><a href="${escapeHTML(topicUrl)}" target="_blank" rel="noopener">${iconHtml}${escapeHTML(topicUrl)}</a></div>
            <div class="result-title"><a href="${escapeHTML(topicUrl)}" target="_blank" rel="noopener">${escapeHTML(topicTitle)}</a></div>
            <div class="result-snippet">${escapeHTML(topicText)}</div>
          `;
          resultsList.appendChild(el);
          animDelay += 40;
        }

        if (topic.Topics && topic.Topics.length > 0) {
          topic.Topics.forEach(sub => {
            if (sub.Result) {
              totalResults++;
              const subEl = createResultElement('result-item', animDelay);
              const subUrl = sub.FirstURL || '#';
              const subTitle = extractTitle(sub.Result) || (sub.Text || '').substring(0, 80);
              subEl.innerHTML = `
                <div class="result-url"><a href="${escapeHTML(subUrl)}" target="_blank" rel="noopener">${escapeHTML(subUrl)}</a></div>
                <div class="result-title"><a href="${escapeHTML(subUrl)}" target="_blank" rel="noopener">${escapeHTML(subTitle)}</a></div>
                <div class="result-snippet">${escapeHTML(sub.Text || '')}</div>
              `;
              resultsList.appendChild(subEl);
              animDelay += 40;
            }
          });
        }
      });
    }

    // Results
    if (data.Results && data.Results.length > 0) {
      data.Results.forEach(result => {
        totalResults++;
        const el = createResultElement('result-item', animDelay);
        const resultUrl = result.FirstURL || '#';
        const resultTitle = extractTitle(result.Result) || (result.Text || '').substring(0, 80);
        el.innerHTML = `
          <div class="result-url"><a href="${escapeHTML(resultUrl)}" target="_blank" rel="noopener">${escapeHTML(resultUrl)}</a></div>
          <div class="result-title"><a href="${escapeHTML(resultUrl)}" target="_blank" rel="noopener">${escapeHTML(resultTitle)}</a></div>
          <div class="result-snippet">${escapeHTML(result.Text || '')}</div>
        `;
        resultsList.appendChild(el);
        animDelay += 40;
      });
    }

    // Full DuckDuckGo link
    const fullEl = createResultElement('result-item result-ddg-link', animDelay);
    const safeSearch = $('safe-search').checked;
    fullEl.innerHTML = `
      <div class="result-title">
        <a href="https://duckduckgo.com/?q=${encodeURIComponent(query)}${currentRegion ? `&kl=${currentRegion}` : ''}${safeSearch ? '&kp=1' : '&kp=-2'}" target="_blank" rel="noopener" style="color:var(--accent);">
          🔍 Voir tous les résultats sur DuckDuckGo →
        </a>
      </div>
    `;
    resultsList.appendChild(fullEl);
    totalResults++;

    // Related tags
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const relatedNames = data.RelatedTopics
        .filter(t => t.Text && t.FirstURL)
        .slice(0, 10)
        .map(t => ({ name: (t.Text || '').substring(0, 45), url: t.FirstURL }));

      if (relatedNames.length > 0) {
        const relDiv = document.createElement('div');
        relDiv.className = 'related-topics';
        relDiv.innerHTML = `
          <h3>Recherches associées</h3>
          <div class="related-tags">
            ${relatedNames.map(r => `<a class="related-tag" data-query="${escapeHTML(r.name)}">${escapeHTML(r.name)}</a>`).join('')}
          </div>
        `;
        resultsList.appendChild(relDiv);

        relDiv.querySelectorAll('.related-tag').forEach(tag => {
          tag.addEventListener('click', (e) => {
            e.preventDefault();
            const newQuery = tag.dataset.query;
            searchInput.value = newQuery;
            clearBtn.hidden = false;
            performSearch(newQuery, currentRegion);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        });
      }
    }

    // Update header
    resultsCount.textContent = `${totalResults} résultat${totalResults > 1 ? 's' : ''}`;
    resultsTime.textContent = `${elapsed}s`;

    if (totalResults <= 1) {
      showState('empty');
      resultsList.innerHTML = '';
      resultsList.appendChild(fullEl);
      resultsCount.textContent = '';
      resultsTime.textContent = `${elapsed}s`;
      resultsSection.hidden = false;
      resultsList.hidden = false;
      resultsEmpty.hidden = false;
    } else {
      showState('results');
    }
  }

  function createResultElement(className, delay) {
    const el = document.createElement('div');
    el.className = className;
    el.setAttribute('role', 'listitem');
    el.style.animationDelay = `${delay}ms`;
    return el;
  }

  // ─── UI State Management ────────────────────────
  function showState(state) {
    resultsSection.hidden = state === 'idle';
    resultsList.hidden = state !== 'results';
    resultsLoading.hidden = state !== 'loading';
    resultsEmpty.hidden = state !== 'empty';
    resultsError.hidden = state !== 'error';

    if (state === 'loading') {
      resultsSection.hidden = false;
      resultsList.hidden = true;
    }
  }

  function resetToLanding() {
    searchInput.value = '';
    clearBtn.hidden = true;
    hero.classList.remove('has-results');
    resultsSection.hidden = true;
    if (featuresSection) featuresSection.hidden = false;
    bangIndicator.hidden = true;
    closeSuggestions();
    renderQuickHistory();
    currentQuery = '';
    window.history.pushState({}, '', window.location.pathname);
  }

  // ─── Utility Functions ──────────────────────────
  function extractTitle(html) {
    if (!html) return '';
    const match = html.match(/<a[^>]*>([^<]+)<\/a>/i);
    return match ? match[1] : '';
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}j`;
    return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  // ─── Event Listeners ───────────────────────────
  // Search form
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    closeSuggestions();
    const region = document.querySelector('input[name="region"]:checked').value;
    performSearch(query, region);
  });

  // Input events
  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    clearBtn.hidden = val.length === 0;
    voiceBtn && (voiceBtn.style.display = val.length > 0 ? 'none' : '');

    detectBang(val);

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchSuggestions(val.trim());
    }, 250);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) {
      fetchSuggestions(searchInput.value.trim());
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (!suggestionsDropdown.hidden) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        suggestionsIndex = Math.min(suggestionsIndex + 1, suggestionsData.length - 1);
        highlightSuggestion();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        suggestionsIndex = Math.max(suggestionsIndex - 1, -1);
        highlightSuggestion();
      } else if (e.key === 'Enter' && suggestionsIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestionsIndex);
      } else if (e.key === 'Escape') {
        closeSuggestions();
      }
    }
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => closeSuggestions(), 200);
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.hidden = true;
    bangIndicator.hidden = true;
    closeSuggestions();
    searchInput.focus();
  });

  // Voice
  voiceBtn.addEventListener('click', startVoiceSearch);

  // Retry
  retryBtn.addEventListener('click', () => {
    if (currentQuery) {
      performSearch(currentQuery, currentRegion);
    }
  });

  // Search type tabs
  document.querySelectorAll('.search-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.search-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentType = tab.dataset.type;

      // Redo search if query exists
      if (currentQuery) {
        performSearch(currentQuery, currentRegion);
      }
    });
  });

  // Bookmark results
  bookmarkResultsBtn.addEventListener('click', () => {
    if (!currentQuery) return;
    if (isBookmarked(currentQuery)) {
      removeBookmark(currentQuery);
      toast('Favori supprimé', 'info');
    } else {
      addBookmark(currentQuery);
    }
  });

  // Share
  shareBtn.addEventListener('click', shareSearch);

  // Clear history
  clearHistoryBtn.addEventListener('click', clearHistory);

  // Bookmarks panel
  bookmarksClose.addEventListener('click', closeBookmarksPanel);

  // Shortcuts modal
  shortcutsOverlay.addEventListener('click', () => { shortcutsModal.hidden = true; });
  shortcutsClose.addEventListener('click', () => { shortcutsModal.hidden = true; });

  // Stats widget
  statsToggle.addEventListener('click', () => {
    statsPanel.hidden = !statsPanel.hidden;
  });

  // Close stats on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-stats-widget')) {
      statsPanel.hidden = true;
    }
  });

  // ─── Keyboard Shortcuts ─────────────────────────
  document.addEventListener('keydown', (e) => {
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

    // / → Focus search (when not typing)
    if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      searchInput.focus();
      return;
    }

    // ? → Show shortcuts
    if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      shortcutsModal.hidden = !shortcutsModal.hidden;
      return;
    }

    // Escape
    if (e.key === 'Escape') {
      if (!shortcutsModal.hidden) { shortcutsModal.hidden = true; return; }
      if (!bookmarksPanel.hidden) { closeBookmarksPanel(); return; }
      if (!suggestionsDropdown.hidden) { closeSuggestions(); return; }
      if (document.activeElement === searchInput) { searchInput.blur(); return; }
    }

    // Alt shortcuts
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          if (!hero.classList.contains('has-results')) {
            renderQuickHistory();
            quickHistory.hidden = !quickHistory.hidden;
          }
          break;
        case 'b':
          e.preventDefault();
          if (bookmarksPanel.hidden) openBookmarksPanel();
          else closeBookmarksPanel();
          break;
        case 'v':
          e.preventDefault();
          startVoiceSearch();
          break;
        case 's':
          e.preventDefault();
          shareSearch();
          break;
        case '1': case '2': case '3': case '4':
          e.preventDefault();
          const tabs = document.querySelectorAll('.search-tab');
          const idx = parseInt(e.key) - 1;
          if (tabs[idx]) tabs[idx].click();
          break;
      }
    }
  });

  // ─── URL Params (initial load) ──────────────────
  const urlParams = new URLSearchParams(window.location.search);
  const urlQuery = urlParams.get('q');
  const urlRegion = urlParams.get('r') || '';
  const urlType = urlParams.get('t') || 'web';

  if (urlRegion) {
    const radioBtn = document.querySelector(`input[name="region"][value="${urlRegion}"]`);
    if (radioBtn) radioBtn.checked = true;
  }

  if (urlType !== 'web') {
    currentType = urlType;
    document.querySelectorAll('.search-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.type === urlType);
      t.setAttribute('aria-selected', t.dataset.type === urlType ? 'true' : 'false');
    });
  }

  if (urlQuery) {
    searchInput.value = urlQuery;
    clearBtn.hidden = false;
    performSearch(urlQuery, urlRegion);
  }

  // ─── Popstate (back/forward) ────────────────────
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchInput.value = q;
      clearBtn.hidden = false;
      performSearch(q, params.get('r') || '');
    } else {
      resetToLanding();
    }
  });

  // ─── SafeSearch persistence ─────────────────────
  const savedSafe = getStorage(STORAGE_KEYS.safeSearch, true);
  $('safe-search').checked = savedSafe;
  $('safe-search').addEventListener('change', () => {
    setStorage(STORAGE_KEYS.safeSearch, $('safe-search').checked);
    if (currentQuery) performSearch(currentQuery, currentRegion);
  });

  // ─── Initialize ─────────────────────────────────
  initVoiceSearch();
  renderQuickHistory();
  updateStats();

  // Logo click → reset
  document.querySelector('.peercom-logo-container')?.addEventListener('click', () => {
    if (hero.classList.contains('has-results')) {
      resetToLanding();
    }
  });
});
