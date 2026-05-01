(function () {
  'use strict';

  const TILES = {
    standard: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri &mdash; Sources: Esri, Maxar, Earthstar Geographics'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    },
    transport: {
      url: 'https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
      attr: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; OpenStreetMap'
    }
  };

  const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  const OSRM_URL = 'https://router.project-osrm.org/route/v1';
  const STORAGE_HISTORY = 'vs-maps-history';
  const STORAGE_FAVORITES = 'vs-maps-favorites';
  const MAX_HISTORY = 10;

  let map, currentLayer, searchMarkers = [], routeLayer = null;
  let routeStartMarker = null, routeEndMarker = null;
  let routeStartCoords = null, routeEndCoords = null;
  let searchTimeout = null, selectedResultIndex = -1;
  let measureMode = false, measurePoints = [], measureLayers = [];
  let currentPanel = 'home';
  let trackWatchId = null, trackPoints = [], trackLine = null, trackStartTime = null, trackPaused = false, trackTimer = null;
  let pinMode = false, pinMarkers = [];
  const STORAGE_TRACKS = 'vs-maps-tracks';
  const STORAGE_PINS = 'vs-maps-pins';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const sidebar = $('#sidebar');
  const sidebarToggle = $('#sidebar-toggle');
  const sidebarOpen = $('#sidebar-open');
  const searchInput = $('#search-input');
  const searchClear = $('#search-clear');
  const searchResults = $('#search-results');
  const sidebarHome = $('#sidebar-home');
  const routePanel = $('#route-panel');
  const routeToggleBtn = $('#route-toggle-btn');
  const routeStart = $('#route-start');
  const routeEnd = $('#route-end');
  const routeSwap = $('#route-swap');
  const routeInfo = $('#route-info');
  const routeSteps = $('#route-steps');
  const routeClose = $('#route-close');
  const locateBtn = $('#locate-btn');
  const layersBtn = $('#layers-btn');
  const layersPanel = $('#layers-panel');
  const fullscreenBtn = $('#fullscreen-btn');
  const placeInfo = $('#place-info');
  const placeName = $('#place-name');
  const placeAddress = $('#place-address');
  const placeCoords = $('#place-coords');
  const placeType = $('#place-type');
  const placeRouteBtn = $('#place-route-btn');
  const placeShareBtn = $('#place-share-btn');
  const placeFavBtn = $('#place-fav-btn');
  const placeClose = $('#place-close');
  const measurePanel = $('#measure-panel');
  const measureToggleBtn = $('#measure-toggle-btn');
  const measureClose = $('#measure-close');
  const measureResult = $('#measure-result');
  const measureDistance = $('#measure-distance');
  const measureReset = $('#measure-reset');
  const trackPanel = $('#track-panel');
  const trackToggleBtn = $('#track-toggle-btn');
  const trackClose = $('#track-close');
  const trackStartBtn = $('#track-start-btn');
  const trackPauseBtn = $('#track-pause-btn');
  const trackStopBtn = $('#track-stop-btn');
  const trackStats = $('#track-stats');
  const trackDistanceEl = $('#track-distance');
  const trackDurationEl = $('#track-duration');
  const trackSpeedEl = $('#track-speed');
  const trackPointsEl = $('#track-points');
  const trackExportGpx = $('#track-export-gpx');
  const trackExportGeojson = $('#track-export-geojson');
  const pinPanel = $('#pin-panel');
  const pinClose = $('#pin-close');
  const pinsList = $('#pins-list');
  const pinsClear = $('#pins-clear');
  const coordLat = $('#coord-lat');
  const coordLng = $('#coord-lng');
  const coordZoom = $('#coord-zoom');
  const toast = $('#toast');

  function initMap() {
    map = L.map('map', {
      center: [46.6034, 1.8883],
      zoom: 6,
      zoomControl: true,
      attributionControl: true
    });

    currentLayer = L.tileLayer(TILES.standard.url, {
      attribution: TILES.standard.attr,
      maxZoom: 19
    }).addTo(map);

    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    map.on('click', onMapClick);
    map.on('contextmenu', onMapRightClick);
    map.on('mousemove', onMapMouseMove);
    map.on('zoomend', updateCoordBar);
    map.on('moveend', updateHash);
  }

  function onMapMouseMove(e) {
    coordLat.textContent = `Lat: ${e.latlng.lat.toFixed(5)}`;
    coordLng.textContent = `Lng: ${e.latlng.lng.toFixed(5)}`;
  }

  function updateCoordBar() {
    coordZoom.textContent = `Zoom: ${map.getZoom()}`;
  }

  function updateHash() {
    const c = map.getCenter();
    const z = map.getZoom();
    history.replaceState(null, '', `#${c.lat.toFixed(5)},${c.lng.toFixed(5)},${z}`);
  }

  function parseHash() {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const parts = hash.split(',');
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      const zoom = parts[2] ? parseInt(parts[2], 10) : 16;
      if (!isNaN(lat) && !isNaN(lon)) {
        map.setView([lat, lon], zoom);
        if (zoom >= 12) {
          const marker = createMarker(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          searchMarkers.push(marker);
        }
      }
    }
  }

  function toggleSidebar(show) {
    const isCollapsed = sidebar.classList.contains('collapsed');
    if (show === undefined) show = isCollapsed;
    sidebar.classList.toggle('collapsed', !show);
    sidebarOpen.classList.toggle('hidden', show);
    setTimeout(() => map.invalidateSize(), 350);
  }

  sidebarToggle.addEventListener('click', () => toggleSidebar(false));
  sidebarOpen.addEventListener('click', () => toggleSidebar(true));

  function showPanel(panel) {
    currentPanel = panel;
    sidebarHome.classList.toggle('hidden', panel !== 'home');
    routePanel.classList.toggle('hidden', panel !== 'route');
    measurePanel.classList.toggle('hidden', panel !== 'measure');
    placeInfo.classList.toggle('hidden', panel !== 'place');
    trackPanel.classList.toggle('hidden', panel !== 'track');
    pinPanel.classList.toggle('hidden', panel !== 'pin');

    routeToggleBtn.classList.toggle('active', panel === 'route');
    measureToggleBtn.classList.toggle('active', panel === 'measure');
    trackToggleBtn.classList.toggle('active', panel === 'track');

    if (panel !== 'measure' && measureMode) {
      exitMeasureMode();
    }
    if (panel !== 'pin' && pinMode) {
      exitPinMode();
    }
  }

  $('#quick-locate').addEventListener('click', () => doLocate());
  $('#quick-route').addEventListener('click', () => {
    showPanel('route');
    toggleSidebar(true);
  });
  $('#quick-measure').addEventListener('click', () => {
    showPanel('measure');
    toggleSidebar(true);
    enterMeasureMode();
  });
  $('#quick-favorites').addEventListener('click', () => {
    const favSection = $('#favorites-section');
    favSection.classList.toggle('hidden');
    renderFavorites();
  });
  $('#quick-track').addEventListener('click', () => {
    showPanel('track');
    toggleSidebar(true);
  });
  $('#quick-pin').addEventListener('click', () => {
    showPanel('pin');
    toggleSidebar(true);
    enterPinMode();
  });

  function performSearch(query) {
    if (!query || query.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }

    searchResults.innerHTML = '<div class="search-loading">Recherche en cours</div>';
    searchResults.classList.remove('hidden');
    selectedResultIndex = -1;

    const params = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '8',
      'accept-language': 'fr'
    });

    fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: { 'User-Agent': 'VentiStudioMaps/1.0' }
    })
      .then(r => r.json())
      .then(results => renderSearchResults(results))
      .catch(() => {
        searchResults.innerHTML = '<div class="search-empty">Erreur de recherche. Réessayez.</div>';
      });
  }

  function renderSearchResults(results) {
    if (!results.length) {
      searchResults.innerHTML = '<div class="search-empty">Aucun résultat trouvé</div>';
      return;
    }

    searchResults.innerHTML = results.map((r, i) => `
      <div class="search-result-item" role="option" data-index="${i}" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${escapeAttr(r.display_name)}" data-type="${escapeAttr(r.type || '')}">
        <div class="search-result-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="search-result-text">
          <div class="search-result-name">${escapeHtml(r.name || r.display_name.split(',')[0])}</div>
          <div class="search-result-address">${escapeHtml(r.display_name)}</div>
          ${r.type ? `<div class="search-result-type">${escapeHtml(r.type)}</div>` : ''}
        </div>
      </div>
    `).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => selectSearchResult(el));
    });
  }

  function selectSearchResult(el) {
    const lat = parseFloat(el.dataset.lat);
    const lon = parseFloat(el.dataset.lon);
    const name = el.dataset.name;
    const type = el.dataset.type;

    searchResults.classList.add('hidden');
    searchInput.value = el.querySelector('.search-result-name').textContent;

    clearSearchMarkers();
    const marker = createMarker(lat, lon, name);
    searchMarkers.push(marker);

    map.setView([lat, lon], 16);
    showPlaceInfo(name, lat, lon, type);
    addToHistory(name, lat, lon);
  }

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClear.classList.toggle('hidden', !q);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performSearch(q), 400);
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = searchResults.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedResultIndex = Math.min(selectedResultIndex + 1, items.length - 1);
      updateSelectedResult(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedResultIndex = Math.max(selectedResultIndex - 1, 0);
      updateSelectedResult(items);
    } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault();
      selectSearchResult(items[selectedResultIndex]);
    } else if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      toggleSidebar(true);
      searchInput.focus();
    }
  });

  function updateSelectedResult(items) {
    items.forEach((el, i) => {
      el.setAttribute('aria-selected', i === selectedResultIndex ? 'true' : 'false');
    });
    if (items[selectedResultIndex]) {
      items[selectedResultIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    searchResults.classList.add('hidden');
    clearSearchMarkers();
    if (currentPanel === 'place') showPanel('home');
  });

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_HISTORY)) || []; }
    catch { return []; }
  }

  function addToHistory(name, lat, lon) {
    let history = getHistory();
    history = history.filter(h => !(Math.abs(h.lat - lat) < 0.0001 && Math.abs(h.lon - lon) < 0.0001));
    history.unshift({ name: name.split(',')[0].trim(), fullName: name, lat, lon, ts: Date.now() });
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = getHistory();
    const section = $('#history-section');
    const list = $('#history-list');

    if (!history.length) {
      section.classList.add('hidden');
      return;
    }

    section.classList.remove('hidden');
    list.innerHTML = history.map((h, i) => `
      <div class="history-item" data-index="${i}" data-lat="${h.lat}" data-lon="${h.lon}" data-name="${escapeAttr(h.fullName)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="history-item-text">${escapeHtml(h.name)}</span>
        <button class="history-item-remove" data-index="${i}" aria-label="Supprimer" title="Supprimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('');

    list.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.history-item-remove')) return;
        const lat = parseFloat(el.dataset.lat);
        const lon = parseFloat(el.dataset.lon);
        searchInput.value = el.querySelector('.history-item-text').textContent;
        clearSearchMarkers();
        const marker = createMarker(lat, lon, el.dataset.name);
        searchMarkers.push(marker);
        map.setView([lat, lon], 16);
        showPlaceInfo(el.dataset.name, lat, lon);
      });
    });

    list.querySelectorAll('.history-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const history = getHistory();
        history.splice(parseInt(btn.dataset.index), 1);
        localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
        renderHistory();
      });
    });
  }

  $('#history-clear').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_HISTORY);
    renderHistory();
    showToast('Historique effacé');
  });

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(STORAGE_FAVORITES)) || []; }
    catch { return []; }
  }

  function toggleFavorite(name, lat, lon) {
    let favs = getFavorites();
    const existing = favs.findIndex(f => Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lon - lon) < 0.0001);
    if (existing >= 0) {
      favs.splice(existing, 1);
      showToast('Retiré des favoris');
    } else {
      favs.unshift({ name: name.split(',')[0].trim(), fullName: name, lat, lon });
      showToast('Ajouté aux favoris');
    }
    localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favs));
    renderFavorites();
    updateFavBtn(lat, lon);
  }

  function isFavorite(lat, lon) {
    return getFavorites().some(f => Math.abs(f.lat - lat) < 0.0001 && Math.abs(f.lon - lon) < 0.0001);
  }

  function updateFavBtn(lat, lon) {
    const fav = isFavorite(lat, lon);
    placeFavBtn.classList.toggle('active', fav);
    placeFavBtn.setAttribute('aria-label', fav ? 'Retirer des favoris' : 'Ajouter aux favoris');
    placeFavBtn.setAttribute('title', fav ? 'Retirer des favoris' : 'Ajouter aux favoris');
  }

  function renderFavorites() {
    const favs = getFavorites();
    const section = $('#favorites-section');
    const list = $('#favorites-list');

    if (!favs.length) {
      section.classList.remove('hidden');
      list.innerHTML = '<div class="search-empty" style="padding:0.75rem;font-size:0.82rem;">Aucun favori. Cliquez sur l\'étoile d\'un lieu pour l\'ajouter.</div>';
      return;
    }

    section.classList.remove('hidden');
    list.innerHTML = favs.map((f, i) => `
      <div class="favorite-item" data-index="${i}" data-lat="${f.lat}" data-lon="${f.lon}" data-name="${escapeAttr(f.fullName)}">
        <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span class="favorite-item-text">${escapeHtml(f.name)}</span>
        <button class="favorite-item-remove" data-index="${i}" aria-label="Supprimer" title="Supprimer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `).join('');

    list.querySelectorAll('.favorite-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-item-remove')) return;
        const lat = parseFloat(el.dataset.lat);
        const lon = parseFloat(el.dataset.lon);
        clearSearchMarkers();
        const marker = createMarker(lat, lon, el.dataset.name);
        searchMarkers.push(marker);
        map.setView([lat, lon], 16);
        showPlaceInfo(el.dataset.name, lat, lon);
      });
    });

    list.querySelectorAll('.favorite-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const favs = getFavorites();
        favs.splice(parseInt(btn.dataset.index), 1);
        localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favs));
        renderFavorites();
        showToast('Retiré des favoris');
      });
    });
  }

  function createMarker(lat, lon, title, type) {
    const css = type === 'start' ? 'marker-start' : type === 'end' ? 'marker-end' : '';
    const icon = L.divIcon({
      className: `custom-marker ${css}`,
      html: '<div class="marker-pin"><div class="marker-pin-head"></div><div class="marker-pin-shadow"></div></div>',
      iconSize: [30, 44],
      iconAnchor: [15, 44],
      popupAnchor: [0, -46]
    });

    return L.marker([lat, lon], { icon })
      .addTo(map)
      .bindPopup(`<strong>${escapeHtml(title ? title.split(',')[0] : 'Position')}</strong><br><small style="color:var(--text-secondary)">${lat.toFixed(5)}, ${lon.toFixed(5)}</small>`);
  }

  function clearSearchMarkers() {
    searchMarkers.forEach(m => map.removeLayer(m));
    searchMarkers = [];
  }

  function showPlaceInfo(displayName, lat, lon, type) {
    const parts = displayName.split(',');
    placeName.textContent = parts[0].trim();
    placeAddress.textContent = displayName;
    placeCoords.textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    placeType.textContent = type || '';
    placeType.classList.toggle('hidden', !type);

    placeInfo._lat = lat;
    placeInfo._lon = lon;
    placeInfo._name = displayName;

    updateFavBtn(lat, lon);
    showPanel('place');
    toggleSidebar(true);
  }

  placeRouteBtn.addEventListener('click', () => {
    if (placeInfo._lat != null) {
      showPanel('route');
      routeEnd.value = placeInfo._name.split(',')[0];
      routeEndCoords = [placeInfo._lat, placeInfo._lon];
      updateRouteEndMarker();
      if (routeStartCoords) calculateRoute();
    }
  });

  placeShareBtn.addEventListener('click', () => {
    if (placeInfo._lat != null) {
      const url = `${location.origin}${location.pathname}#${placeInfo._lat.toFixed(6)},${placeInfo._lon.toFixed(6)},16`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast('Lien copié dans le presse-papier');
      }
    }
  });

  placeFavBtn.addEventListener('click', () => {
    if (placeInfo._lat != null) {
      toggleFavorite(placeInfo._name, placeInfo._lat, placeInfo._lon);
    }
  });

  placeClose.addEventListener('click', () => showPanel('home'));

  function onMapClick(e) {
    searchResults.classList.add('hidden');
    layersPanel.classList.add('hidden');
    layersBtn.classList.remove('active');

    if (measureMode) {
      addMeasurePoint(e.latlng);
      return;
    }

    if (pinMode) {
      dropPin(e.latlng.lat, e.latlng.lng);
      return;
    }
  }

  function onMapRightClick(e) {
    e.originalEvent.preventDefault();
    const { lat, lng } = e.latlng;

    if (measureMode) return;

    clearSearchMarkers();
    const marker = createMarker(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    searchMarkers.push(marker);
    marker.openPopup();

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'jsonv2',
      addressdetails: '1',
      'accept-language': 'fr'
    });

    fetch(`${NOMINATIM_URL}/reverse?${params}`, {
      headers: { 'User-Agent': 'VentiStudioMaps/1.0' }
    })
      .then(r => r.json())
      .then(data => {
        if (data.display_name) {
          marker.setPopupContent(`<strong>${escapeHtml(data.name || data.display_name.split(',')[0])}</strong><br><small style="color:var(--text-secondary)">${escapeHtml(data.display_name)}</small>`);
          showPlaceInfo(data.display_name, lat, lng, data.type || '');
        }
      })
      .catch(() => {
        showPlaceInfo(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng);
      });
  }

  routeToggleBtn.addEventListener('click', () => {
    if (currentPanel === 'route') {
      showPanel('home');
    } else {
      showPanel('route');
      toggleSidebar(true);
    }
  });

  routeClose.addEventListener('click', () => {
    showPanel('home');
    clearRoute();
  });

  routeSwap.addEventListener('click', () => {
    const tmpVal = routeStart.value;
    routeStart.value = routeEnd.value;
    routeEnd.value = tmpVal;

    const tmpCoords = routeStartCoords;
    routeStartCoords = routeEndCoords;
    routeEndCoords = tmpCoords;

    updateRouteStartMarker();
    updateRouteEndMarker();
    if (routeStartCoords && routeEndCoords) calculateRoute();
  });

  $$('.route-mode').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.route-mode').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (routeStartCoords && routeEndCoords) calculateRoute();
    });
  });

  document.querySelector('.route-field-locate').addEventListener('click', () => {
    doLocate((lat, lon) => {
      routeStartCoords = [lat, lon];
      routeStart.value = 'Ma position';
      updateRouteStartMarker();
      if (routeEndCoords) calculateRoute();
    });
  });

  function geocodeRouteField(input, callback) {
    const q = input.value.trim();
    if (!q) return;

    const params = new URLSearchParams({
      q,
      format: 'jsonv2',
      limit: '1',
      'accept-language': 'fr'
    });

    fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: { 'User-Agent': 'VentiStudioMaps/1.0' }
    })
      .then(r => r.json())
      .then(results => {
        if (results.length) {
          callback([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
        }
      })
      .catch(() => {});
  }

  routeStart.addEventListener('change', () => {
    geocodeRouteField(routeStart, (coords) => {
      routeStartCoords = coords;
      updateRouteStartMarker();
      if (routeEndCoords) calculateRoute();
    });
  });

  routeEnd.addEventListener('change', () => {
    geocodeRouteField(routeEnd, (coords) => {
      routeEndCoords = coords;
      updateRouteEndMarker();
      if (routeStartCoords) calculateRoute();
    });
  });

  function updateRouteStartMarker() {
    if (routeStartMarker) { map.removeLayer(routeStartMarker); routeStartMarker = null; }
    if (routeStartCoords) {
      routeStartMarker = createMarker(routeStartCoords[0], routeStartCoords[1], 'Départ', 'start');
    }
  }

  function updateRouteEndMarker() {
    if (routeEndMarker) { map.removeLayer(routeEndMarker); routeEndMarker = null; }
    if (routeEndCoords) {
      routeEndMarker = createMarker(routeEndCoords[0], routeEndCoords[1], 'Arrivée', 'end');
    }
  }

  function clearRoute() {
    if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
    if (routeStartMarker) { map.removeLayer(routeStartMarker); routeStartMarker = null; }
    if (routeEndMarker) { map.removeLayer(routeEndMarker); routeEndMarker = null; }
    routeStartCoords = null;
    routeEndCoords = null;
    routeStart.value = '';
    routeEnd.value = '';
    routeInfo.classList.add('hidden');
    routeSteps.classList.add('hidden');
  }

  function calculateRoute() {
    if (!routeStartCoords || !routeEndCoords) return;

    const mode = document.querySelector('.route-mode.active')?.dataset.mode || 'driving';
    const profile = mode === 'cycling' ? 'bike' : mode === 'foot' ? 'foot' : 'car';
    const coords = `${routeStartCoords[1]},${routeStartCoords[0]};${routeEndCoords[1]},${routeEndCoords[0]}`;

    routeInfo.innerHTML = '<div class="search-loading">Calcul en cours</div>';
    routeInfo.classList.remove('hidden');
    routeSteps.classList.add('hidden');

    fetch(`${OSRM_URL}/${profile}/${coords}?overview=full&geometries=geojson&steps=true`)
      .then(r => r.json())
      .then(data => {
        if (data.code !== 'Ok' || !data.routes.length) {
          routeInfo.innerHTML = '<div class="search-empty">Itinéraire introuvable</div>';
          return;
        }
        displayRoute(data.routes[0]);
      })
      .catch(() => {
        routeInfo.innerHTML = '<div class="search-empty">Erreur de calcul. Réessayez.</div>';
      });
  }

  function displayRoute(route) {
    if (routeLayer) map.removeLayer(routeLayer);

    routeLayer = L.geoJSON(route.geometry, {
      style: {
        color: '#6366f1',
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      }
    }).addTo(map);

    L.geoJSON(route.geometry, {
      style: {
        color: '#4338ca',
        weight: 9,
        opacity: 0.3,
        lineJoin: 'round',
        lineCap: 'round'
      }
    }).addTo(map).bringToBack();

    map.fitBounds(routeLayer.getBounds(), { padding: [80, 80] });

    const distKm = (route.distance / 1000).toFixed(1);
    const durMin = Math.round(route.duration / 60);
    const durH = Math.floor(durMin / 60);
    const durM = durMin % 60;
    const durText = durH > 0 ? `${durH}h ${durM}min` : `${durMin} min`;

    routeInfo.classList.remove('hidden');
    routeInfo.innerHTML = `
      <div class="route-info-item">
        <span class="route-info-label">Distance</span>
        <span class="route-info-value">${distKm} km</span>
      </div>
      <div class="route-info-item">
        <span class="route-info-label">Durée</span>
        <span class="route-info-value">${durText}</span>
      </div>
    `;

    const legs = route.legs;
    if (legs && legs[0] && legs[0].steps) {
      routeSteps.classList.remove('hidden');
      routeSteps.innerHTML = legs[0].steps
        .filter(s => s.maneuver && s.name)
        .map((s, i) => {
          const dist = s.distance >= 1000
            ? `${(s.distance / 1000).toFixed(1)} km`
            : `${Math.round(s.distance)} m`;
          return `<div class="route-step"><span class="route-step-num">${i + 1}</span><span>${escapeHtml(s.name || 'Continuer')}  ${dist}</span></div>`;
        }).join('');
    }
  }

  measureToggleBtn.addEventListener('click', () => {
    if (currentPanel === 'measure') {
      showPanel('home');
    } else {
      showPanel('measure');
      toggleSidebar(true);
      enterMeasureMode();
    }
  });

  measureClose.addEventListener('click', () => {
    showPanel('home');
  });

  measureReset.addEventListener('click', () => {
    clearMeasure();
    enterMeasureMode();
  });

  function enterMeasureMode() {
    measureMode = true;
    map.getContainer().style.cursor = 'crosshair';
    showToast('Cliquez sur la carte pour mesurer');
  }

  function exitMeasureMode() {
    measureMode = false;
    map.getContainer().style.cursor = '';
    clearMeasure();
  }

  function clearMeasure() {
    measurePoints = [];
    measureLayers.forEach(l => map.removeLayer(l));
    measureLayers = [];
    measureResult.classList.add('hidden');
    measureDistance.textContent = '0 m';
  }

  function addMeasurePoint(latlng) {
    measurePoints.push(latlng);

    const circleMarker = L.circleMarker(latlng, {
      radius: 5,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 1,
      weight: 2
    }).addTo(map);
    measureLayers.push(circleMarker);

    if (measurePoints.length > 1) {
      const line = L.polyline(
        [measurePoints[measurePoints.length - 2], latlng],
        { color: '#f59e0b', weight: 3, dashArray: '8 6', opacity: 0.9 }
      ).addTo(map);
      measureLayers.push(line);
    }

    updateMeasureDistance();
  }

  function updateMeasureDistance() {
    let total = 0;
    for (let i = 1; i < measurePoints.length; i++) {
      total += measurePoints[i - 1].distanceTo(measurePoints[i]);
    }

    measureResult.classList.remove('hidden');
    if (total >= 1000) {
      measureDistance.textContent = `${(total / 1000).toFixed(2)} km`;
    } else {
      measureDistance.textContent = `${Math.round(total)} m`;
    }
  }

  function doLocate(callback) {
    if (!navigator.geolocation) {
      showToast('Géolocalisation non disponible');
      return;
    }
    locateBtn.classList.add('active');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        locateBtn.classList.remove('active');

        if (callback) {
          callback(latitude, longitude);
          return;
        }

        map.setView([latitude, longitude], 15);
        clearSearchMarkers();
        const marker = createMarker(latitude, longitude, 'Ma position');
        searchMarkers.push(marker);
        marker.openPopup();

        routeStartCoords = [latitude, longitude];
        routeStart.value = 'Ma position';
      },
      () => {
        locateBtn.classList.remove('active');
        showToast('Impossible d\'accéder à votre position');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  locateBtn.addEventListener('click', () => doLocate());

  layersBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    layersPanel.classList.toggle('hidden');
    layersBtn.classList.toggle('active', !layersPanel.classList.contains('hidden'));
  });

  $$('input[name="map-layer"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const key = radio.value;
      if (!TILES[key]) return;
      map.removeLayer(currentLayer);
      currentLayer = L.tileLayer(TILES[key].url, {
        attribution: TILES[key].attr,
        maxZoom: 19
      }).addTo(map);
      layersPanel.classList.add('hidden');
      layersBtn.classList.remove('active');
    });
  });

  fullscreenBtn.addEventListener('click', () => {
    const el = document.querySelector('.maps-main');
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreenBtn.classList.toggle('active', !!document.fullscreenElement);
    setTimeout(() => map.invalidateSize(), 100);
  });

  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  document.addEventListener('click', (e) => {
    if (!layersPanel.contains(e.target) && e.target !== layersBtn && !layersBtn.contains(e.target)) {
      layersPanel.classList.add('hidden');
      layersBtn.classList.remove('active');
    }
  });

  trackToggleBtn.addEventListener('click', () => {
    if (currentPanel === 'track') {
      showPanel('home');
    } else {
      showPanel('track');
      toggleSidebar(true);
    }
  });

  trackClose.addEventListener('click', () => showPanel('home'));

  trackStartBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { showToast('Géolocalisation non disponible'); return; }

    if (trackPaused) {

      trackPaused = false;
      trackStartBtn.classList.add('recording');
      trackStartBtn.querySelector('span:last-child').textContent = 'En cours…';
      trackPauseBtn.disabled = false;
      startTrackTimer();
      startTrackWatch();
      showToast('Enregistrement repris');
      return;
    }

    trackPoints = [];
    if (trackLine) { map.removeLayer(trackLine); trackLine = null; }
    trackStartTime = Date.now();
    trackPaused = false;

    trackStartBtn.classList.add('recording');
    trackStartBtn.querySelector('span:last-child').textContent = 'En cours…';
    trackPauseBtn.disabled = false;
    trackStopBtn.disabled = false;
    trackStats.classList.remove('hidden');
    trackToggleBtn.classList.add('recording');

    startTrackTimer();
    startTrackWatch();
    showToast('Enregistrement démarré');
  });

  trackPauseBtn.addEventListener('click', () => {
    trackPaused = true;
    trackStartBtn.classList.remove('recording');
    trackStartBtn.querySelector('span:last-child').textContent = 'Reprendre';
    trackPauseBtn.disabled = true;
    stopTrackWatch();
    clearInterval(trackTimer);
    showToast('Enregistrement en pause');
  });

  trackStopBtn.addEventListener('click', () => {
    stopTrackWatch();
    clearInterval(trackTimer);
    trackStartBtn.classList.remove('recording');
    trackStartBtn.querySelector('span:last-child').textContent = 'Enregistrer';
    trackPauseBtn.disabled = true;
    trackStopBtn.disabled = true;
    trackToggleBtn.classList.remove('recording');

    if (trackPoints.length > 1) {
      saveTrack();
      trackExportGpx.disabled = false;
      trackExportGeojson.disabled = false;
      showToast('Trajet enregistré !');
    } else {
      showToast('Pas assez de points pour sauvegarder');
    }
    trackPaused = false;
  });

  function startTrackWatch() {
    trackWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, accuracy } = pos.coords;
        if (accuracy > 100) return;

        const latlng = L.latLng(latitude, longitude);
        trackPoints.push({ lat: latitude, lng: longitude, ts: Date.now(), speed: speed || 0 });

        if (!trackLine) {
          trackLine = L.polyline([], { color: '#10b981', weight: 4, opacity: 0.9 }).addTo(map);
        }
        trackLine.addLatLng(latlng);
        map.panTo(latlng);

        updateTrackStats();
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );
  }

  function stopTrackWatch() {
    if (trackWatchId !== null) {
      navigator.geolocation.clearWatch(trackWatchId);
      trackWatchId = null;
    }
  }

  function startTrackTimer() {
    trackTimer = setInterval(updateTrackDuration, 1000);
  }

  function updateTrackDuration() {
    if (!trackStartTime) return;
    const elapsed = Math.floor((Date.now() - trackStartTime) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    trackDurationEl.textContent = h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateTrackStats() {
    let totalDist = 0;
    for (let i = 1; i < trackPoints.length; i++) {
      totalDist += L.latLng(trackPoints[i - 1].lat, trackPoints[i - 1].lng)
        .distanceTo(L.latLng(trackPoints[i].lat, trackPoints[i].lng));
    }

    trackDistanceEl.textContent = totalDist >= 1000
      ? `${(totalDist / 1000).toFixed(2)} km`
      : `${Math.round(totalDist)} m`;

    trackPointsEl.textContent = trackPoints.length;

    if (trackStartTime && totalDist > 0) {
      const elapsed = (Date.now() - trackStartTime) / 1000 / 3600;
      const avgSpeed = (totalDist / 1000) / elapsed;
      trackSpeedEl.textContent = `${avgSpeed.toFixed(1)} km/h`;
    }
  }

  function getSavedTracks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_TRACKS)) || []; }
    catch { return []; }
  }

  function saveTrack() {
    const tracks = getSavedTracks();
    let totalDist = 0;
    for (let i = 1; i < trackPoints.length; i++) {
      totalDist += L.latLng(trackPoints[i - 1].lat, trackPoints[i - 1].lng)
        .distanceTo(L.latLng(trackPoints[i].lat, trackPoints[i].lng));
    }
    const duration = trackStartTime ? Math.floor((Date.now() - trackStartTime) / 1000) : 0;
    const distLabel = totalDist >= 1000 ? `${(totalDist / 1000).toFixed(1)} km` : `${Math.round(totalDist)} m`;
    const durLabel = duration >= 3600
      ? `${Math.floor(duration / 3600)}h${Math.floor((duration % 3600) / 60)}min`
      : `${Math.floor(duration / 60)}min`;

    tracks.unshift({
      id: Date.now(),
      name: `Trajet du ${new Date().toLocaleDateString('fr-FR')}`,
      points: trackPoints,
      distance: distLabel,
      duration: durLabel,
      ts: Date.now()
    });

    if (tracks.length > 20) tracks.length = 20;
    localStorage.setItem(STORAGE_TRACKS, JSON.stringify(tracks));
    renderSavedTracks();
  }

  function renderSavedTracks() {
    const tracks = getSavedTracks();
    const section = $('#tracks-section');
    const list = $('#tracks-list');

    if (!tracks.length) { section.classList.add('hidden'); return; }

    section.classList.remove('hidden');
    list.innerHTML = tracks.map((t, i) => `
      <div class="track-saved-item" data-index="${i}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <div class="track-saved-info">
          <div class="track-saved-name">${escapeHtml(t.name)}</div>
          <div class="track-saved-meta">${t.distance} · ${t.duration}</div>
        </div>
        <div class="track-saved-actions">
          <button class="track-action-btn show-track" data-index="${i}" title="Afficher">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="track-action-btn export-track" data-index="${i}" title="Exporter GPX">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="track-action-btn delete" data-index="${i}" title="Supprimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.show-track').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const track = tracks[parseInt(btn.dataset.index)];
        showTrackOnMap(track.points);
      });
    });

    list.querySelectorAll('.export-track').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const track = tracks[parseInt(btn.dataset.index)];
        downloadGpx(track.points, track.name);
      });
    });

    list.querySelectorAll('.track-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tracks = getSavedTracks();
        tracks.splice(parseInt(btn.dataset.index), 1);
        localStorage.setItem(STORAGE_TRACKS, JSON.stringify(tracks));
        renderSavedTracks();
        showToast('Trajet supprimé');
      });
    });
  }

  function showTrackOnMap(points) {
    if (trackLine) { map.removeLayer(trackLine); trackLine = null; }
    const latlngs = points.map(p => [p.lat, p.lng]);
    trackLine = L.polyline(latlngs, { color: '#10b981', weight: 4, opacity: 0.9 }).addTo(map);
    map.fitBounds(trackLine.getBounds(), { padding: [60, 60] });
    showPanel('home');
  }

  function toGpxString(points, name) {
    const pts = points.map(p =>
      `      <trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.ts).toISOString()}</time></trkpt>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VentiStudioMaps" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapeHtml(name || 'Trajet')}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>`;
  }

  function toGeojsonString(points) {
    return JSON.stringify({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: points.map(p => [p.lng, p.lat])
        },
        properties: { timestamp: points.map(p => p.ts) }
      }]
    }, null, 2);
  }

  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadGpx(points, name) {
    downloadFile(toGpxString(points, name), `${name || 'trajet'}.gpx`, 'application/gpx+xml');
    showToast('GPX téléchargé');
  }

  trackExportGpx.addEventListener('click', () => {
    if (trackPoints.length > 1) {
      downloadGpx(trackPoints, `Trajet du ${new Date().toLocaleDateString('fr-FR')}`);
    }
  });

  trackExportGeojson.addEventListener('click', () => {
    if (trackPoints.length > 1) {
      downloadFile(
        toGeojsonString(trackPoints),
        `trajet-${new Date().toISOString().slice(0, 10)}.geojson`,
        'application/geo+json'
      );
      showToast('GeoJSON téléchargé');
    }
  });

  pinClose.addEventListener('click', () => showPanel('home'));

  pinsClear.addEventListener('click', () => {
    pinMarkers.forEach(m => map.removeLayer(m));
    pinMarkers = [];
    localStorage.removeItem(STORAGE_PINS);
    renderPins();
    showToast('Repères supprimés');
  });

  function enterPinMode() {
    pinMode = true;
    map.getContainer().style.cursor = 'crosshair';
    showToast('Cliquez pour placer un repère');
  }

  function exitPinMode() {
    pinMode = false;
    map.getContainer().style.cursor = '';
  }

  function getSavedPins() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PINS)) || []; }
    catch { return []; }
  }

  function dropPin(lat, lng) {
    const pins = getSavedPins();
    const pin = { lat, lng, name: `Repère ${pins.length + 1}`, ts: Date.now() };
    pins.push(pin);
    localStorage.setItem(STORAGE_PINS, JSON.stringify(pins));

    const marker = createMarker(lat, lng, pin.name);
    pinMarkers.push(marker);
    marker.openPopup();

    renderPins();
    showToast('Repère ajouté');
  }

  function renderPins() {
    const pins = getSavedPins();
    if (!pins.length) {
      pinsList.innerHTML = '<div class="search-empty" style="padding:0.75rem;font-size:0.82rem;">Aucun repère. Cliquez sur la carte pour en ajouter.</div>';
      return;
    }

    pinsList.innerHTML = pins.map((p, i) => `
      <div class="track-saved-item" data-index="${i}">
        <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div class="track-saved-info">
          <div class="track-saved-name">${escapeHtml(p.name)}</div>
          <div class="track-saved-meta">${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</div>
        </div>
        <div class="track-saved-actions">
          <button class="track-action-btn go-pin" data-index="${i}" title="Aller au repère">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="track-action-btn delete del-pin" data-index="${i}" title="Supprimer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    pinsList.querySelectorAll('.go-pin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pin = pins[parseInt(btn.dataset.index)];
        map.setView([pin.lat, pin.lng], 16);
      });
    });

    pinsList.querySelectorAll('.del-pin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        const pins = getSavedPins();
        pins.splice(idx, 1);
        localStorage.setItem(STORAGE_PINS, JSON.stringify(pins));
        if (pinMarkers[idx]) { map.removeLayer(pinMarkers[idx]); pinMarkers.splice(idx, 1); }
        renderPins();
        showToast('Repère supprimé');
      });
    });
  }

  function loadPinsOnMap() {
    const pins = getSavedPins();
    pins.forEach(p => {
      const marker = createMarker(p.lat, p.lng, p.name);
      pinMarkers.push(marker);
    });
    renderPins();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  initMap();
  parseHash();
  renderHistory();
  renderFavorites();
  renderSavedTracks();
  loadPinsOnMap();
})();
