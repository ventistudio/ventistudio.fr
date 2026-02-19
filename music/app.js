// ============================================================
// VentiStudio Music — Complete Spotify-like App
// ============================================================

// ---- Global State ----
let musicData = [];
let currentIndex = 0;
let isLoop = false;
let isShuffle = false;
let audioCtxInitialized = false;
let audioCtx, analyser, source, dataArray;
let ledColors = [];
let ledAnimationId = null;
let currentView = 'home'; // home | allTracks | artists | artist | albums | album | search

// ---- DOM References ----
const audio = document.getElementById('mainAudio');
const progressBar = document.getElementById('progressBar');
const progressHandle = document.getElementById('progressHandle');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const playPauseBtn = document.getElementById('playPauseBtn');
const loopBtn = document.getElementById('loopBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');
const progressWrapper = document.getElementById('progressWrapper');
const currentAlbumImage = document.getElementById('currentAlbumImage');
const viewContainer = document.getElementById('viewContainer');

// Mobile player refs
const pmTitle = document.getElementById('pmTitle');
const pmArtist = document.getElementById('pmArtist');
const pmCover = document.getElementById('pmCover');
const pmPlayBtn = document.getElementById('pmPlayBtn');
const pmProgressBar = document.getElementById('pmProgressBar');

// ---- DOM Ready ----
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  fetchMusic();
  setupSidebar();
  setupVolumeSlider();
  setupProgressDrag();
  setupSearch();
}

// ============================================================
// SIDEBAR
// ============================================================
function setupSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  if (overlay) overlay.addEventListener('click', () => sidebar.classList.remove('open'));
}

function updateActiveNav(view) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));
  const map = {
    home: '/music',
    allTracks: '/music',
    search: '/music',
    artists: '#artists',
    artist: '#artists',
    albums: '#albums',
    album: '#albums'
  };
  const href = map[view];
  if (!href) return;
  if (href.startsWith('#')) {
    const id = view === 'artist' ? 'navArtists' : view === 'album' ? 'navAlbums' : `nav${view.charAt(0).toUpperCase() + view.slice(1)}`;
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  } else {
    const link = document.querySelector(`.sidebar-nav a[href="${href}"]`);
    if (link) link.classList.add('active');
  }
}

// ============================================================
// VOLUME
// ============================================================
function setupVolumeSlider() {
  const slider = document.getElementById('volumeSlider');
  if (!slider) return;
  slider.addEventListener('input', e => {
    audio.volume = parseFloat(e.target.value);
    saveCurrentMusicSession();
  });
}

// ============================================================
// PROGRESS DRAG
// ============================================================
function setupProgressDrag() {
  if (!progressWrapper) return;
  let isDragging = false;
  const seek = e => {
    const rect = progressWrapper.getBoundingClientRect();
    const pos = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    if (audio.duration) audio.currentTime = pos * audio.duration;
  };
  const seekTouch = e => {
    const t = e.touches[0];
    const rect = progressWrapper.getBoundingClientRect();
    const pos = Math.min(Math.max((t.clientX - rect.left) / rect.width, 0), 1);
    if (audio.duration) audio.currentTime = pos * audio.duration;
  };
  progressWrapper.addEventListener('mousedown', e => { isDragging = true; seek(e); });
  document.addEventListener('mousemove', e => { if (isDragging) seek(e); });
  document.addEventListener('mouseup', () => isDragging = false);
  progressWrapper.addEventListener('touchstart', e => { isDragging = true; seekTouch(e); }, { passive: true });
  progressWrapper.addEventListener('touchmove', e => { if (isDragging) seekTouch(e); }, { passive: true });
  progressWrapper.addEventListener('touchend', () => isDragging = false);
}

// ============================================================
// SEARCH
// ============================================================
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  let debounce;
  input.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = e.target.value.trim();
      if (q.length === 0) {
        showView('home');
      } else {
        showView('search', q);
      }
    }, 250);
  });

  document.getElementById('sortSelect')?.addEventListener('change', e => {
    const sort = e.target.value;
    if (!sort) return;
    const tracks = [...musicData].sort((a, b) => (a[sort] || '').localeCompare(b[sort] || ''));
    showView('allTracks', null, tracks);
  });
}

