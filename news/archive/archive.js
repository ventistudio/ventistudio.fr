let allNews = [];

document.addEventListener('DOMContentLoaded', function() {
  loadNews();
  setupFilters();
});

function loadNews() {

  const script = document.createElement('script');
  script.src = '/news/news-data.js';
  script.onload = function() {
    if (typeof newsData !== 'undefined') {
      allNews = newsData;
      displayArchive(allNews);
      updateStats(allNews);
    }
  };
  document.head.appendChild(script);
}

function setupFilters() {
  document.getElementById('filterCategory').addEventListener('change', applyFilters);
  document.getElementById('filterYear').addEventListener('change', applyFilters);
  document.getElementById('filterMonth').addEventListener('change', applyFilters);
  document.getElementById('searchText').addEventListener('input', applyFilters);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function applyFilters() {
  const category = document.getElementById('filterCategory').value;
  const year = document.getElementById('filterYear').value;
  const month = document.getElementById('filterMonth').value;
  const search = document.getElementById('searchText').value.toLowerCase();

  let filtered = allNews.filter(news => {

    if (category && news.category !== category) return false;


    if (year || month) {
      const newsDate = news.date.split('-');
      if (year && newsDate[0] !== year) return false;
      if (month && newsDate[1] !== month) return false;
    }


    if (search && !news.title.toLowerCase().includes(search) && !news.excerpt.toLowerCase().includes(search)) {
      return false;
    }

    return true;
  });


  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  displayArchive(filtered);
  updateStats(filtered);
}

function resetFilters() {
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterYear').value = '';
  document.getElementById('filterMonth').value = '';
  document.getElementById('searchText').value = '';

  displayArchive(allNews);
  updateStats(allNews);
}

function displayArchive(newsToDisplay) {
  const archiveList = document.getElementById('archiveList');
  const emptyArchive = document.getElementById('emptyArchive');

  if (newsToDisplay.length === 0) {
    archiveList.style.display = 'none';
    emptyArchive.style.display = 'block';
    return;
  }

  archiveList.style.display = 'flex';
  emptyArchive.style.display = 'none';
  archiveList.innerHTML = '';


  const grouped = {};

  newsToDisplay.forEach(news => {
    const [year, month, day] = news.date.split('-');
    const key = `${year}-${month}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(news);
  });


  Object.keys(grouped).sort().reverse().forEach(key => {
    const [year, month] = key.split('-');
    const monthNames = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const monthHeader = document.createElement('div');
    monthHeader.style.cssText = 'grid-column: 1/-1; margin-top: 30px; margin-bottom: 15px;';
    monthHeader.innerHTML = `<h3 style="margin: 0; color: #6366f1; font-size: 1.1rem;">${monthNames[parseInt(month)]} ${year}</h3>`;
    archiveList.appendChild(monthHeader);

    grouped[key].forEach(news => {
      const item = createArchiveItem(news);
      archiveList.appendChild(item);
    });
  });


  archiveList.style.display = 'grid';
  archiveList.style.gridTemplateColumns = '1fr';
}

function createArchiveItem(news) {
  const article = document.createElement('article');
  article.className = 'archive-item';

  const categoryLabel = getCategoryLabel(news.category);
  const formattedDate = formatDate(news.date);

  article.innerHTML = `
    <div class="archive-date">${categoryLabel} • ${formattedDate}</div>
    <h3 class="archive-title">${escapeHtml(news.title)}</h3>
    <p class="archive-excerpt">${escapeHtml(news.excerpt)}</p>
    <div class="archive-footer">
      <span>Par ${escapeHtml(news.author)}</span>
      <button class="read-more-btn" onclick="expandArchive(this, ${news.id})">Lire la suite</button>
    </div>
    <div class="archive-full-content" id="archive-${news.id}" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
      ${news.content}
    </div>
  `;

  return article;
}

function expandArchive(button, newsId) {
  const content = document.getElementById(`archive-${newsId}`);
  const isVisible = content.style.display !== 'none';

  if (isVisible) {
    content.style.display = 'none';
    button.textContent = 'Lire la suite';
  } else {
    content.style.display = 'block';
    button.textContent = 'Masquer';
  }
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function getCategoryLabel(category) {
  const labels = {
    'update': '📦 Mise à jour',
    'announcement': '📢 Annonce',
    'feature': '✨ Nouvelle fonctionnalité',
    'event': '🎪 Événement',
    'other': '📝 Info'
  };
  return labels[category] || '📝 Info';
}

function updateStats(newsToShow) {
  const stats = document.getElementById('archiveStats');
  const totalNews = allNews.length;
  const shown = newsToShow.length;

  let statsHTML = `<strong>${shown}</strong> chronique${shown !== 1 ? 's' : ''} trouvée${shown !== 1 ? 's' : ''}`;

  if (shown !== totalNews) {
    statsHTML += ` (sur ${totalNews} au total)`;
  }


  const categoryCounts = {};
  newsToShow.forEach(news => {
    categoryCounts[news.category] = (categoryCounts[news.category] || 0) + 1;
  });

  if (Object.keys(categoryCounts).length > 0) {
    statsHTML += '<br><small style="color: var(--text-secondary); margin-top: 8px; display: block;">';
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      const label = getCategoryLabel(cat);
      statsHTML += `${label}: ${count} • `;
    });
    statsHTML = statsHTML.slice(0, -3) + '</small>';
  }

  stats.innerHTML = statsHTML;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const archiveStyles = document.createElement('style');
archiveStyles.textContent = `
  .archive-full-content {
    color: var(--text-secondary);
    line-height: 1.8;
  }

  .archive-full-content h3,
  .archive-full-content h4 {
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 12px;
  }

  .archive-full-content p {
    margin-bottom: 12px;
  }

  .archive-full-content ul,
  .archive-full-content ol {
    margin-bottom: 16px;
    padding-left: 20px;
  }

  .archive-full-content li {
    margin-bottom: 8px;
  }

  .read-more-btn {
    padding: 6px 12px;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .read-more-btn:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }
`;
document.head.appendChild(archiveStyles);
