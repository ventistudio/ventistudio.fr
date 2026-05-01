(function() {
  if (typeof calendarData === 'undefined') return;

  var grid = document.getElementById('calendar-grid');
  var monthLabel = document.getElementById('cal-month-label');
  var prevBtn = document.getElementById('cal-prev');
  var nextBtn = document.getElementById('cal-next');
  var todayBtn = document.getElementById('cal-today');
  var filtersContainer = document.getElementById('cal-filters');
  var upcomingList = document.getElementById('upcoming-list');
  var modalOverlay = document.getElementById('cal-modal');

  if (!grid) return;

  var currentDate = new Date();
  var viewYear = currentDate.getFullYear();
  var viewMonth = currentDate.getMonth();
  var activeFilter = '';

  var categoryLabels = {
    concert: '🎵 Concert',
    community: '💬 Communauté',
    release: '🚀 Sortie',
    birthday: '🎂 Anniversaire',
    special: '✨ Spécial'
  };

  var categoryIcons = {
    concert: '🎵',
    community: '💬',
    release: '🚀',
    birthday: '🎂',
    special: '✨'
  };

  var monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var monthNamesShort = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getEventsForDate(year, month, day) {
    var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    return calendarData.filter(function(evt) {
      if (activeFilter && evt.category !== activeFilter) return false;
      return evt.date === dateStr;
    });
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year, month) {
    var day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }

  function isToday(year, month, day) {
    var now = new Date();
    return year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
  }

  function renderCalendar() {
    monthLabel.textContent = monthNames[viewMonth] + ' ' + viewYear;

    var daysInMonth = getDaysInMonth(viewYear, viewMonth);
    var firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    var prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

    grid.innerHTML = '';

    for (var i = firstDay - 1; i >= 0; i--) {
      var day = prevMonthDays - i;
      var cell = createDayCell(viewYear, viewMonth - 1, day, true);
      grid.appendChild(cell);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var cell = createDayCell(viewYear, viewMonth, d, false);
      grid.appendChild(cell);
    }

    var totalCells = firstDay + daysInMonth;
    var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (var n = 1; n <= remaining; n++) {
      var cell = createDayCell(viewYear, viewMonth + 1, n, true);
      grid.appendChild(cell);
    }
  }

  function createDayCell(year, month, day, otherMonth) {

    var d = new Date(year, month, day);
    var ny = d.getFullYear();
    var nm = d.getMonth();
    var nd = d.getDate();

    var cell = document.createElement('div');
    cell.className = 'calendar-day';
    if (otherMonth) cell.classList.add('other-month');
    if (isToday(ny, nm, nd)) cell.classList.add('today');

    var numEl = document.createElement('div');
    numEl.className = 'calendar-day-number';
    numEl.textContent = nd;
    cell.appendChild(numEl);

    var events = getEventsForDate(ny, nm, nd);
    if (events.length > 0) {
      var eventsEl = document.createElement('div');
      eventsEl.className = 'calendar-day-events';
      var maxShow = 2;
      events.slice(0, maxShow).forEach(function(evt) {
        var dot = document.createElement('div');
        dot.className = 'cal-event-dot ' + evt.category;
        dot.textContent = escapeHtml(evt.title);
        eventsEl.appendChild(dot);
      });
      if (events.length > maxShow) {
        var more = document.createElement('div');
        more.className = 'cal-event-more';
        more.textContent = '+' + (events.length - maxShow) + ' autre(s)';
        eventsEl.appendChild(more);
      }
      cell.appendChild(eventsEl);
    }

    cell.addEventListener('click', function() {
      if (events.length > 0) showModal(ny, nm, nd, events);
    });

    return cell;
  }

  function showModal(year, month, day, events) {
    var dateStr = day + ' ' + monthNames[month] + ' ' + year;
    modalOverlay.innerHTML =
      '<div class="cal-modal">' +
        '<div class="cal-modal-header">' +
          '<div><h3>' + escapeHtml(dateStr) + '</h3>' +
          '<span class="cal-modal-date">' + events.length + ' événement(s)</span></div>' +
          '<button class="cal-modal-close" aria-label="Fermer">&times;</button>' +
        '</div>' +
        '<div class="cal-modal-events">' +
          events.map(function(evt) {
            return '<div class="cal-modal-event ' + evt.category + '">' +
              '<div class="cal-modal-event-title">' + (categoryIcons[evt.category] || '') + ' ' + escapeHtml(evt.title) + '</div>' +
              '<div class="cal-modal-event-meta">' +
                (evt.time && evt.time !== '00:00' ? '<span>🕐 ' + evt.time + '</span>' : '') +
                '<span>📍 ' + escapeHtml(evt.location) + '</span>' +
                (evt.recurring ? '<span>🔁 ' + (evt.recurring === 'yearly' ? 'Annuel' : 'Mensuel') + '</span>' : '') +
              '</div>' +
              '<div class="cal-modal-event-desc">' + escapeHtml(evt.description) + '</div>' +
              (evt.link ? '<a class="cal-modal-event-link" href="' + evt.link + '">Voir plus →</a>' : '') +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';

    modalOverlay.hidden = false;

    modalOverlay.querySelector('.cal-modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  function closeModal() {
    modalOverlay.hidden = true;
    modalOverlay.innerHTML = '';
  }

  function renderUpcoming() {
    var now = new Date();
    var future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    var nowStr = now.toISOString().slice(0, 10);
    var futureStr = future.toISOString().slice(0, 10);

    var upcoming = calendarData.filter(function(evt) {
      if (activeFilter && evt.category !== activeFilter) return false;
      return evt.date >= nowStr && evt.date <= futureStr;
    }).sort(function(a, b) {
      return a.date.localeCompare(b.date);
    });

    upcomingList.innerHTML = '';

    if (upcoming.length === 0) {
      upcomingList.innerHTML = '<div class="upcoming-empty">Aucun événement dans les 30 prochains jours.</div>';
      return;
    }

    upcoming.forEach(function(evt) {
      var d = new Date(evt.date + 'T00:00:00');
      var el = document.createElement('div');
      el.className = 'upcoming-event ' + evt.category;
      el.innerHTML =
        '<div class="upcoming-date">' +
          '<div class="upcoming-date-day">' + d.getDate() + '</div>' +
          '<div class="upcoming-date-month">' + monthNamesShort[d.getMonth()] + '</div>' +
        '</div>' +
        '<div class="upcoming-info">' +
          '<div class="upcoming-title">' + (categoryIcons[evt.category] || '') + ' ' + escapeHtml(evt.title) + '</div>' +
          '<div class="upcoming-meta">' +
            (evt.time && evt.time !== '00:00' ? evt.time + ' · ' : '') +
            escapeHtml(evt.location) +
          '</div>' +
        '</div>';
      upcomingList.appendChild(el);
    });
  }

  function renderFilters() {
    filtersContainer.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.className = 'cal-filter-chip' + (!activeFilter ? ' active' : '');
    allBtn.textContent = 'Tous';
    allBtn.addEventListener('click', function() { activeFilter = ''; render(); });
    filtersContainer.appendChild(allBtn);

    Object.keys(categoryLabels).forEach(function(cat) {
      var btn = document.createElement('button');
      btn.className = 'cal-filter-chip' + (activeFilter === cat ? ' active' : '');
      btn.textContent = categoryLabels[cat];
      btn.addEventListener('click', function() { activeFilter = cat; render(); });
      filtersContainer.appendChild(btn);
    });
  }

  function render() {
    renderFilters();
    renderCalendar();
    renderUpcoming();
  }

  prevBtn.addEventListener('click', function() {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });

  nextBtn.addEventListener('click', function() {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });

  todayBtn.addEventListener('click', function() {
    var now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    render();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });

  render();
})();