// ============================================================
// DATA EXTRACTION HELPERS
// ============================================================
function getArtists() {
  const map = {};
  musicData.forEach(t => {
    if (!map[t.artist]) {
      map[t.artist] = { name: t.artist, tracks: [], albums: new Set(), covers: new Set() };
    }
    map[t.artist].tracks.push(t);
    map[t.artist].albums.add(t.album);
    map[t.artist].covers.add(t.cover);
  });
  return Object.values(map).map(a => ({
    ...a,
    albums: [...a.albums],
    covers: [...a.covers],
    cover: a.covers.values().next().value,
    trackCount: a.tracks.length,
    albumCount: a.albums.size
  })).sort((a, b) => b.trackCount - a.trackCount);
}

function getAlbums() {
  const map = {};
  musicData.forEach(t => {
    const key = `${t.album}___${t.artist}`;
    if (!map[key]) {
      map[key] = { name: t.album, artist: t.artist, cover: t.cover, tracks: [], styles: new Set() };
    }
    map[key].tracks.push(t);
    if (t.style) t.style.split(',').forEach(s => map[key].styles.add(s.trim()));
  });
  return Object.values(map).map(a => ({
    ...a,
    styles: [...a.styles],
    trackCount: a.tracks.length
  })).sort((a, b) => b.trackCount - a.trackCount);
}

function getRecentlyPlayed() {
  const history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
  return history.slice(0, 8).filter(h => musicData.some(t => t.title === h.title));
}

// ============================================================
// VIEW SYSTEM
// ============================================================
function showView(view, param, extraData) {
  currentView = view;
  const container = viewContainer;
  if (!container) return;
  const backBtn = document.getElementById('backBtn');
  const sortWrap = document.getElementById('sortSelectWrap');

  // Show/hide back button
  const subViews = ['artist', 'album', 'allTracks', 'search'];
  if (backBtn) backBtn.style.display = subViews.includes(view) ? 'flex' : 'none';
  if (sortWrap) sortWrap.style.display = (view === 'allTracks' || view === 'search') ? '' : 'none';

  updateActiveNav(view);

  switch (view) {
    case 'home': renderHome(container); break;
    case 'allTracks': renderAllTracks(container, extraData || musicData); break;
    case 'search': renderSearch(container, param); break;
    case 'artists': renderArtistsList(container); break;
    case 'artist': renderArtistPage(container, param); break;
    case 'albums': renderAlbumsList(container); break;
    case 'album': renderAlbumPage(container, param); break;
  }
}

