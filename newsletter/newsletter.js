const SUBSCRIBERS_KEY = 'ventistudio_newsletter_subscribers';

document.addEventListener('DOMContentLoaded', function() {
  loadSubscribers();
  document.getElementById('newsletterForm').addEventListener('submit', handleSubscribe);
});

function handleSubscribe(e) {
  e.preventDefault();
  const email = document.getElementById('subscribeEmail').value;
  const messageDiv = document.getElementById('newsletterMessage');

  if (!isValidEmail(email)) {
    showMessage('❌ Adresse email invalide', 'error', messageDiv);
    return;
  }

  const subscribers = getSubscribers();
  if (subscribers.find(s => s.email === email)) {
    showMessage('⚠️ Cet email est déjà abonné', 'error', messageDiv);
    document.getElementById('subscribeEmail').value = '';
    return;
  }

  const newSubscriber = {
    email: email,
    date: new Date().toISOString().split('T')[0],
    id: Date.now(),
    status: 'active'
  };

  subscribers.push(newSubscriber);
  localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));

  showMessage('✅ Merci! Vous êtes maintenant abonné à notre infolettre', 'success', messageDiv);
  document.getElementById('subscribeEmail').value = '';

  loadSubscribers();

  simulateSendEmail(email, 'confirmation');
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function showMessage(text, type, element) {
  element.textContent = text;
  element.className = `newsletter-message ${type}`;
  setTimeout(() => {
    element.className = 'newsletter-message';
  }, 5000);
}

function getSubscribers() {
  const data = localStorage.getItem(SUBSCRIBERS_KEY);
  return data ? JSON.parse(data) : [];
}

function loadSubscribers() {
  const subscribers = getSubscribers();
  const list = document.getElementById('subscribersList');

  if (subscribers.length === 0) {
    list.innerHTML = '<p style="color: #64748b; text-align: center;">Aucun abonné pour le moment</p>';
    return;
  }

  list.innerHTML = subscribers
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(sub => `
      <div class="subscriber-item">
        <div>
          <div class="email">${escapeHtml(sub.email)}</div>
          <div class="date">Abonné le ${sub.date}</div>
        </div>
        <button onclick="unsubscribeEmail('${sub.id}', '${escapeHtml(sub.email)}')">Supprimer</button>
      </div>
    `)
    .join('');
}

function unsubscribeEmail(id, email) {
  if (confirm(`Désabonner ${email}?`)) {
    const subscribers = getSubscribers();
    const filtered = subscribers.filter(s => s.id != id);
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(filtered));
    loadSubscribers();
    showMessage(`✅ ${email} a été désabonné`, 'success', document.getElementById('newsletterMessage'));
  }
}

function sendTestNewsletter() {
  const subscribers = getSubscribers();

  if (subscribers.length === 0) {
    alert('❌ Aucun abonné pour envoyer un email test');
    return;
  }

  const testEmails = subscribers.slice(0, 3).map(s => s.email);
  alert(`📬 Email test envoyé à:\n${testEmails.join('\n')}\n\nNote: Ceci est une simulation. Dans un vrai système, utilise un service comme SendGrid, Mailgun ou AWS SES`);

  console.log('Test newsletter envoyé à:', testEmails);
  logNewsletterAction('send', 'test', testEmails.length);
}

function exportSubscribers() {
  const subscribers = getSubscribers();
  const data = {
    exportDate: new Date().toISOString(),
    totalSubscribers: subscribers.length,
    subscribers: subscribers
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ventistudio-newsletter-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert('✅ Liste des abonnés exportée');
  logNewsletterAction('export', 'subscribers', subscribers.length);
}

function clearAllSubscribers() {
  if (confirm('⚠️ Êtes-vous sûr? Cette action est irréversible et supprimera tous les abonnés.')) {
    if (confirm('Confirmer la suppression de tous les abonnés?')) {
      localStorage.removeItem(SUBSCRIBERS_KEY);
      loadSubscribers();
      alert('✅ Tous les abonnés ont été supprimés');
      logNewsletterAction('clear', 'all', 0);
    }
  }
}

function simulateSendEmail(email, type) {
  const emailContent = {
    to: email,
    type: type,
    timestamp: new Date().toISOString(),
    subject: type === 'confirmation' ? '✅ Confirmez votre abonnement à VentiStudio' : '📰 Nouvelle chronique VentiStudio',
    body: type === 'confirmation'
      ? `Bienvenue sur la newsletter de VentiStudio!\n\nMerci de vous être abonné. Vous recevrez maintenant nos dernières chroniques et actualités directement dans votre boîte mail.`
      : `Découvrez la nouvelle chronique: [TITRE CHRONIQUE]\n\nLisez la suite sur ventistudio.eu/news/`
  };

  console.log('📧 Email simulé:', emailContent);
  logEmailSent(email, type);
}

function logEmailSent(email, type) {
  const key = 'ventistudio_email_log';
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  logs.push({
    email: email,
    type: type,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(logs));
}

function logNewsletterAction(action, target, count) {
  const key = 'ventistudio_newsletter_actions';
  const logs = JSON.parse(localStorage.getItem(key) || '[]');
  logs.push({
    action: action,
    target: target,
    count: count,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(logs));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sendNewsletterEmail(chronique) {
  const subscribers = getSubscribers();

  const testSubscribers = subscribers.slice(0, 5);

  const emailTemplate = `
    <h2>${chronique.title}</h2>
    <p><strong>Par</strong> ${chronique.author}</p>
    <p>${chronique.excerpt}</p>
    <a href="https://ventistudio.eu/news/">Lire la suite →</a>
  `;

  console.log('📨 Newsletter à envoyer:', {
    recipients: testSubscribers.map(s => s.email),
    subject: `📰 Nouvelle chronique: ${chronique.title}`,
    content: emailTemplate
  });

}

window.newsletterModule = {
  sendNewsletterEmail: sendNewsletterEmail,
  getSubscribersCount: () => getSubscribers().length
};
