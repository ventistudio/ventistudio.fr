// ═══ Galerie Communautaire — Logique ═══
(function() {
  if (typeof galleryData === 'undefined') return;

  var gridEl = document.getElementById('gallery-grid');
  var searchInput = document.getElementById('gallery-search');
  var chipsContainer = document.getElementById('gallery-chips');
  var sortSelect = document.getElementById('gallery-sort');
  var lightboxEl = document.getElementById('gallery-lightbox');
  var statWorks = document.getElementById('stat-works');
  var statArtists = document.getElementById('stat-artists');
  var statFeatured = document.getElementById('stat-featured');

  if (!gridEl) return;

  var activeType = '';
  var currentLightboxIndex = -1;
  var filteredItems = [];

  var typeLabels = {
    illustration: '🎨 Illustration',
    music: '🎵 Musique',
    writing: '✍️ Écriture',
    video: '🎬 Vidéo',
    photo: '📷 Photo',
    '3d': '🧊 3D'
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getTypeClass(type) {
    return type === '3d' ? 'three-d' : type;
  }

  function getFiltered() {
    var search = (searchInput.value || '').toLowerCase().trim();
    var sort = sortSelect.value;

    var result = galleryData.filter(function(item) {
      if (activeType && item.type !== activeType) return false;
      if (search) {
        var haystack = (item.title + ' ' + item.artist + ' ' + item.tags.join(' ')).toLowerCase();
        if (haystack.indexOf(search) === -1) return false;
      }
      return true;
    });

    if (sort === 'date-desc') {
      result.sort(function(a, b) { return b.date.localeCompare(a.date); });
    } else if (sort === 'date-asc') {
      result.sort(function(a, b) { return a.date.localeCompare(b.date); });
    } else if (sort === 'featured') {
      result.sort(function(a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    } else if (sort === 'artist') {
      result.sort(function(a, b) { return a.artist.localeCompare(b.artist); });
    }

    return result;
  }

  function renderChips() {
    chipsContainer.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.className = 'gallery-chip' + (!activeType ? ' active' : '');
    allBtn.textContent = 'Tous';
    allBtn.addEventListener('click', function() { activeType = ''; render(); });
    chipsContainer.appendChild(allBtn);

    Object.keys(typeLabels).forEach(function(type) {
      var btn = document.createElement('button');
      btn.className = 'gallery-chip' + (activeType === type ? ' active' : '');
      btn.textContent = typeLabels[type];
      btn.addEventListener('click', function() { activeType = type; render(); });
      chipsContainer.appendChild(btn);
    });
  }

  function renderGrid(data) {
    gridEl.innerHTML = '';
    filteredItems = data;

    if (data.length === 0) {
      gridEl.innerHTML = '<div class="gallery-no-results">Aucune œuvre trouvée pour cette recherche.</div>';
      return;
    }

    data.forEach(function(item, index) {
      var card = document.createElement('div');
      card.className = 'gallery-card';

      var tagsHtml = item.tags.slice(0, 3).map(function(t) {
        return '<span class="gallery-tag">' + escapeHtml(t) + '</span>';
      }).join('');

      card.innerHTML =
        '<div style="position:relative">' +
          '<img class="gallery-card-image" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          (item.featured ? '<span class="gallery-featured-badge">⭐ Featured</span>' : '') +
          '<div class="gallery-card-overlay"><div class="gallery-card-overlay-text">Cliquez pour agrandir</div></div>' +
        '</div>' +
        '<div class="gallery-card-body">' +
          '<div class="gallery-card-title">' + escapeHtml(item.title) + '</div>' +
          '<div class="gallery-card-artist">par ' + escapeHtml(item.artist) + '</div>' +
          '<div class="gallery-card-meta">' +
            '<span class="gallery-type-badge ' + getTypeClass(item.type) + '">' + escapeHtml(typeLabels[item.type] || item.type) + '</span>' +
            tagsHtml +
          '</div>' +
        '</div>';

      card.addEventListener('click', function() {
        openLightbox(index);
      });

      gridEl.appendChild(card);
    });
  }

  function updateStats() {
    if (statWorks) statWorks.textContent = galleryData.length;
    if (statArtists) {
      var artists = {};
      galleryData.forEach(function(i) { artists[i.artist] = true; });
      statArtists.textContent = Object.keys(artists).length;
    }
    if (statFeatured) statFeatured.textContent = galleryData.filter(function(i) { return i.featured; }).length;
  }

  function openLightbox(index) {
    currentLightboxIndex = index;
    var item = filteredItems[index];
    if (!item) return;

    lightboxEl.innerHTML =
      '<button class="gallery-lightbox-close" aria-label="Fermer">&times;</button>' +
      '<button class="gallery-lightbox-nav prev" aria-label="Précédent">‹</button>' +
      '<button class="gallery-lightbox-nav next" aria-label="Suivant">›</button>' +
      '<div class="gallery-lightbox-content">' +
        '<img class="gallery-lightbox-image" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
        '<div class="gallery-lightbox-info">' +
          '<div class="gallery-lightbox-title">' + escapeHtml(item.title) + '</div>' +
          '<div class="gallery-lightbox-artist">par ' + escapeHtml(item.artist) + ' · ' + item.date + '</div>' +
          '<div class="gallery-lightbox-desc">' + escapeHtml(item.description) + '</div>' +
        '</div>' +
      '</div>';

    lightboxEl.hidden = false;

    lightboxEl.querySelector('.gallery-lightbox-close').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.gallery-lightbox-nav.prev').addEventListener('click', function(e) {
      e.stopPropagation();
      navigateLightbox(-1);
    });
    lightboxEl.querySelector('.gallery-lightbox-nav.next').addEventListener('click', function(e) {
      e.stopPropagation();
      navigateLightbox(1);
    });
    lightboxEl.addEventListener('click', function(e) {
      if (e.target === lightboxEl) closeLightbox();
    });
  }

  function closeLightbox() {
    lightboxEl.hidden = true;
    lightboxEl.innerHTML = '';
    currentLightboxIndex = -1;
  }

  function navigateLightbox(direction) {
    var newIndex = currentLightboxIndex + direction;
    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;
    openLightbox(newIndex);
  }

  function render() {
    renderChips();
    var data = getFiltered();
    renderGrid(data);
    updateStats();
  }

  searchInput.addEventListener('input', render);
  sortSelect.addEventListener('change', render);

  document.addEventListener('keydown', function(e) {
    if (currentLightboxIndex === -1) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  render();
})();