// ============================================================
// HOME VIEW
// ============================================================
function renderHome(container) {
  const recent = getRecentlyPlayed();
  const albums = getAlbums();
  const artists = getArtists();

  let html = '';

  // Welcome
  html += `
    <div class="home-welcome">
      <h1>Bienvenue sur VentiStudio Music</h1>
      <p>${musicData.length} titres · ${albums.length} albums · ${artists.length} artistes</p>
    </div>
  `;

  // Recently played
  if (recent.length > 0) {
    html += `
      <section class="home-section">
        <div class="section-header">
          <h2>Reprendre l'écoute</h2>
        </div>
        <div class="quick-picks">
          ${recent.map(t => {
            const idx = musicData.findIndex(m => m.title === t.title && m.artist === t.artist);
            return `
              <div class="quick-pick" onclick="playTrack(${idx})">
                <img src="/${t.cover}" alt="${t.title}" loading="lazy">
                <div class="quick-pick-info">
                  <span class="quick-pick-title">${t.title}</span>
                  <span class="quick-pick-artist">${t.artist}</span>
                </div>
                <button class="quick-pick-play" onclick="event.stopPropagation();playTrack(${idx})">
                  <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  // Artists
  html += `
    <section class="home-section">
      <div class="section-header">
        <h2>Artistes</h2>
        <button class="section-link" onclick="showView('artists')">Tout afficher</button>
      </div>
      <div class="horizontal-scroll">
        ${artists.map(a => `
          <div class="artist-card" onclick="showView('artist','${escapeAttr(a.name)}')">
            <div class="artist-card-image">
              <img src="/${a.cover}" alt="${a.name}" loading="lazy">
            </div>
            <div class="artist-card-name">${a.name}</div>
            <div class="artist-card-meta">${a.trackCount} titres · ${a.albumCount} albums</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // Albums
  html += `
    <section class="home-section">
      <div class="section-header">
        <h2>Albums</h2>
        <button class="section-link" onclick="showView('albums')">Tout afficher</button>
      </div>
      <div class="horizontal-scroll">
        ${albums.map(a => `
          <div class="album-card" onclick="showView('album','${escapeAttr(a.name + '___' + a.artist)}')">
            <img src="/${a.cover}" alt="${a.name}" loading="lazy">
            <div class="album-card-title">${a.name}</div>
            <div class="album-card-meta">${a.artist} · ${a.trackCount} titres</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  // All tracks teaser
  html += `
    <section class="home-section">
      <div class="section-header">
        <h2>Tous les titres</h2>
        <button class="section-link" onclick="showView('allTracks')">Tout afficher</button>
      </div>
      <div class="track-list" id="trackList">
        ${renderTrackCards(musicData.slice(0, 20))}
      </div>
    </section>
  `;

  container.innerHTML = html;
}

// ============================================================
// ALL TRACKS VIEW
// ============================================================
function renderAllTracks(container, tracks) {
  container.innerHTML = `
    <div class="view-header">
      <h1>Tous les titres</h1>
      <p>${tracks.length} titres disponibles</p>
    </div>
    <div class="track-list" id="trackList">
      ${renderTrackCards(tracks)}
    </div>
  `;
}

// ============================================================
// SEARCH VIEW
// ============================================================
function renderSearch(container, query) {
  const q = query.toLowerCase();
  const matchedTracks = musicData.filter(t =>
    `${t.title} ${t.artist} ${t.album} ${t.style}`.toLowerCase().includes(q)
  );
  const matchedArtists = getArtists().filter(a => a.name.toLowerCase().includes(q));
  const matchedAlbums = getAlbums().filter(a => a.name.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));

  let html = `<div class="view-header"><h1>Résultats pour « ${query} »</h1></div>`;

  if (matchedArtists.length > 0) {
    html += `
      <section class="home-section">
        <div class="section-header"><h2>Artistes</h2></div>
        <div class="horizontal-scroll">
          ${matchedArtists.map(a => `
            <div class="artist-card" onclick="showView('artist','${escapeAttr(a.name)}')">
              <div class="artist-card-image">
                <img src="/${a.cover}" alt="${a.name}" loading="lazy">
              </div>
              <div class="artist-card-name">${a.name}</div>
              <div class="artist-card-meta">${a.trackCount} titres</div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  if (matchedAlbums.length > 0) {
    html += `
      <section class="home-section">
        <div class="section-header"><h2>Albums</h2></div>
        <div class="horizontal-scroll">
          ${matchedAlbums.map(a => `
            <div class="album-card" onclick="showView('album','${escapeAttr(a.name + '___' + a.artist)}')">
              <img src="/${a.cover}" alt="${a.name}" loading="lazy">
              <div class="album-card-title">${a.name}</div>
              <div class="album-card-meta">${a.artist}</div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  if (matchedTracks.length > 0) {
    html += `
      <section class="home-section">
        <div class="section-header"><h2>Titres</h2></div>
        <div class="track-list" id="trackList">
          ${renderTrackCards(matchedTracks)}
        </div>
      </section>
    `;
  }

  if (matchedTracks.length === 0 && matchedArtists.length === 0 && matchedAlbums.length === 0) {
    html += `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h2>Aucun résultat</h2>
        <p>Essayez avec d'autres mots-clés.</p>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ============================================================
// ARTISTS LIST VIEW
// ============================================================
function renderArtistsList(container) {
  const artists = getArtists();
  container.innerHTML = `
    <div class="view-header">
      <h1>Artistes</h1>
      <p>${artists.length} artistes</p>
    </div>
    <div class="artists-grid">
      ${artists.map(a => `
        <div class="artist-card-lg" onclick="showView('artist','${escapeAttr(a.name)}')">
          <div class="artist-card-lg-image">
            <img src="/${a.cover}" alt="${a.name}" loading="lazy">
          </div>
          <div class="artist-card-lg-name">${a.name}</div>
          <div class="artist-card-lg-meta">${a.trackCount} titres · ${a.albumCount} albums</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================
// ARTIST PAGE VIEW
// ============================================================
function renderArtistPage(container, artistName) {
  const artist = getArtists().find(a => a.name === artistName);
  if (!artist) {
    container.innerHTML = `<div class="empty-state"><h2>Artiste introuvable</h2></div>`;
    return;
  }

  // Get albums for this artist
  const artistAlbums = getAlbums().filter(a => a.artist === artistName);
  // Get play counts from history
  const history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
  const tracksWithPopularity = artist.tracks.map(t => {
    const h = history.find(h => h.title === t.title);
    return { ...t, playCount: h ? h.playCount : 0 };
  }).sort((a, b) => b.playCount - a.playCount);

  const topTracks = tracksWithPopularity.slice(0, 5);
  const totalPlays = tracksWithPopularity.reduce((s, t) => s + t.playCount, 0);

  container.innerHTML = `
    <div class="artist-hero" style="--hero-cover: url('/${artist.cover}')">
      <div class="artist-hero-overlay"></div>
      <div class="artist-hero-content">
        <div class="artist-hero-avatar">
          <img src="/${artist.cover}" alt="${artist.name}">
        </div>
        <div class="artist-hero-info">
          <span class="artist-hero-label">Artiste</span>
          <h1 class="artist-hero-name">${artist.name}</h1>
          <p class="artist-hero-stats">${artist.trackCount} titres · ${artist.albumCount} albums · ${totalPlays} écoutes</p>
        </div>
      </div>
      <div class="artist-hero-actions">
        <button class="btn-play-all" onclick="playArtist('${escapeAttr(artist.name)}')">
          <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Lecture
        </button>
        <button class="btn-shuffle-all" onclick="shuffleArtist('${escapeAttr(artist.name)}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
          Aléatoire
        </button>
      </div>
    </div>

    ${topTracks.length > 0 ? `
    <section class="home-section">
      <div class="section-header"><h2>Titres populaires</h2></div>
      <div class="track-table">
        ${topTracks.map((t, i) => {
          const idx = musicData.findIndex(m => m.title === t.title && m.artist === t.artist);
          return `
            <div class="track-row${idx === currentIndex ? ' playing' : ''}" onclick="playTrack(${idx})" data-index="${idx}">
              <span class="track-row-num">${i + 1}</span>
              <img class="track-row-cover" src="/${t.cover}" alt="" loading="lazy">
              <div class="track-row-info">
                <span class="track-row-title">${t.title}</span>
                <span class="track-row-album">${t.album}</span>
              </div>
              <span class="track-row-plays">${t.playCount > 0 ? t.playCount + '×' : '—'}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>
    ` : ''}

    <section class="home-section">
      <div class="section-header"><h2>Discographie</h2></div>
      <div class="horizontal-scroll">
        ${artistAlbums.map(a => `
          <div class="album-card" onclick="showView('album','${escapeAttr(a.name + '___' + a.artist)}')">
            <img src="/${a.cover}" alt="${a.name}" loading="lazy">
            <div class="album-card-title">${a.name}</div>
            <div class="album-card-meta">${a.trackCount} titres</div>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="home-section">
      <div class="section-header"><h2>Tous les titres</h2></div>
      <div class="track-list" id="trackList">
        ${renderTrackCards(artist.tracks)}
      </div>
    </section>
  `;
}

// ============================================================
// ALBUMS LIST VIEW
// ============================================================
function renderAlbumsList(container) {
  const albums = getAlbums();
  container.innerHTML = `
    <div class="view-header">
      <h1>Albums</h1>
      <p>${albums.length} albums</p>
    </div>
    <div class="albums-grid">
      ${albums.map(a => `
        <div class="album-card" onclick="showView('album','${escapeAttr(a.name + '___' + a.artist)}')">
          <img src="/${a.cover}" alt="${a.name}" loading="lazy">
          <div class="album-card-title">${a.name}</div>
          <div class="album-card-meta">${a.artist} · ${a.trackCount} titres</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================
// ALBUM PAGE VIEW
// ============================================================
function renderAlbumPage(container, key) {
  const [albumName, artistName] = key.split('___');
  const albums = getAlbums();
  const album = albums.find(a => a.name === albumName && a.artist === artistName);
  if (!album) {
    container.innerHTML = `<div class="empty-state"><h2>Album introuvable</h2></div>`;
    return;
  }

  const totalDuration = '—'; // no duration data available
  const history = JSON.parse(localStorage.getItem('musicHistory') || '[]');

  container.innerHTML = `
    <div class="album-hero" style="--hero-cover: url('/${album.cover}')">
      <div class="album-hero-overlay"></div>
      <div class="album-hero-content">
        <div class="album-hero-cover">
          <img src="/${album.cover}" alt="${album.name}">
        </div>
        <div class="album-hero-info">
          <span class="album-hero-label">Album</span>
          <h1 class="album-hero-name">${album.name}</h1>
          <div class="album-hero-meta">
            <a class="album-hero-artist" onclick="showView('artist','${escapeAttr(album.artist)}')">${album.artist}</a>
            <span>·</span>
            <span>${album.trackCount} titres</span>
            ${album.styles.length > 0 ? `<span>·</span><span>${album.styles.join(', ')}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="album-hero-actions">
        <button class="btn-play-all" onclick="playAlbum('${escapeAttr(key)}')">
          <svg viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Lecture
        </button>
        <button class="btn-shuffle-all" onclick="shuffleAlbum('${escapeAttr(key)}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
          Aléatoire
        </button>
      </div>
    </div>

    <div class="track-table album-tracklist">
      ${album.tracks.map((t, i) => {
        const idx = musicData.findIndex(m => m.title === t.title && m.artist === t.artist && m.album === t.album);
        const h = history.find(h => h.title === t.title);
        return `
          <div class="track-row${idx === currentIndex ? ' playing' : ''}" onclick="playTrack(${idx})" data-index="${idx}">
            <span class="track-row-num">${i + 1}</span>
            <div class="track-row-info">
              <span class="track-row-title">${t.title}</span>
              <span class="track-row-album">${t.style || ''}</span>
            </div>
            <span class="track-row-plays">${h && h.playCount > 0 ? h.playCount + '×' : ''}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================
// TRACK CARD RENDERING
// ============================================================
function renderTrackCards(tracks) {
  return tracks.map(track => {
    const actualIndex = musicData.findIndex(t =>
      t.title === track.title && t.artist === track.artist && t.album === track.album
    );
    const isPlaying = actualIndex === currentIndex && !audio.paused;
    return `
      <div class="track${isPlaying ? ' playing' : ''}" data-index="${actualIndex}" onclick="playTrack(${actualIndex})">
        <img src="/${track.cover}" alt="${track.title}" loading="lazy">
        <div class="track-play-overlay">
          <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div class="track-title">${track.title}</div>
        <div class="track-info">
          <p><a href="javascript:void(0)" class="artist-link" onclick="event.stopPropagation();showView('artist','${escapeAttr(track.artist)}')">${track.artist}</a></p>
          <p>${track.album || 'Single'}</p>
        </div>
      </div>
    `;
  }).join('');
}

function escapeAttr(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ============================================================
// PLAY ARTIST / ALBUM HELPERS
// ============================================================
function playArtist(artistName) {
  const artistTracks = musicData.filter(t => t.artist === artistName);
  if (artistTracks.length === 0) return;
  const firstIdx = musicData.indexOf(artistTracks[0]);
  playTrack(firstIdx);
}

function shuffleArtist(artistName) {
  const artistTracks = musicData.filter(t => t.artist === artistName);
  if (artistTracks.length === 0) return;
  const random = artistTracks[Math.floor(Math.random() * artistTracks.length)];
  const idx = musicData.indexOf(random);
  isShuffle = true;
  if (shuffleBtn) shuffleBtn.classList.add('active');
  playTrack(idx);
}

function playAlbum(key) {
  const [albumName, artistName] = key.split('___');
  const albumTracks = musicData.filter(t => t.album === albumName && t.artist === artistName);
  if (albumTracks.length === 0) return;
  const firstIdx = musicData.indexOf(albumTracks[0]);
  playTrack(firstIdx);
}

function shuffleAlbum(key) {
  const [albumName, artistName] = key.split('___');
  const albumTracks = musicData.filter(t => t.album === albumName && t.artist === artistName);
  if (albumTracks.length === 0) return;
  const random = albumTracks[Math.floor(Math.random() * albumTracks.length)];
  const idx = musicData.indexOf(random);
  isShuffle = true;
  if (shuffleBtn) shuffleBtn.classList.add('active');
  playTrack(idx);
}

// ============================================================
// PLAYER LOGIC
// ============================================================

// ---- Smooth fade helpers ----
const FADE_DURATION = 300; // ms
let _fadeInterval = null;

function _fadeOut(cb) {
  if (_fadeInterval) clearInterval(_fadeInterval);
  // If audio is already paused or at 0, skip fade
  if (audio.paused || audio.volume <= 0) { if (cb) cb(); return; }
  const startVol = audio.volume;
  const step = startVol / (FADE_DURATION / 15);
  _fadeInterval = setInterval(() => {
    const next = audio.volume - step;
    if (next <= 0.01) {
      clearInterval(_fadeInterval);
      _fadeInterval = null;
      audio.volume = 0;
      if (cb) cb();
    } else {
      audio.volume = next;
    }
  }, 15);
}

function _fadeIn(targetVol) {
  if (_fadeInterval) clearInterval(_fadeInterval);
  audio.volume = 0;
  const step = targetVol / (FADE_DURATION / 15);
  _fadeInterval = setInterval(() => {
    const next = audio.volume + step;
    if (next >= targetVol - 0.01) {
      clearInterval(_fadeInterval);
      _fadeInterval = null;
      audio.volume = targetVol;
    } else {
      audio.volume = next;
    }
  }, 15);
}

function _getTargetVolume() {
  const slider = document.getElementById('volumeSlider');
  return slider ? parseFloat(slider.value) : 1;
}

function playTrack(index, autoPlay = true) {
  if (!musicData[index]) return;
  const wasPlaying = !audio.paused;
  const targetVol = _getTargetVolume();

  const loadAndPlay = () => {
    currentIndex = index;
    audio.src = '/' + musicData[index].src;

    nowPlayingTitle.textContent = musicData[index].title;
    nowPlayingArtist.textContent = musicData[index].artist;
    currentAlbumImage.src = '/' + musicData[index].cover;

    if (pmTitle) pmTitle.textContent = musicData[index].title;
    if (pmArtist) pmArtist.textContent = musicData[index].artist;
    if (pmCover) pmCover.src = '/' + musicData[index].cover;

    // Make artist name in desktop player clickable
    if (nowPlayingArtist) {
      nowPlayingArtist.style.cursor = 'pointer';
      nowPlayingArtist.onclick = () => showView('artist', musicData[currentIndex].artist);
    }

    const artEl = document.querySelector('.player-album-art');
    if (artEl) artEl.classList.add('playing-glow');

    // Update track highlight in any view
    document.querySelectorAll('.track.playing, .track-row.playing').forEach(el => el.classList.remove('playing'));
    document.querySelectorAll(`[data-index="${index}"]`).forEach(el => el.classList.add('playing'));

    saveToHistory(musicData[index]);

    if (autoPlay) {
      if (!audioCtxInitialized) initAudioContext();
      audio.play().catch(() => {});
      _fadeIn(targetVol);
      updatePlayPauseButton(false);
    } else {
      audio.volume = targetVol;
      updatePlayPauseButton(true);
    }
  };

  // Fade out current track before switching, then load new one
  if (wasPlaying) {
    _fadeOut(() => {
      audio.pause();
      loadAndPlay();
    });
  } else {
    loadAndPlay();
  }
}

function togglePlay() {
  if (!audioCtxInitialized) initAudioContext();
  if (!audio.src) return;
  const targetVol = _getTargetVolume();
  if (audio.paused) {
    audio.volume = 0;
    audio.play().catch(() => alert("Lecture bloquée par le navigateur. Cliquez à nouveau."));
    _fadeIn(targetVol);
    updatePlayPauseButton(false);
  } else {
    _fadeOut(() => {
      audio.pause();
      audio.volume = targetVol;
    });
    updatePlayPauseButton(true);
  }
}

function updatePlayPauseButton(isPaused) {
  const playIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const pauseIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  const mobilePlayIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const mobilePauseIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

  if (playPauseBtn) playPauseBtn.innerHTML = isPaused ? playIcon : pauseIcon;
  if (pmPlayBtn) pmPlayBtn.innerHTML = isPaused ? mobilePlayIcon : mobilePauseIcon;
  const artEl = document.querySelector('.player-album-art');
  if (artEl) artEl.classList.toggle('playing-glow', !isPaused);
}

function prevTrack() {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * musicData.length)
    : (currentIndex - 1 + musicData.length) % musicData.length;
  playTrack(currentIndex);
}

function nextTrack() {
  currentIndex = isShuffle
    ? Math.floor(Math.random() * musicData.length)
    : (currentIndex + 1) % musicData.length;
  playTrack(currentIndex);
}

function toggleLoop() {
  isLoop = !isLoop;
  audio.loop = isLoop;
  if (loopBtn) loopBtn.classList.toggle('active', isLoop);
  saveCurrentMusicSession();
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  if (shuffleBtn) shuffleBtn.classList.toggle('active', isShuffle);
  saveCurrentMusicSession();
}

function shareTrack() {
  if (!musicData[currentIndex]) return;
  const title = musicData[currentIndex].title;
  navigator.clipboard.writeText(`${window.location.origin}/music?track=${encodeURIComponent(title)}`);
  alert('Lien de partage copié !');
}

// ============================================================
// PROGRESS
// ============================================================
function updateProgress() {
  const progress = (audio.currentTime / audio.duration) * 100 || 0;
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (progressHandle) progressHandle.style.left = `${progress}%`;
  if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(audio.currentTime);
  if (totalTimeDisplay) totalTimeDisplay.textContent = formatTime(audio.duration);
  if (pmProgressBar) pmProgressBar.style.width = `${progress}%`;
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ---- Audio Events ----
audio.addEventListener('ended', () => { if (!audio.loop) nextTrack(); });
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('error', () => console.error("Erreur audio."));

// ============================================================
// SESSION PERSISTENCE
// ============================================================
const LAST_TRACK_KEY = "lastPlayedTrackIndex";
const LAST_POSITION_KEY = "lastPlayedPosition";
const LAST_VOLUME_KEY = "lastSetVolume";
const LAST_LOOP_KEY = "lastLoop";
const LAST_SHUFFLE_KEY = "lastShuffle";

function saveCurrentMusicSession() {
  if (typeof currentIndex !== "undefined" && musicData[currentIndex]) {
    localStorage.setItem(LAST_TRACK_KEY, currentIndex.toString());
  }
  if (audio.currentTime > 0 && !isNaN(audio.currentTime) && audio.duration) {
    localStorage.setItem(LAST_POSITION_KEY, audio.currentTime.toString());
  }
  localStorage.setItem(LAST_VOLUME_KEY, audio.volume.toString());
  localStorage.setItem(LAST_LOOP_KEY, isLoop ? "1" : "0");
  localStorage.setItem(LAST_SHUFFLE_KEY, isShuffle ? "1" : "0");
}

function restoreMusicSession() {
  const savedTrackIndex = localStorage.getItem(LAST_TRACK_KEY);
  const savedPosition = localStorage.getItem(LAST_POSITION_KEY);
  const savedVolume = localStorage.getItem(LAST_VOLUME_KEY);
  const savedLoop = localStorage.getItem(LAST_LOOP_KEY);
  const savedShuffle = localStorage.getItem(LAST_SHUFFLE_KEY);

  if (savedTrackIndex !== null && musicData[savedTrackIndex]) {
    playTrack(Number(savedTrackIndex), false);
    if (savedPosition !== null) audio.currentTime = parseFloat(savedPosition);
  }
  if (savedVolume !== null) {
    audio.volume = parseFloat(savedVolume);
    const slider = document.getElementById('volumeSlider');
    if (slider) slider.value = savedVolume;
  }
  if (savedLoop !== null) {
    isLoop = savedLoop === "1";
    audio.loop = isLoop;
    if (loopBtn) loopBtn.classList.toggle('active', isLoop);
  }
  if (savedShuffle !== null) {
    isShuffle = savedShuffle === "1";
    if (shuffleBtn) shuffleBtn.classList.toggle('active', isShuffle);
  }
}

audio.addEventListener('play', () => setTimeout(saveCurrentMusicSession, 1000));
audio.addEventListener('pause', saveCurrentMusicSession);
audio.addEventListener('volumechange', saveCurrentMusicSession);
audio.addEventListener('timeupdate', () => { if (!audio.paused && audio.currentTime > 0) saveCurrentMusicSession(); });
window.addEventListener('beforeunload', saveCurrentMusicSession);

// ============================================================
// AUDIO CONTEXT (LED visualization)
// ============================================================
function initAudioContext() {
  if (audioCtxInitialized) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 128;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  audioCtxInitialized = true;
}

// ============================================================
// LED FULLSCREEN
// ============================================================
function extractDominantColors(imageSrc, callback) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageSrc;
  img.onload = function () {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const map = {};
    for (let i = 0; i < d.length; i += 40) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (d[i + 3] < 200 || (r < 10 && g < 10 && b < 10) || (r > 245 && g > 245 && b > 245)) continue;
      const k = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${Math.floor(b / 10) * 10}`;
      if (map[k]) map[k].count++; else map[k] = { r, g, b, count: 1 };
    }
    const sorted = Object.values(map).sort((a, b) => b.count - a.count);
    const colors = [];
    for (let i = 0; i < sorted.length && colors.length < 6; i++) {
      const c = sorted[i];
      if (colors.every(e => Math.sqrt((c.r - e.r) ** 2 + (c.g - e.g) ** 2 + (c.b - e.b) ** 2) >= 50)) colors.push(c);
    }
    if (colors.length < 3) colors.push({ r: 255, g: 255, b: 180 });
    callback(colors);
  };
  img.onerror = () => callback([{ r: 255, g: 180, b: 0 }, { r: 100, g: 200, b: 255 }, { r: 255, g: 100, b: 200 }]);
}

function enterFullscreenLed() {
  if (!musicData[currentIndex]) return;
  const fs = document.getElementById('fullscreenLed');
  const cover = fs.querySelector('.led-album');
  const title = fs.querySelector('.led-title');
  const artist = fs.querySelector('.led-artist');
  cover.src = '/' + musicData[currentIndex].cover;
  title.textContent = musicData[currentIndex].title;
  artist.textContent = musicData[currentIndex].artist;
  fs.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  extractDominantColors(cover.src, colors => { ledColors = colors; startLedAnimation(); });
}

function exitFullscreenLed() {
  document.getElementById('fullscreenLed').style.display = 'none';
  document.body.style.overflow = '';
  stopLedAnimation();
}

function startLedAnimation() {
  const canvas = document.querySelector('.led-canvas');
  const ctx = canvas.getContext('2d');
  resizeLedCanvas();
  const leds = [];
  for (let i = 0; i < 100; i++) {
    const c = ledColors[Math.floor(Math.random() * ledColors.length)] || { r: 255, g: 255, b: 255 };
    leds.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 100 + 40, dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5, color: `rgb(${c.r},${c.g},${c.b})` });
  }
  const getBass = () => { if (!audioCtxInitialized) return 0; analyser.getByteFrequencyData(dataArray); let s = 0; for (let i = 0; i < 10; i++) s += dataArray[i]; return s / 10; };
  const drawBlob = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(0.4, color.replace('rgb', 'rgba').replace(')', ',0.6)'));
    g.addColorStop(0.8, color.replace('rgb', 'rgba').replace(')', ',0.2)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  };
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bass = getBass();
    ctx.filter = 'blur(2px)';
    leds.forEach(l => {
      l.x += l.dx; l.y += l.dy;
      if (l.x < -100) l.x = canvas.width + 100; if (l.x > canvas.width + 100) l.x = -100;
      if (l.y < -100) l.y = canvas.height + 100; if (l.y > canvas.height + 100) l.y = -100;
      drawBlob(l.x, l.y, l.r * (1 + bass / 255 * 0.5), l.color);
    });
    ctx.filter = 'none';
    ledAnimationId = requestAnimationFrame(animate);
  };
  window.addEventListener('resize', resizeLedCanvas);
  animate();
}
function stopLedAnimation() { if (ledAnimationId) cancelAnimationFrame(ledAnimationId); }
function resizeLedCanvas() { const c = document.querySelector('.led-canvas'); if (c) { c.width = window.innerWidth; c.height = window.innerHeight; } }

// ============================================================
// HISTORY
// ============================================================
function saveToHistory(track) {
  let history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
  const existing = history.find(item => item.title === track.title && item.artist === track.artist);
  if (existing) {
    existing.playCount = (existing.playCount || 0) + 1;
    // Move to top
    history = [existing, ...history.filter(h => h !== existing)];
  } else {
    history.unshift({ ...track, playCount: 1 });
  }
  if (history.length > 200) history.pop();
  localStorage.setItem('musicHistory', JSON.stringify(history));
}

// ============================================================
// FETCH & INIT
// ============================================================
async function fetchMusic() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTrack = urlParams.get('track');
    const artistParam = urlParams.get('artist');
    const albumParam = urlParams.get('album');
    const viewParam = urlParams.get('view');

    const res = await fetch('/music/metadata.json');
    musicData = await res.json();
    musicData = musicData.filter(track => !track.paid || track.accessible);

    // Determine initial view
    if (sharedTrack) {
      showView('home');
      const idx = musicData.findIndex(t => t.title.toLowerCase() === sharedTrack.toLowerCase());
      if (idx !== -1) playTrack(idx);
    } else if (artistParam) {
      showView('artist', decodeURIComponent(artistParam));
      restoreMusicSession();
    } else if (albumParam) {
      showView('album', decodeURIComponent(albumParam));
      restoreMusicSession();
    } else if (viewParam && ['artists', 'albums', 'allTracks'].includes(viewParam)) {
      showView(viewParam);
      restoreMusicSession();
    } else {
      showView('home');
      restoreMusicSession();
    }
  } catch (error) {
    console.error('Failed to load metadata:', error);
    musicData = [
      { title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", style: "Rock", cover: "favicon.avif", src: "music/song1.mp3" },
      { title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", style: "Pop", cover: "favicon.avif", src: "music/song2.mp3" },
      { title: "Imagine", artist: "John Lennon", album: "Imagine", style: "Rock", cover: "favicon.avif", src: "music/song3.mp3" }
    ];
    showView('home');
    restoreMusicSession();
  }
}
