// Script du dashboard admin
const ADMIN_PASSWORD = 'admin123';
let adminSession = false;
let allNewsData = [];

document.addEventListener('DOMContentLoaded', function() {
  checkSession();
  setupEventListeners();
  loadNewsData();
});

function checkSession() {
  const sessionToken = sessionStorage.getItem('adminSession');
  if (sessionToken === 'authorized') {
    adminSession = true;
    showAdminPage();
  }
}

function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('adminNewsForm').addEventListener('submit', handlePublish);
  document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
  document.getElementById('exportDataBtn').addEventListener('click', exportData);
  document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importData);
}

function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById('password').value;

  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminSession', 'authorized');
    adminSession = true;
    showAdminPage();
    loadStats();
  } else {
    alert('❌ Mot de passe incorrect');
  }
}

function handleLogout() {
  if (confirm('Vous allez être déconnecté')) {
    sessionStorage.removeItem('adminSession');
    adminSession = false;
    location.reload();
  }
}

function showAdminPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'block';
}

function switchTab(tabName) {
  // Masquer tous les tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Afficher le tab sélectionné
  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');

  // Actions spéciales par tab
  if (tabName === 'manage') {
    loadManageNews();
  } else if (tabName === 'stats') {
    loadStats();
  } else if (tabName === 'moderation') {
    loadModerationComments();
  }
}

function loadNewsData() {
  const script = document.createElement('script');
  script.src = '/news/news-data.js';
  script.onload = function() {
    if (typeof newsData !== 'undefined') {
      allNewsData = newsData;
    }
  };
  document.head.appendChild(script);
}

function handlePublish(e) {
  e.preventDefault();

  const newNews = {
    id: Date.now(),
    title: document.getElementById('adminTitle').value,
    author: document.getElementById('adminAuthor').value,
    date: document.getElementById('adminDate').value,
    category: document.getElementById('adminCategory').value,
    excerpt: document.getElementById('adminExcerpt').value,
    content: document.getElementById('adminContent').value
  };

  // Générer le code à ajouter
  const newsCode = `{
    id: ${newNews.id},
    title: '${newNews.title.replace(/'/g, "\\'")}',
    author: '${newNews.author.replace(/'/g, "\\'")}',
    date: '${newNews.date}',
    category: '${newNews.category}',
    excerpt: '${newNews.excerpt.replace(/'/g, "\\'")}',
    content: \`${newNews.content.replace(/`/g, '\\`')}\`
  },`;

  // Afficher le code
  const codeBlock = document.createElement('div');
  codeBlock.style.cssText = `
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
    max-height: 300px;
    overflow-y: auto;
  `;
  codeBlock.innerHTML = `
    <h4>Code à copier dans /news/news-data.js:</h4>
    <pre style="margin: 0; color: #a0aec0;"><code>${escapeHtml(newsCode)}</code></pre>
    <button onclick="copyToClipboardAdmin(this)" style="margin-top: 10px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">Copier le code</button>
  `;

  document.getElementById('adminNewsForm').parentNode.appendChild(codeBlock);

  // Réinitialiser le form
  document.getElementById('adminNewsForm').reset();
  document.getElementById('adminDate').valueAsDate = new Date();

  alert('✅ News générée! Copie le code et ajoute-le à /news/news-data.js');
}

function copyToClipboardAdmin(btn) {
  const code = btn.previousElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copié!';
    setTimeout(() => {
      btn.textContent = 'Copier le code';
    }, 2000);
  });
}

