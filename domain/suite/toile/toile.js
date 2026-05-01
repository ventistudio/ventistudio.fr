(function () {
  'use strict';

  const docNameInput = document.getElementById('doc-name');
  const canvasWrap = document.getElementById('toile-canvas-wrap');
  const canvas = document.getElementById('toile-canvas');
  const ctx = canvas.getContext('2d');

  let tool = 'pen';
  let strokeColor = '#e0e0e0';
  let fillColor = 'transparent';
  let lineWidth = 3;
  let opacity = 1;
  let gridSnap = false;
  let zoomLevel = 100;
  let isDrawing = false;
  let startX, startY;
  let layers = [];
  let currentPath = [];
  let undoStack = [];
  let redoStack = [];
  let autoSaveTimer;

  const COLORS = ['#e0e0e0', '#000000', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a3e635'];

  function resizeCanvas() {
    const rect = canvasWrap.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    redrawAll();
  }

  window.addEventListener('resize', resizeCanvas);

  function snapGrid(v) { return gridSnap ? Math.round(v / 20) * 20 : v; }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    const s = zoomLevel / 100;
    return { x: snapGrid((touch.clientX - rect.left) / s), y: snapGrid((touch.clientY - rect.top) / s) };
  }

  canvas.addEventListener('mousedown', onStart);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onEnd);
  canvas.addEventListener('mouseleave', onEnd);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(e); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); onMove(e); }, { passive: false });
  canvas.addEventListener('touchend', onEnd);

  function onStart(e) {
    isDrawing = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;

    if (tool === 'pen' || tool === 'eraser') {
      currentPath = [{ x: pos.x, y: pos.y }];
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }

  function onMove(e) {
    if (!isDrawing) return;
    const pos = getPos(e);

    if (tool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      currentPath.push({ x: pos.x, y: pos.y });
    } else if (tool === 'eraser') {
      ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' ? '#f8f8fc' : '#0c0c14';
      ctx.lineWidth = lineWidth * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      currentPath.push({ x: pos.x, y: pos.y });
    } else if (tool === 'rect' || tool === 'ellipse' || tool === 'line' || tool === 'arrow' || tool === 'triangle' || tool === 'diamond' || tool === 'star') {
      redrawAll();
      drawShapePreview(startX, startY, pos.x, pos.y);
    }
  }

  function onEnd(e) {
    if (!isDrawing) return;
    isDrawing = false;

    const pos = e.changedTouches ? { x: e.changedTouches[0].clientX - canvas.getBoundingClientRect().left, y: e.changedTouches[0].clientY - canvas.getBoundingClientRect().top } : (e.type === 'mouseleave' ? { x: startX, y: startY } : getPos(e));

    if (tool === 'pen') {
      layers.push({ type: 'path', points: currentPath, color: strokeColor, width: lineWidth });
      currentPath = [];
    } else if (tool === 'eraser') {
      layers.push({ type: 'eraser', points: currentPath, width: lineWidth * 3, color: document.documentElement.getAttribute('data-theme') === 'light' ? '#f8f8fc' : '#0c0c14' });
      currentPath = [];
    } else if (tool === 'rect') {
      layers.push({ type: 'rect', x: startX, y: startY, w: pos.x - startX, h: pos.y - startY, strokeColor, fillColor, lineWidth });
    } else if (tool === 'ellipse') {
      layers.push({ type: 'ellipse', cx: (startX + pos.x) / 2, cy: (startY + pos.y) / 2, rx: Math.abs(pos.x - startX) / 2, ry: Math.abs(pos.y - startY) / 2, strokeColor, fillColor, lineWidth });
    } else if (tool === 'line') {
      layers.push({ type: 'line', x1: startX, y1: startY, x2: pos.x, y2: pos.y, color: strokeColor, width: lineWidth });
    } else if (tool === 'arrow') {
      layers.push({ type: 'arrow', x1: startX, y1: startY, x2: pos.x, y2: pos.y, color: strokeColor, width: lineWidth });
    } else if (tool === 'triangle') {
      layers.push({ type: 'triangle', x1: startX, y1: startY, x2: pos.x, y2: pos.y, strokeColor, fillColor, lineWidth });
    } else if (tool === 'diamond') {
      layers.push({ type: 'diamond', x1: startX, y1: startY, x2: pos.x, y2: pos.y, strokeColor, fillColor, lineWidth });
    } else if (tool === 'star') {
      layers.push({ type: 'star', x1: startX, y1: startY, x2: pos.x, y2: pos.y, strokeColor, fillColor, lineWidth });
    } else if (tool === 'text') {
      const text = prompt('Texte :');
      if (text) {
        layers.push({ type: 'text', x: startX, y: startY, text, color: strokeColor, fontSize: lineWidth * 5 + 10 });
        redrawAll();
      }
    }

    if (layers.length > 0 && layers[layers.length - 1].opacity === undefined) layers[layers.length - 1].opacity = opacity;
    undoStack.push(JSON.stringify(layers));
    redoStack = [];
    scheduleAutoSave();
    redrawAll();
    updateStatus();
  }

  function drawShapePreview(x1, y1, x2, y2) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([6, 4]);

    if (tool === 'rect') {
      if (fillColor !== 'transparent') {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      }
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (tool === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2, 0, 0, Math.PI * 2);
      if (fillColor !== 'transparent') { ctx.fillStyle = fillColor; ctx.fill(); }
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (tool === 'arrow') {
      drawArrow(ctx, x1, y1, x2, y2);
    } else if (tool === 'triangle') {
      ctx.beginPath();
      ctx.moveTo((x1 + x2) / 2, y1); ctx.lineTo(x2, y2); ctx.lineTo(x1, y2); ctx.closePath();
      if (fillColor !== 'transparent') { ctx.fillStyle = fillColor; ctx.fill(); }
      ctx.stroke();
    } else if (tool === 'diamond') {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      ctx.beginPath();
      ctx.moveTo(mx, y1); ctx.lineTo(x2, my); ctx.lineTo(mx, y2); ctx.lineTo(x1, my); ctx.closePath();
      if (fillColor !== 'transparent') { ctx.fillStyle = fillColor; ctx.fill(); }
      ctx.stroke();
    } else if (tool === 'star') {
      drawStar(ctx, x1, y1, x2, y2, fillColor);
    }
    ctx.setLineDash([]);
  }

  function drawArrow(c, x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 14;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.beginPath();
    c.moveTo(x2, y2);
    c.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    c.moveTo(x2, y2);
    c.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    c.stroke();
  }

  function drawStar(c, x1, y1, x2, y2, fill) {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const outerR = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
    const innerR = outerR * 0.38;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.closePath();
    if (fill && fill !== 'transparent') { c.fillStyle = fill; c.fill(); }
    c.stroke();
  }

  function redrawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach(obj => {
      ctx.globalAlpha = obj.opacity !== undefined ? obj.opacity : 1;
      ctx.setLineDash([]);
      if (obj.type === 'path' || obj.type === 'eraser') {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        obj.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (obj.type === 'rect') {
        ctx.strokeStyle = obj.strokeColor;
        ctx.lineWidth = obj.lineWidth;
        if (obj.fillColor && obj.fillColor !== 'transparent') {
          ctx.fillStyle = obj.fillColor;
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }
        ctx.strokeRect(obj.x, obj.y, obj.w, obj.h);
      } else if (obj.type === 'ellipse') {
        ctx.strokeStyle = obj.strokeColor;
        ctx.lineWidth = obj.lineWidth;
        ctx.beginPath();
        ctx.ellipse(obj.cx, obj.cy, Math.abs(obj.rx), Math.abs(obj.ry), 0, 0, Math.PI * 2);
        if (obj.fillColor && obj.fillColor !== 'transparent') { ctx.fillStyle = obj.fillColor; ctx.fill(); }
        ctx.stroke();
      } else if (obj.type === 'line') {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.width;
        ctx.beginPath();
        ctx.moveTo(obj.x1, obj.y1);
        ctx.lineTo(obj.x2, obj.y2);
        ctx.stroke();
      } else if (obj.type === 'arrow') {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.width;
        drawArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2);
      } else if (obj.type === 'text') {
        ctx.fillStyle = obj.color;
        ctx.font = `${obj.fontSize}px Inter, sans-serif`;
        ctx.fillText(obj.text, obj.x, obj.y);
      } else if (obj.type === 'triangle') {
        ctx.strokeStyle = obj.strokeColor;
        ctx.lineWidth = obj.lineWidth;
        ctx.beginPath();
        ctx.moveTo((obj.x1 + obj.x2) / 2, obj.y1); ctx.lineTo(obj.x2, obj.y2); ctx.lineTo(obj.x1, obj.y2); ctx.closePath();
        if (obj.fillColor && obj.fillColor !== 'transparent') { ctx.fillStyle = obj.fillColor; ctx.fill(); }
        ctx.stroke();
      } else if (obj.type === 'diamond') {
        ctx.strokeStyle = obj.strokeColor;
        ctx.lineWidth = obj.lineWidth;
        const mx = (obj.x1 + obj.x2) / 2, my = (obj.y1 + obj.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(mx, obj.y1); ctx.lineTo(obj.x2, my); ctx.lineTo(mx, obj.y2); ctx.lineTo(obj.x1, my); ctx.closePath();
        if (obj.fillColor && obj.fillColor !== 'transparent') { ctx.fillStyle = obj.fillColor; ctx.fill(); }
        ctx.stroke();
      } else if (obj.type === 'star') {
        ctx.strokeStyle = obj.strokeColor;
        ctx.lineWidth = obj.lineWidth;
        drawStar(ctx, obj.x1, obj.y1, obj.x2, obj.y2, obj.fillColor);
      }
      ctx.globalAlpha = 1;
    });
  }

  document.querySelectorAll('.toile-tool[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      tool = btn.dataset.tool;
      document.querySelectorAll('.toile-tool[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      canvasWrap.style.cursor = tool === 'eraser' ? 'crosshair' : (tool === 'text' ? 'text' : 'crosshair');
    });
  });

  const colorInput = document.getElementById('prop-color');
  const fillInput = document.getElementById('prop-fill');
  const sizeInput = document.getElementById('prop-size');
  const sizeVal = document.getElementById('prop-size-val');

  if (colorInput) {
    colorInput.addEventListener('input', () => { strokeColor = colorInput.value; updateColorPresets(); });
  }
  if (fillInput) {
    fillInput.addEventListener('input', () => { fillColor = fillInput.value; });
  }
  if (sizeInput) {
    sizeInput.addEventListener('input', () => {
      lineWidth = parseInt(sizeInput.value, 10);
      if (sizeVal) sizeVal.textContent = lineWidth + 'px';
    });
  }

  const opacityInput = document.getElementById('prop-opacity');
  const opacityVal = document.getElementById('prop-opacity-val');
  if (opacityInput) {
    opacityInput.addEventListener('input', () => {
      opacity = parseInt(opacityInput.value, 10) / 100;
      if (opacityVal) opacityVal.textContent = opacityInput.value + '%';
    });
  }

  const gridSnapInput = document.getElementById('prop-grid-snap');
  if (gridSnapInput) {
    gridSnapInput.addEventListener('change', () => { gridSnap = gridSnapInput.checked; });
  }

  function renderColorPresets() {
    const container = document.getElementById('color-presets');
    if (!container) return;
    container.innerHTML = '';
    COLORS.forEach(c => {
      const swatch = document.createElement('div');
      swatch.className = 'toile-color-preset' + (c === strokeColor ? ' active' : '');
      swatch.style.background = c;
      swatch.addEventListener('click', () => {
        strokeColor = c;
        if (colorInput) colorInput.value = c;
        updateColorPresets();
      });
      container.appendChild(swatch);
    });
  }

  function updateColorPresets() {
    document.querySelectorAll('.toile-color-preset').forEach(s => {
      s.classList.toggle('active', s.style.background === strokeColor || rgbToHex(s.style.background) === strokeColor);
    });
  }

  function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return rgb;
    return '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
  }

  window.toileUndo = function () {
    if (layers.length === 0) return;
    redoStack.push(JSON.stringify(layers));
    layers.pop();
    redrawAll();
    scheduleAutoSave();
    updateStatus();
  };

  window.toileRedo = function () {
    if (redoStack.length === 0) return;
    layers = JSON.parse(redoStack.pop());
    redrawAll();
    scheduleAutoSave();
    updateStatus();
  };

  window.toileClear = function () {
    if (!confirm('Effacer tout le dessin ?')) return;
    undoStack.push(JSON.stringify(layers));
    layers = [];
    redoStack = [];
    redrawAll();
    scheduleAutoSave();
    updateStatus();
  };

  window.toileZoom = function (delta) {
    zoomLevel = Math.max(25, Math.min(400, zoomLevel + delta));
    const s = zoomLevel / 100;
    canvas.style.transform = 'scale(' + s + ')';
    canvas.style.transformOrigin = '0 0';
    const lbl = document.getElementById('zoom-level');
    if (lbl) lbl.textContent = zoomLevel + '%';
  };

  function updateStatus() {
    const el = document.getElementById('status-objects');
    if (el) el.textContent = layers.length + ' objet' + (layers.length !== 1 ? 's' : '');
  }

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      VSSuite.autoSave('toile_current', { title: docNameInput.value, layers });
    }, 800);
  }

  function loadAutoSave() {
    const data = VSSuite.autoLoad('toile_current');
    if (data) {
      if (data.title) docNameInput.value = data.title;
      if (data.layers) layers = data.layers;
    }
  }

  window.toileNew = function () {
    if (!confirm('Nouveau dessin ?')) return;
    layers = [];
    undoStack = [];
    redoStack = [];
    docNameInput.value = 'Sans titre';
    VSSuite.autoDelete('toile_current');
    redrawAll();
    updateStatus();
  };

  window.toileSave = function () {
    const fileObj = VSSuite.createFile('vdraw', {
      title: docNameInput.value,
      content: { layers, canvasWidth: canvas.width, canvasHeight: canvas.height },
    });
    VSSuite.saveFile(fileObj);
  };

  window.toileOpen = function () {
    VSSuite.openFile('.vdraw').then(obj => {
      if (obj.type !== 'vdraw') { alert('Ce fichier n\'est pas un dessin Toile (.vdraw)'); return; }
      docNameInput.value = obj.meta?.title || 'Sans titre';
      layers = obj.layers || [];
      scheduleAutoSave();
      redrawAll();
      updateStatus();
    }).catch(e => {
      if (e.message !== 'Aucun fichier sélectionné') alert(e.message);
    });
  };

  window.toileExportPNG = function () {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = (docNameInput.value || 'dessin') + '.png';
    a.click();
  };

  window.toileExportPDF = function () {
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>${VSSuite.esc(docNameInput.value)}</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh}img{max-width:100%;max-height:100vh}</style></head><body><img src="${canvas.toDataURL('image/png')}"></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  window.toggleDropdown = function (id) {
    const dd = document.getElementById(id);
    if (!dd) return;
    document.querySelectorAll('.suite-dropdown.open').forEach(d => { if (d.id !== id) d.classList.remove('open'); });
    dd.classList.toggle('open');
  };
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.suite-dropdown') && !e.target.closest('[onclick*="toggleDropdown"]')) {
      document.querySelectorAll('.suite-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  VSSuite.registerShortcuts({
    'ctrl+s': () => toileSave(),
    'ctrl+o': () => toileOpen(),
    'ctrl+n': () => toileNew(),
    'ctrl+z': () => toileUndo(),
    'ctrl+y': () => toileRedo(),
    'ctrl+shift+z': () => toileRedo(),
    'ctrl+p': () => toileExportPDF(),
  });

  function init() {
    VSSuite.initTheme();
    loadAutoSave();
    resizeCanvas();
    renderColorPresets();
    updateStatus();

    document.querySelector('.toile-tool[data-tool="pen"]')?.classList.add('active');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
