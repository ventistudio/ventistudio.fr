(function () {
  'use strict';

  const ROWS = 100;
  const COLS = 26;
  const docNameInput = document.getElementById('doc-name');

  let sheets = [{ name: 'Feuille 1', data: createEmptyGrid(), styles: {} }];
  let activeSheet = 0;
  let selectedCell = { r: 0, c: 0 };
  let selectionRange = null;
  let isSelecting = false;
  let autoSaveTimer;

  function createEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
  }

  function colName(c) {
    return String.fromCharCode(65 + c);
  }

  function cellRef(r, c) {
    return colName(c) + (r + 1);
  }

  function parseCellRef(ref) {
    const m = ref.match(/^([A-Z])(\d+)$/);
    if (!m) return null;
    return { r: parseInt(m[2], 10) - 1, c: m[1].charCodeAt(0) - 65 };
  }


  function render() {
    const container = document.getElementById('cellule-container');
    container.innerHTML = '';

    const sheet = sheets[activeSheet];


    const colRow = document.createElement('div');
    colRow.className = 'cellule-col-header';
    const corner = document.createElement('div');
    corner.className = 'col-h row-indicator';
    colRow.appendChild(corner);
    for (let c = 0; c < COLS; c++) {
      const ch = document.createElement('div');
      ch.className = 'col-h' + (c === selectedCell.c ? ' selected' : '');
      ch.textContent = colName(c);
      colRow.appendChild(ch);
    }
    container.appendChild(colRow);


    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'cellule-row';

      const rh = document.createElement('div');
      rh.className = 'row-h' + (r === selectedCell.r ? ' selected' : '');
      rh.textContent = r + 1;
      row.appendChild(rh);

      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cellule-cell';
        cell.tabIndex = -1;
        cell.dataset.r = r;
        cell.dataset.c = c;

        const raw = sheet.data[r][c];
        const val = evaluate(raw, sheet.data);
        cell.textContent = val;
        cell.title = raw !== val ? raw : '';

        if (typeof val === 'number' || (raw && raw.startsWith('=') && !isNaN(val))) {
          cell.classList.add('type-number');
        }


        const cs = (sheet.styles || {})[r + ',' + c];
        if (cs) {
          if (cs.bold) cell.style.fontWeight = '700';
          if (cs.italic) cell.style.fontStyle = 'italic';
          if (cs.underline) cell.style.textDecoration = 'underline';
          if (cs.color) cell.style.color = cs.color;
          if (cs.bg) cell.style.background = cs.bg;
          if (cs.align) cell.style.justifyContent = cs.align === 'center' ? 'center' : (cs.align === 'right' ? 'flex-end' : 'flex-start');
          if (cs.wrap) { cell.style.whiteSpace = 'normal'; cell.style.height = 'auto'; cell.style.minHeight = '28px'; }
          if (cs.format && val && !isNaN(val)) {
            const n = parseFloat(val);
            if (cs.format === 'number') cell.textContent = n.toFixed(2);
            else if (cs.format === 'currency') cell.textContent = n.toFixed(2) + ' \u20ac';
            else if (cs.format === 'percent') cell.textContent = (n * 100).toFixed(1) + ' %';
          }
        }

        if (r === selectedCell.r && c === selectedCell.c) {
          cell.classList.add('editing');
        }

        if (isInSelection(r, c)) {
          cell.classList.add('selected');
        }

        cell.addEventListener('mousedown', (e) => onCellMouseDown(e, r, c));
        cell.addEventListener('mouseover', (e) => onCellMouseOver(e, r, c));
        cell.addEventListener('dblclick', () => startEditing(r, c));

        row.appendChild(cell);
      }
      container.appendChild(row);
    }

    renderTabs();
    updateFormulaBar();
    updateStatus();
  }

  function isInSelection(r, c) {
    if (!selectionRange) return r === selectedCell.r && c === selectedCell.c;
    const minR = Math.min(selectionRange.r1, selectionRange.r2);
    const maxR = Math.max(selectionRange.r1, selectionRange.r2);
    const minC = Math.min(selectionRange.c1, selectionRange.c2);
    const maxC = Math.max(selectionRange.c1, selectionRange.c2);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  }


  function onCellMouseDown(e, r, c) {
    selectedCell = { r, c };
    if (e.shiftKey) {
      selectionRange = { r1: selectedCell.r, c1: selectedCell.c, r2: r, c2: c };
    } else {
      selectionRange = null;
      isSelecting = true;
    }
    render();
  }

  function onCellMouseOver(e, r, c) {
    if (!isSelecting) return;
    selectionRange = { r1: selectedCell.r, c1: selectedCell.c, r2: r, c2: c };
    render();
  }

  document.addEventListener('mouseup', () => { isSelecting = false; });


  function startEditing(r, c) {
    const cellEl = document.querySelector(`.cellule-cell[data-r="${r}"][data-c="${c}"]`);
    if (!cellEl) return;

    const raw = sheets[activeSheet].data[r][c];
    cellEl.textContent = raw;
    cellEl.contentEditable = true;
    cellEl.focus();


    const range = document.createRange();
    range.selectNodeContents(cellEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const finalize = () => {
      cellEl.contentEditable = false;
      const newVal = cellEl.textContent.trim();
      sheets[activeSheet].data[r][c] = newVal;
      cellEl.removeEventListener('blur', finalize);
      scheduleAutoSave();
      render();
    };

    cellEl.addEventListener('blur', finalize);
    cellEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        cellEl.blur();
        navigate(1, 0);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        cellEl.blur();
        navigate(0, e.shiftKey ? -1 : 1);
      } else if (e.key === 'Escape') {
        cellEl.textContent = raw;
        cellEl.blur();
      }
    });
  }

  function navigate(dr, dc) {
    selectedCell.r = Math.max(0, Math.min(ROWS - 1, selectedCell.r + dr));
    selectedCell.c = Math.max(0, Math.min(COLS - 1, selectedCell.c + dc));
    selectionRange = null;
    render();
  }


  function updateFormulaBar() {
    const refEl = document.getElementById('cell-ref');
    const fxInput = document.getElementById('fx-input');
    if (refEl) refEl.textContent = cellRef(selectedCell.r, selectedCell.c);
    if (fxInput) fxInput.value = sheets[activeSheet].data[selectedCell.r][selectedCell.c];
  }


  const fxInput = document.getElementById('fx-input');
  if (fxInput) {
    fxInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sheets[activeSheet].data[selectedCell.r][selectedCell.c] = fxInput.value;
        scheduleAutoSave();
        render();
      }
    });
  }


  document.addEventListener('keydown', (e) => {
    if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    const { r, c } = selectedCell;
    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); navigate(-1, 0); break;
      case 'ArrowDown': e.preventDefault(); navigate(1, 0); break;
      case 'ArrowLeft': e.preventDefault(); navigate(0, -1); break;
      case 'ArrowRight': e.preventDefault(); navigate(0, 1); break;
      case 'Enter':
        e.preventDefault();
        startEditing(r, c);
        break;
      case 'Tab':
        e.preventDefault();
        navigate(0, e.shiftKey ? -1 : 1);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        sheets[activeSheet].data[r][c] = '';
        scheduleAutoSave();
        render();
        break;
      default:

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          sheets[activeSheet].data[r][c] = '';
          render();
          startEditing(r, c);
        }
    }
  });


  function evaluate(raw, data, depth) {
    depth = depth || 0;
    if (depth > 10) return '#ERREUR';
    if (!raw || typeof raw !== 'string') return raw || '';
    if (!raw.startsWith('=')) return raw;

    const expr = raw.slice(1).trim();
    try {

      const resolved = expr.replace(/\b([A-Z])(\d+)\b/g, (_, col, row) => {
        const r = parseInt(row, 10) - 1;
        const c = col.charCodeAt(0) - 65;
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return '0';
        const v = data[r][c];
        if (v && v.startsWith('=')) return evaluate(v, data, depth + 1);
        return isNaN(v) ? '0' : v || '0';
      });


      const withFunctions = resolved
        .replace(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, c1, r1, c2, r2) => rangeOp(data, c1, r1, c2, r2, 'sum'))
        .replace(/AVERAGE\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, c1, r1, c2, r2) => rangeOp(data, c1, r1, c2, r2, 'avg'))
        .replace(/MIN\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, c1, r1, c2, r2) => rangeOp(data, c1, r1, c2, r2, 'min'))
        .replace(/MAX\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, c1, r1, c2, r2) => rangeOp(data, c1, r1, c2, r2, 'max'))
        .replace(/COUNT\(([A-Z])(\d+):([A-Z])(\d+)\)/gi, (_, c1, r1, c2, r2) => rangeOp(data, c1, r1, c2, r2, 'count'));


      let processed = withFunctions;
      processed = processed.replace(/PI\(\)/gi, String(Math.PI));
      processed = processed.replace(/ABS\(([^)]+)\)/gi, (_, v) => { const n = parseFloat(v); return isNaN(n) ? v : Math.abs(n); });
      processed = processed.replace(/SQRT\(([^)]+)\)/gi, (_, v) => { const n = parseFloat(v); return isNaN(n) ? '#ERREUR' : Math.sqrt(n); });
      processed = processed.replace(/POWER\(([^,]+),\s*([^)]+)\)/gi, (_, b, e) => Math.pow(parseFloat(b) || 0, parseFloat(e) || 0));
      processed = processed.replace(/ROUND\(([^,]+),\s*(\d+)\)/gi, (_, v, d) => { const n = parseFloat(v); return isNaN(n) ? '#ERREUR' : parseFloat(n.toFixed(parseInt(d, 10))); });
      processed = processed.replace(/TODAY\(\)/gi, () => { const d = new Date(); return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear(); });
      processed = processed.replace(/NOW\(\)/gi, () => { const d = new Date(); return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); });
      processed = processed.replace(/LEN\(([^)]+)\)/gi, (_, v) => String(v).replace(/^"|"$/g, '').length);
      processed = processed.replace(/UPPER\(([^)]+)\)/gi, (_, v) => String(v).replace(/^"|"$/g, '').toUpperCase());
      processed = processed.replace(/LOWER\(([^)]+)\)/gi, (_, v) => String(v).replace(/^"|"$/g, '').toLowerCase());
      processed = processed.replace(/TRIM\(([^)]+)\)/gi, (_, v) => String(v).replace(/^"|"$/g, '').trim());
      processed = processed.replace(/CONCAT\(([^)]+)\)/gi, (_, args) => args.split(',').map(a => a.trim().replace(/^"|"$/g, '')).join(''));
      processed = processed.replace(/IF\(([^,]+),\s*([^,]+),\s*([^)]+)\)/gi, (_, cond, tVal, fVal) => {
        try {
          const condResult = Function('"use strict"; return (' + cond + ')')();
          return condResult ? tVal.trim() : fVal.trim();
        } catch { return '#ERREUR'; }
      });


      if (/^[\d\s+\-*/%().]+$/.test(processed)) {
        const result = Function('"use strict"; return (' + processed + ')')();
        return isFinite(result) ? (Math.round(result * 1e10) / 1e10) : '#ERREUR';
      }

      if (processed && processed !== expr) return processed;
      return '#ERREUR';
    } catch {
      return '#ERREUR';
    }
  }

  function rangeOp(data, c1, r1, c2, r2, op) {
    const colStart = c1.charCodeAt(0) - 65;
    const colEnd = c2.charCodeAt(0) - 65;
    const rowStart = parseInt(r1, 10) - 1;
    const rowEnd = parseInt(r2, 10) - 1;
    const vals = [];
    for (let r = Math.min(rowStart, rowEnd); r <= Math.max(rowStart, rowEnd); r++) {
      for (let c = Math.min(colStart, colEnd); c <= Math.max(colStart, colEnd); c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          const v = data[r][c];
          const ev = v && v.startsWith('=') ? evaluate(v, data, (depth || 0) + 1) : v;
          const n = parseFloat(ev);
          if (!isNaN(n)) vals.push(n);
        }
      }
    }
    if (vals.length === 0) return '0';
    switch (op) {
      case 'sum': return vals.reduce((a, b) => a + b, 0);
      case 'avg': return vals.reduce((a, b) => a + b, 0) / vals.length;
      case 'min': return Math.min(...vals);
      case 'max': return Math.max(...vals);
      case 'count': return vals.length;
      default: return '0';
    }
  }


  function renderTabs() {
    const tabsEl = document.getElementById('cellule-tabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = '';
    sheets.forEach((s, i) => {
      const tab = document.createElement('button');
      tab.className = 'sheet-tab' + (i === activeSheet ? ' active' : '');
      tab.textContent = s.name;
      tab.addEventListener('click', () => { activeSheet = i; render(); });
      tab.addEventListener('dblclick', () => {
        const name = prompt('Nom de la feuille :', s.name);
        if (name) { s.name = name; render(); }
      });
      tabsEl.appendChild(tab);
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'add-sheet';
    addBtn.textContent = '+';
    addBtn.title = 'Ajouter une feuille';
    addBtn.addEventListener('click', () => {
      sheets.push({ name: 'Feuille ' + (sheets.length + 1), data: createEmptyGrid(), styles: {} });
      activeSheet = sheets.length - 1;
      render();
    });
    tabsEl.appendChild(addBtn);
  }


  function updateStatus() {
    const selInfo = document.getElementById('status-sel');
    const sumInfo = document.getElementById('status-sum');
    if (selInfo) selInfo.textContent = cellRef(selectedCell.r, selectedCell.c);


    if (selectionRange && sumInfo) {
      const data = sheets[activeSheet].data;
      let sum = 0, count = 0;
      const minR = Math.min(selectionRange.r1, selectionRange.r2);
      const maxR = Math.max(selectionRange.r1, selectionRange.r2);
      const minC = Math.min(selectionRange.c1, selectionRange.c2);
      const maxC = Math.max(selectionRange.c1, selectionRange.c2);
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const v = parseFloat(evaluate(data[r][c], data));
          if (!isNaN(v)) { sum += v; count++; }
        }
      }
      sumInfo.textContent = count > 0 ? `Somme: ${sum} | Moy: ${(sum/count).toFixed(2)} | Nb: ${count}` : '';
    } else if (sumInfo) {
      sumInfo.textContent = '';
    }
  }


  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      VSSuite.autoSave('cellule_current', { title: docNameInput.value, sheets });
    }, 800);
  }

  function loadAutoSave() {
    const data = VSSuite.autoLoad('cellule_current');
    if (data) {
      if (data.title) docNameInput.value = data.title;
      if (data.sheets) sheets = data.sheets;
    }
  }


  window.celluleNew = function () {
    if (!confirm('Créer un nouveau tableur ?')) return;
    sheets = [{ name: 'Feuille 1', data: createEmptyGrid(), styles: {} }];
    activeSheet = 0;
    docNameInput.value = 'Sans titre';
    VSSuite.autoDelete('cellule_current');
    render();
  };

  window.celluleSave = function () {
    const fileObj = VSSuite.createFile('vcal', {
      title: docNameInput.value,
      content: { sheets: sheets.map(s => ({ name: s.name, data: s.data })) },
    });
    VSSuite.saveFile(fileObj);
  };

  window.celluleOpen = function () {
    VSSuite.openFile('.vcal').then(obj => {
      if (obj.type !== 'vcal') { alert('Ce fichier n\'est pas un tableur Cellule (.vcal)'); return; }
      docNameInput.value = obj.meta?.title || 'Sans titre';
      sheets = obj.sheets || [{ name: 'Feuille 1', data: createEmptyGrid() }];
      activeSheet = 0;
      scheduleAutoSave();
      render();
    }).catch(e => {
      if (e.message !== 'Aucun fichier sélectionné') alert(e.message);
    });
  };

  window.celluleExportPDF = function () {
    VSSuite.exportPDF(document.getElementById('cellule-container'), docNameInput.value);
  };

  window.celluleExportCSV = function () {
    const data = sheets[activeSheet].data;

    let maxR = 0, maxC = 0;
    data.forEach((row, r) => row.forEach((cell, c) => {
      if (cell) { maxR = Math.max(maxR, r); maxC = Math.max(maxC, c); }
    }));
    const exportData = data.slice(0, maxR + 1).map(row =>
      row.slice(0, maxC + 1).map(cell => {
        const ev = evaluate(cell, data);
        return ev;
      })
    );
    VSSuite.exportCSV(exportData, docNameInput.value);
  };

  window.celluleExportHTML = function () {
    VSSuite.exportHTML(document.getElementById('cellule-container'), docNameInput.value);
  };


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


  VSSuite.registerShortcuts({
    'ctrl+s': () => celluleSave(),
    'ctrl+o': () => celluleOpen(),
    'ctrl+n': () => celluleNew(),
    'ctrl+p': () => celluleExportPDF(),
    'ctrl+b': (e) => { e.preventDefault(); celluleToggleStyle('bold'); },
    'ctrl+i': (e) => { e.preventDefault(); celluleToggleStyle('italic'); },
    'ctrl+u': (e) => { e.preventDefault(); celluleToggleStyle('underline'); },
  });


  function getSelectedCells() {
    const cells = [];
    if (selectionRange) {
      const minR = Math.min(selectionRange.r1, selectionRange.r2);
      const maxR = Math.max(selectionRange.r1, selectionRange.r2);
      const minC = Math.min(selectionRange.c1, selectionRange.c2);
      const maxC = Math.max(selectionRange.c1, selectionRange.c2);
      for (let r = minR; r <= maxR; r++) for (let c = minC; c <= maxC; c++) cells.push([r, c]);
    } else {
      cells.push([selectedCell.r, selectedCell.c]);
    }
    return cells;
  }

  function getCellStyle(r, c) {
    const sheet = sheets[activeSheet];
    if (!sheet.styles) sheet.styles = {};
    const key = r + ',' + c;
    if (!sheet.styles[key]) sheet.styles[key] = {};
    return sheet.styles[key];
  }

  window.celluleToggleStyle = function (prop) {
    const cells = getSelectedCells();
    const firstStyle = getCellStyle(cells[0][0], cells[0][1]);
    const newVal = !firstStyle[prop];
    cells.forEach(([r, c]) => { getCellStyle(r, c)[prop] = newVal; });
    scheduleAutoSave();
    render();
  };

  window.celluleSetAlign = function (align) {
    getSelectedCells().forEach(([r, c]) => { getCellStyle(r, c).align = align; });
    scheduleAutoSave();
    render();
  };

  window.celluleSetFormat = function (format) {
    getSelectedCells().forEach(([r, c]) => { getCellStyle(r, c).format = format === 'general' ? null : format; });
    scheduleAutoSave();
    render();
  };

  window.celluleToggleWrap = function () {
    const cells = getSelectedCells();
    const firstStyle = getCellStyle(cells[0][0], cells[0][1]);
    const newVal = !firstStyle.wrap;
    cells.forEach(([r, c]) => { getCellStyle(r, c).wrap = newVal; });
    scheduleAutoSave();
    render();
  };

  window.celluleSort = function (ascending) {
    const col = selectedCell.c;
    const data = sheets[activeSheet].data;
    const styles = sheets[activeSheet].styles || {};

    let maxR = 0;
    data.forEach((row, r) => { if (row[col]) maxR = r; });

    const rowIndices = Array.from({ length: maxR + 1 }, (_, i) => i);
    rowIndices.sort((a, b) => {
      const va = evaluate(data[a][col], data) || '';
      const vb = evaluate(data[b][col], data) || '';
      const na = parseFloat(va), nb = parseFloat(vb);
      let cmp;
      if (!isNaN(na) && !isNaN(nb)) cmp = na - nb;
      else cmp = String(va).localeCompare(String(vb), 'fr');
      return ascending ? cmp : -cmp;
    });
    const newData = createEmptyGrid();
    const newStyles = {};
    rowIndices.forEach((origR, newR) => {
      newData[newR] = data[origR].slice();
      for (let c = 0; c < COLS; c++) {
        const oldKey = origR + ',' + c;
        if (styles[oldKey]) newStyles[newR + ',' + c] = styles[oldKey];
      }
    });
    sheets[activeSheet].data = newData;
    sheets[activeSheet].styles = newStyles;
    scheduleAutoSave();
    render();
  };


  const fmtColor = document.getElementById('fmt-color');
  const fmtBg = document.getElementById('fmt-bg');
  if (fmtColor) fmtColor.addEventListener('input', () => {
    getSelectedCells().forEach(([r, c]) => { getCellStyle(r, c).color = fmtColor.value; });
    scheduleAutoSave(); render();
  });
  if (fmtBg) fmtBg.addEventListener('input', () => {
    getSelectedCells().forEach(([r, c]) => { getCellStyle(r, c).bg = fmtBg.value; });
    scheduleAutoSave(); render();
  });


  function init() {
    VSSuite.initTheme();
    loadAutoSave();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