function loadStats() {
  // Total des news
  document.getElementById('totalNews').textContent = allNewsData.length;

  // News ce mois
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = allNewsData.filter(n => n.date.startsWith(currentMonth)).length;
  document.getElementById('newsThisMonth').textContent = thisMonth;

  // Vues et votes (simulé avec localStorage)
  const views = localStorage.getItem('newsViews') || '0';
  const votes = localStorage.getItem('newsVotes') || '0';
  document.getElementById('totalViews').textContent = views;
  document.getElementById('totalVotes').textContent = votes;

  // Chart catégories
  const categories = {};
  allNewsData.forEach(news => {
    categories[news.category] = (categories[news.category] || 0) + 1;
  });

  let chartHTML = '';
  for (const [cat, count] of Object.entries(categories)) {
    const label = getCategoryLabelShort(cat);
    const width = (count / allNewsData.length) * 100;
    chartHTML += `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>${label}</span>
          <span style="font-weight: 600;">${count}</span>
        </div>
        <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 24px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #9333ea); height: 100%; width: ${width}%; transition: width 0.3s;"></div>
        </div>
      </div>
    `;
  }
  document.getElementById('categoryChart').innerHTML = chartHTML;
}

function loadManageNews() {
  const list = document.getElementById('newsList');
  list.innerHTML = '';

  allNewsData.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(news => {
    const item = document.createElement('div');
    item.className = 'manage-item';
    item.innerHTML = `
      <div class="manage-item-info">
        <h4>${escapeHtml(news.title)}</h4>
        <p>${news.date} • ${getCategoryLabelShort(news.category)} • ${news.author}</p>
      </div>
      <div class="manage-item-actions">
        <button class="btn-edit" onclick="editNews(${news.id})">Éditer</button>
        <button class="btn-delete" onclick="deleteNews(${news.id})">Supprimer</button>
      </div>
    `;
    list.appendChild(item);
  });
}

function editNews(id) {
  const news = allNewsData.find(n => n.id === id);
  if (!news) return;

  // Pré-remplir le formulaire
  document.getElementById('adminTitle').value = news.title;
  document.getElementById('adminAuthor').value = news.author;
  document.getElementById('adminDate').value = news.date;
  document.getElementById('adminCategory').value = news.category;
  document.getElementById('adminExcerpt').value = news.excerpt;
  document.getElementById('adminContent').value = news.content;

  // Scroller vers le formulaire
  switchTab('news');
  document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
}

function deleteNews(id) {
  if (confirm('Voulez-vous vraiment supprimer cette chronique?')) {
    alert('Note: Pour vraiment supprimer une news, édite /news/news-data.js et retire les lignes correspondantes');
  }
}

function changePassword() {
  const newPassword = prompt('Nouveau mot de passe:');
  if (newPassword && newPassword.length >= 6) {
    alert('⚠️ Note: Pour changer le mot de passe définitivement, édite le fichier admin.js et change la variable ADMIN_PASSWORD');
  } else {
    alert('Le mot de passe doit faire au moins 6 caractères');
  }
}

function exportData() {
  const data = {
    newsCount: allNewsData.length,
    news: allNewsData,
    exportDate: new Date().toISOString()
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ventistudio-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert('✅ Sauvegarde exportée!');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (data.news && Array.isArray(data.news)) {
        alert(`📥 Import réussi! ${data.news.length} chroniques trouvées.\n\nNote: Ajoute ces données manuellement dans /news/news-data.js`);
      }
    } catch (err) {
      alert('❌ Erreur lors de l\'import du fichier');
    }
  };
  reader.readAsText(file);
}

function getCategoryLabelShort(cat) {
  const labels = {
    'update': '📦 Mise à jour',
    'announcement': '📢 Annonce',
    'feature': '✨ Fonctionnalité',
    'event': '🎪 Événement',
    'other': '📝 Autre'
  };
  return labels[cat] || 'Info';
}

// ===== SYSTÈME DE MODÉRATION =====

