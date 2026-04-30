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

// Screen Capture Protection - Invisible QR Code Watermark
const ScreenProtection = (() => {
  let isProtected = localStorage.getItem('pip-screen-protected') !== 'false';
  let currentCode = null;
  let autoMode = true;
  const overlay = document.getElementById('screen-capture-overlay');

  // Minimal QR Code generator (Version 1, 21×21, numeric/alphanumeric)
  // Generates a matrix for a URL string using canvas drawing
  const QRMatrix = (() => {
    // Encode text to a simple visual pattern matrix (steganographic QR-like grid)
    // This creates a deterministic visual pattern from the data that encodes the URL
    const generate = (text) => {
      const size = 25;
      const matrix = Array.from({ length: size }, () => Array(size).fill(false));

      // Finder patterns (3 corners)
      const drawFinder = (row, col) => {
        for (let r = 0; r < 7; r++) {
          for (let c = 0; c < 7; c++) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[row + r][col + c] = isBorder || isInner;
          }
        }
      };
      drawFinder(0, 0);
      drawFinder(0, size - 7);
      drawFinder(size - 7, 0);

      // Timing patterns
      for (let i = 8; i < size - 8; i++) {
        matrix[6][i] = i % 2 === 0;
        matrix[i][6] = i % 2 === 0;
      }

      // Data encoding - hash the text into module positions
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
      }

      // Fill data area with pattern derived from text
      let bitIndex = 0;
      const textBytes = new TextEncoder().encode(text);
      for (let col = size - 1; col >= 0; col -= 2) {
        if (col === 6) col = 5;
        for (let row = 0; row < size; row++) {
          for (let c = 0; c < 2 && col - c >= 0; c++) {
            const r = row;
            const cc = col - c;
            // Skip finder/timing areas
            if ((r < 8 && cc < 8) || (r < 8 && cc >= size - 8) || (r >= size - 8 && cc < 8)) continue;
            if (r === 6 || cc === 6) continue;

            const byteIdx = bitIndex >> 3;
            const bitPos = 7 - (bitIndex & 7);
            if (byteIdx < textBytes.length) {
              matrix[r][cc] = ((textBytes[byteIdx] >> bitPos) & 1) === 1;
            } else {
              // XOR pattern for error correction lookalike
              matrix[r][cc] = ((r * 3 + cc * 7 + hash) & 1) === 1;
            }
            bitIndex++;
          }
        }
      }

      return { matrix, size };
    };

    return { generate };
  })();

  // Generate unique protection code with metadata
  const generateCode = (mediaData) => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const uniqueId = `${timestamp}-${random}`;

    const params = new URLSearchParams();
    params.set('id', uniqueId);
    if (mediaData) {
      if (mediaData.title) params.set('t', mediaData.title.substring(0, 50));
      if (mediaData.duration) params.set('d', Math.round(mediaData.duration).toString());
      if (mediaData.type) params.set('type', mediaData.type);
      if (mediaData.resolution) params.set('res', mediaData.resolution);
    }
    params.set('ts', Date.now().toString());

    const url = `https://ventistudio.eu/protected?${params.toString()}`;
    currentCode = { id: uniqueId, url, params: Object.fromEntries(params), timestamp: Date.now() };
    return currentCode;
  };

  // Get current media metadata
  const getMediaData = () => {
    const media = document.getElementById('active-media');
    if (!media) return null;
    const title = document.getElementById('media-title')?.textContent || 'Sans titre';
    const isVideo = media.tagName === 'VIDEO';
    return {
      title,
      duration: isFinite(media.duration) ? media.duration : 0,
      type: isVideo ? 'video' : 'audio',
      resolution: isVideo ? `${media.videoWidth}x${media.videoHeight}` : null
    };
  };

  // Render invisible QR code on a canvas overlay
  const renderQR = (code) => {
    const player = document.getElementById('player-container');
    if (!player) return;

    // Remove existing QR
    const oldCanvas = player.querySelector('.qr-watermark');
    if (oldCanvas) oldCanvas.remove();

    const { matrix, size } = QRMatrix.generate(code.url);

    const canvas = document.createElement('canvas');
    canvas.className = 'qr-watermark';
    const moduleSize = 4;
    canvas.width = size * moduleSize;
    canvas.height = size * moduleSize;

    canvas.style.cssText = `
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: ${size * moduleSize}px;
      height: ${size * moduleSize}px;
      pointer-events: none;
      z-index: 51;
      opacity: 0.018;
      mix-blend-mode: difference;
    `;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(c * moduleSize, r * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    player.style.position = 'relative';
    player.appendChild(canvas);
  };

  // Remove QR watermark
  const removeQR = () => {
    const qr = document.querySelector('.qr-watermark');
    if (qr) qr.remove();
  };

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
    const btn = document.getElementById('protection-toggle');
    if (btn) btn.classList.toggle('active', isProtected);

    // Update protection panel
    const panel = document.getElementById('protection-panel');
    if (panel) panel.classList.toggle('hidden', !isProtected);

    updateCodeDisplay();
  };

  const applyProtection = () => {
    const player = document.getElementById('player-container');
    if (!player) return;

    // Watermark lines
    if (!player.querySelector('.watermark-pattern')) {
      const watermark = document.createElement('div');
      watermark.className = 'watermark-pattern';
      watermark.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.015) 35px, rgba(255,255,255,0.015) 70px);
        pointer-events: none; z-index: 50;
      `;
      player.style.position = 'relative';
      player.appendChild(watermark);
    }

    // Generate and render QR
    if (autoMode || !currentCode) {
      regenerateCode();
    } else {
      renderQR(currentCode);
    }

    document.addEventListener('keydown', interceptScreenshot, true);
    document.addEventListener('contextmenu', preventContext, true);
  };

  const removeProtection = () => {
    const watermark = document.querySelector('.watermark-pattern');
    if (watermark) watermark.remove();
    removeQR();
    currentCode = null;
    document.removeEventListener('keydown', interceptScreenshot, true);
    document.removeEventListener('contextmenu', preventContext, true);
  };

  const interceptScreenshot = (e) => {
    if (!isProtected) return;
    if ((e.key === 'PrintScreen') || (e.shiftKey && e.key === 'S') || (e.ctrlKey && e.shiftKey && e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const preventContext = (e) => {
    if (!isProtected || !e.target.closest('#player-container')) return;
    e.preventDefault();
  };

  const generateThumbnail = () => {
    const media = document.getElementById('active-media');
    if (!media || media.tagName !== 'VIDEO') return null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 192;
      canvas.height = 108;
      canvas.getContext('2d').drawImage(media, 0, 0, 192, 108);
      return canvas.toDataURL('image/jpeg', 0.6);
    } catch { return null; }
  };

  const saveToHistory = (code) => {
    if (!code) return;
    try {
      const history = JSON.parse(localStorage.getItem('pip-protection-history') || '[]');
      history.unshift({ ...code, thumbnail: generateThumbnail() });
      if (history.length > 100) history.length = 100;
      localStorage.setItem('pip-protection-history', JSON.stringify(history));
    } catch { /* quota exceeded or parse error */ }
  };

  const regenerateCode = () => {
    const mediaData = getMediaData();
    const code = generateCode(mediaData);
    renderQR(code);
    updateCodeDisplay();
    saveToHistory(code);
    return code;
  };

  const manualGenerate = (customTitle) => {
    const mediaData = getMediaData() || {};
    if (customTitle) mediaData.title = customTitle;
    const code = generateCode(mediaData);
    renderQR(code);
    updateCodeDisplay();
    saveToHistory(code);
    return code;
  };

  const updateCodeDisplay = () => {
    const idEl = document.getElementById('protection-code-id');
    const urlEl = document.getElementById('protection-code-url');
    const metaEl = document.getElementById('protection-code-meta');
    if (!idEl) return;

    if (currentCode) {
      idEl.textContent = currentCode.id;
      urlEl.textContent = currentCode.url;
      urlEl.href = currentCode.url;
      const parts = [];
      if (currentCode.params.t) parts.push(`Titre: ${currentCode.params.t}`);
      if (currentCode.params.d && currentCode.params.d !== '0') {
        const d = parseInt(currentCode.params.d);
        const m = Math.floor(d / 60);
        const s = d % 60;
        parts.push(`Durée: ${m}:${String(s).padStart(2, '0')}`);
      }
      if (currentCode.params.type) parts.push(`Type: ${currentCode.params.type}`);
      if (currentCode.params.res) parts.push(`Résolution: ${currentCode.params.res}`);
      metaEl.textContent = parts.join(' · ') || 'Aucune métadonnée';
    } else {
      idEl.textContent = ':';
      urlEl.textContent = ':';
      urlEl.href = '#';
      metaEl.textContent = 'Protection inactive';
    }
  };

  const setAutoMode = (auto) => {
    autoMode = auto;
    localStorage.setItem('pip-protection-auto', auto);
  };

  const getAutoMode = () => autoMode;
  const getCurrentCode = () => currentCode;

  const init = () => {
    autoMode = localStorage.getItem('pip-protection-auto') !== 'false';
    updateUI();

    // Regenerate on media change if protected : one QR per media, not per mutation
    let lastMediaSrc = null;
    let debounceTimer = null;
    const obs = new MutationObserver(() => {
      if (!isProtected || !autoMode) return;
      const media = document.getElementById('active-media');
      const src = media ? media.src : null;
      if (src && src !== lastMediaSrc) {
        lastMediaSrc = src;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => regenerateCode(), 500);
      }
    });
    const player = document.getElementById('player-container');
    if (player) obs.observe(player, { childList: true, subtree: true });
  };

  return { init, toggle, regenerateCode, manualGenerate, setAutoMode, getAutoMode, getCurrentCode, isProtected: () => isProtected, updateCodeDisplay };
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

  const toggle = (element) => {
    isActive = !isActive;
    if (isActive) {
      element.dataset.cinemaFilter = 'saturate(1.3) contrast(1.1) brightness(0.95)';
    } else {
      delete element.dataset.cinemaFilter;
    }
    applyCompositeFilter(element);
    return isActive;
  };

  return { toggle, isActive: () => isActive };
})();

// NVIDIA Enhanced Video - GPU acceleration, HDR tone mapping, super resolution hints
const NvidiaEnhance = (() => {
  let isActive = false;
  let gl = null;
  let enhanceCanvas = null;

  const detectGPU = () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!context) return { supported: false, renderer: 'Unknown' };
      const ext = context.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext ? context.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Unknown';
      const vendor = ext ? context.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'Unknown';
      const isNvidia = /nvidia/i.test(renderer) || /nvidia/i.test(vendor);
      canvas.remove();
      return { supported: true, renderer, vendor, isNvidia };
    } catch (e) {
      return { supported: false, renderer: 'Unknown' };
    }
  };

  const applyEnhancements = (videoElement) => {
    if (!videoElement || videoElement.tagName !== 'VIDEO') return false;

    // Request high-performance GPU
    videoElement.style.willChange = 'transform';
    videoElement.style.transform = 'translateZ(0)';

    // Enable hardware decode hints
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      videoElement.setAttribute('disablePictureInPicture', 'false');
    }

    // HDR tone mapping via CSS filter (GPU-accelerated)
    if (isActive) {
      videoElement.dataset.nvidiaFilter = 'contrast(1.05) saturate(1.1) brightness(1.02)';
      videoElement.style.imageRendering = 'high-quality';
      applyCompositeFilter(videoElement);
    }

    return true;
  };

  const removeEnhancements = (videoElement) => {
    if (!videoElement) return;
    videoElement.style.willChange = '';
    videoElement.style.transform = '';
    videoElement.style.imageRendering = '';
    delete videoElement.dataset.nvidiaFilter;
    applyCompositeFilter(videoElement);
  };

  const toggle = () => {
    isActive = !isActive;
    const media = document.getElementById('active-media');

    if (isActive) {
      if (media) applyEnhancements(media);
    } else {
      if (media) removeEnhancements(media);
    }

    // Update button
    const btn = document.getElementById('nvidia-enhance');
    if (btn) btn.classList.toggle('active', isActive);

    localStorage.setItem('pip-nvidia-enhance', isActive);
    return isActive;
  };

  const init = () => {
    const gpu = detectGPU();
    const btn = document.getElementById('nvidia-enhance');
    if (!btn) return;

    if (gpu.supported) {
      btn.disabled = false;
      btn.title = gpu.isNvidia
        ? `NVIDIA détecté : ${gpu.renderer} : Améliorations RTX disponibles`
        : `GPU : ${gpu.renderer} : Améliorations vidéo disponibles`;

      if (gpu.isNvidia) {
        btn.classList.add('nvidia-detected');
      }
    } else {
      btn.title = 'Accélération GPU non disponible';
    }

    // Restore state
    const saved = localStorage.getItem('pip-nvidia-enhance') === 'true';
    if (saved && gpu.supported) {
      isActive = true;
      btn.classList.add('active');
    }
  };

  const onMediaLoaded = () => {
    if (!isActive) return;
    const media = document.getElementById('active-media');
    if (media) applyEnhancements(media);
  };

  return { init, toggle, detectGPU, onMediaLoaded, applyEnhancements, removeEnhancements };
})();

// Composite filter helper : merges Cinema + NVIDIA + user filters
const applyCompositeFilter = (element) => {
  if (!element) return;
  const parts = [];
  if (element.dataset.cinemaFilter) parts.push(element.dataset.cinemaFilter);
  if (element.dataset.nvidiaFilter) parts.push(element.dataset.nvidiaFilter);
  if (element.dataset.userFilter) parts.push(element.dataset.userFilter);
  element.style.filter = parts.join(' ') || '';
};

// Audio Equalizer : 3-band EQ via Web Audio API BiquadFilters
const AudioEqualizer = (() => {
  let audioContext = null;
  let source = null;
  let bassFilter = null;
  let midFilter = null;
  let trebleFilter = null;
  let connectedAudio = null;

  const getContext = () => {
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioContext = new Ctx();
    }
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  };

  const connect = (mediaElement) => {
    if (!mediaElement || connectedAudio === mediaElement) return;
    const ctx = getContext();
    if (!ctx) return;

    // Disconnect previous
    if (source) {
      try { source.disconnect(); } catch (_) {}
    }

    connectedAudio = mediaElement;

    try {
      source = ctx.createMediaElementSource(mediaElement);
    } catch (e) {
      // Already connected via AudioVisualizer : reuse that context
      // Can't create two sources from same element; EQ won't apply in this case
      console.warn('EQ: source already connected, skipping');
      return;
    }

    bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = 0;

    midFilter = ctx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1;
    midFilter.gain.value = 0;

    trebleFilter = ctx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;
    trebleFilter.gain.value = 0;

    source.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);
    trebleFilter.connect(ctx.destination);
  };

  const setBass = (dB) => { if (bassFilter) bassFilter.gain.value = dB; };
  const setMid = (dB) => { if (midFilter) midFilter.gain.value = dB; };
  const setTreble = (dB) => { if (trebleFilter) trebleFilter.gain.value = dB; };

  const reset = () => {
    setBass(0);
    setMid(0);
    setTreble(0);
  };

  return { connect, setBass, setMid, setTreble, reset };
})();

// Sleep Timer
const SleepTimer = (() => {
  let timerId = null;
  let endTime = null;
  let displayInterval = null;

  const start = (minutes) => {
    stop();
    if (minutes <= 0) return;
    endTime = Date.now() + minutes * 60 * 1000;

    timerId = setTimeout(() => {
      const media = document.getElementById('active-media');
      if (media) media.pause();
      stop();
    }, minutes * 60 * 1000);

    const statusEl = document.getElementById('sleep-timer-status');
    const remainEl = document.getElementById('sleep-timer-remaining');
    statusEl.classList.remove('hidden');

    displayInterval = setInterval(() => {
      const left = Math.max(0, endTime - Date.now());
      if (left <= 0) { stop(); return; }
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      remainEl.textContent = `⏳ ${m}:${String(s).padStart(2, '0')} restantes`;
    }, 1000);
  };

  const stop = () => {
    if (timerId) { clearTimeout(timerId); timerId = null; }
    if (displayInterval) { clearInterval(displayInterval); displayInterval = null; }
    endTime = null;
    const statusEl = document.getElementById('sleep-timer-status');
    if (statusEl) statusEl.classList.add('hidden');
    document.querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('active'));
    const offBtn = document.querySelector('.sleep-btn[data-minutes="0"]');
    if (offBtn) offBtn.classList.add('active');
  };

  const isActive = () => !!timerId;

  return { start, stop, isActive };
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

  const playNext = () => {
    if (!playlist.length) return;
    currentIndex = (currentIndex + 1) % playlist.length;
    renderMedia(playlist[currentIndex]);
  };

  const playRandom = () => {
    if (playlist.length <= 1) return;
    let idx;
    do { idx = Math.floor(Math.random() * playlist.length); } while (idx === currentIndex);
    currentIndex = idx;
    renderMedia(playlist[currentIndex]);
  };

  const getPlaylist = () => playlist;
  const getCurrentIndex = () => currentIndex;

  return { init, addLocalFile, addURL, play, loadPlaylist, renderPlaylist, playNext, playRandom, getPlaylist, getCurrentIndex };
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
  
  // Volume control
  const volumeSlider = document.getElementById('volume-slider');
  const volumeToggle = document.getElementById('volume-toggle');
  const volumeValue = document.getElementById('volume-value');
  let savedVolume = parseFloat(localStorage.getItem('pip-volume') ?? '1');
  let isMuted = false;

  volumeSlider.value = Math.round(savedVolume * 100);
  volumeValue.textContent = Math.round(savedVolume * 100) + '%';

  const applyVolume = (vol) => {
    const media = document.getElementById('active-media');
    if (media) media.volume = vol;
  };

  volumeSlider.addEventListener('input', () => {
    const vol = parseInt(volumeSlider.value) / 100;
    savedVolume = vol;
    isMuted = false;
    volumeToggle.classList.remove('muted');
    volumeValue.textContent = volumeSlider.value + '%';
    localStorage.setItem('pip-volume', vol);
    applyVolume(vol);
  });

  volumeToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    volumeToggle.classList.toggle('muted', isMuted);
    if (isMuted) {
      applyVolume(0);
      volumeValue.textContent = '0%';
      volumeSlider.value = 0;
    } else {
      applyVolume(savedVolume);
      volumeSlider.value = Math.round(savedVolume * 100);
      volumeValue.textContent = Math.round(savedVolume * 100) + '%';
    }
  });

  // Apply saved volume to newly loaded media
  const observer = new MutationObserver(() => {
    const media = document.getElementById('active-media');
    if (media) {
      media.volume = isMuted ? 0 : savedVolume;
    }
  });
  observer.observe(document.getElementById('player-container'), { childList: true, subtree: true });

  // Protection toggle button
  document.getElementById('protection-toggle').addEventListener('click', () => {
    ScreenProtection.toggle();
  });

  // Protection panel : mode auto/manual
  const protAutoBtn = document.getElementById('protection-auto-btn');
  const protManualBtn = document.getElementById('protection-manual-btn');
  const protManualGroup = document.getElementById('protection-manual-group');

  const setProtectionMode = (auto) => {
    ScreenProtection.setAutoMode(auto);
    protAutoBtn.classList.toggle('active', auto);
    protManualBtn.classList.toggle('active', !auto);
    protManualGroup.classList.toggle('hidden', auto);
  };

  // Restore saved mode
  setProtectionMode(ScreenProtection.getAutoMode());

  protAutoBtn.addEventListener('click', () => setProtectionMode(true));
  protManualBtn.addEventListener('click', () => setProtectionMode(false));

  document.getElementById('protection-generate-btn').addEventListener('click', () => {
    const title = document.getElementById('protection-custom-title').value.trim();
    ScreenProtection.manualGenerate(title || null);
  });

  document.getElementById('protection-copy-btn').addEventListener('click', () => {
    const code = ScreenProtection.getCurrentCode();
    if (code && code.url) {
      navigator.clipboard.writeText(code.url).then(() => {
        const btn = document.getElementById('protection-copy-btn');
        const span = btn.querySelector('span');
        const orig = span.textContent;
        span.textContent = 'Copié !';
        setTimeout(() => span.textContent = orig, 1500);
      });
    }
  });

  document.getElementById('protection-regen-btn').addEventListener('click', () => {
    ScreenProtection.regenerateCode();
  });

  // NVIDIA Enhance
  NvidiaEnhance.init();
  document.getElementById('nvidia-enhance').addEventListener('click', () => {
    NvidiaEnhance.toggle();
  });

  // Apply NVIDIA enhancements on new media
  const nvidiaObserver = new MutationObserver(() => NvidiaEnhance.onMediaLoaded());
  nvidiaObserver.observe(document.getElementById('player-container'), { childList: true, subtree: true });

  // Enhancement tools panel toggle
  document.getElementById('enhance-toggle').addEventListener('click', () => {
    const panel = document.getElementById('enhance-panel');
    panel.classList.toggle('hidden');
    document.getElementById('enhance-toggle').classList.toggle('active', !panel.classList.contains('hidden'));
  });

  // Playback speed
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const media = document.getElementById('active-media');
      if (media) media.playbackRate = parseFloat(btn.dataset.speed);
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Video filters (user-adjustable)
  const filterIds = ['brightness', 'contrast', 'saturate', 'hue', 'blur'];
  const buildUserFilter = () => {
    const b = document.getElementById('filter-brightness').value;
    const c = document.getElementById('filter-contrast').value;
    const s = document.getElementById('filter-saturate').value;
    const h = document.getElementById('filter-hue').value;
    const bl = document.getElementById('filter-blur').value;
    const parts = [];
    if (b !== '100') parts.push(`brightness(${b / 100})`);
    if (c !== '100') parts.push(`contrast(${c / 100})`);
    if (s !== '100') parts.push(`saturate(${s / 100})`);
    if (h !== '0') parts.push(`hue-rotate(${h}deg)`);
    if (bl !== '0') parts.push(`blur(${bl}px)`);
    return parts.join(' ');
  };

  filterIds.forEach(id => {
    const slider = document.getElementById('filter-' + id);
    const valEl = document.getElementById('val-' + id);
    slider.addEventListener('input', () => {
      if (id === 'hue') valEl.textContent = slider.value + '°';
      else if (id === 'blur') valEl.textContent = slider.value + 'px';
      else valEl.textContent = slider.value + '%';
      const media = document.getElementById('active-media');
      if (media) {
        media.dataset.userFilter = buildUserFilter();
        applyCompositeFilter(media);
      }
    });
  });

  // Loop controls
  let loopMode = 'none';
  let abPointA = null;
  let abPointB = null;
  let abCheckInterval = null;

  document.querySelectorAll('.loop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loopMode = btn.dataset.loop;
      document.querySelectorAll('.loop-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const media = document.getElementById('active-media');
      const abInfo = document.getElementById('ab-loop-info');

      // Clear existing A-B loop
      if (abCheckInterval) { clearInterval(abCheckInterval); abCheckInterval = null; }
      abPointA = null;
      abPointB = null;

      if (loopMode === 'single') {
        if (media) media.loop = true;
        abInfo.classList.add('hidden');
      } else if (loopMode === 'ab') {
        if (media) media.loop = false;
        abInfo.classList.remove('hidden');
        document.getElementById('ab-loop-status').textContent = 'Cliquez pour définir le point A';

        const setPoint = () => {
          if (!media) return;
          if (abPointA === null) {
            abPointA = media.currentTime;
            document.getElementById('ab-loop-status').textContent =
              `A = ${abPointA.toFixed(1)}s : Cliquez pour le point B`;
          } else if (abPointB === null) {
            abPointB = media.currentTime;
            if (abPointB <= abPointA) { abPointB = null; return; }
            document.getElementById('ab-loop-status').textContent =
              `A = ${abPointA.toFixed(1)}s → B = ${abPointB.toFixed(1)}s`;
            abCheckInterval = setInterval(() => {
              if (media && media.currentTime >= abPointB) media.currentTime = abPointA;
            }, 100);
          }
        };

        // Use the media element click to set A/B points
        if (media) {
          media._abHandler = setPoint;
          media.addEventListener('click', setPoint);
        }
      } else {
        if (media) media.loop = false;
        abInfo.classList.add('hidden');
      }

      // Cleanup previous handler
      if (loopMode !== 'ab' && media && media._abHandler) {
        media.removeEventListener('click', media._abHandler);
        delete media._abHandler;
      }
    });
  });

  document.getElementById('ab-loop-clear').addEventListener('click', () => {
    if (abCheckInterval) { clearInterval(abCheckInterval); abCheckInterval = null; }
    abPointA = null;
    abPointB = null;
    document.getElementById('ab-loop-status').textContent = 'Cliquez pour définir le point A';
  });

  // Screenshot (video only)
  document.getElementById('screenshot-btn').addEventListener('click', () => {
    const media = document.getElementById('active-media');
    if (!media || media.tagName !== 'VIDEO') return;
    const canvas = document.createElement('canvas');
    canvas.width = media.videoWidth;
    canvas.height = media.videoHeight;
    canvas.getContext('2d').drawImage(media, 0, 0);
    const link = document.createElement('a');
    link.download = `capture_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Rotation
  let currentRotation = 0;
  document.getElementById('rotate-btn').addEventListener('click', () => {
    const media = document.getElementById('active-media');
    if (!media) return;
    currentRotation = (currentRotation + 90) % 360;
    media.style.transform = `translateZ(0) rotate(${currentRotation}deg)`;
    if (currentRotation % 180 !== 0) {
      media.style.maxWidth = '56.25%'; // 9/16
      media.style.margin = 'auto';
    } else {
      media.style.maxWidth = '';
      media.style.margin = '';
    }
  });

  // Flip horizontal
  let isFlipped = false;
  document.getElementById('flip-h-btn').addEventListener('click', () => {
    const media = document.getElementById('active-media');
    if (!media) return;
    isFlipped = !isFlipped;
    const scaleX = isFlipped ? -1 : 1;
    media.style.transform = `translateZ(0) rotate(${currentRotation}deg) scaleX(${scaleX})`;
    document.getElementById('flip-h-btn').classList.toggle('active', isFlipped);
  });

  // Enhancement reset
  document.getElementById('enhance-reset').addEventListener('click', () => {
    // Reset speed
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.speed-btn[data-speed="1"]').classList.add('active');

    // Reset filters
    filterIds.forEach(id => {
      const slider = document.getElementById('filter-' + id);
      const valEl = document.getElementById('val-' + id);
      if (id === 'hue') { slider.value = 0; valEl.textContent = '0°'; }
      else if (id === 'blur') { slider.value = 0; valEl.textContent = '0px'; }
      else { slider.value = 100; valEl.textContent = '100%'; }
    });

    // Reset loop
    loopMode = 'none';
    document.querySelectorAll('.loop-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.loop-btn[data-loop="none"]').classList.add('active');
    document.getElementById('ab-loop-info').classList.add('hidden');
    if (abCheckInterval) { clearInterval(abCheckInterval); abCheckInterval = null; }
    abPointA = null;
    abPointB = null;

    // Reset rotation/flip
    currentRotation = 0;
    isFlipped = false;
    document.getElementById('flip-h-btn').classList.remove('active');

    // Apply to media
    const media = document.getElementById('active-media');
    if (media) {
      media.playbackRate = 1;
      media.loop = false;
      media.style.transform = 'translateZ(0)';
      media.style.maxWidth = '';
      media.style.margin = '';
      delete media.dataset.userFilter;
      applyCompositeFilter(media);
    }

    // Reset EQ
    AudioEqualizer.reset();
    ['eq-bass', 'eq-mid', 'eq-treble'].forEach(id => {
      document.getElementById(id).value = 0;
      document.getElementById('val-' + id).textContent = '0 dB';
    });

    // Reset sleep timer
    SleepTimer.stop();

    // Reset auto-next / shuffle
    autoNextEnabled = false;
    shuffleEnabled = false;
    document.getElementById('auto-next-btn').classList.remove('active');
    document.getElementById('shuffle-btn').classList.remove('active');
  });

  // Enable enhancement tools when media is loaded
  const enhanceObserver = new MutationObserver(() => {
    const media = document.getElementById('active-media');
    const isVideo = media && media.tagName === 'VIDEO';
    document.getElementById('screenshot-btn').disabled = !isVideo;
    document.getElementById('rotate-btn').disabled = !media;
    document.getElementById('flip-h-btn').disabled = !media;
    // Reset rotation/flip on new media
    currentRotation = 0;
    isFlipped = false;
    // Apply saved speed
    const activeSpeed = document.querySelector('.speed-btn.active');
    if (media && activeSpeed) media.playbackRate = parseFloat(activeSpeed.dataset.speed);
    // Apply loop
    if (media && loopMode === 'single') media.loop = true;
    // Update media details
    updateMediaDetails(media);
    // Connect EQ if not audio visualizer
    if (media && media.tagName !== 'VIDEO') {
      // Audio elements: EQ will conflict with AudioVisualizer's createMediaElementSource
      // Only connect EQ for video elements or if visualizer didn't connect
    }
  });
  enhanceObserver.observe(document.getElementById('player-container'), { childList: true, subtree: true });

  // Audio Equalizer
  document.getElementById('eq-bass').addEventListener('input', (e) => {
    AudioEqualizer.setBass(parseFloat(e.target.value));
    document.getElementById('val-eq-bass').textContent = e.target.value + ' dB';
  });
  document.getElementById('eq-mid').addEventListener('input', (e) => {
    AudioEqualizer.setMid(parseFloat(e.target.value));
    document.getElementById('val-eq-mid').textContent = e.target.value + ' dB';
  });
  document.getElementById('eq-treble').addEventListener('input', (e) => {
    AudioEqualizer.setTreble(parseFloat(e.target.value));
    document.getElementById('val-eq-treble').textContent = e.target.value + ' dB';
  });

  // Sleep Timer
  document.querySelectorAll('.sleep-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const minutes = parseInt(btn.dataset.minutes);
      if (minutes === 0) SleepTimer.stop();
      else SleepTimer.start(minutes);
    });
  });

  // Auto-next playlist
  let autoNextEnabled = false;
  let shuffleEnabled = false;

  document.getElementById('auto-next-btn').addEventListener('click', () => {
    autoNextEnabled = !autoNextEnabled;
    document.getElementById('auto-next-btn').classList.toggle('active', autoNextEnabled);
  });

  document.getElementById('shuffle-btn').addEventListener('click', () => {
    shuffleEnabled = !shuffleEnabled;
    document.getElementById('shuffle-btn').classList.toggle('active', shuffleEnabled);
  });

  // Listen for media ended to trigger auto-next/shuffle
  document.getElementById('player-container').addEventListener('ended', (e) => {
    if (e.target.id !== 'active-media') return;
    if (loopMode !== 'none') return; // loop modes handle their own behavior
    if (shuffleEnabled) {
      MediaManager.playRandom();
    } else if (autoNextEnabled) {
      MediaManager.playNext();
    }
  }, true);

  // Media details
  const formatDuration = (s) => {
    if (!s || !isFinite(s)) return ':';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${m}:${String(sec).padStart(2, '0')}`;
  };

  const updateMediaDetails = (media) => {
    const container = document.getElementById('media-details');
    if (!media) {
      container.innerHTML = '<p class="media-detail-empty">Aucun média chargé</p>';
      return;
    }

    const populate = () => {
      const rows = [];
      if (media.tagName === 'VIDEO') {
        rows.push(['Résolution', `${media.videoWidth}×${media.videoHeight}`]);
      }
      rows.push(['Durée', formatDuration(media.duration)]);
      rows.push(['Type', media.tagName === 'VIDEO' ? 'Vidéo' : 'Audio']);
      if (media.src) {
        const isBlob = media.src.startsWith('blob:');
        rows.push(['Source', isBlob ? 'Fichier local' : new URL(media.src).hostname]);
      }
      rows.push(['État', media.paused ? '⏸ En pause' : '▶ Lecture']);

      container.innerHTML = rows.map(([label, val]) =>
        `<div class="media-detail-row"><span>${label}</span><span>${val}</span></div>`
      ).join('');
    };

    // Wait for metadata if not yet loaded
    if (media.readyState >= 1) {
      populate();
    } else {
      media.addEventListener('loadedmetadata', populate, { once: true });
    }
    // Update play/pause state live
    media.addEventListener('play', () => { const el = container.querySelector('.media-detail-row:last-child span:last-child'); if (el) el.textContent = '▶ Lecture'; });
    media.addEventListener('pause', () => { const el = container.querySelector('.media-detail-row:last-child span:last-child'); if (el) el.textContent = '⏸ En pause'; });
  };

  // Keyboard shortcuts
  const speedValues = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];

  document.addEventListener('keydown', (e) => {
    // Don't capture when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    const media = document.getElementById('active-media');
    if (!media) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        media.paused ? media.play() : media.pause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        media.currentTime = Math.max(0, media.currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        media.currentTime = Math.min(media.duration || 0, media.currentTime + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        savedVolume = Math.min(1, savedVolume + 0.05);
        isMuted = false;
        volumeToggle.classList.remove('muted');
        applyVolume(savedVolume);
        volumeSlider.value = Math.round(savedVolume * 100);
        volumeValue.textContent = Math.round(savedVolume * 100) + '%';
        localStorage.setItem('pip-volume', savedVolume);
        break;
      case 'ArrowDown':
        e.preventDefault();
        savedVolume = Math.max(0, savedVolume - 0.05);
        isMuted = false;
        volumeToggle.classList.remove('muted');
        applyVolume(savedVolume);
        volumeSlider.value = Math.round(savedVolume * 100);
        volumeValue.textContent = Math.round(savedVolume * 100) + '%';
        localStorage.setItem('pip-volume', savedVolume);
        break;
      case 'm':
      case 'M':
        volumeToggle.click();
        break;
      case 'f':
      case 'F':
        document.getElementById('fullscreen-btn').click();
        break;
      case '<':
      case ',': {
        const currentSpeed = media.playbackRate;
        const idx = speedValues.indexOf(currentSpeed);
        if (idx > 0) {
          const newSpeed = speedValues[idx - 1];
          media.playbackRate = newSpeed;
          document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === newSpeed));
        }
        break;
      }
      case '>':
      case '.': {
        const currentSpeed = media.playbackRate;
        const idx = speedValues.indexOf(currentSpeed);
        if (idx < speedValues.length - 1) {
          const newSpeed = speedValues[idx + 1];
          media.playbackRate = newSpeed;
          document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', parseFloat(b.dataset.speed) === newSpeed));
        }
        break;
      }
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
