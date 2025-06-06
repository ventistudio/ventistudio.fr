// --- Variables globales ---
    musicData = [
      { title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", style: "Rock", cover: "default-cover.jpg", src: "music/song1.mp3" },
      { title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", style: "Pop", cover: "default-cover.jpg", src: "music/song2.mp3" },
      { title: "Imagine", artist: "John Lennon", album: "Imagine", style: "Rock", cover: "default-cover.jpg", src: "music/song3.mp3" }
    ];
    renderTracks(musicData);
    restoreMusicSession();

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

// --- Extraction des couleurs dominantes ---
function extractDominantColors(imageSrc, callback) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imageSrc;
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap = {};
    const sampleSize = 10;
    for (let i = 0; i < imageData.length; i += 4 * sampleSize) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      if (imageData[i + 3] < 200 || (r < 10 && g < 10 && b < 10) || (r > 245 && g > 245 && b > 245)) {
        continue;
      }
      const quantizedColor = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${Math.floor(b / 10) * 10}`;
      if (colorMap[quantizedColor]) {
        colorMap[quantizedColor].count++;
      } else {
        colorMap[quantizedColor] = { r: r, g: g, b: b, count: 1 };
      }
    }
    const sortedColors = Object.values(colorMap).sort((a, b) => b.count - a.count);
    const colorCount = Math.min(6, Math.max(3, Math.floor(sortedColors.length / 20)));
    const colors = [];
    for (let i = 0, added = 0; i < sortedColors.length && added < colorCount; i++) {
      const color = sortedColors[i];
      let isDifferent = true;
      for (let j = 0; j < colors.length; j++) {
        const existingColor = colors[j];
        const colorDistance = Math.sqrt(
          Math.pow(color.r - existingColor.r, 2) +
          Math.pow(color.g - existingColor.g, 2) +
          Math.pow(color.b - existingColor.b, 2)
        );
        if (colorDistance < 50) {
          isDifferent = false;
          break;
        }
      }
      if (isDifferent) {
        colors.push(color);
        added++;
      }
    }
    if (colors.length < 3) {
      colors.push({ r: 255, g: 255, b: 180 });
    }
    callback(colors);
  };
  img.onerror = function() {
    callback([
      { r: 255, g: 180, b: 0 },
      { r: 100, g: 200, b: 255 },
      { r: 255, g: 100, b: 200 },
      { r: 150, g: 255, b: 100 }
    ]);
  };
}

// --- Plein écran LED ---
let ledAnimationId = null;
function enterFullscreenLed() {
  const fs = document.getElementById('fullscreenLed');
  const cover = fs.querySelector('.led-album');
  const title = fs.querySelector('.led-title');
  const artist = fs.querySelector('.led-artist');
  cover.src = '/' + musicData[currentIndex].cover;
  title.textContent = musicData[currentIndex].title;
  artist.textContent = musicData[currentIndex].artist;
  fs.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Extrait les couleurs dominantes de la cover
  extractDominantColors(cover.src, function(colors) {
    ledColors = colors;
    startLedAnimation();
  });
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
  
  // Augmenter le nombre de LEDs pour un meilleur effet
  let leds = [];
  for (let i = 0; i < 100; i++) {
    const color = ledColors.length > 0 ? ledColors[Math.floor(Math.random() * ledColors.length)] : {r:255,g:255,b:255};
    leds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 100 + 40, // Augmenter la taille de base
      dx: (Math.random() - 0.5) * 0.5, // Ralentir le mouvement
      dy: (Math.random() - 0.5) * 0.5,
      color: `rgb(${color.r},${color.g},${color.b})`
    });
  }

  function getBass() {
    if (!audioCtxInitialized) return 0;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += dataArray[i];
    return sum / 10;
  }

  function drawNeonBlob(x, y, radius, color) {
    // Créer un dégradé radial pour l'effet néon
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color.replace('rgb', 'rgba').replace(')', ',0.6)'));
    gradient.addColorStop(0.8, color.replace('rgb', 'rgba').replace(')', ',0.2)'));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    // Dessiner plusieurs cercles superposés pour l'effet de flou
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Ajouter un halo lumineux
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', ',0.3)');
    ctx.filter = 'blur(15px)';
    ctx.fill();
    ctx.filter = 'none';
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bass = getBass();

    // Appliquer un léger flou à tout le canvas
    ctx.filter = 'blur(2px)';
    
    leds.forEach(led => {
      led.x += led.dx;
      led.y += led.dy;
      
      // Rebondir sur les bords
      if (led.x < -100) led.x = canvas.width + 100;
      if (led.x > canvas.width + 100) led.x = -100;
      if (led.y < -100) led.y = canvas.height + 100;
      if (led.y > canvas.height + 100) led.y = -100;

      // Faire pulser les LEDs avec la basse
      const pulseFactor = 1 + (bass/255) * 0.5;
      const radius = led.r * pulseFactor;

      drawNeonBlob(led.x, led.y, radius, led.color);
    });
    
    ctx.filter = 'none';
    ledAnimationId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resizeLedCanvas);
  animate();
}

function stopLedAnimation() {
  if (ledAnimationId) cancelAnimationFrame(ledAnimationId);
}
function resizeLedCanvas() {
  const canvas = document.querySelector('.led-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// --- Session Storage ---
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
    if (savedPosition !== null) {
      audio.currentTime = parseFloat(savedPosition);
    }
  }
  if (savedVolume !== null) {
    audio.volume = parseFloat(savedVolume);
    document.getElementById('volumeSlider').value = savedVolume;
  }
  if (savedLoop !== null) {
    isLoop = savedLoop === "1";
    audio.loop = isLoop;
    loopBtn.classList.toggle('active', isLoop);
  }
  if (savedShuffle !== null) {
    isShuffle = savedShuffle === "1";
    shuffleBtn.classList.toggle('active', isShuffle);
  }
}
audio.addEventListener('play', () => setTimeout(saveCurrentMusicSession, 1000));
audio.addEventListener('pause', saveCurrentMusicSession);
audio.addEventListener('volumechange', saveCurrentMusicSession);
audio.addEventListener('timeupdate', () => {
  if (!audio.paused && audio.currentTime > 0) saveCurrentMusicSession();
});
window.addEventListener('beforeunload', saveCurrentMusicSession);

// --- AudioContext pour l'analyseur (bass) ---
function initAudioContext() {
  if (!audioCtxInitialized) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 128;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    audioCtxInitialized = true;
  }
}

// --- Player logic ---
function playTrack(index, autoPlay = true) {
  if (!musicData[index]) return;
  currentIndex = index;
  audio.src = '/' + musicData[index].src;
  nowPlayingTitle.textContent = musicData[index].title;
  nowPlayingArtist.textContent = musicData[index].artist;
  currentAlbumImage.src = '/' + musicData[index].cover;
  
  document.querySelectorAll("#trackList .track.playing").forEach(el => el.classList.remove("playing"));
  const card = document.querySelector(`#trackList .track[data-index="${index}"]`);
  if (card) card.classList.add("playing");
  // Enregistrer la musique dans l'historique
  saveToHistory(musicData[index]);
  
  updatePlayPauseButton(true);
  if (autoPlay) {
    if (!audioCtxInitialized) initAudioContext();
    audio.play().catch(() => {});
    updatePlayPauseButton(false);
  }
}
function togglePlay() {
  if (!audioCtxInitialized) initAudioContext();
  if (!audio.src) return;
  if (audio.paused) {
    audio.play().catch(err => {
      alert("Lecture bloquée par le navigateur. Cliquez à nouveau ou vérifiez les permissions.");
    });
    updatePlayPauseButton(false);
  } else {
    audio.pause();
    updatePlayPauseButton(true);
  }
}
function updatePlayPauseButton(isPaused) {
  if (isPaused) {
    playPauseBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
  } else {
    playPauseBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `;
  }
}
function prevTrack() {
  currentIndex = isShuffle ? Math.floor(Math.random() * musicData.length) : (currentIndex - 1 + musicData.length) % musicData.length;
  playTrack(currentIndex);
}
function nextTrack() {
  currentIndex = isShuffle ? Math.floor(Math.random() * musicData.length) : (currentIndex + 1) % musicData.length;
  playTrack(currentIndex);
}
function toggleLoop() {
  isLoop = !isLoop;
  audio.loop = isLoop;
  loopBtn.classList.toggle('active', isLoop);
  saveCurrentMusicSession();
}
function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
  saveCurrentMusicSession();
}
function shareTrack() {
  if (!musicData[currentIndex]) return;
  const title = musicData[currentIndex].title;
  navigator.clipboard.writeText(`${window.location.origin}/music?track=${encodeURIComponent(title)}`);
  alert('Lien de partage copié !');
}
function updateProgress() {
  const progress = (audio.currentTime / audio.duration) * 100 || 0;
  progressBar.style.width = `${progress}%`;
  progressHandle.style.left = `${progress}%`;
  currentTimeDisplay.textContent = formatTime(audio.currentTime);
  totalTimeDisplay.textContent = formatTime(audio.duration);
}
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
progressWrapper.addEventListener('click', (e) => {
  if (!audio.src) return;
  const rect = progressWrapper.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pos * audio.duration;
});
document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtered = musicData.filter(t =>
    `${t.title} ${t.artist} ${t.album} ${t.style}`.toLowerCase().includes(q)
  );
  renderTracks(filtered);
});
document.getElementById("sortSelect").addEventListener("change", e => {
  const sort = e.target.value;
  const tracks = [...musicData];
  if (sort) tracks.sort((a,b) => a[sort].localeCompare(b[sort]));
  renderTracks(tracks);

});
document.getElementById('volumeSlider').addEventListener('input', e => {
  audio.volume = parseFloat(e.target.value);
  saveCurrentMusicSession();
});
audio.addEventListener('ended', () => {
  if (!audio.loop) nextTrack();
});
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('error', () => {
  alert("Erreur lors du chargement du fichier audio.");
});
function renderTracks(tracks) {
  const list = document.getElementById('trackList');
  list.innerHTML = '';
  tracks.forEach((track, index) => {
    const actualIndex = musicData.findIndex(t =>
      t.title === track.title && t.artist === track.artist && t.album === track.album
    );
    const card = document.createElement('div');
    card.className = 'track';
    card.dataset.index = actualIndex;
    card.onclick = () => {
      playTrack(actualIndex);
    };
    card.innerHTML = `
      <img src="/${track.cover}" alt="Cover">
      <div class="track-info">
        <p>Artiste : <a href="/artist?name=${encodeURIComponent(track.artist)}" class="artist-link">${track.artist}</a></p>
        <p>Album : ${track.album || 'Single'}</p>
        <p>Style : ${track.style}</p>
      </div>
      <div class="track-title">${track.title}</div>
    `;
    if (actualIndex === currentIndex) card.classList.add("playing");
    list.appendChild(card);
  });
}
async function fetchMusic() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTrack = urlParams.get('track');

    const res = await fetch('/music/metadata.json');
    musicData = await res.json();

    // Filtrer les musiques accessibles uniquement si elles ne sont pas bloquées par un contrôle de paiement
    musicData = musicData.filter(track => !track.paid || track.accessible);

    renderTracks(musicData);

    if (sharedTrack) {
      const sharedIndex = musicData.findIndex(track => track.title.toLowerCase() === sharedTrack.toLowerCase());
      if (sharedIndex !== -1) {
        playTrack(sharedIndex);
      }
    } else {
      restoreMusicSession();
    }
  } catch (error) {
    musicData = [
      { title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", style: "Rock", cover: "default-cover.jpg", src: "music/song1.mp3" },
      { title: "Billie Jean", artist: "Michael Jackson", album: "Thriller", style: "Pop", cover: "default-cover.jpg", src: "music/song2.mp3" },
      { title: "Imagine", artist: "John Lennon", album: "Imagine", style: "Rock", cover: "default-cover.jpg", src: "music/song3.mp3" }
    ];
    renderTracks(musicData);
    restoreMusicSession();
}
fetchMusic();
function saveToHistory(track) {
  let history = JSON.parse(localStorage.getItem('musicHistory') || '[]');
  let existingTrack = history.find(item => item.title === track.title);

  if (existingTrack) {
    existingTrack.playCount += 1; // Incrémenter le compteur de lectures
  } else {
    track.playCount = 1; // Initialiser le compteur de lectures
    history.unshift(track); // Ajouter au début
  }

  if (history.length > 200) history.pop(); // Limiter à 200 entrées
  localStorage.setItem('musicHistory', JSON.stringify(history));
}