function loadModerationComments() {
  const list = document.getElementById('moderationList') || createModerationPanel();
  list.innerHTML = '';

  try {
    const pendingData = localStorage.getItem('ventistudio_pending_comments');
    if (!pendingData) {
      list.innerHTML = '<p style="text-align: center; color: #a0aec0;">✅ Aucun commentaire en attente!</p>';
      return;
    }

    const pending = JSON.parse(pendingData);
    let totalPending = 0;

    for (const [newsId, comments] of Object.entries(pending)) {
      if (comments && comments.length > 0) {
        comments.forEach((comment, idx) => {
          totalPending++;
          const item = document.createElement('div');
          item.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
            padding: 16px;
            margin: 12px 0;
            border-radius: 8px;
          `;
          item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
              <div>
                <h4 style="color: #e2e8f0; margin-bottom: 4px;"><strong>${escapeHtml(comment.author)}</strong></h4>
                <p style="color: #a0aec0; font-size: 0.9em; margin: 4px 0;">
                  📧 ${escapeHtml(comment.email)} | ⭐ ${comment.rating || 5} étoiles
                </p>
                <p style="color: #cbd5e1; font-size: 0.9em;">${new Date(comment.date).toLocaleString('fr-FR')}</p>
              </div>
              <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em;">
                🔴 En attente
              </span>
            </div>
            <p style="color: #cbd5e1; margin: 16px 0; line-height: 1.6;">${escapeHtml(comment.content)}</p>
            <div style="display: flex; gap: 8px;">
              <button onclick="approveModerationComment('${newsId}', ${comment.id})" style="
                padding: 8px 16px;
                background: #22c55e;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
              ">✅ Approuver</button>
              <button onclick="rejectModerationComment('${newsId}', ${comment.id})" style="
                padding: 8px 16px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
              ">❌ Rejeter</button>
            </div>
          `;
          list.appendChild(item);
        });
      }
    }

    // Ajouter titre avec compteur
    if (totalPending > 0) {
      const title = document.createElement('div');
      title.style.cssText = `
        background: rgba(239, 68, 68, 0.2);
        border: 2px solid #ef4444;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
      `;
      title.innerHTML = `
        <h3 style="color: #ef4444; margin: 0;">
          🔔 ${totalPending} commentaire${totalPending > 1 ? 's' : ''} en attente de modération
        </h3>
      `;
      list.insertBefore(title, list.firstChild);
    }

  } catch (err) {
    console.error('Erreur modération:', err);
  }
}

function approveModerationComment(newsId, commentId) {
  try {
    const pendingData = localStorage.getItem('ventistudio_pending_comments');
    const pending = JSON.parse(pendingData || '{}');
    
    if (!pending[newsId]) return;

    const comment = pending[newsId].find(c => c.id === commentId);
    if (!comment) return;

    // Ajouter aux commentaires approuvés
    const approvedData = localStorage.getItem('ventistudio_comments') || '{}';
    const approved = JSON.parse(approvedData);
    
    if (!approved[newsId]) {
      approved[newsId] = [];
    }

    comment.approved = true;
    approved[newsId].push(comment);
    localStorage.setItem('ventistudio_comments', JSON.stringify(approved));

    // Retirer des en attente
    pending[newsId] = pending[newsId].filter(c => c.id !== commentId);
    localStorage.setItem('ventistudio_pending_comments', JSON.stringify(pending));

    alert('✅ Commentaire approuvé!');
    loadModerationComments();

  } catch (err) {
    console.error('Erreur:', err);
  }
}

function rejectModerationComment(newsId, commentId) {
  if (confirm('Êtes-vous sûr de vouloir rejeter ce commentaire?')) {
    try {
      const pendingData = localStorage.getItem('ventistudio_pending_comments');
      const pending = JSON.parse(pendingData || '{}');

      if (pending[newsId]) {
        pending[newsId] = pending[newsId].filter(c => c.id !== commentId);
        localStorage.setItem('ventistudio_pending_comments', JSON.stringify(pending));
        alert('✅ Commentaire rejeté et supprimé!');
        loadModerationComments();
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  }
}

function createModerationPanel() {
  const panel = document.createElement('div');
  panel.id = 'moderationList';
  panel.style.cssText = `
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 20px;
  `;
  
  // Injecter dans le tab de modération s'il existe
  const moderationTab = document.getElementById('moderationTab');
  if (moderationTab) {
    moderationTab.appendChild(panel);
  }
  
  return panel;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
