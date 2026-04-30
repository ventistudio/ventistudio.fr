(function () {
  var canvas = document.getElementById('wb-canvas');
  var wrapper = document.getElementById('wb-canvas-wrapper');
  if (!canvas || !wrapper) return;
  var ctx = canvas.getContext('2d');


  var toolBtns = document.querySelectorAll('.wb-tool-btn');
  var colorSwatches = document.querySelectorAll('.wb-color-swatch');
  var colorCustom = document.getElementById('wb-color-custom');
  var sizeSlider = document.getElementById('wb-size-slider');
  var sizeLabel = document.getElementById('wb-size-label');
  var undoBtn = document.getElementById('wb-undo');
  var redoBtn = document.getElementById('wb-redo');
  var clearBtn = document.getElementById('wb-clear');
  var exportBtn = document.getElementById('wb-export');
  var p2pDot = document.getElementById('wb-p2p-dot');
  var p2pLabel = document.getElementById('wb-p2p-label');
  var hostBtn = document.getElementById('wb-host');
  var joinBtn = document.getElementById('wb-join');
  var modalOverlay = document.getElementById('wb-modal');
  var participantsEl = document.getElementById('wb-participants');


  var tool = 'pen';
  var color = '#e0e0e0';
  var size = 3;
  var drawing = false;
  var lx = 0, ly = 0, sx = 0, sy = 0;


  var states = [];
  var redoStack = [];
  var MAX_HIST = 40;


  var peer = null;
  var conns = [];
  var myId = null;
  var isHost = false;
  var peers = {};
  var myName = 'Utilisateur';
  var COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];


  function resize() {
    var r = wrapper.getBoundingClientRect();
    var img = null;
    if (canvas.width > 0 && canvas.height > 0) {
      try { img = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) {}
    }
    canvas.width = r.width;
    canvas.height = r.height;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (img) ctx.putImageData(img, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  snap();


  function pos(e) {
    var r = canvas.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }


  function onDown(e) {
    e.preventDefault();
    drawing = true;
    var p = pos(e);
    lx = sx = p.x;
    ly = sy = p.y;
  }

  function onMove(e) {
    if (!drawing) return;
    e.preventDefault();
    var p = pos(e);

    if (tool === 'pen') {
      stroke(lx, ly, p.x, p.y, color, size);
      broadcast({ t: 'draw', x1: lx, y1: ly, x2: p.x, y2: p.y, c: color, s: size });
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size * 3;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      broadcast({ t: 'erase', x1: lx, y1: ly, x2: p.x, y2: p.y, s: size * 3 });
    }

    broadcastCursor(p.x, p.y);
    lx = p.x;
    ly = p.y;
  }

  function onUp(e) {
    if (!drawing) return;
    drawing = false;
    var p;
    if (e.changedTouches) {
      var r = canvas.getBoundingClientRect();
      p = { x: e.changedTouches[0].clientX - r.left, y: e.changedTouches[0].clientY - r.top };
    } else {
      p = pos(e);
    }

    if (tool === 'rect') {
      drawRect(sx, sy, p.x, p.y, color, size);
      broadcast({ t: 'rect', x1: sx, y1: sy, x2: p.x, y2: p.y, c: color, s: size });
    } else if (tool === 'circle') {
      drawEllipse(sx, sy, p.x, p.y, color, size);
      broadcast({ t: 'circle', x1: sx, y1: sy, x2: p.x, y2: p.y, c: color, s: size });
    } else if (tool === 'line') {
      drawLine(sx, sy, p.x, p.y, color, size);
      broadcast({ t: 'line', x1: sx, y1: sy, x2: p.x, y2: p.y, c: color, s: size });
    }
    snap();
  }

  function stroke(x1, y1, x2, y2, c, w) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawRect(x1, y1, x2, y2, c, w) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }

  function drawEllipse(x1, y1, x2, y2, c, w) {
    var rx = Math.abs(x2 - x1) / 2;
    var ry = Math.abs(y2 - y1) / 2;
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawLine(x1, y1, x2, y2, c, w) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('mouseleave', onUp);
  canvas.addEventListener('touchstart', onDown, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onUp);


  toolBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tool = btn.dataset.tool;
      toolBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
    });
  });


  colorSwatches.forEach(function (s) {
    s.addEventListener('click', function () {
      color = s.dataset.color;
      colorSwatches.forEach(function (el) { el.classList.remove('active'); });
      s.classList.add('active');
    });
  });
  if (colorCustom) {
    colorCustom.addEventListener('input', function () {
      color = colorCustom.value;
      colorSwatches.forEach(function (el) { el.classList.remove('active'); });
    });
  }


  sizeSlider.addEventListener('input', function () {
    size = parseInt(sizeSlider.value);
    sizeLabel.textContent = size + 'px';
  });


  function snap() {
    if (states.length >= MAX_HIST) states.shift();
    states.push(canvas.toDataURL());
    redoStack = [];
    updateBtns();
  }

  function undo() {
    if (states.length <= 1) return;
    redoStack.push(states.pop());
    restore(states[states.length - 1]);
    updateBtns();
  }

  function redo() {
    if (!redoStack.length) return;
    var s = redoStack.pop();
    states.push(s);
    restore(s);
    updateBtns();
  }

  function restore(url) {
    var img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }

  function updateBtns() {
    undoBtn.disabled = states.length <= 1;
    redoBtn.disabled = !redoStack.length;
  }

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);

  clearBtn.addEventListener('click', function () {
    if (!confirm('Effacer tout le tableau ?')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snap();
    broadcast({ t: 'clear' });
  });

  exportBtn.addEventListener('click', function () {
    var a = document.createElement('a');
    a.download = 'tableau-blanc-ventistudio.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
  });





  function initPeer(cb) {
    if (typeof Peer === 'undefined') {
      alert('PeerJS non chargé. Vérifiez votre connexion.');
      return;
    }
    peer = new Peer();
    peer.on('open', function (id) { myId = id; cb(id); });
    peer.on('connection', function (c) { wire(c); });
    peer.on('error', function (err) {
      console.error('PeerJS:', err);
      p2pLabel.textContent = 'Erreur P2P';
    });
  }

  function wire(conn) {
    conns.push(conn);
    conn.on('open', function () {
      conn.send({ t: 'state', d: canvas.toDataURL() });
      conn.send({ t: 'id', name: myName });
      syncStatus();
    });
    conn.on('data', function (d) { handleMsg(conn, d); });
    conn.on('close', function () {
      conns = conns.filter(function (c) { return c !== conn; });
      delete peers[conn.peer];
      syncStatus();
      renderPeers();
      var el = document.getElementById('cur-' + conn.peer);
      if (el) el.remove();
    });
  }

  function handleMsg(conn, d) {
    if (!d || !d.t) return;
    switch (d.t) {
      case 'draw':
        stroke(d.x1, d.y1, d.x2, d.y2, d.c, d.s);
        break;
      case 'erase':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = d.s;
        ctx.beginPath(); ctx.moveTo(d.x1, d.y1); ctx.lineTo(d.x2, d.y2); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        break;
      case 'rect':
        drawRect(d.x1, d.y1, d.x2, d.y2, d.c, d.s);
        break;
      case 'circle':
        drawEllipse(d.x1, d.y1, d.x2, d.y2, d.c, d.s);
        break;
      case 'line':
        drawLine(d.x1, d.y1, d.x2, d.y2, d.c, d.s);
        break;
      case 'clear':
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        snap();
        break;
      case 'state':
        var img = new Image();
        img.onload = function () {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          snap();
        };
        img.src = d.d;
        break;
      case 'id':
        peers[conn.peer] = { name: d.name, color: COLORS[conns.indexOf(conn) % COLORS.length] };
        renderPeers();
        break;
      case 'cur':
        showCursor(conn.peer, d.x, d.y);
        break;
    }
  }

  function broadcast(msg) {
    conns.forEach(function (c) { if (c.open) c.send(msg); });
  }

  function broadcastCursor(x, y) {
    broadcast({ t: 'cur', x: x, y: y });
  }

  function showCursor(pid, x, y) {
    var el = document.getElementById('cur-' + pid);
    if (!el) {
      el = document.createElement('div');
      el.className = 'wb-remote-cursor';
      el.id = 'cur-' + pid;
      var p = peers[pid] || { name: '?', color: '#6b7280' };
      el.innerHTML = '<div class="wb-remote-cursor-dot" style="background:' + p.color + '"></div>' +
        '<span class="wb-remote-cursor-label" style="background:' + p.color + '">' + (p.name || '?') + '</span>';
      wrapper.appendChild(el);
    }
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }

  function syncStatus() {
    var n = conns.filter(function (c) { return c.open; }).length;
    if (n > 0) {
      p2pDot.classList.add('connected');
      p2pLabel.textContent = n + ' connecté' + (n > 1 ? 's' : '');
    } else if (myId) {
      p2pDot.classList.remove('connected');
      p2pLabel.textContent = 'En attente…';
    } else {
      p2pDot.classList.remove('connected');
      p2pLabel.textContent = 'Solo';
    }
  }

  function renderPeers() {
    if (!participantsEl) return;
    participantsEl.innerHTML = '';
    Object.keys(peers).forEach(function (pid) {
      var p = peers[pid];
      var dot = document.createElement('span');
      dot.className = 'wb-participant-dot';
      dot.style.background = p.color;
      dot.textContent = (p.name || '?').charAt(0).toUpperCase();
      dot.title = p.name;
      participantsEl.appendChild(dot);
    });
  }


  function showModal(html) {
    modalOverlay.innerHTML = '<div class="wb-modal">' + html + '</div>';
    modalOverlay.hidden = false;
    modalOverlay.addEventListener('click', function handler(e) {
      if (e.target === modalOverlay) { closeModal(); modalOverlay.removeEventListener('click', handler); }
    });
  }

  function closeModal() {
    modalOverlay.hidden = true;
    modalOverlay.innerHTML = '';
  }

  hostBtn.addEventListener('click', function () {
    showModal(
      '<h3>Créer une session</h3>' +
      '<label>Votre pseudo</label>' +
      '<input class="wb-modal-input" id="wb-h-name" value="' + myName + '">' +
      '<div class="wb-modal-actions">' +
        '<button class="wb-modal-btn" id="wb-h-cancel">Annuler</button>' +
        '<button class="wb-modal-btn primary" id="wb-h-ok">Créer</button>' +
      '</div>'
    );
    document.getElementById('wb-h-cancel').addEventListener('click', closeModal);
    document.getElementById('wb-h-ok').addEventListener('click', function () {
      myName = document.getElementById('wb-h-name').value.trim() || 'Hôte';
      isHost = true;
      initPeer(function (id) {
        closeModal();
        showModal(
          '<h3>Session créée</h3>' +
          '<label>Partagez cet identifiant</label>' +
          '<div class="wb-session-id" id="wb-sid">' + id + '</div>' +
          '<div class="wb-modal-actions">' +
            '<button class="wb-modal-btn primary" id="wb-copy">Copier</button>' +
            '<button class="wb-modal-btn" id="wb-h-close">Fermer</button>' +
          '</div>'
        );
        document.getElementById('wb-copy').addEventListener('click', function () {
          navigator.clipboard.writeText(id).then(function () {
            document.getElementById('wb-copy').textContent = 'Copié !';
          });
        });
        document.getElementById('wb-h-close').addEventListener('click', closeModal);
        syncStatus();
      });
    });
  });

  joinBtn.addEventListener('click', function () {
    showModal(
      '<h3>Rejoindre une session</h3>' +
      '<label>Votre pseudo</label>' +
      '<input class="wb-modal-input" id="wb-j-name" value="' + myName + '">' +
      '<label>Identifiant de session</label>' +
      '<input class="wb-modal-input" id="wb-j-id" placeholder="Collez l\'ID ici">' +
      '<div class="wb-modal-actions">' +
        '<button class="wb-modal-btn" id="wb-j-cancel">Annuler</button>' +
        '<button class="wb-modal-btn primary" id="wb-j-ok">Rejoindre</button>' +
      '</div>'
    );
    document.getElementById('wb-j-cancel').addEventListener('click', closeModal);
    document.getElementById('wb-j-ok').addEventListener('click', function () {
      myName = document.getElementById('wb-j-name').value.trim() || 'Invité';
      var tid = document.getElementById('wb-j-id').value.trim();
      if (!tid) return;
      initPeer(function () {
        var c = peer.connect(tid);
        c.on('open', function () {
          wire(c);
          c.send({ t: 'id', name: myName });
          closeModal();
          syncStatus();
        });
        c.on('error', function () {
          alert('Impossible de se connecter à cette session.');
        });
      });
    });
  });

  syncStatus();
  updateBtns();
})();
