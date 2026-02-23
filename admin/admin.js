// =============================================
// VentiStudio Admin Dashboard — PHP/SQL Client
// =============================================

const API = '/admin/api';
let allNewsData = [];
let editingNewsId = null; // ID de la news en cours d'édition

// ─── Initialisation ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  setupEventListeners();
});

// ─── Appels API (helper) ─────────────────────────────────
async function api(endpoint, options = {}) {
  const url = `${API}/${endpoint}`;
  const defaults = {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  };
  const config = { ...defaults, ...options };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Erreur HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API ${endpoint}:`, err);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════
// AUTHENTIFICATION
// ═══════════════════════════════════════════════════════════

async function checkSession() {
  try {
    const data = await api('auth.php?action=check');
    if (data.authenticated) {
      showAdminPage();
      loadStats();
    }
  } catch {
    // Pas connecté, on reste sur la page de login
  }
}

function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('adminNewsForm').addEventListener('submit', handlePublish);
  document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
  document.getElementById('exportDataBtn').addEventListener('click', exportData);
  document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', importData);
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Connexion...';
  btn.disabled = true;

  try {
    await api('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({
        password: document.getElementById('password').value,
      }),
    });
    showAdminPage();
    loadStats();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Mot de passe incorrect'), 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

async function handleLogout() {
  if (!confirm('Vous allez être déconnecté')) return;
  try {
    await api('auth.php?action=logout', { method: 'POST' });
  } catch { /* ignore */ }
  location.reload();
}

function showAdminPage() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminPage').style.display = 'block';
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION TABS
// ═══════════════════════════════════════════════════════════

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');

  if (tabName === 'manage') loadManageNews();
  else if (tabName === 'stats') loadStats();
  else if (tabName === 'moderation') loadModerationComments();
}

// ═══════════════════════════════════════════════════════════
// STATISTIQUES (depuis la BDD)
// ═══════════════════════════════════════════════════════════

async function loadStats() {
  try {
    const data = await api('stats.php');

    document.getElementById('totalNews').textContent = data.totalNews;
    document.getElementById('newsThisMonth').textContent = data.newsThisMonth;
    document.getElementById('totalViews').textContent = data.totalViews.toLocaleString('fr-FR');
    document.getElementById('totalVotes').textContent = data.totalVotes.toLocaleString('fr-FR');
    document.getElementById('pendingComments').textContent = data.pendingComments;

    // Chart catégories
    let chartHTML = '';
    const total = data.categories.reduce((s, c) => s + c.count, 0) || 1;
    for (const cat of data.categories) {
      const label = getCategoryLabel(cat.category);
      const width = (cat.count / total) * 100;
      chartHTML += `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>${label}</span>
            <span style="font-weight: 600;">${cat.count}</span>
          </div>
          <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 24px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6366f1, #9333ea); height: 100%; width: ${width}%; transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }
    document.getElementById('categoryChart').innerHTML = chartHTML;

  } catch (err) {
    console.error('Erreur stats:', err);
  }
}

// ═══════════════════════════════════════════════════════════
// PUBLIER / ÉDITER UNE NEWS
// ═══════════════════════════════════════════════════════════

