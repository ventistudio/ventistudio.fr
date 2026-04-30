/* Plume — Document Editor Logic */
(function () {
  'use strict';

  const editor = document.getElementById('plume-editor');
  const docNameInput = document.getElementById('doc-name');
  const undoStack = new VSSuite.UndoStack(80);
  let autoSaveTimer;

  /* ---- Init ---- */
  function init() {
    VSSuite.initTheme();
    editor.focus();
    pushUndo();
    updateStatus();
    setupToolbar();
    setupShortcuts();
    setupZoom();
    loadAutoSave();

    editor.addEventListener('input', () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        pushUndo();
        doAutoSave();
      }, 600);
      updateStatus();
    });
  }

  /* ---- Toolbar commands ---- */
  function exec(cmd, value) {
    document.execCommand(cmd, false, value || null);
    editor.focus();
  }

  function setupToolbar() {
    document.querySelectorAll('[data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        exec(btn.dataset.cmd, btn.dataset.value || null);
      });
    });

    // Heading select
    const headingSel = document.getElementById('tb-heading');
    if (headingSel) {
      headingSel.addEventListener('change', () => {
        if (headingSel.value === 'p') {
          exec('formatBlock', 'p');
        } else {
          exec('formatBlock', headingSel.value);
        }
        headingSel.value = '';
      });
    }

    // Font family
    const fontSel = document.getElementById('tb-font');
    if (fontSel) {
      fontSel.addEventListener('change', () => {
        exec('fontName', fontSel.value);
      });
    }

    // Font size
    const sizeSel = document.getElementById('tb-fontsize');
    if (sizeSel) {
      sizeSel.addEventListener('change', () => {
        exec('fontSize', sizeSel.value);
      });
    }

    // Text color
    const colorInput = document.getElementById('tb-color');
    if (colorInput) {
      colorInput.addEventListener('input', () => {
        exec('foreColor', colorInput.value);
      });
    }

    // Highlight color
    const hlInput = document.getElementById('tb-highlight');
    if (hlInput) {
      hlInput.addEventListener('input', () => {
        exec('hiliteColor', hlInput.value);
      });
    }

    // Insert image
    const imgBtn = document.getElementById('tb-image');
    if (imgBtn) {
      imgBtn.addEventListener('click', insertImage);
    }

    // Insert table
    const tableBtn = document.getElementById('tb-table');
    if (tableBtn) {
      tableBtn.addEventListener('click', insertTable);
    }

    // Insert link
    const linkBtn = document.getElementById('tb-link');
    if (linkBtn) {
      linkBtn.addEventListener('click', insertLink);
    }

    // Line spacing
    const lineSpacing = document.getElementById('tb-linespacing');
    if (lineSpacing) {
      lineSpacing.addEventListener('change', () => {
        editor.style.lineHeight = lineSpacing.value;
      });
    }
  }

  function insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        exec('insertImage', reader.result);
      };
      reader.readAsDataURL(file);
    });
    input.click();
  }

  function insertTable() {
    const rows = parseInt(prompt('Nombre de lignes :', '3'), 10) || 3;
    const cols = parseInt(prompt('Nombre de colonnes :', '3'), 10) || 3;
    const clampedRows = Math.min(Math.max(rows, 1), 50);
    const clampedCols = Math.min(Math.max(cols, 1), 26);
    let html = '<table><thead><tr>';
    for (let c = 0; c < clampedCols; c++) html += '<th>En-tête</th>';
    html += '</tr></thead><tbody>';
    for (let r = 0; r < clampedRows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < clampedCols; c++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    exec('insertHTML', html);
  }

  function insertLink() {
    const url = prompt('URL du lien :');
    if (url) {
      // Basic URL validation
      try {
        new URL(url);
        exec('createLink', url);
      } catch {
        alert('URL invalide');
      }
    }
  }

  /* ---- Find & Replace ---- */
  window.toggleFindBar = function () {
    document.getElementById('findbar').classList.toggle('open');
    const input = document.getElementById('find-input');
    if (input) input.focus();
  };

  window.doFind = function () {
    const term = document.getElementById('find-input').value;
    if (!term) return;
    window.find(term, false, false, true);
  };

  window.doReplace = function () {
    const term = document.getElementById('find-input').value;
    const rep = document.getElementById('replace-input').value;
    if (!term) return;

    const sel = window.getSelection();
    if (sel.toString() === term) {
      exec('insertText', rep);
    }
    window.find(term, false, false, true);
  };

  window.doReplaceAll = function () {
    const term = document.getElementById('find-input').value;
    const rep = document.getElementById('replace-input').value;
    if (!term) return;
    const content = editor.innerHTML;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    editor.innerHTML = content.replace(new RegExp(escaped, 'g'), VSSuite.esc(rep));
    pushUndo();
  };

  /* ---- Undo / Redo ---- */
  function pushUndo() {
    undoStack.push({ html: editor.innerHTML });
  }

  window.plumeUndo = function () {
    const s = undoStack.undo();
    if (s) editor.innerHTML = s.html;
  };

  window.plumeRedo = function () {
    const s = undoStack.redo();
    if (s) editor.innerHTML = s.html;
  };

  /* ---- Status bar ---- */
  function updateStatus() {
    const text = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const wEl = document.getElementById('status-words');
    const cEl = document.getElementById('status-chars');
    if (wEl) wEl.textContent = words + ' mot' + (words !== 1 ? 's' : '');
    if (cEl) cEl.textContent = chars + ' caractère' + (chars !== 1 ? 's' : '');    const pEl = document.getElementById('status-pages');
    if (pEl) {
      const pageBreaks = editor.querySelectorAll('.plume-page-break').length;
      pEl.textContent = (pageBreaks + 1) + ' page' + (pageBreaks > 0 ? 's' : '');
    }  }

  /* ---- Auto-save (localStorage) ---- */
  function doAutoSave() {
    VSSuite.autoSave('plume_current', {
      title: docNameInput.value,
      html: editor.innerHTML,
    });
  }

  function loadAutoSave() {
    const data = VSSuite.autoLoad('plume_current');
    if (data) {
      if (data.title) docNameInput.value = data.title;
      if (data.html) editor.innerHTML = data.html;
      pushUndo();
      updateStatus();
    }
  }

  /* ---- File operations ---- */
  window.plumeNew = function () {
    if (!confirm('Créer un nouveau document ? Les modifications non sauvegardées seront perdues.')) return;
    editor.innerHTML = '<p><br></p>';
    docNameInput.value = 'Sans titre';
    VSSuite.autoDelete('plume_current');
    pushUndo();
    updateStatus();
  };

  window.plumeSave = function () {
    const fileObj = VSSuite.createFile('vdoc', {
      title: docNameInput.value,
      content: {
        body: editor.innerHTML,
      },
    });
    VSSuite.saveFile(fileObj);
  };

  window.plumeOpen = function () {
    VSSuite.openFile('.vdoc').then(obj => {
      if (obj.type !== 'vdoc') { alert('Ce fichier n\'est pas un document Plume (.vdoc)'); return; }
      docNameInput.value = obj.meta?.title || 'Sans titre';
      editor.innerHTML = obj.body || '';
      pushUndo();
      updateStatus();
      doAutoSave();
    }).catch(e => {
      if (e.message !== 'Aucun fichier sélectionné') alert(e.message);
    });
  };

  window.plumeExportPDF = function () {
    VSSuite.exportPDF(editor, docNameInput.value);
  };

  window.plumeExportHTML = function () {
    VSSuite.exportHTML(editor, docNameInput.value);
  };

  window.plumeExportDOCX = function () {
    VSSuite.exportDOCX(editor, docNameInput.value);
  };

  window.plumeExportText = function () {
    VSSuite.exportText(editor, docNameInput.value);
  };

  /* ---- Clear format, Page break, Date, Zoom ---- */
  window.plumeClearFormat = function () {
    exec('removeFormat');
  };

  window.plumeInsertPageBreak = function () {
    exec('insertHTML', '<div class="plume-page-break" contenteditable="false"><span>\u2014 Saut de page \u2014</span></div><p><br></p>');
  };

  window.plumeInsertDate = function () {
    const d = new Date();
    const formatted = d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    exec('insertText', formatted);
  };

  let currentZoom = 100;

  window.plumeZoom = function (delta) {
    currentZoom = Math.max(50, Math.min(200, currentZoom + delta));
    applyZoom();
  };

  function applyZoom() {
    const pagesContainer = document.querySelector('.plume-pages');
    if (pagesContainer) {
      pagesContainer.style.transform = 'scale(' + (currentZoom / 100) + ')';
      pagesContainer.style.transformOrigin = 'top center';
    }
    const slider = document.getElementById('zoom-slider');
    const label = document.getElementById('zoom-level');
    if (slider) slider.value = currentZoom;
    if (label) label.textContent = currentZoom + '%';
  }

  function setupZoom() {
    const slider = document.getElementById('zoom-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        currentZoom = parseInt(slider.value, 10);
        applyZoom();
      });
    }
  }

  /* ---- Shortcuts ---- */
  function setupShortcuts() {
    VSSuite.registerShortcuts({
      'ctrl+s': (e) => { e.preventDefault(); plumeSave(); },
      'ctrl+o': (e) => { e.preventDefault(); plumeOpen(); },
      'ctrl+n': (e) => { e.preventDefault(); plumeNew(); },
      'ctrl+z': (e) => { e.preventDefault(); plumeUndo(); },
      'ctrl+shift+z': (e) => { e.preventDefault(); plumeRedo(); },
      'ctrl+y': (e) => { e.preventDefault(); plumeRedo(); },
      'ctrl+h': (e) => { e.preventDefault(); toggleFindBar(); },
      'ctrl+f': (e) => { e.preventDefault(); toggleFindBar(); },
      'ctrl+p': (e) => { e.preventDefault(); plumeExportPDF(); },
    });
  }

  /* ---- Dropdown menus ---- */
  window.toggleDropdown = function (id) {
    const dd = document.getElementById(id);
    if (!dd) return;
    document.querySelectorAll('.suite-dropdown.open').forEach(d => {
      if (d.id !== id) d.classList.remove('open');
    });
    dd.classList.toggle('open');
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.suite-dropdown') && !e.target.closest('[onclick*="toggleDropdown"]')) {
      document.querySelectorAll('.suite-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  /* ---- Start ---- */
  document.addEventListener('DOMContentLoaded', init);
})();
