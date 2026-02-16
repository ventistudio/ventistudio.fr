/**
 * Lecteur PIP VentiStudio
 * Gestion complète: import local, URL, protection écran, mode cinéma, audio visualizer
 */

// Storage Manager
const StorageManager = (() => {
  const DB_NAME = 'PIPLecteur';
  const STORE_NAME = 'medias';
  let db = null;

  const init = () => {
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onerror = () => rej('IndexedDB init failed');
      req.onsuccess = () => {
        db = req.result;
        res();
      };
      req.onupgradeneeded = (e) => {
        const store = e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type');
      };
    });
  };

  const add = (media) => {
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).add(media);
      req.onerror = () => rej('Add failed');
      req.onsuccess = () => res(req.result);
    });
  };

  const getAll = () => {
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onerror = () => rej('Get failed');
      req.onsuccess = () => res(req.result);
    });
  };

  const remove = (id) => {
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).delete(id);
      req.onerror = () => rej('Delete failed');
      req.onsuccess = () => res();
    });
  };

  const clear = () => {
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).clear();
      req.onerror = () => rej('Clear failed');
      req.onsuccess = () => res();
    });
  };

  return { init, add, getAll, remove, clear };
})();

// Konami Code Handler
const KonamiCode = (() => {
  const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  let current = 0;
  let callbacks = [];

  const init = (callback) => {
    callbacks.push(callback);
    document.addEventListener('keydown', (e) => {
      if (e.key === sequence[current]) {
        current++;
        if (current === sequence.length) {
          current = 0;
          callbacks.forEach(cb => cb());
        }
      } else {
        current = 0;
      }
    });
  };

  return { init };
})();

