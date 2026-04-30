(function () {
  'use strict';

  const editor = document.getElementById('plume-editor');
  const docNameInput = document.getElementById('doc-name');
  const undoStack = new VSSuite.UndoStack(80);
  let autoSaveTimer;


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


    const fontSel = document.getElementById('tb-font');
    if (fontSel) {
      fontSel.addEventListener('change', () => {
        exec('fontName', fontSel.value);
      });
    }


    const sizeSel = document.getElementById('tb-fontsize');
    if (sizeSel) {
      sizeSel.addEventListener('change', () => {
        exec('fontSize', sizeSel.value);
      });
    }


    const colorInput = document.getElementById('tb-color');
    if (colorInput) {
      colorInput.addEventListener('input', () => {
        exec('foreColor', colorInput.value);
      });
    }


    const hlInput = document.getElementById('tb-highlight');
    if (hlInput) {
      hlInput.addEventListener('input', () => {
        exec('hiliteColor', hlInput.value);
      });
    }


    const imgBtn = document.getElementById('tb-image');
    if (imgBtn) {
      imgBtn.addEventListener('click', insertImage);
    }


    const tableBtn = document.getElementById('tb-table');
    if (tableBtn) {
      tableBtn.addEventListener('click', insertTable);
    }


    const linkBtn = document.getElementById('tb-link');
    if (linkBtn) {
      linkBtn.addEventListener('click', insertLink);
    }


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
    input.accept = 'image
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


  document.addEventListener('DOMContentLoaded', init);
})();
