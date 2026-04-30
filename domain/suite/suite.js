/* ============================================================
   VentiStudio Suite — Shared Utilities (suite.js)
   100% client-side — no server requests
   ============================================================ */

const VSSuite = (() => {
  'use strict';

  /* ---------- File format helpers ---------- */
  const FILE_TYPES = {
    vdoc:  { name: 'Plume Document',   mime: 'application/vnd.ventistudio.vdoc+json',  ext: '.vdoc'  },
    vcal:  { name: 'Cellule Spreadsheet', mime: 'application/vnd.ventistudio.vcal+json', ext: '.vcal'  },
    vpres: { name: 'Diapo Presentation',  mime: 'application/vnd.ventistudio.vpres+json', ext: '.vpres' },
    vnote: { name: 'Note Notebook',     mime: 'application/vnd.ventistudio.vnote+json', ext: '.vnote' },
    vdraw: { name: 'Toile Drawing',     mime: 'application/vnd.ventistudio.vdraw+json', ext: '.vdraw' },
  };

  /** Create a new file envelope */
  function createFile(type, data = {}) {
    return {
      type,
      version: 1,
      meta: {
        title: data.title || 'Sans titre',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: data.author || '',
      },
      ...data.content,
    };
  }

  /** Save JSON to disk as a .v--- file */
  function saveFile(fileObj) {
    const ft = FILE_TYPES[fileObj.type];
    if (!ft) return;
    fileObj.meta.modified = new Date().toISOString();
    const blob = new Blob([JSON.stringify(fileObj, null, 2)], { type: ft.mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (fileObj.meta.title || 'document') + ft.ext;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /** Open and parse a .v--- file from disk */
  function openFile(accept) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept || Object.values(FILE_TYPES).map(f => f.ext).join(',');
      input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return reject(new Error('Aucun fichier sélectionné'));
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const obj = JSON.parse(reader.result);
            resolve(obj);
          } catch (e) {
            reject(new Error('Format de fichier invalide'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
      input.click();
    });
  }

  /* ---------- Export helpers ---------- */

  /** Export to PDF via browser print */
  function exportPDF(element, title) {
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>${esc(title)}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #222; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        img { max-width: 100%; }
        @media print { body { padding: 0; } }
      </style></head><body>${element.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  /** Export as HTML file */
  function exportHTML(element, title) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(title)}</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:auto}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px}</style>
      </head><body>${element.innerHTML}</body></html>`;
    download(html, title + '.html', 'text/html');
  }

  /** Export as plain text */
  function exportText(element, title) {
    download(element.innerText, title + '.txt', 'text/plain');
  }

  /** Export as DOCX (basic — HTML wrapped in Word XML container) */
  function exportDOCX(element, title) {
    const header = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(title)}</title></head><body>`;
    const footer = '</body></html>';
    const content = header + element.innerHTML + footer;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title + '.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /** Export as CSV (for spreadsheets) */
  function exportCSV(data2D, title) {
    const csv = data2D.map(row =>
      row.map(cell => {
        const s = String(cell ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? '"' + s.replace(/"/g, '""') + '"'
          : s;
      }).join(',')
    ).join('\n');
    download(csv, title + '.csv', 'text/csv');
  }

  /* ---------- LocalStorage persistence ---------- */

  function autoSave(key, data) {
    try {
      localStorage.setItem('vs_suite_' + key, JSON.stringify(data));
    } catch { /* quota exceeded — silently fail */ }
  }

  function autoLoad(key) {
    try {
      const d = localStorage.getItem('vs_suite_' + key);
      return d ? JSON.parse(d) : null;
    } catch { return null; }
  }

  function autoDelete(key) {
    localStorage.removeItem('vs_suite_' + key);
  }

  /* ---------- Utility ---------- */

  function download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /** Keyboard shortcut manager */
  function registerShortcuts(map) {
    document.addEventListener('keydown', (e) => {
      const key = [];
      if (e.ctrlKey || e.metaKey) key.push('ctrl');
      if (e.shiftKey) key.push('shift');
      if (e.altKey) key.push('alt');
      key.push(e.key.toLowerCase());
      const combo = key.join('+');
      if (map[combo]) {
        e.preventDefault();
        map[combo](e);
      }
    });
  }

  /** Simple undo/redo stack */
  class UndoStack {
    constructor(maxSize = 100) {
      this._stack = [];
      this._index = -1;
      this._max = maxSize;
    }
    push(state) {
      this._stack = this._stack.slice(0, this._index + 1);
      this._stack.push(JSON.parse(JSON.stringify(state)));
      if (this._stack.length > this._max) this._stack.shift();
      this._index = this._stack.length - 1;
    }
    undo() {
      if (this._index > 0) return this._stack[--this._index];
      return null;
    }
    redo() {
      if (this._index < this._stack.length - 1) return this._stack[++this._index];
      return null;
    }
    current() { return this._stack[this._index] ?? null; }
  }

  /* ---------- Theme sync ---------- */
  function initTheme() {
    const t = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  /* ---------- Public API ---------- */
  return {
    FILE_TYPES,
    createFile,
    saveFile,
    openFile,
    exportPDF,
    exportHTML,
    exportText,
    exportDOCX,
    exportCSV,
    autoSave,
    autoLoad,
    autoDelete,
    registerShortcuts,
    UndoStack,
    initTheme,
    toggleTheme,
    esc,
  };
})();