// Screen Capture Protection - Invisible but visible to capture software
const ScreenProtection = (() => {
  let isProtected = localStorage.getItem('pip-screen-protected') !== 'false';
  const overlay = document.getElementById('screen-capture-overlay');

  const toggle = () => {
    isProtected = !isProtected;
    localStorage.setItem('pip-screen-protected', isProtected);
    updateUI();
  };

  const updateUI = () => {
    if (isProtected) {
      overlay.classList.remove('hidden');
      applyProtection();
    } else {
      overlay.classList.add('hidden');
      removeProtection();
    }
  };

  const applyProtection = () => {
    // Add watermark pattern to player
    const player = document.getElementById('player-container');
    if (!player || player.querySelector('.watermark-pattern')) return;
    
    const watermark = document.createElement('div');
    watermark.className = 'watermark-pattern';
    watermark.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 35px,
        rgba(255, 255, 255, 0.03) 35px,
        rgba(255, 255, 255, 0.03) 70px
      );
      pointer-events: none;
      z-index: 50;
    `;
    
    player.style.position = 'relative';
    player.appendChild(watermark);
    
    // Add anti-screenshot interceptors
    document.addEventListener('keydown', interceptScreenshot, true);
    document.addEventListener('contextmenu', preventContext, true);
  };

  const removeProtection = () => {
    const watermark = document.querySelector('.watermark-pattern');
    if (watermark) watermark.remove();
    
    document.removeEventListener('keydown', interceptScreenshot, true);
    document.removeEventListener('contextmenu', preventContext, true);
  };

  const interceptScreenshot = (e) => {
    if (!isProtected) return;
    // PrtScn, Shift+S, etc.
    if ((e.key === 'PrintScreen') || (e.shiftKey && e.key === 'S') || (e.ctrlKey && e.shiftKey && e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const preventContext = (e) => {
    if (!isProtected || !e.target.closest('#player-container')) return;
    e.preventDefault();
  };

  const init = () => {
    KonamiCode.init(toggle);
    updateUI();
    
    // Show/hide notification in overlay
    const notif = overlay.querySelector('span');
    if (notif) {
      const observer = new MutationObserver(() => {
        const visible = !overlay.classList.contains('hidden');
        notif.style.opacity = visible ? '1' : '0';
        notif.style.pointerEvents = visible ? 'auto' : 'none';
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
  };

  return { init, toggle, isProtected: () => isProtected };
})();

// Audio Visualizer - Multiple visualization modes
const AudioVisualizer = (() => {
  let audioContext = null;
  let analyser = null;
  let analyser2 = null;
  let dataArray = null;
  let dataArrayWave = null;
  let animationId = null;
  let source = null;
  let currentAudio = null;

  const getAudioContext = () => {
    try {
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error('AudioContext not supported');
        audioContext = new AudioContextClass();
      }
      
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.warn('Resume failed:', e));
      }
      
      return audioContext;
    } catch (e) {
      console.warn('AudioContext creation failed:', e.message);
      return null;
    }
  };

  const init = (audio) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return false;

      // Reset if audio changed
      if (currentAudio && currentAudio !== audio) {
        stop();
        analyser = null;
        analyser2 = null;
        source = null;
      }

      currentAudio = audio;
      
      // Create analysers if needed
      if (!analyser) {
        analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
      }

      if (!analyser2) {
        analyser2 = ctx.createAnalyser();
        analyser2.fftSize = 2048;
      }

      // Create source only once per audio element
      if (!source) {
        try {
          source = ctx.createMediaElementAudioSource(audio);
          source.connect(analyser);
          source.connect(analyser2);
          analyser.connect(ctx.destination);
        } catch (err) {
          console.warn('Source creation error:', err.message);
          return false;
        }
      }
      
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayWave = new Uint8Array(analyser2.frequencyBinCount);
      return true;
    } catch (e) {
      console.warn('AudioVisualizer init failed:', e.message);
      return false;
    }
  };

  const drawSpectrum = (canvas) => {
    if (!analyser || !dataArray || !canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      try {
        analyser.getByteFrequencyData(dataArray);
      } catch (e) {
        console.warn('Spectrum data error:', e.message);
        return;
      }
      
      ctx.fillStyle = 'rgba(20, 20, 30, 0.08)';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = width / dataArray.length * 2.5;
      let x = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const hue = (i / dataArray.length) * 360;
        
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        
        x += barWidth;
      }
    };
    animate();
  };

  const drawWave = (canvas) => {
    if (!analyser2 || !dataArrayWave || !canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerY = height / 2;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      try {
        analyser2.getByteFrequencyData(dataArrayWave);
      } catch (e) {
        console.warn('Wave data error:', e.message);
        return;
      }
      
      ctx.fillStyle = 'rgba(20, 20, 30, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const sliceWidth = width / dataArrayWave.length;
      let x = 0;
      
      for (let i = 0; i < dataArrayWave.length; i++) {
        const v = dataArrayWave[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) ctx.moveTo(x, centerY - y);
        else ctx.lineTo(x, centerY - y);
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, centerY);
      ctx.stroke();
      
      // Draw reflection
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      x = 0;
      ctx.beginPath();
      for (let i = 0; i < dataArrayWave.length; i++) {
        const v = dataArrayWave[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, centerY + y);
        else ctx.lineTo(x, centerY + y);
        x += sliceWidth;
      }
      ctx.lineTo(width, centerY);
      ctx.stroke();
    };
    animate();
  };

  const drawCircles = (canvas) => {
    if (!analyser || !dataArray || !canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      try {
        analyser.getByteFrequencyData(dataArray);
      } catch (e) {
        console.warn('Circle data error:', e.message);
        return;
      }
      
      ctx.fillStyle = 'rgba(20, 20, 30, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 255;
        const radius = (v * Math.min(width, height)) / 2.5;
        const angle = (i / dataArray.length) * Math.PI * 2;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const hue = (i / dataArray.length) * 360;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        ctx.beginPath();
        ctx.arc(x, y, 3 + v * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    animate();
  };

  const drawSunburst = (canvas) => {
    if (!analyser || !dataArray || !canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      try {
        analyser.getByteFrequencyData(dataArray);
      } catch (e) {
        console.warn('Sunburst data error:', e.message);
        return;
      }
      
      ctx.fillStyle = 'rgba(20, 20, 30, 0.08)';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (Math.PI * 2) / dataArray.length;
      const maxRadius = Math.min(width, height) / 2.5;
      
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 255;
        const angle = (i / dataArray.length) * Math.PI * 2;
        const barHeight = v * maxRadius;
        
        const x1 = centerX + Math.cos(angle) * (maxRadius * 0.3);
        const y1 = centerY + Math.sin(angle) * (maxRadius * 0.3);
        const x2 = centerX + Math.cos(angle) * (maxRadius * 0.3 + barHeight);
        const y2 = centerY + Math.sin(angle) * (maxRadius * 0.3 + barHeight);
        
        const hue = (i / dataArray.length) * 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.lineWidth = Math.max(2, barWidth * 50);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };
    animate();
  };

  const stop = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const reset = () => {
    stop();
    analyser = null;
    analyser2 = null;
    source = null;
    currentAudio = null;
  };

  return { init, drawSpectrum, drawWave, drawCircles, drawSunburst, stop, reset };
})();

// Cinema Mode
const CinemaMode = (() => {
  let isActive = false;
  let originalFilter = '';

  const toggle = (element) => {
    isActive = !isActive;
    if (isActive) {
      originalFilter = element.style.filter;
      element.style.filter = 'saturate(1.3) contrast(1.1) brightness(0.95)';
    } else {
      element.style.filter = originalFilter;
    }
    return isActive;
  };

  return { toggle };
})();

// Media Manager
const MediaManager = (() => {
  let playlist = [];
  let currentMedia = null;
  let currentIndex = -1;

  const loadPlaylist = async () => {
    try {
      playlist = await StorageManager.getAll();
      renderPlaylist();
    } catch (e) {
      console.error('Failed to load playlist:', e);
    }
  };

  const addLocalFile = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const type = file.type.startsWith('video') ? 'video' : 'audio';
      const media = {
        type,
        title: file.name.replace(/\.[^/.]+$/, ''),
        source: e.target.result,
        duration: 'N/A',
        sourceType: 'local',
        timestamp: Date.now()
      };
      
      try {
        await StorageManager.add(media);
        await loadPlaylist();
      } catch (err) {
        console.error('Failed to add media:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addURL = async (url, title) => {
    // Verify URL accessibility
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      const type = url.includes('.mp3') || url.includes('.wav') ? 'audio' : 'video';
      
      const media = {
        type,
        title: title || new URL(url).pathname.split('/').pop(),
        source: url,
        duration: 'N/A',
        sourceType: 'url',
        timestamp: Date.now()
      };
      
      await StorageManager.add(media);
      await loadPlaylist();
    } catch (err) {
      console.error('URL not accessible:', err);
      alert('Impossible d\'accéder à cette URL');
    }
  };

  const play = async (id) => {
    currentIndex = playlist.findIndex(m => m.id === id);
    if (currentIndex === -1) return;
    
    const media = playlist[currentIndex];
    await renderMedia(media);
  };

  const renderMedia = async (media) => {
    const container = document.getElementById('player-container');
    container.innerHTML = '';
    currentMedia = media;
    
    const title = media.title || 'Sans titre';
    document.getElementById('media-title').textContent = title;
    
    if (media.type === 'video') {
      const video = document.createElement('video');
      video.id = 'active-media';
      video.controls = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.display = 'block';
      video.crossOrigin = 'anonymous';
      
      if (media.sourceType === 'local') {
        const blob = new Blob([media.source], { type: 'video/mp4' });
        video.src = URL.createObjectURL(blob);
      } else {
        video.src = media.source;
      }
      
      container.appendChild(video);
      enableControls('video');
    } else {
      // Audio custom player with multiple visualizers
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      `;
      
      const titleDiv = document.createElement('div');
      titleDiv.style.cssText = `
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-primary);
      `;
      titleDiv.textContent = media.title;
      
      // Visualizer selector
      const visContainer = document.createElement('div');
      visContainer.style.cssText = `
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      `;
      
      const modes = [
        { id: 'spectrum', label: '📊 Spectre', fn: AudioVisualizer.drawSpectrum },
        { id: 'wave', label: '〰️  Onde', fn: AudioVisualizer.drawWave },
        { id: 'circles', label: '⭐ Cercles', fn: AudioVisualizer.drawCircles },
        { id: 'sunburst', label: '✨ Sunburst', fn: AudioVisualizer.drawSunburst }
      ];
      
      let currentVis = 'spectrum';
      
      modes.forEach(mode => {
        const btn = document.createElement('button');
        btn.textContent = mode.label;
        btn.style.cssText = `
          padding: 0.5rem 1rem;
          background: ${mode.id === 'spectrum' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.1)'};
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 0.5rem;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s;
        `;
        
        btn.addEventListener('click', () => {
          currentVis = mode.id;
          AudioVisualizer.stop();
          modes.forEach(m => {
            const b = visContainer.querySelector(`button[data-mode="${m.id}"]`);
            if (b) b.style.background = m.id === mode.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.1)';
          });
          
          const audio = document.getElementById('active-media');
          if (audio && !audio.paused) {
            if (AudioVisualizer.init(audio)) {
              mode.fn(canvas);
            }
          }
        });
        btn.setAttribute('data-mode', mode.id);
        visContainer.appendChild(btn);
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = 0;
      canvas.height = 0;
      canvas.style.cssText = `
        border-radius: 0.5rem;
        background: rgba(0,0,0,0.3);
        flex: 1;
      `;
      
      const audio = document.createElement('audio');
      audio.id = 'active-media';
      audio.controls = true;
      audio.style.width = '100%';
      audio.crossOrigin = 'anonymous';
      
      if (media.sourceType === 'local') {
        const blob = new Blob([media.source], { type: 'audio/mpeg' });
        audio.src = URL.createObjectURL(blob);
      } else {
        audio.src = media.source;
      }
      
      audio.addEventListener('play', () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        if (AudioVisualizer.init(audio)) {
          const visMode = currentVis;
          if (visMode === 'spectrum') AudioVisualizer.drawSpectrum(canvas);
          else if (visMode === 'wave') AudioVisualizer.drawWave(canvas);
          else if (visMode === 'circles') AudioVisualizer.drawCircles(canvas);
          else if (visMode === 'sunburst') AudioVisualizer.drawSunburst(canvas);
        }
      });
      
      audio.addEventListener('pause', () => AudioVisualizer.stop());
      audio.addEventListener('ended', () => AudioVisualizer.stop());
      
      wrapper.appendChild(titleDiv);
      wrapper.appendChild(visContainer);
      wrapper.appendChild(canvas);
      wrapper.appendChild(audio);
      container.appendChild(wrapper);
      enableControls('audio');
    }
    
    document.getElementById('media-info').classList.remove('hidden');
  };

  const renderPlaylist = () => {
    const playlistEl = document.getElementById('playlist');
    const filter = document.querySelector('.filter-btn.active').dataset.filter;
    
    if (!playlist.length) {
      playlistEl.innerHTML = '<div class="empty-state"><p>Aucun média</p></div>';
      document.getElementById('clear-list').classList.add('hidden');
      document.getElementById('item-count').textContent = '0';
      return;
    }
    
    const filtered = filter === 'all' ? playlist : playlist.filter(m => m.type === filter);
    
    playlistEl.innerHTML = filtered.map(media => `
      <div class="playlist-item" data-id="${media.id}" draggable="true">
        <div class="item-icon">${media.type === 'video' ? '🎬' : '🎵'}</div>
        <div class="item-info">
          <h4>${media.title}</h4>
          <p>${media.sourceType === 'local' ? '📁' : '🔗'} ${media.sourceType}</p>
        </div>
        <button class="item-delete" data-id="${media.id}">✕</button>
      </div>
    `).join('');
    
    playlistEl.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => play(parseInt(item.dataset.id)));
      item.addEventListener('dragstart', (e) => e.dataTransfer.effectAllowed = 'move');
    });
    
    playlistEl.querySelectorAll('.item-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        await StorageManager.remove(id);
        await loadPlaylist();
      });
    });
    
    document.getElementById('clear-list').classList.toggle('hidden', !playlist.length);
    document.getElementById('item-count').textContent = playlist.length;
  };

  const init = async () => {
    await StorageManager.init();
    await loadPlaylist();
  };

  return { init, addLocalFile, addURL, play, loadPlaylist, renderPlaylist };
})();

