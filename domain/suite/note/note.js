/* Note — Notebook Logic */
(function () {
  'use strict';

  const docNameInput = document.getElementById('doc-name');
  const pagesList = document.getElementById('note-pages');
  const titleInput = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');
  const metaEl = document.getElementById('note-meta');
  const searchInput = document.getElementById('note-search');

  let pages = [
    {
      id: Date.now(),
      title: 'Bienvenue',
      content: '<h2>Bienvenue dans Note</h2><p>Créez vos notes, listes de tâches et idées ici.</p><p>Fonctionnalités :</p><ul><li>Mise en forme riche</li><li>Plusieurs pages par carnet</li><li>Sauvegarde automatique locale</li><li>Export en .vnote, PDF, HTML</li></ul>',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  ];
  let activePage = 0;
  let autoSaveTimer;

  /* ---- Render ---- */
  function render() {
    renderPageList();
    renderEditor();
    updateStatus();
  }

  function renderPageList() {
    const filter = (searchInput?.value || '').toLowerCase();
    pagesList.innerHTML = '';

    pages.forEach((page, i) => {
      if (filter && !page.title.toLowerCase().includes(filter)) return;
      const item = document.createElement('div');
      item.className = 'note-page-item' + (i === activePage ? ' active' : '');

      const title = document.createElement('div');
      title.className = 'page-title';
      title.textContent = page.title || 'Sans titre';

      const preview = document.createElement('div');
      preview.className = 'page-preview';
      const tmp = document.createElement('div');
      tmp.innerHTML = page.content;
      preview.textContent = tmp.textContent.slice(0, 80);

      const date = document.createElement('div');
      date.className = 'page-date';
      date.textContent = new Date(page.modified).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      item.appendChild(title);
      item.appendChild(preview);
      item.appendChild(date);

      item.addEventListener('click', () => {
        saveCurrentPage();
        activePage = i;
        render();
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (pages.length > 1 && confirm('Supprimer cette page ?')) {
          pages.splice(i, 1);
          if (activePage >= pages.length) activePage = pages.length - 1;
          scheduleAutoSave();
          render();
        }
      });

      pagesList.appendChild(item);
    });
  }

  function renderEditor() {
    const page = pages[activePage];
    if (!page) return;
    titleInput.value = page.title;
    editorEl.innerHTML = page.content;
    metaEl.textContent = `Créé : ${new Date(page.created).toLocaleDateString('fr-FR')} · Modifié : ${new Date(page.modified).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  function saveCurrentPage() {
    const page = pages[activePage];
    if (!page) return;
    page.title = titleInput.value || 'Sans titre';
    page.content = editorEl.innerHTML;
    page.modified = new Date().toISOString();
  }

  /* ---- Events ---- */
  titleInput.addEventListener('input', () => {
    pages[activePage].title = titleInput.value;
    renderPageList();
    scheduleAutoSave();
  });

  editorEl.addEventListener('input', () => {
    pages[activePage].content = editorEl.innerHTML;
    pages[activePage].modified = new Date().toISOString();
    scheduleAutoSave();
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => renderPageList());
  }

  /* ---- Toolbar commands ---- */
  function exec(cmd, value) {
    document.execCommand(cmd, false, value || null);
    editorEl.focus();
  }

  document.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => exec(btn.dataset.cmd, btn.dataset.value || null));
  });

  window.noteInsertCheckbox = function () {
    exec('insertHTML', '<div><input type="checkbox"> <span contenteditable="true">Tâche</span></div>');
  };

  window.noteInsertTable = function () {
    const rows = parseInt(prompt('Nombre de lignes :', '3'), 10);
    const cols = parseInt(prompt('Nombre de colonnes :', '3'), 10);
    if (!rows || !cols || rows < 1 || cols < 1) return;
    let html = '<table class="note-table"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += r === 0 ? '<th>&nbsp;</th>' : '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    exec('insertHTML', html);
  };

  window.noteInsertImage = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => exec('insertHTML', '<img src="' + reader.result + '" style="max-width:100%;border-radius:6px;margin:8px 0" alt="image">');
      reader.readAsDataURL(file);
    });
    input.click();
  };

  window.noteInsertLink = function () {
    const url = prompt('URL du lien :');
    if (!url) return;
    exec('createLink', url);
  };

  // Text color
  const textColorInput = document.getElementById('tb-text-color');
  if (textColorInput) {
    textColorInput.addEventListener('input', () => exec('foreColor', textColorInput.value));
    textColorInput.closest('.tb-btn')?.addEventListener('click', () => textColorInput.click());
  }

  // Highlight
  const highlightInput = document.getElementById('tb-highlight');
  if (highlightInput) {
    highlightInput.addEventListener('input', () => exec('hiliteColor', highlightInput.value));
    highlightInput.closest('.tb-btn')?.addEventListener('click', () => highlightInput.click());
  }

  // Tags
  const tagsSel = document.getElementById('tb-tags');
  if (tagsSel) {
    tagsSel.addEventListener('change', () => {
      if (!tagsSel.value) return;
      const labels = { important: '⭐ Important', todo: '☑ À faire', question: '❓ Question', idea: '💡 Idée', remember: '📌 À retenir' };
      exec('insertHTML', '<span class="note-tag-badge note-tag-' + tagsSel.value + '">' + (labels[tagsSel.value] || tagsSel.value) + '</span>&nbsp;');
      tagsSel.value = '';
    });
  }

  const headingSel = document.getElementById('tb-heading');
  if (headingSel) {
    headingSel.addEventListener('change', () => {
      if (headingSel.value) {
        exec('formatBlock', headingSel.value);
        headingSel.value = '';
      }
    });
  }

  /* ---- Add page ---- */
  window.noteAddPage = function () {
    saveCurrentPage();
    pages.push({
      id: Date.now(),
      title: 'Nouvelle page',
      content: '<p><br></p>',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    });
    activePage = pages.length - 1;
    scheduleAutoSave();
    render();
    titleInput.focus();
    titleInput.select();
  };

  /* ---- Auto-save ---- */
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveCurrentPage();
      VSSuite.autoSave('note_current', { title: docNameInput.value, pages });
    }, 600);
  }

  function loadAutoSave() {
    const data = VSSuite.autoLoad('note_current');
    if (data) {
      if (data.title) docNameInput.value = data.title;
      if (data.pages && data.pages.length) pages = data.pages;
    }
  }

  /* ---- File operations ---- */
  window.noteNew = function () {
    if (!confirm('Créer un nouveau carnet ?')) return;
    pages = [{
      id: Date.now(),
      title: 'Nouvelle page',
      content: '<p><br></p>',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }];
    activePage = 0;
    docNameInput.value = 'Sans titre';
    VSSuite.autoDelete('note_current');
    render();
  };

  window.noteSave = function () {
    saveCurrentPage();
    const fileObj = VSSuite.createFile('vnote', {
      title: docNameInput.value,
      content: { pages: pages.map(p => ({ title: p.title, content: p.content, created: p.created, modified: p.modified })) },
    });
    VSSuite.saveFile(fileObj);
  };

  window.noteOpen = function () {
    VSSuite.openFile('.vnote').then(obj => {
      if (obj.type !== 'vnote') { alert('Ce fichier n\'est pas un carnet Note (.vnote)'); return; }
      docNameInput.value = obj.meta?.title || 'Sans titre';
      pages = (obj.pages || []).map(p => ({
        id: Date.now() + Math.random(),
        title: p.title || 'Sans titre',
        content: p.content || '',
        created: p.created || new Date().toISOString(),
        modified: p.modified || new Date().toISOString(),
      }));
      if (pages.length === 0) pages.push({ id: Date.now(), title: 'Page 1', content: '', created: new Date().toISOString(), modified: new Date().toISOString() });
      activePage = 0;
      scheduleAutoSave();
      render();
    }).catch(e => {
      if (e.message !== 'Aucun fichier sélectionné') alert(e.message);
    });
  };

  window.noteExportPDF = function () {
    VSSuite.exportPDF(editorEl, (docNameInput.value || 'note') + ' - ' + (pages[activePage]?.title || ''));
  };

  window.noteExportHTML = function () {
    VSSuite.exportHTML(editorEl, (docNameInput.value || 'note') + ' - ' + (pages[activePage]?.title || ''));
  };

  window.noteExportText = function () {
    VSSuite.exportText(editorEl, (docNameInput.value || 'note') + ' - ' + (pages[activePage]?.title || ''));
  };

  /* ---- Dropdown ---- */
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

  /* ---- Status ---- */
  function updateStatus() {
    const s = document.getElementById('status-pages');
    if (s) s.textContent = `Page ${activePage + 1} / ${pages.length}`;
    const w = document.getElementById('status-words');
    if (w) {
      const text = editorEl.innerText.trim();
      w.textContent = text ? text.split(/\s+/).length + ' mots' : '0 mot';
    }
  }

  /* ---- Shortcuts ---- */
  VSSuite.registerShortcuts({
    'ctrl+s': () => noteSave(),
    'ctrl+o': () => noteOpen(),
    'ctrl+n': () => noteNew(),
    'ctrl+p': () => noteExportPDF(),
  });

  /* ---- Init ---- */
  function init() {
    VSSuite.initTheme();
    loadAutoSave();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
