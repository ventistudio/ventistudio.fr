(function () {
  'use strict';

  const docNameInput = document.getElementById('doc-name');
  const slideContainer = document.getElementById('diapo-slide');
  const sidebar = document.getElementById('diapo-sidebar');
  const propsPanel = document.getElementById('diapo-props');

  let slides = [createDefaultSlide()];
  let activeSlide = 0;
  let selectedElement = null;
  let dragState = null;
  let autoSaveTimer;
  let elementIdCounter = 1;

  const THEMES = {
    dark:    { bg: '#1a1a2e', text: '#e0e0e0', accent: '#6366f1' },
    light:   { bg: '#ffffff', text: '#1a1a2e', accent: '#6366f1' },
    blue:    { bg: '#0f172a', text: '#e2e8f0', accent: '#3b82f6' },
    green:   { bg: '#064e3b', text: '#d1fae5', accent: '#10b981' },
    sunset:  { bg: '#1c1917', text: '#fef3c7', accent: '#f59e0b' },
    rose:    { bg: '#1a0a14', text: '#fce7f3', accent: '#ec4899' },
  };

  function createDefaultSlide() {
    return {
      id: Date.now(),
      theme: 'dark',      transition: 'none',
      notes: '',      elements: [
        { id: elementIdCounter++, type: 'title', x: 80, y: 160, w: 800, h: 80, content: 'Titre de la présentation', style: {} },
        { id: elementIdCounter++, type: 'text', x: 80, y: 280, w: 800, h: 100, content: 'Sous-titre ou description', style: {} },
      ],
    };
  }


  function render() {
    renderSlide();
    renderSidebar();
    renderProps();
    renderNotes();
    updateStatus();
  }

  function renderSlide() {
    const slide = slides[activeSlide];
    const theme = THEMES[slide.theme] || THEMES.dark;
    slideContainer.style.background = theme.bg;
    slideContainer.innerHTML = '';

    slide.elements.forEach(el => {
      const div = document.createElement('div');
      div.className = 'diapo-element' + (selectedElement === el.id ? ' selected' : '');
      div.dataset.type = el.type;
      div.dataset.id = el.id;
      div.style.left = el.x + 'px';
      div.style.top = el.y + 'px';
      div.style.width = el.w + 'px';
      if (el.h) div.style.height = el.h + 'px';
      div.style.color = el.style.color || theme.text;
      if (el.style.fontSize) div.style.fontSize = el.style.fontSize;
      if (el.style.fontWeight) div.style.fontWeight = el.style.fontWeight;
      if (el.style.textAlign) div.style.textAlign = el.style.textAlign;
      if (el.style.background) div.style.background = el.style.background;
      if (el.style.borderRadius) div.style.borderRadius = el.style.borderRadius;

      if (el.type === 'image') {
        const img = document.createElement('img');
        img.src = el.content;
        img.alt = 'Image';
        img.draggable = false;
        div.appendChild(img);
      } else if (el.type === 'shape') {
        div.style.background = el.style.background || theme.accent;
        div.style.borderRadius = el.style.borderRadius || '0';
      } else {
        div.textContent = el.content;
      }


      ['nw', 'ne', 'sw', 'se'].forEach(pos => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle ' + pos;
        handle.addEventListener('mousedown', (e) => startResize(e, el, pos));
        div.appendChild(handle);
      });

      div.addEventListener('mousedown', (e) => startDrag(e, el));
      div.addEventListener('dblclick', () => startEditElement(el));
      slideContainer.appendChild(div);
    });
  }

  function renderSidebar() {
    sidebar.innerHTML = '';
    slides.forEach((slide, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'diapo-thumb' + (i === activeSlide ? ' active' : '');
      const theme = THEMES[slide.theme] || THEMES.dark;
      thumb.style.background = theme.bg;

      const num = document.createElement('span');
      num.className = 'thumb-number';
      num.textContent = i + 1;
      thumb.appendChild(num);

      const content = document.createElement('div');
      content.className = 'diapo-thumb-content';
      slide.elements.forEach(el => {
        if (el.type === 'title') {
          const h = document.createElement('h3');
          h.textContent = el.content;
          h.style.color = el.style.color || theme.text;
          content.appendChild(h);
        } else if (el.type === 'text') {
          const p = document.createElement('p');
          p.textContent = el.content;
          p.style.color = el.style.color || theme.text;
          content.appendChild(p);
        }
      });
      thumb.appendChild(content);

      thumb.addEventListener('click', () => {
        activeSlide = i;
        selectedElement = null;
        render();
      });


      thumb.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (slides.length > 1 && confirm('Supprimer cette diapositive ?')) {
          slides.splice(i, 1);
          if (activeSlide >= slides.length) activeSlide = slides.length - 1;
          scheduleAutoSave();
          render();
        }
      });

      sidebar.appendChild(thumb);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'diapo-add-slide';
    addBtn.textContent = '+';
    addBtn.title = 'Ajouter une diapositive';
    addBtn.addEventListener('click', () => {
      slides.splice(activeSlide + 1, 0, {
        id: Date.now(),
        theme: slides[activeSlide].theme,
        transition: 'none',
        notes: '',
        elements: [],
      });
      activeSlide++;
      selectedElement = null;
      scheduleAutoSave();
      render();
    });
    sidebar.appendChild(addBtn);
  }

  function renderProps() {
    if (!propsPanel) return;
    const slide = slides[activeSlide];
    const el = slide.elements.find(e => e.id === selectedElement);

    let html = '<h4>Diapositive</h4>';
    html += '<div class="diapo-themes">';
    Object.entries(THEMES).forEach(([key, t]) => {
      html += `<div class="diapo-theme-swatch${slide.theme === key ? ' active' : ''}" style="background:${t.bg};border:1px solid ${t.accent}" data-theme="${key}" title="${key}"></div>`;
    });
    html += '</div>';

    if (el) {
      html += '<h4>Élément</h4>';
      html += `<label>Type <input type="text" value="${el.type}" disabled></label>`;
      html += `<label>X <input type="number" value="${el.x}" data-prop="x"></label>`;
      html += `<label>Y <input type="number" value="${el.y}" data-prop="y"></label>`;
      html += `<label>L <input type="number" value="${el.w}" data-prop="w"></label>`;
      html += `<label>H <input type="number" value="${el.h || ''}" data-prop="h"></label>`;
      if (el.type !== 'image' && el.type !== 'shape') {
        html += '<h4>Style</h4>';
        html += `<label>Taille <input type="text" value="${el.style.fontSize || ''}" data-style="fontSize" placeholder="ex: 2rem"></label>`;
        html += `<label>Couleur <input type="color" value="${el.style.color || '#e0e0e0'}" data-style="color"></label>`;
        html += `<label>Align <select data-style="textAlign"><option value="">Auto</option><option value="left"${el.style.textAlign==='left'?' selected':''}>Gauche</option><option value="center"${el.style.textAlign==='center'?' selected':''}>Centre</option><option value="right"${el.style.textAlign==='right'?' selected':''}>Droite</option></select></label>`;
      }
      if (el.type === 'shape') {
        html += '<h4>Forme</h4>';
        html += `<label>Couleur <input type="color" value="${el.style.background || '#6366f1'}" data-style="background"></label>`;
        html += `<label>Arrondi <input type="text" value="${el.style.borderRadius || '0'}" data-style="borderRadius" placeholder="ex: 50%"></label>`;
      }
      html += `<br><button class="suite-btn suite-btn-ghost" style="width:100%;margin-top:8px" onclick="diapoDeleteElement()">Supprimer l'élément</button>`;
    }

    const transSelect = document.getElementById('tb-transition');
    if (transSelect) transSelect.value = slide.transition || 'none';
    propsPanel.innerHTML = html;


    propsPanel.querySelectorAll('.diapo-theme-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        slide.theme = sw.dataset.theme;
        scheduleAutoSave();
        render();
      });
    });

    propsPanel.querySelectorAll('[data-prop]').forEach(input => {
      input.addEventListener('change', () => {
        if (!el) return;
        el[input.dataset.prop] = parseInt(input.value, 10) || 0;
        scheduleAutoSave();
        render();
      });
    });

    propsPanel.querySelectorAll('[data-style]').forEach(input => {
      input.addEventListener('change', () => {
        if (!el) return;
        el.style[input.dataset.style] = input.value;
        scheduleAutoSave();
        render();
      });
    });
  }


  function startDrag(e, el) {
    if (e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    selectedElement = el.id;
    render();

    const startX = e.clientX - el.x;
    const startY = e.clientY - el.y;

    function onMove(e) {
      el.x = Math.max(0, e.clientX - startX);
      el.y = Math.max(0, e.clientY - startY);
      renderSlide();
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      scheduleAutoSave();
      render();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function startResize(e, el, pos) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = el.w;
    const origH = el.h || 80;
    const origX = el.x;
    const origY = el.y;

    function onMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (pos.includes('e')) el.w = Math.max(40, origW + dx);
      if (pos.includes('s')) el.h = Math.max(20, origH + dy);
      if (pos.includes('w')) { el.w = Math.max(40, origW - dx); el.x = origX + dx; }
      if (pos.includes('n')) { el.h = Math.max(20, origH - dy); el.y = origY + dy; }
      renderSlide();
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      scheduleAutoSave();
      render();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }


  function startEditElement(el) {
    if (el.type === 'image' || el.type === 'shape') return;
    const div = slideContainer.querySelector(`[data-id="${el.id}"]`);
    if (!div) return;

    div.contentEditable = true;
    div.classList.add('editing');
    div.focus();

    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const finalize = () => {
      div.contentEditable = false;
      div.classList.remove('editing');
      el.content = div.textContent;
      div.removeEventListener('blur', finalize);
      scheduleAutoSave();
      render();
    };
    div.addEventListener('blur', finalize);
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { div.textContent = el.content; div.blur(); }
    });
  }


  slideContainer.addEventListener('mousedown', (e) => {
    if (e.target === slideContainer) {
      selectedElement = null;
      render();
    }
  });


  window.diapoAddTitle = function () {
    const slide = slides[activeSlide];
    slide.elements.push({
      id: elementIdCounter++, type: 'title',
      x: 80, y: 80, w: 800, h: 70,
      content: 'Nouveau titre', style: {},
    });
    scheduleAutoSave();
    render();
  };

  window.diapoAddText = function () {
    const slide = slides[activeSlide];
    slide.elements.push({
      id: elementIdCounter++, type: 'text',
      x: 80, y: 200, w: 800, h: 100,
      content: 'Nouveau texte', style: {},
    });
    scheduleAutoSave();
    render();
  };

  window.diapoAddImage = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image
  window.diapoDuplicateSlide = function () {
    const src = slides[activeSlide];
    const dup = JSON.parse(JSON.stringify(src));
    dup.id = Date.now();
    dup.elements.forEach(el => { el.id = elementIdCounter++; });
    slides.splice(activeSlide + 1, 0, dup);
    activeSlide++;
    selectedElement = null;
    scheduleAutoSave();
    render();
  };

  window.diapoDeleteSlide = function () {
    if (slides.length <= 1) return;
    if (!confirm('Supprimer cette diapositive ?')) return;
    slides.splice(activeSlide, 1);
    if (activeSlide >= slides.length) activeSlide = slides.length - 1;
    selectedElement = null;
    scheduleAutoSave();
    render();
  };

  window.diapoMoveSlide = function (dir) {
    const newIdx = activeSlide + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const tmp = slides[activeSlide];
    slides[activeSlide] = slides[newIdx];
    slides[newIdx] = tmp;
    activeSlide = newIdx;
    scheduleAutoSave();
    render();
  };


  window.diapoSetTransition = function (t) {
    slides[activeSlide].transition = t;
    scheduleAutoSave();
  };


  function renderNotes() {
    const textarea = document.getElementById('diapo-notes');
    if (textarea) textarea.value = slides[activeSlide].notes || '';
  }

  const notesEl = document.getElementById('diapo-notes');
  if (notesEl) {
    notesEl.addEventListener('input', () => {
      slides[activeSlide].notes = notesEl.value;
      scheduleAutoSave();
    });
  }


  document.addEventListener('keydown', (e) => {
    if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElement !== null) { e.preventDefault(); diapoDeleteElement(); }
    }
    if (e.key === 'ArrowRight' && !e.ctrlKey) {
      if (activeSlide < slides.length - 1) { activeSlide++; selectedElement = null; render(); }
    }
    if (e.key === 'ArrowLeft' && !e.ctrlKey) {
      if (activeSlide > 0) { activeSlide--; selectedElement = null; render(); }
    }
    if (e.key === 'Escape') {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      selectedElement = null;
      render();
    }
  });


  window.diapoPresent = function () {
    const overlay = document.createElement('div');
    overlay.className = 'diapo-presentation-mode';
    let idx = activeSlide;

    function showSlide() {
      const slide = slides[idx];
      const theme = THEMES[slide.theme] || THEMES.dark;
      overlay.innerHTML = '';
      const slideDiv = document.createElement('div');
      slideDiv.className = 'diapo-slide';
      slideDiv.style.background = theme.bg;

      slide.elements.forEach(el => {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = (el.x / 960 * 100) + '%';
        div.style.top = (el.y / 540 * 100) + '%';
        div.style.width = (el.w / 960 * 100) + '%';
        if (el.h) div.style.height = (el.h / 540 * 100) + '%';
        div.style.color = el.style.color || theme.text;
        if (el.style.fontSize) div.style.fontSize = el.style.fontSize;
        if (el.style.fontWeight) div.style.fontWeight = el.style.fontWeight;
        if (el.style.textAlign) div.style.textAlign = el.style.textAlign;

        if (el.type === 'title') {
          div.style.fontSize = div.style.fontSize || '3vw';
          div.style.fontWeight = '700';
          div.textContent = el.content;
        } else if (el.type === 'text') {
          div.style.fontSize = div.style.fontSize || '1.5vw';
          div.textContent = el.content;
        } else if (el.type === 'image') {
          const img = document.createElement('img');
          img.src = el.content;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          div.appendChild(img);
        } else if (el.type === 'shape') {
          div.style.background = el.style.background || theme.accent;
          div.style.borderRadius = el.style.borderRadius || '0';
        }
        slideDiv.appendChild(div);
      });

      overlay.appendChild(slideDiv);
    }

    showSlide();
    document.body.appendChild(overlay);

    if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => {});

    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (idx < slides.length - 1) { idx++; applyTransition(overlay, slides[idx].transition || 'none'); showSlide(); }
      } else if (e.key === 'ArrowLeft') {
        if (idx > 0) { idx--; showSlide(); }
      } else if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', onKey);
      }
    }

    overlay.addEventListener('click', () => {
      if (idx < slides.length - 1) { idx++; applyTransition(overlay, slides[idx].transition || 'none'); showSlide(); }
      else { overlay.remove(); document.removeEventListener('keydown', onKey); }
    });
    document.addEventListener('keydown', onKey);
  };

  function applyTransition(overlay, type) {
    const slide = overlay.querySelector('.diapo-slide');
    if (!slide || type === 'none') return;
    slide.style.animation = 'none';
    slide.offsetHeight;
    slide.style.animation = 'diapo-' + type + ' 0.5s ease';
  }


  function updateStatus() {
    const sEl = document.getElementById('status-slide');
    if (sEl) sEl.textContent = `Diapo ${activeSlide + 1} / ${slides.length}`;
  }


  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      VSSuite.autoSave('diapo_current', { title: docNameInput.value, slides });
    }, 800);
  }

  function loadAutoSave() {
    const data = VSSuite.autoLoad('diapo_current');
    if (data) {
      if (data.title) docNameInput.value = data.title;
      if (data.slides && data.slides.length) {
        slides = data.slides;

        slides.forEach(s => s.elements.forEach(el => {
          if (el.id >= elementIdCounter) elementIdCounter = el.id + 1;
        }));
      }
    }
  }


  window.diapoNew = function () {
    if (!confirm('Créer une nouvelle présentation ?')) return;
    slides = [createDefaultSlide()];
    activeSlide = 0;
    selectedElement = null;
    docNameInput.value = 'Sans titre';
    VSSuite.autoDelete('diapo_current');
    render();
  };

  window.diapoSave = function () {
    const fileObj = VSSuite.createFile('vpres', {
      title: docNameInput.value,
      content: { slides },
    });
    VSSuite.saveFile(fileObj);
  };

  window.diapoOpen = function () {
    VSSuite.openFile('.vpres').then(obj => {
      if (obj.type !== 'vpres') { alert('Ce fichier n\'est pas une présentation Diapo (.vpres)'); return; }
      docNameInput.value = obj.meta?.title || 'Sans titre';
      slides = obj.slides || [createDefaultSlide()];
      activeSlide = 0;
      selectedElement = null;
      scheduleAutoSave();
      render();
    }).catch(e => {
      if (e.message !== 'Aucun fichier sélectionné') alert(e.message);
    });
  };

  window.diapoExportPDF = function () {
    VSSuite.exportPDF(slideContainer, docNameInput.value);
  };

  window.diapoExportHTML = function () {
    VSSuite.exportHTML(slideContainer, docNameInput.value);
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
    'ctrl+s': () => diapoSave(),
    'ctrl+o': () => diapoOpen(),
    'ctrl+n': () => diapoNew(),
    'ctrl+p': () => diapoExportPDF(),
    'ctrl+shift+p': () => diapoPresent(),
  });


  function init() {
    VSSuite.initTheme();
    loadAutoSave();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
