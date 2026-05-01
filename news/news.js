document.addEventListener('DOMContentLoaded', function() {
  loadNews();
});

function loadNews() {

  const script = document.createElement('script');
  script.src = '/news/news-data.js';
  script.onload = function() {
    displayNews();
  };
  script.onerror = function() {
    console.error('Impossible de charger les données des actualités');
    showEmptyState();
  };
  document.head.appendChild(script);
}

function displayNews() {
  if (typeof newsData === 'undefined' || newsData.length === 0) {
    showEmptyState();
    return;
  }

  const newsList = document.getElementById('newsList');
  newsList.innerHTML = '';

  const sortedNews = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedNews.forEach(news => {
    const newsItem = createNewsElement(news);
    newsList.appendChild(newsItem);
  });

  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
}

function createNewsElement(news) {
  const article = document.createElement('article');
  article.className = 'news-item';

  const categoryLabel = getCategoryLabel(news.category);
  const formattedDate = formatDate(news.date);

  article.innerHTML = `
    <div class="news-date">${categoryLabel} • ${formattedDate}</div>
    <h3 class="news-title" onclick="expandNews(this)">${escapeHtml(news.title)}</h3>
    <p class="news-excerpt">${escapeHtml(news.excerpt)}</p>
    <div class="news-footer">
      <span class="news-author">Par ${escapeHtml(news.author)}</span>
      <div class="news-actions">
        <button class="news-read-more" onclick="toggleContent(this, ${news.id})">Lire la suite</button>
      </div>
    </div>
    <div class="news-full-content" id="content-${news.id}" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
      ${news.content}
    </div>
  `;

  return article;
}

function toggleContent(button, newsId) {
  const content = document.getElementById(`content-${newsId}`);
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

function showEmptyState() {
  const newsList = document.getElementById('newsList');
  const emptyState = document.getElementById('emptyState');

  if (newsList) newsList.style.display = 'none';
  if (emptyState) emptyState.style.display = 'block';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const newsStyles = document.createElement('style');
newsStyles.textContent = `
  .news-full-content {
    color: var(--text-secondary);
    line-height: 1.8;
  }

  .news-full-content h3 {
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 12px;
  }

  .news-full-content p {
    margin-bottom: 12px;
  }

  .news-full-content ul, .news-full-content ol {
    margin-bottom: 16px;
    padding-left: 20px;
  }

  .news-full-content li {
    margin-bottom: 8px;
  }

  .news-read-more {
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

  .news-read-more:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
  }
`;
document.head.appendChild(newsStyles);