// UI Controls
const enableControls = (type) => {
  const pipBtn = document.getElementById('pip-toggle');
  const cinemaBtn = document.getElementById('cinema-mode');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  
  if (type === 'video') {
    pipBtn.disabled = !document.pictureInPictureEnabled;
    cinemaBtn.disabled = false;
    fullscreenBtn.disabled = false;
  } else {
    pipBtn.disabled = true;
    cinemaBtn.disabled = true;
    fullscreenBtn.disabled = false;
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
  ScreenProtection.init();
  await MediaManager.init();
  
  // File upload
  const fileInput = document.getElementById('file-input');
  const fileBtn = document.getElementById('file-input-btn');
  const dropZone = document.getElementById('drop-zone');
  
  fileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(file => MediaManager.addLocalFile(file));
  });
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    Array.from(e.dataTransfer.files).forEach(file => MediaManager.addLocalFile(file));
  });
  
  // URL upload
  document.getElementById('url-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('url-input').value;
    const title = document.getElementById('url-title').value;
    await MediaManager.addURL(url, title);
    e.target.reset();
  });
  
  // Upload tabs
  document.querySelectorAll('.upload-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.upload-tab-content').forEach(c => c.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + '-tab').classList.remove('hidden');
    });
  });
  
  // Playlist filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      MediaManager.renderPlaylist();
    });
  });
  
  // Player controls
  document.getElementById('pip-toggle').addEventListener('click', async () => {
    try {
      const media = document.getElementById('active-media');
      if (!media || media.tagName !== 'VIDEO') return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await media.requestPictureInPicture();
      }
    } catch (e) {
      alert('PIP indisponible: ' + e.message);
    }
  });
  
  document.getElementById('cinema-mode').addEventListener('click', () => {
    const media = document.getElementById('active-media');
    if (media) {
      const isActive = CinemaMode.toggle(media);
      document.getElementById('cinema-mode').classList.toggle('active', isActive);
    }
  });
  
  document.getElementById('fullscreen-btn').addEventListener('click', async () => {
    const media = document.getElementById('active-media');
    if (!media) return;
    try {
      if (!document.fullscreenElement) {
        await media.requestFullscreen?.();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error('Fullscreen error:', e);
    }
  });
  
  document.getElementById('clear-list').addEventListener('click', async () => {
    if (confirm('Êtes-vous sûr?')) {
      await StorageManager.clear();
      await MediaManager.loadPlaylist();
    }
  });
  
  // PIP events
  document.addEventListener('enterpictureinpicture', () => {
    document.getElementById('pip-toggle').classList.add('active');
  });
  
  document.addEventListener('leavepictureinpicture', () => {
    document.getElementById('pip-toggle').classList.remove('active');
  });
});
