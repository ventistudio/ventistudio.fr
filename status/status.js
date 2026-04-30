(function() {
  if (typeof statusData === 'undefined') return;

  var servicesContainer = document.getElementById('status-services');
  var globalDot = document.getElementById('global-dot');
  var globalText = document.getElementById('global-text');
  var globalTime = document.getElementById('global-time');
  var incidentList = document.getElementById('incident-list');
  var refreshInfo = document.getElementById('refresh-info');
  var refreshBtn = document.getElementById('refresh-btn');

  if (!servicesContainer) return;

  var serviceStates = {};
  var categoryLabels = {
    core: '🔧 Infrastructure',
    community: '💬 Communauté',
    tools: '🛠️ Outils',
    media: '📺 Médias & Contenu'
  };

  var statusLabels = {
    online: 'En ligne',
    degraded: 'Dégradé',
    offline: 'Hors ligne',
    checking: 'Vérification…',
    external: 'Externe'
  };

  function groupByCategory(data) {
    var groups = {};
    data.forEach(function(s) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }

  function renderServices() {
    var groups = groupByCategory(statusData);
    var order = ['core', 'tools', 'media', 'community'];
    servicesContainer.innerHTML = '';

    order.forEach(function(cat) {
      if (!groups[cat]) return;
      var section = document.createElement('div');
      section.className = 'status-category';
      section.innerHTML = '<h2>' + (categoryLabels[cat] || cat) + '</h2>';
      var list = document.createElement('div');
      list.className = 'status-services';

      groups[cat].forEach(function(s) {
        var state = serviceStates[s.id] || { status: s.type === 'external' ? 'external' : 'checking', latency: null };
        var el = document.createElement('div');
        el.className = 'status-service';
        el.id = 'service-' + s.id;

        var latencyText = state.latency !== null ? state.latency + ' ms' : '';
        if (state.status === 'external') latencyText = '';
        if (state.status === 'checking') latencyText = '…';

        el.innerHTML =
          '<span class="service-dot ' + state.status + '"></span>' +
          '<div class="service-info">' +
            '<div class="service-name">' + escapeHtml(s.name) + '</div>' +
            '<div class="service-desc">' + escapeHtml(s.description) + '</div>' +
          '</div>' +
          '<span class="service-latency">' + latencyText + '</span>' +
          '<span class="service-status ' + state.status + '">' + (statusLabels[state.status] || state.status) + '</span>';

        list.appendChild(el);
      });

      section.appendChild(list);
      servicesContainer.appendChild(section);
    });
  }

  function updateGlobalStatus() {
    var states = Object.keys(serviceStates).map(function(k) { return serviceStates[k].status; });
    var internalStates = [];
    statusData.forEach(function(s) {
      if (s.type === 'internal' && serviceStates[s.id]) {
        internalStates.push(serviceStates[s.id].status);
      }
    });

    var status = 'operational';
    var text = 'Tous les systèmes sont opérationnels';
    if (internalStates.indexOf('offline') !== -1) {
      status = 'major';
      text = 'Incident majeur détecté';
    } else if (internalStates.indexOf('degraded') !== -1) {
      status = 'degraded';
      text = 'Certains services sont dégradés';
    } else if (internalStates.length === 0) {
      status = 'unknown';
      text = 'Vérification en cours…';
    }

    globalDot.className = 'status-global-dot ' + status;
    globalText.textContent = text;
    globalTime.textContent = 'Dernière vérification : ' + new Date().toLocaleTimeString('fr-FR');
  }

  function checkService(service) {
    if (service.type === 'external') {
      serviceStates[service.id] = { status: 'external', latency: null };
      return Promise.resolve();
    }

    var start = performance.now();
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 5000);

    return fetch(service.url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
      .then(function() {
        clearTimeout(timeoutId);
        var latency = Math.round(performance.now() - start);
        serviceStates[service.id] = {
          status: latency > 3000 ? 'degraded' : 'online',
          latency: latency
        };
      })
      .catch(function(err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          serviceStates[service.id] = { status: 'offline', latency: null };
        } else {

          var latency = Math.round(performance.now() - start);
          serviceStates[service.id] = {
            status: latency > 3000 ? 'degraded' : 'online',
            latency: latency
          };
        }
      });
  }

  function checkAllServices() {
    var promises = statusData.map(function(s) { return checkService(s); });
    return Promise.all(promises).then(function() {
      renderServices();
      updateGlobalStatus();
      if (refreshInfo) refreshInfo.textContent = 'Rafraîchissement automatique toutes les 60s';
    });
  }

  function renderIncidents() {
    if (!incidentList || typeof statusIncidents === 'undefined') return;
    incidentList.innerHTML = '';

    if (statusIncidents.length === 0) {
      incidentList.innerHTML = '<p style="color:var(--text-secondary);font-size:0.9rem">Aucun incident récent.</p>';
      return;
    }

    statusIncidents.forEach(function(inc) {
      var card = document.createElement('div');
      card.className = 'incident-card ' + inc.severity;
      card.innerHTML =
        '<div class="incident-header">' +
          '<span class="incident-title">' + escapeHtml(inc.title) +
            '<span class="incident-badge ' + (inc.resolved ? 'resolved' : 'ongoing') + '">' +
              (inc.resolved ? 'Résolu' : 'En cours') +
            '</span>' +
          '</span>' +
          '<span class="incident-date">' + escapeHtml(inc.date) + '</span>' +
        '</div>' +
        '<p class="incident-desc">' + escapeHtml(inc.description) + '</p>';
      incidentList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }


  renderServices();
  renderIncidents();


  checkAllServices();


  setInterval(checkAllServices, 60000);


  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      refreshInfo.textContent = 'Rafraîchissement…';
      checkAllServices();
    });
  }
})();