async function handlePublish(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Publication...';
  btn.disabled = true;

  const payload = {
    title:    document.getElementById('adminTitle').value,
    author:   document.getElementById('adminAuthor').value,
    date:     document.getElementById('adminDate').value,
    category: document.getElementById('adminCategory').value,
    excerpt:  document.getElementById('adminExcerpt').value,
    content:  document.getElementById('adminContent').value,
  };

  try {
    if (editingNewsId) {
      // Mode édition : PUT
      await api(`news.php?id=${editingNewsId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('✅ Chronique modifiée avec succès');
      editingNewsId = null;
      btn.textContent = 'Publier la chronique';
      cancelEditBtn(false);
    } else {
      // Mode création : POST
      await api('news.php', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('✅ Chronique publiée avec succès');
    }
    document.getElementById('adminNewsForm').reset();
    document.getElementById('adminDate').valueAsDate = new Date();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erreur lors de la publication'), 'error');
  } finally {
    btn.disabled = false;
    if (!editingNewsId) btn.textContent = originalText;
  }
}

// ═══════════════════════════════════════════════════════════
// GÉRER LES NEWS (liste + CRUD)
// ═══════════════════════════════════════════════════════════

async function loadManageNews() {
  const list = document.getElementById('newsList');
  list.innerHTML = '<p style="text-align:center;color:#a0aec0;">Chargement...</p>';

  try {
    const data = await api('news.php?limit=100');
    allNewsData = data.news || [];
    list.innerHTML = '';

    if (allNewsData.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#a0aec0;">Aucune chronique publiée.</p>';
      return;
    }

    allNewsData.forEach(news => {
      const item = document.createElement('div');
      item.className = 'manage-item';
      item.innerHTML = `
        <div class="manage-item-info">
          <h4>${escapeHtml(news.title)}</h4>
          <p>${news.date} • ${getCategoryLabel(news.category)} • ${escapeHtml(news.author)} • 👁 ${news.views || 0}</p>
        </div>
        <div class="manage-item-actions">
          <button class="btn-edit" onclick="editNews(${news.id})">Éditer</button>
          <button class="btn-delete" onclick="deleteNews(${news.id})">Supprimer</button>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    list.innerHTML = `<p style="text-align:center;color:#ef4444;">Erreur: ${err.message}</p>`;
  }
}

async function editNews(id) {
  try {
    const news = await api(`news.php?id=${id}`);
    editingNewsId = id;

    document.getElementById('adminTitle').value = news.title;
    document.getElementById('adminAuthor').value = news.author;
    document.getElementById('adminDate').value = news.date;
    document.getElementById('adminCategory').value = news.category;
    document.getElementById('adminExcerpt').value = news.excerpt;
    document.getElementById('adminContent').value = news.content;

    // Changer le bouton
    const btn = document.querySelector('#adminNewsForm button[type="submit"]');
    btn.textContent = 'Modifier la chronique';
    cancelEditBtn(true);

    switchTab('news');
    document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    showToast('❌ Impossible de charger la news', 'error');
  }
}

function cancelEditBtn(show) {
  let btn = document.getElementById('cancelEditBtn');
  if (show && !btn) {
    btn = document.createElement('button');
    btn.id = 'cancelEditBtn';
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.style.cssText = 'margin-top: 10px; width: 100%;';
    btn.textContent = 'Annuler la modification';
    btn.onclick = () => {
      editingNewsId = null;
      document.getElementById('adminNewsForm').reset();
      document.getElementById('adminDate').valueAsDate = new Date();
      document.querySelector('#adminNewsForm button[type="submit"]').textContent = 'Publier la chronique';
      cancelEditBtn(false);
    };
    document.getElementById('adminNewsForm').appendChild(btn);
  } else if (!show && btn) {
    btn.remove();
  }
}

async function deleteNews(id) {
  if (!confirm('Voulez-vous vraiment supprimer cette chronique ? Cette action est irréversible.')) return;

  try {
    await api(`news.php?id=${id}`, { method: 'DELETE' });
    showToast('✅ Chronique supprimée');
    loadManageNews();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erreur lors de la suppression'), 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// MODÉRATION DES COMMENTAIRES (depuis la BDD)
// ═══════════════════════════════════════════════════════════

async function loadModerationComments() {
  const list = document.getElementById('moderationList');
  list.innerHTML = '<p style="text-align:center;color:#a0aec0;">Chargement...</p>';

  try {
    const data = await api('comments.php?status=pending');
    const comments = data.comments || [];
    list.innerHTML = '';

    if (comments.length === 0) {
      list.innerHTML = '<p style="text-align: center; color: #a0aec0;">✅ Aucun commentaire en attente de modération !</p>';
      return;
    }

    // Titre avec compteur
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
        🔔 ${comments.length} commentaire${comments.length > 1 ? 's' : ''} en attente de modération
      </h3>
    `;
    list.appendChild(title);

    comments.forEach(comment => {
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
              ${comment.news_title ? ` | 📰 ${escapeHtml(comment.news_title)}` : ''}
            </p>
            <p style="color: #cbd5e1; font-size: 0.9em;">${new Date(comment.created_at).toLocaleString('fr-FR')}</p>
          </div>
          <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em;">
            🔴 En attente
          </span>
        </div>
        <p style="color: #cbd5e1; margin: 16px 0; line-height: 1.6;">${escapeHtml(comment.content)}</p>
        <div style="display: flex; gap: 8px;">
          <button onclick="approveComment(${comment.id})" style="
            padding: 8px 16px; background: #22c55e; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
          ">✅ Approuver</button>
          <button onclick="rejectComment(${comment.id})" style="
            padding: 8px 16px; background: #ef4444; color: white;
            border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
          ">❌ Rejeter</button>
        </div>
      `;
      list.appendChild(item);
    });

  } catch (err) {
    list.innerHTML = `<p style="text-align:center;color:#ef4444;">Erreur: ${err.message}</p>`;
  }
}

async function approveComment(id) {
  try {
    await api(`comments.php?action=approve&id=${id}`, { method: 'POST' });
    showToast('✅ Commentaire approuvé');
    loadModerationComments();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

async function rejectComment(id) {
  if (!confirm('Êtes-vous sûr de vouloir rejeter ce commentaire ?')) return;
  try {
    await api(`comments.php?action=reject&id=${id}`, { method: 'POST' });
    showToast('✅ Commentaire rejeté et supprimé');
    loadModerationComments();
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// PARAMÈTRES : CHANGER LE MOT DE PASSE
// ═══════════════════════════════════════════════════════════

async function handleChangePassword(e) {
  e.preventDefault();
  const currentPwd = document.getElementById('currentPassword').value;
  const newPwd = document.getElementById('newPassword').value;
  const confirmPwd = document.getElementById('confirmPassword').value;

  if (newPwd !== confirmPwd) {
    showToast('❌ Les mots de passe ne correspondent pas', 'error');
    return;
  }

  try {
    await api('auth.php?action=password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPwd,
        new_password: newPwd,
      }),
    });
    showToast('✅ Mot de passe modifié avec succès');
    document.getElementById('changePasswordForm').reset();
  } catch (err) {
    showToast('❌ ' + (err.message || 'Erreur'), 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT / IMPORT DE DONNÉES
// ═══════════════════════════════════════════════════════════

async function exportData() {
  try {
    const data = await api('news.php?limit=9999');
    const exportPayload = {
      newsCount: data.total,
      news: data.news,
      exportDate: new Date().toISOString(),
    };

    const json = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventistudio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('✅ Sauvegarde exportée !');
  } catch (err) {
    showToast('❌ Erreur lors de l\'export', 'error');
  }
}

async function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(event) {
    try {
      const data = JSON.parse(event.target.result);
      if (!data.news || !Array.isArray(data.news)) {
        showToast('❌ Format de fichier invalide', 'error');
        return;
      }

      if (!confirm(`Importer ${data.news.length} chroniques ? Les doublons seront ignorés.`)) return;

      let imported = 0;
      let errors = 0;

      for (const news of data.news) {
        try {
          await api('news.php', {
            method: 'POST',
            body: JSON.stringify({
              title:    news.title,
              author:   news.author || 'Équipe VentiStudio',
              date:     news.date,
              category: news.category || 'other',
              excerpt:  news.excerpt || '',
              content:  news.content || '',
            }),
          });
          imported++;
        } catch {
          errors++;
        }
      }

      showToast(`📥 Import terminé : ${imported} ajoutées, ${errors} erreurs`);
    } catch {
      showToast('❌ Erreur lors de la lecture du fichier', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Reset pour permettre un nouvel import
}

// ═══════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════

function getCategoryLabel(cat) {
  const labels = {
    'update':       '📦 Mise à jour',
    'announcement': '📢 Annonce',
    'feature':      '✨ Fonctionnalité',
    'event':        '🎪 Événement',
    'other':        '📝 Autre',
  };
  return labels[cat] || 'Info';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Toast notification */
function showToast(message, type = 'success') {
  // Supprimer un toast existant
  const existing = document.getElementById('adminToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'adminToast';
  const bg = type === 'error' ? '#ef4444' : '#22c55e';
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; z-index: 10000;
    background: ${bg}; color: white; padding: 14px 24px;
    border-radius: 10px; font-weight: 600; font-size: 0.95rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    animation: toastIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
